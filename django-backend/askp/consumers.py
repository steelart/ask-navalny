# Copyright 2017 Merkulov Alexey
#
# The MIT License
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.

# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.

__author__ = 'Merkulov Alexey'

import json

from django.contrib.auth.models import User

from channels.channel import Group
from channels.sessions import channel_session
from channels.auth import channel_session_user_from_http

import inspect

@channel_session_user_from_http
def ws_connect(message):
    if message.user.has_perm('askp.moderator_perm'):
        obj = {'type': 'CONNECT_HANDSHAKE'}
        message.reply_channel.send({'text': json.dumps(obj)})
        Group('moderator').add(message.reply_channel)
    #TODO: make sure to discard connection

def ws_message(message):
    print('Now there should not be input messages!')


def ws_disconnect(message):
    Group('moderator').discard(message.reply_channel)
