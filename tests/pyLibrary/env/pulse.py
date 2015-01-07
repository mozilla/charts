# encoding: utf-8
#
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this file,
# You can obtain one at http://mozilla.org/MPL/2.0/.
#
# Author: Kyle Lahnakoski (kyle@lahnakoski.com)
#

from __future__ import unicode_literals
from __future__ import division

from mozillapulse.config import PulseConfiguration
from mozillapulse.consumers import GenericConsumer

from pyLibrary.debugs.logs import Log
from pyLibrary.dot import set_default, unwrap, wrap, nvl
from pyLibrary.thread.threads import Thread


class Pulse(Thread):

    def __init__(self, settings, queue=None, target=None, start=None):
        """
        queue (aka aelf.queue) WILL BE FILLED WITH PULSE PAYLOADS
        target WILL BE CALLED WITH PULSE PAYLOADS AND ack() IF COMPLETE$ED WITHOUT EXCEPTION
        start - USED AS STARTING POINT FOR ASSIGNING THE _meta.count ATTRIBUTE

        settings IS A STRUCT WITH FOLLOWING PARAMETERS

            exchange - name of the Pulse exchange
            topic - message name pattern to subscribe to  ('#' is wildcard)

            host - url to connect (default 'pulse.mozilla.org'),
            port - tcp port (default ssl port 5671),
            user - (default 'public')
            password - (default 'public')
            vhost - http HOST (default '/'),
            ssl - True to use SSL (default True)

            applabel = unknown (default '')
            heartbeat - True to also get the Pulse heartbeat message (default False)
            durable - True to keep queue after shutdown (default (False)

            serializer - (default 'json')
            broker_timezone' - (default 'GMT')

        """

        self.queue = queue
        self.pulse_target = target
        if (queue == None and target == None) or (queue != None and target != None):
            Log.error("Expecting a queue (for fast digesters) or a target (for slow digesters)")

        Thread.__init__(self, name="Pulse consumer for " + settings.exchange, target=self._worker)
        self.settings = set_default({"broker_timezone": "GMT"}, settings, PulseConfiguration.defaults)
        self.settings.callback = self._got_result
        self.settings.user = nvl(self.settings.user, self.settings.username)
        self.settings.applabel = nvl(self.settings.applable, self.settings.queue, self.settings.queue_name)

        self.pulse = GenericConsumer(self.settings, connect=True, **unwrap(self.settings))
        self.count = nvl(start, 0)
        self.start()


    def _got_result(self, data, message):
        data = wrap(data)
        if self.settings.debug:
            Log.note("{{data}}", {"data": data})
        if self.queue != None:
            try:
                data._meta.count = self.count
                self.count += 1
                self.queue.add(data)
                message.ack()
            except Exception, e:
                if not self.queue.closed:  # EXPECTED TO HAPPEN, THIS THREAD MAY HAVE BEEN AWAY FOR A WHILE
                    raise e
        else:
            try:
                self.pulse_target(data)
                message.ack()
            except Exception, e:
                Log.error("Problem processing Pule payload\n{{data|indent}}", {"data": data}, e)

    def _worker(self, please_stop):
        while not please_stop:
            try:
                self.pulse.listen()
            except Exception, e:
                if not please_stop:
                    Log.warning("pulse had problem", e)

    def __exit__(self, exc_type, exc_val, exc_tb):
        Log.note("clean pulse exit")
        self.please_stop.go()
        try:
            self.queue.add(Thread.STOP)
            Log.note("stop put into queue")
        except:
            pass

        try:
            self.pulse.disconnect()
        except Exception, e:
            Log.warning("Can not disconnect during pulse exit, ignoring", e)
        Thread.__exit__(self, exc_type, exc_val, exc_tb)
