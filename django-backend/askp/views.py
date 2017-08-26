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

from django.http import HttpResponse
from django.template import loader

from .utils import COMMON_APP_CONFIG
from .utils import check_dbg_filter


# This number should be increased every time API behaviour changes
API_VERSION = 1


def reactindex(request):
    index = 'askp/reactindex.html'
    if not check_dbg_filter(request):
        index = 'askp/filter.html'
    template = loader.get_template(index)
    config = {'api_version': API_VERSION}
    config.update(COMMON_APP_CONFIG)
    context = {'config_data': json.dumps(config)}
    return HttpResponse(template.render(context, request))
