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
import pytest

from selenium import webdriver
from util import MoDevMetricsDriver, path2fullpath


@pytest.mark.parametrize(("path", "timeout"), [
    ("fxos/blockers.html", timedelta(seconds=10)),
    ("fxos/nominations.html", timedelta(seconds=10)),
    ("fxos/regressions.html", timedelta(seconds=10)),
    ("fxos/targeted.html#milestone=Milestone.2.1+S6", timedelta(seconds=10)),
    ("fxos/team.html", timedelta(seconds=10)),
    ("fxos/overall.html", timedelta(seconds=10)),
    ("fxos/burndown-feature.html#bugList=1037305", timedelta(seconds=10)),
    ("fxos/burndown-feature-b2g.html#sampleInterval=day&sampleMax=2014-10-26&sampleMin=2014-09-13&scope=Scope.Both+2.1", timedelta(seconds=30)),
    ("fxos/burndown-milestone.html#milestone=Milestone.34+Sprint+1&team=WebRTC+Loop,WebRTC+Platform", timedelta(seconds=10)),
    ("fxos/burndown-release.html#release=2.2", timedelta(seconds=10)),
    ("fxos/burndown-release-compare.html#release=2.0,2.1", timedelta(seconds=10)),
    ("fxos/burndown-ucid.html#scope=Scope.Both+2.1", timedelta(seconds=30))
])
def test_one_page(path, timeout):
    fullpath = path2fullpath(path)

    driver = MoDevMetricsDriver(webdriver.Firefox())

    driver.get(fullpath)
    logs = driver.wait_for_logs(timeout)
    driver.check_if_still_loading(path)# FIND ANY ERRORS IN THE LOGS

    driver.check_for_errors(logs, path)

