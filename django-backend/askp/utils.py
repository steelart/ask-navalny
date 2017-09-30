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
import urllib2

from django.http import JsonResponse
from django.http import Http404

try:
    # Python 3
    from urllib.parse import urlparse
except ImportError:
    # Python 2
    from urlparse import urlparse

from config.config import *


def check_dbg_filter(request):
    if SERVER_CONFIG['debug_filter'] is None:
        return True
    dbgcode = request.COOKIES.get('dbgcode', '')
    if dbgcode != SERVER_CONFIG['debug_filter']:
        return False
    return True


def pass_raise_dbg_filter_or_exception(request):
    if not check_dbg_filter(request):
        raise Http404('You need to pass debug filter')


def fail_dict(diagnostic):
    return {'success': False, 'diagnostic': diagnostic}


def fail_json_response(diagnostic):
    return JsonResponse(fail_dict(diagnostic))


def get_domain(uri):
    parsed_uri = urlparse(uri)
    domain = '{uri.scheme}://{uri.netloc}/'.format(uri=parsed_uri)
    return domain


def getJsonObj(url):
    # print 'getJsonObj: ' + str(url)
    f = urllib2.urlopen(url)
    return json.load(f)
