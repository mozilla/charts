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
from pyLibrary.cnv import CNV
from pyLibrary.collections import OR
from pyLibrary.env.files import File
from pyLibrary.env.logs import Log
from pyLibrary.thread.threads import Thread

LOG_DIV = "test_logs"


def path2fullpath(path):
    fullpath = "file:///" + File(path).abspath.replace("\\", "/")
    if fullpath.find("#") >= 0:
        fullpath = fullpath.replace("#", "#log=" + LOG_DIV + "&")
    else:
        fullpath = fullpath + "#log=" + LOG_DIV
    return fullpath



class MoDevMetricsDriver(object):
    def __init__(self, driver):
        self.driver = driver

    def find(self, selector):
        try:
            return self.driver.find_elements_by_css_selector(selector)
        except Exception, e:
            # IT APPEARS Selenium TREATS "NO MATCH" AS DESERVING OF AN EXCEPTION
            # I CONSIDER IT REASONABLE TO EXPECT SOME ELEMENTS DO NOT EXIST
            return []

    def get(self, *args, **kwargs):
        self.driver.get(*args, **kwargs)
        return self

    def close(self, *args, **kwargs):
        self.driver.close(*args, **kwargs)
        return self

    def check_if_still_loading(self, path):
        # IF SPINNER STILL SHOWS, THEN WE GOT LOADING ISSUES
        isLoading = OR([e.is_displayed() for e in self.find(".loading")])
        if isLoading:
            Log.error("page still loading: {{page}}", {"page": path})

    def wait_for_logs(self):
        old_length = -1
        elements = self.find("#" + LOG_DIV + " p")
        while len(elements) != old_length:
            Thread.sleep(seconds=10)
            old_length = len(elements)
            elements = self.find("#" + LOG_DIV + " p")

        return [CNV.JSON2object(CNV.html2unicode(e.get_attribute('innerHTML'))) for e in elements]

    def check_for_errors(self, logs, path):
        try:
            errors = [l for l in logs if l.type == "ERROR"]
            if errors:
                Log.error("Problem found in {{page}}:\n{{error|indent}}", {
                    "page": path,
                    "error": errors[0]
                })
        finally:
            self.close()
