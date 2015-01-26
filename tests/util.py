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
from datetime import timedelta
from pyLibrary import convert
from pyLibrary.collections import OR
from pyLibrary.env.files import File
from pyLibrary.debugs.logs import Log
from pyLibrary.thread.threads import Thread
from pyLibrary.times.dates import Date

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

    def wait_for_logs(self, timeout=None):
        if not timeout:
            timeout = timedelta(seconds=10)

        def logs():
            return self.find("#" + LOG_DIV + " p")

        def status():
            s = self.find("#status")
            if not s:
                return None
            return s[0].text

        # IF THE MESSAGE KEEPS CHANGING OR THE LOGS KEEP INCREASING WE CAN BE
        # CONFIDENT SOMETHING IMPORTANT IS STILL HAPPENING
        self._wait_for_stable(lambda: (status(), len(logs())), timeout)

        output = [convert.json2value(convert.html2unicode(e.get_attribute('innerHTML'))) for e in logs()]
        Log.note("Logs:\n{{logs|indent}}", {"logs": output})
        return output

    def check_for_errors(self, logs, path):
        try:
            errors = [l for l in logs if l.type in ["ALERT", "ERROR"]]
            if errors:
                Log.error("Problem found in {{page}}:\n{{error|indent}}", {
                    "page": path,
                    "error": errors[0]
                })
        finally:
            self.close()


    def _wait_for_stable(self, detect_function, timeout):
        """
        WAIT FOR RESULTS OF detect_function TO BE STABLE
        """
        if not isinstance(timeout, timedelta):
            Log.error("Expecting a timeout as a timedelta")

        detectTime = Date.now()
        oldValue = "probably never an initial value"
        newValue = detect_function()
        while True:
            now = Date.now()
            potentialValue = detect_function()
            if potentialValue != newValue:
                oldValue = newValue
                newValue = potentialValue
                detectTime = now
            if now > detectTime + timeout:
                return
            Thread.sleep(seconds=0.5)

