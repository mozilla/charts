# encoding: utf-8
#
#
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this file,
# You can obtain one at http://mozilla.org/MPL/2.0/.
#
# Author: Kyle Lahnakoski (kyle@lahnakoski.com)
#


from datetime import datetime
import io
import os
import shutil

from pyLibrary.strings import utf82unicode
from pyLibrary.maths import crypto
from pyLibrary.dot import nvl, set_default, split_field, join_field
from pyLibrary.dot import listwrap, wrap
from pyLibrary import convert


class File(object):
    """
    ASSUMES ALL FILE CONTENT IS UTF8 ENCODED STRINGS
    """

    def __init__(self, filename, buffering=2 ** 14, suffix=None):
        """
        YOU MAY SET filename TO {"path":p, "key":k} FOR CRYPTO FILES
        """
        if filename == None:
            from pyLibrary.debugs.logs import Log

            Log.error("File must be given a filename")
        elif isinstance(filename, basestring):
            self.key = None
            self._filename = "/".join(filename.split(os.sep))  # USE UNIX STANDARD
            self.buffering = buffering
        else:
            self.key = convert.base642bytearray(filename.key)
            self._filename = "/".join(filename.path.split(os.sep))  # USE UNIX STANDARD
            self.buffering = buffering

        if suffix:
            self._filename = File.add_suffix(self._filename, suffix)

    @classmethod
    def new_instance(cls, *path):
        def scrub(i, p):
            if isinstance(p, File):
                p = p.abspath
            p = p.replace(os.sep, "/")
            if p[-1] == '/':
                p = p[:-1]
            if i > 0 and p[0] == '/':
                p = p[1:]
            return p

        return File('/'.join(scrub(i, p) for i, p in enumerate(path)))


    @property
    def filename(self):
        return self._filename.replace("/", os.sep)

    @property
    def abspath(self):
        return os.path.abspath(self._filename)

    @staticmethod
    def add_suffix(filename, suffix):
        """
        ADD suffix TO THE filename (NOT INCLUDING THE FILE EXTENSION)
        """
        path = filename.split("/")
        parts = path[-1].split(".")
        i = max(len(parts) - 2, 0)
        parts[i] = parts[i] + suffix
        path[-1] = ".".join(parts)
        return "/".join(path)

    @property
    def extension(self):
        parts = self._filename.split("/")[-1].split(".")
        if len(parts) == 1:
            return ""
        else:
            return parts[-1]

    @property
    def name(self):
        parts = self._filename.split("/")[-1].split(".")
        if len(parts) == 1:
            return parts[0]
        else:
            return ".".join(parts[0:-1])

    def set_extension(self, ext):
        """
        RETURN NEW FILE WITH GIVEN EXTENSION
        """
        path = self._filename.split("/")
        parts = path[-1].split(".")
        if len(parts) == 1:
            parts.append(ext)
        else:
            parts[-1] = ext

        path[-1] = ".".join(parts)
        return File("/".join(path))

    def set_name(self, name):
        """
        RETURN NEW FILE WITH GIVEN EXTENSION
        """
        path = self._filename.split("/")
        parts = path[-1].split(".")
        if len(parts) == 1:
            path[-1] = name
        else:
            path[-1] = name + "." + parts[-1]
        return File("/".join(path))

    def backup_name(self, timestamp=None):
        """
        RETURN A FILENAME THAT CAN SERVE AS A BACKUP FOR THIS FILE
        """
        suffix = convert.datetime2string(nvl(timestamp, datetime.now()), "%Y%m%d_%H%M%S")
        return File.add_suffix(self._filename, suffix)

    def read(self, encoding="utf8"):
        with open(self._filename, "rb") as f:
            content = f.read().decode(encoding)
            if self.key:
                return crypto.decrypt(content, self.key)
            else:
                return content

    def read_json(self, encoding="utf8"):
        content = self.read(encoding=encoding)
        value = convert.json2value(content, flexible=True, paths=True)
        return wrap(self._replace_ref(value, [value]))

    def _replace_ref(self, node, path):
        if isinstance(node, dict):
            ref = node["$ref"]
            node["$ref"] = None
            if not ref:
                return_value = node
                candidate = {}
                for k, v in node.items():
                    new_v = self._replace_ref(v, [v] + path)
                    candidate[k] = new_v
                    if new_v is not v:
                        return_value = candidate
                return return_value

            if ref.startswith("http://"):
                import requests

                return set_default({}, node, convert.json2value(requests.get(ref), flexible=True, paths=True))
            elif ref.startswith("file://"):
                ref = ref[7::]
                if ref.startswith("/"):
                    return set_default({}, node, File(ref).read_json(ref))
                else:
                    return set_default({}, node, File.new_instance(self.parent, ref).read_json())
            else:
                # REFER TO SELF
                if ref[0] == ".":
                    # RELATIVE
                    for i, p in enumerate(ref):
                        if p != ".":
                            ref_node = path[i][ref[i::]]
                            return set_default({}, node, ref_node)
                    return set_default({}, node, path[len(ref) - 1])
                else:
                    # ABSOLUTE
                    return set_default({}, node, path[-1][ref])
        elif isinstance(node, list):
            candidate = [self._replace_ref(n, [n] + path) for n in node]
            if all(p[0] is p[1] for p in zip(candidate, node)):
                return node
            return candidate

        return node

    def is_directory(self):
        return os.path.isdir(self._filename)

    def read_ascii(self):
        if not self.parent.exists:
            self.parent.create()
        with open(self._filename, "r") as f:
            return f.read()

    def write_ascii(self, content):
        if not self.parent.exists:
            self.parent.create()
        with open(self._filename, "w") as f:
            f.write(content)

    def write(self, data):
        if not self.parent.exists:
            self.parent.create()
        with open(self._filename, "wb") as f:
            if isinstance(data, list) and self.key:
                from pyLibrary.debugs.logs import Log

                Log.error("list of data and keys are not supported, encrypt before sending to file")

            for d in listwrap(data):
                if not isinstance(d, unicode):
                    from pyLibrary.debugs.logs import Log

                    Log.error("Expecting unicode data only")
                if self.key:
                    f.write(crypto.encrypt(d, self.key).encode("utf8"))
                else:
                    f.write(d.encode("utf8"))

    def __iter__(self):
        # NOT SURE HOW TO MAXIMIZE FILE READ SPEED
        # http://stackoverflow.com/questions/8009882/how-to-read-large-file-line-by-line-in-python
        # http://effbot.org/zone/wide-finder.htm
        def output():
            try:
                with io.open(self._filename, "rb") as f:
                    for line in f:
                        yield utf82unicode(line)
            except Exception, e:
                from pyLibrary.debugs.logs import Log

                Log.error("Can not read line from {{filename}}", {"filename": self._filename}, e)

        return output()

    def append(self, content):
        if not self.parent.exists:
            self.parent.create()
        with open(self._filename, "ab") as output_file:
            if isinstance(content, str):
                from pyLibrary.debugs.logs import Log

                Log.error("expecting to write unicode only")
            output_file.write(content.encode("utf-8"))
            output_file.write(b"\n")

    def add(self, content):
        return self.append(content)

    def extend(self, content):
        try:
            if not self.parent.exists:
                self.parent.create()
            with open(self._filename, "ab") as output_file:
                for c in content:
                    if isinstance(c, str):
                        from pyLibrary.debugs.logs import Log

                        Log.error("expecting to write unicode only")

                    output_file.write(c.encode("utf-8"))
                    output_file.write(b"\n")
        except Exception, e:
            from pyLibrary.debugs.logs import Log

            Log.error("Could not write to file", e)

    def delete(self):
        try:
            if os.path.isdir(self._filename):
                shutil.rmtree(self._filename)
            elif os.path.isfile(self._filename):
                os.remove(self._filename)
            return self
        except Exception, e:
            if e.strerror == "The system cannot find the path specified":
                return
            from pyLibrary.debugs.logs import Log

            Log.error("Could not remove file", e)

    def backup(self):
        names = self._filename.split("/")[-1].split(".")
        if len(names) == 1:
            backup = File(self._filename + ".backup " + datetime.utcnow().strftime("%Y%m%d %H%i%s"))


    def create(self):
        try:
            os.makedirs(self._filename)
        except Exception, e:
            from pyLibrary.debugs.logs import Log

            Log.error("Could not make directory {{dir_name}}", {"dir_name": self._filename}, e)

    @property
    def children(self):
        return [File(self._filename + "/" + c) for c in os.listdir(self.filename)]

    @property
    def parent(self):
        return File("/".join(self._filename.split("/")[:-1]))

    @property
    def exists(self):
        if self._filename in ["", "."]:
            return True
        try:
            return os.path.exists(self._filename)
        except Exception, e:
            return False

    def __bool__(self):
        return self.__nonzero__()


    def __nonzero__(self):
        """
        USED FOR FILE EXISTENCE TESTING
        """
        if self._filename in ["", "."]:
            return True
        try:
            return os.path.exists(self._filename)
        except Exception, e:
            return False
