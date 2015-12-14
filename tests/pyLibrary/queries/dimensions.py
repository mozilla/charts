# encoding: utf-8
#
#
# self Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with self file,
# You can obtain one at http:# mozilla.org/MPL/2.0/.
#
# Author: Kyle Lahnakoski (kyle@lahnakoski.com)
#
from __future__ import unicode_literals
from __future__ import division
from pyLibrary import dot
from pyLibrary.collections import SUM
from pyLibrary.queries.domains import Domain, ALGEBRAIC, KNOWN
from pyLibrary.dot import Null, coalesce, join_field, split_field, Dict
from pyLibrary.dot.lists import DictList
from pyLibrary.times.timer import Timer
from pyLibrary.debugs.logs import Log
from pyLibrary.dot import wrap, listwrap


DEFAULT_QUERY_LIMIT = 20


class Dimension(object):

    def __init__(self, dim, parent, qb):
        self.name = dim.name
        self.parent = parent
        self.full_name = join_field(split_field(self.parent.full_name)+[self.name])
        dot.set_default(self, dim)
        self.esfilter = coalesce(dim.esfilter, None)
        self.type = coalesce(dim.type, "set")
        self.limit = coalesce(dim.limit, DEFAULT_QUERY_LIMIT)
        self.index = coalesce(dim.index, coalesce(parent, Null).index, qb.es.settings.name)

        if not self.index:
            Log.error("Expecting an index name")

        # ALLOW ACCESS TO SUB-PART BY NAME (IF ONLY THERE IS NO NAME COLLISION)
        self.edges = Dict()
        for e in listwrap(dim.edges):
            new_e = Dimension(e, self, qb)
            self.edges[new_e.full_name] = new_e

        self.partitions = wrap(coalesce(dim.partitions, []))
        parse_partition(self)

        fields = coalesce(dim.field, dim.fields)
        if not fields:
            return  # NO FIELDS TO SEARCH
        elif isinstance(fields, dict):
            self.fields = wrap(fields)
            edges = wrap([{"name": k, "value": v, "allowNulls": False} for k, v in self.fields.items()])
        else:
            self.fields = listwrap(fields)
            edges = wrap([{"name": f, "value": f, "index": i, "allowNulls": False} for i, f in enumerate(self.fields)])

        if dim.partitions:
            return  # ALREADY HAVE PARTS
        if dim.type not in KNOWN - ALGEBRAIC:
            return  # PARTS OR TOO FUZZY (OR TOO NUMEROUS) TO FETCH

        with Timer("Get parts of {{name}}", {"name": self.name}):
            parts = qb.query({
                "from": self.index,
                "select": {"name": "count", "aggregate": "count"},
                "edges": edges,
                "esfilter": self.esfilter,
                "limit": self.limit
            })
            Log.note("{{name}} has {{num}} parts", {"name": self.name, "num": len(parts)})

        d = parts.edges[0].domain

        if dim.path:
            if len(edges) > 1:
                Log.error("Not supported yet")
            # EACH TERM RETURNED IS A PATH INTO A PARTITION TREE
            temp = Dict(partitions=[])
            for i, count in enumerate(parts):
                a = dim.path(d.getEnd(d.partitions[i]))
                if not isinstance(a, list):
                    Log.error("The path function on " + dim.name + " must return an ARRAY of parts")
                addParts(
                    temp,
                    dim.path(d.getEnd(d.partitions[i])),
                    count,
                    0
                )
            self.value = coalesce(dim.value, "name")
            self.partitions = temp.partitions
        elif isinstance(fields, dict):
            self.value = "name"  # USE THE "name" ATTRIBUTE OF PARTS

            partitions = DictList()
            for g, p in parts.groupby(edges):
                if p:
                    partitions.append({
                        "value": g,
                        "esfilter": {"and": [
                            {"term": {e.value: g[e.name]}}
                            for e in edges
                        ]},
                        "count": int(p)
                    })
            self.partitions = partitions
        elif len(edges) == 1:
            self.value = "name"  # USE THE "name" ATTRIBUTE OF PARTS

            # SIMPLE LIST OF PARTS RETURNED, BE SURE TO INTERRELATE THEM
            self.partitions = wrap([
                {
                    "name": str(d.partitions[i].name),  # CONVERT TO STRING
                    "value": d.getEnd(d.partitions[i]),
                    "esfilter": {"term": {edges[0].value: d.partitions[i].value}},
                    "count": count
                }
                for i, count in enumerate(parts)
            ])
        elif len(edges) == 2:
            self.value = "name"  # USE THE "name" ATTRIBUTE OF PARTS
            d2 = parts.edges[1].domain

            # SIMPLE LIST OF PARTS RETURNED, BE SURE TO INTERRELATE THEM
            array = parts.data.values()[0].cube  # DIG DEEP INTO RESULT (ASSUME SINGLE VALUE CUBE, WITH NULL AT END)

            def edges2value(*values):
                if isinstance(fields, dict):
                    output = Dict()
                    for e, v in zip(edges, values):
                        output[e.name] = v
                    return output
                else:
                    return tuple(values)

            self.partitions = wrap([
                {
                    "name": str(d.partitions[i].name),  # CONVERT TO STRING
                    "value": d.getEnd(d.partitions[i]),
                    "esfilter": {"term": {edges[0].value: d.partitions[i].value}},
                    "count": SUM(subcube),
                    "partitions": [
                        {
                            "name": str(d2.partitions[j].name),  # CONVERT TO STRING
                            "value": edges2value(d.getEnd(d.partitions[i]), d2.getEnd(d2.partitions[j])),
                            "esfilter": {"and": [
                                {"term": {edges[0].value: d.partitions[i].value}},
                                {"term": {edges[1].value: d2.partitions[j].value}}
                            ]},
                            "count": count2
                        }
                        for j, count2 in enumerate(subcube)
                        if count2 > 0  # ONLY INCLUDE PROPERTIES THAT EXIST
                    ]
                }
                for i, subcube in enumerate(array)
            ])
        else:
            Log.error("Not supported")

        parse_partition(self)  # RELATE THE PARTS TO THE PARENTS

    def __getattr__(self, key):
        """
        RETURN CHILD EDGE OR PARTITION BY NAME
        """
        #TODO: IGNORE THE STANDARD DIMENSION PROPERTIES TO AVOID ACCIDENTAL SELECTION OF EDGE OR PART
        e = self.edges[key]
        if e:
            return e
        for p in self.partitions:
            if p.name == key:
                return p
        return Null

    def getDomain(self, **kwargs):
        # kwargs.depth IS MEANT TO REACH INTO SUB-PARTITIONS
        kwargs = wrap(kwargs)
        kwargs.depth = coalesce(kwargs.depth, len(self.fields)-1 if isinstance(self.fields, list) else None)

        if not self.partitions and self.edges:
            # USE EACH EDGE AS A PARTITION, BUT isFacet==True SO IT ALLOWS THE OVERLAP
            partitions = [
                {
                    "name":v.name,
                    "value":v.name,
                    "esfilter":v.esfilter,
                    "style":v.style,
                    "weight":v.weight # YO! WHAT DO WE *NOT* COPY?
                }
                for i, v in enumerate(self.edges)
                if i < coalesce(self.limit, DEFAULT_QUERY_LIMIT) and v.esfilter
            ]
            self.isFacet = True
        elif kwargs.depth == None:  # ASSUME self.fields IS A dict
            partitions = DictList()
            for i, part in enumerate(self.partitions):
                if i >= coalesce(self.limit, DEFAULT_QUERY_LIMIT):
                    break
                partitions.append({
                    "name":part.name,
                    "value":part.value,
                    "esfilter":part.esfilter,
                    "style":coalesce(part.style, part.parent.style),
                    "weight":part.weight   # YO!  WHAT DO WE *NOT* COPY?
                })
        elif kwargs.depth == 0:
            partitions = [
                {
                    "name":v.name,
                    "value":v.value,
                    "esfilter":v.esfilter,
                    "style":v.style,
                    "weight":v.weight   # YO!  WHAT DO WE *NOT* COPY?
                }
                for i, v in enumerate(self.partitions)
                if i < coalesce(self.limit, DEFAULT_QUERY_LIMIT)]
        elif kwargs.depth == 1:
            partitions = DictList()
            rownum = 0
            for i, part in enumerate(self.partitions):
                if i >= coalesce(self.limit, DEFAULT_QUERY_LIMIT):
                    continue
                rownum += 1
                try:
                    for j, subpart in enumerate(part.partitions):
                        partitions.append({
                            "name":join_field(split_field(subpart.parent.name) + [subpart.name]),
                            "value":subpart.value,
                            "esfilter":subpart.esfilter,
                            "style":coalesce(subpart.style, subpart.parent.style),
                            "weight":subpart.weight   # YO!  WHAT DO WE *NOT* COPY?
                        })
                except Exception, e:
                    Log.error("", e)
        else:
            Log.error("deeper than 2 is not supported yet")

        return Domain(
            type=self.type,
            name=self.name,
            partitions=wrap(partitions),
            min=self.min,
            max=self.max,
            interval=self.interval,
            # THE COMPLICATION IS THAT SOMETIMES WE WANT SIMPLE PARTITIONS, LIKE
            # STRINGS, DATES, OR NUMBERS.  OTHER TIMES WE WANT PARTITION OBJECTS
            # WITH NAME, VALUE, AND OTHER MARKUP.
            # USUALLY A "set" IS MEANT TO BE SIMPLE, BUT THE end() FUNCTION IS
            # OVERRIDES EVERYTHING AND IS EXPLICIT.  - NOT A GOOD SOLUTION BECAUSE
            # end() IS USED BOTH TO INDICATE THE QUERY PARTITIONS *AND* DISPLAY
            # COORDINATES ON CHARTS

            # PLEASE SPLIT end() INTO value() (replacing the string value) AND
            # label() (for presentation)
            value="name" if not self.value and self.partitions else self.value,
            key="value",
            label=coalesce(self.label, (self.type == "set" and self.name)),
            end=coalesce(self.end, (self.type == "set" and self.name)),
            isFacet=self.isFacet,
            dimension=self
        )

    def getSelect(self, **kwargs):
        if self.fields:
            if len(self.fields) == 1:
                return Dict(
                    name=self.full_name,
                    value=self.fields[0],
                    aggregate="none"
                )
            else:
                return Dict(
                    name=self.full_name,
                    value=self.fields,
                    aggregate="none"
                )

        domain = self.getDomain(**kwargs)
        if not domain.getKey:
            Log.error("Should not happen")
        if not domain.NULL:
            Log.error("Should not happen")

        return Dict(
            name=self.full_name,
            domain=domain,
            aggregate="none"
        )

def addParts(parentPart, childPath, count, index):
    """
    BUILD A hierarchy BY REPEATEDLY CALLING self METHOD WITH VARIOUS childPaths
    count IS THE NUMBER FOUND FOR self PATH
    """
    if index == None:
        index = 0
    if index == len(childPath):
        return
    c = childPath[index]
    parentPart.count = coalesce(parentPart.count, 0) + count

    if parentPart.partitions == None:
        parentPart.partitions = DictList()
    for i, part in enumerate(parentPart.partitions):
        if part.name == c.name:
            addParts(part, childPath, count, index + 1)
            return

    parentPart.partitions.append(c)
    addParts(c, childPath, count, index + 1)


def parse_partition(part):
    for p in part.partitions:
        if part.index:
            p.index = part.index   # COPY INDEX DOWN
        parse_partition(p)
        p.value = coalesce(p.value, p.name)
        p.parent = part

    if not part.esfilter:
        if len(part.partitions) > 100:
            Log.error("Must define an esfilter on {{name}} there are too many partitions ({{num_parts}})", {
                "name": part.name,
                "num_parts": len(part.partitions)
            })

        # DEFAULT esfilter IS THE UNION OF ALL CHILD FILTERS
        if part.partitions:
            part.esfilter = {"or": part.partitions.esfilter}