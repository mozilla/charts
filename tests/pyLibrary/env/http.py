# encoding: utf-8
#
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this file,
# You can obtain one at http://mozilla.org/MPL/2.0/.
#
# Author: Kyle Lahnakoski (kyle@lahnakoski.com)
#

# MIMICS THE requests API (http://docs.python-requests.org/en/latest/)
# WITH ADDED default_headers THAT CAN BE SET USING pyLibrary.debugs.settings
# EG
# {"debug.constants":{
#     "pyLibrary.env.http.default_headers={
#         "From":"klahnakoski@mozilla.com"
#     }
# }}


from __future__ import unicode_literals
from __future__ import division

from requests import sessions

from pyLibrary.dot import Dict


default_headers = Dict()  # TODO: MAKE THIS VARIABLE A SPECIAL TYPE OF EXPECTED MODULE PARAMETER SO IT COMPLAINS IF NOT SET
_warning_sent = False

def request(method, url, **kwargs):
    if not default_headers and not _warning_sent:
        globals()["_warning_sent"]=True
        from pyLibrary.debugs.logs import Log

        Log.warning("The pyLibrary.env.http module was meant to add extra "
                    "default headers to all requests, specifically the 'From' "
                    "header with a URL to the project, or email of developer. "
                    "Use the constants.set() function to set pyLibrary.env.http.default_headers"
        )

    session = sessions.Session()
    session.headers.update(default_headers)
    return session.request(method=method, url=url, **kwargs)


def get(url, **kwargs):
    kwargs.setdefault('allow_redirects', True)
    return request('get', url, **kwargs)


def options(url, **kwargs):
    kwargs.setdefault('allow_redirects', True)
    return request('options', url, **kwargs)


def head(url, **kwargs):
    kwargs.setdefault('allow_redirects', False)
    return request('head', url, **kwargs)


def post(url, data=None, **kwargs):
    return request('post', url, data=data, **kwargs)


def put(url, data=None, **kwargs):
    return request('put', url, data=data, **kwargs)


def patch(url, data=None, **kwargs):
    return request('patch', url,  data=data, **kwargs)


def delete(url, **kwargs):
    return request('delete', url, **kwargs)


