# encoding: utf-8
#
#
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this file,
# You can obtain one at http://mozilla.org/MPL/2.0/.
#
# Author: Kyle Lahnakoski (kyle@lahnakoski.com)
#
from __future__ import unicode_literals
from __future__ import division
from pyLibrary.debugs.logs import Log
from pyLibrary.dot import unwrap, set_default


def new_instance(settings):
    """
    MAKE A PYTHON INSTANCE

    settings HAS ALL THE kwargs, PLUS class ATTRIBUTE TO INDICATE THE CLASS TO CREATE
    """
    settings = set_default({}, settings)
    if not settings["class"]:
        Log.error("Expectiong 'class' attribute with fully qualified class name")

    # IMPORT MODULE FOR HANDLER
    path = settings["class"].split(".")
    class_name = path[-1]
    path = ".".join(path[:-1])
    constructor = None
    try:
        temp = __import__(path, globals(), locals(), [class_name], -1)
        constructor = object.__getattribute__(temp, class_name)
    except Exception, e:
        Log.error("Can not find class {{class}}", {"class": path}, e)

    settings['class'] = None
    try:
        return constructor(settings=settings)  # MAYBE IT TAKES A SETTINGS OBJECT
    except Exception:
        pass

    try:
        return constructor(**unwrap(settings))
    except Exception, e:
        Log.error("Can not create instance of {{name}}", {"name":".".join(path)}, e)

def get_function_by_name(full_name):
    """
    RETURN FUNCTION
    """

    # IMPORT MODULE FOR HANDLER
    path = full_name.split(".")
    function_name = path[-1]
    path = ".".join(path[:-1])
    constructor = None
    try:
        temp = __import__(path, globals(), locals(), [function_name], -1)
        output = object.__getattribute__(temp, function_name)
        return output
    except Exception, e:
        Log.error("Can not find function {{name}}", {"name": full_name}, e)
