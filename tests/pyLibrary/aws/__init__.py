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
from boto import sqs

from boto.sqs.message import Message
from pyLibrary import convert
from pyLibrary.debugs.logs import Log
from pyLibrary.dot import unwrap, nvl


def cleanup(settings):
    settings.aws_access_key_id = nvl(
        settings.aws_access_key_id,
        settings.access_key_id,
        settings.username,
        settings.user
    )
    settings.aws_secret_access_key = nvl(
        settings.aws_secret_access_key,
        settings.secret_access_key,
        settings.password
    )
    settings.region = nvl(
        settings.region,
        settings.region_name
    )

    if settings.aws_access_key_id == None or settings.aws_secret_access_key == None:
        Log.error("require aws_access_key_id and aws_secret_access_key to connect to aws")

    return unwrap(settings)


class Queue(object):
    def __init__(self, settings):

        cleanup(settings)
        self.settings = settings
        self.pending = []

        if settings.region not in [r.name for r in sqs.regions()]:
            Log.error("Can not find region {{region}} in {{regions}}", {"region": settings.region, "regions": [r.name for r in sqs.regions()]})

        conn = sqs.connect_to_region(
            region_name=settings.region,
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
        )
        self.queue = conn.get_queue(settings.name)
        if self.queue == None:
            Log.error("Can not find queue with name {{queue}} in region {{region}}", {"queue": settings.name, "region": settings.region})

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()

    def add(self, message):
        m = Message()
        m.set_body(convert.value2json(message))
        self.queue.write(m)

    def pop(self):
        m = self.queue.read(wait_time_seconds=1)
        if m == None:
            return None
        self.pending.append(m)
        return convert.json2value(m.get_body())

    def commit(self):
        pending = self.pending
        self.pending = []
        for p in pending:
            self.queue.delete_message(p)

    def rollback(self):
        self.pending = []

    def close(self):
        self.commit()


from . import s3
