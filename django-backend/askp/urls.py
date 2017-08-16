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

__author__      = "Merkulov Alexey"

from django.conf.urls import url
from django.contrib import admin

from . import views
from . import login_api
from . import submit_api
from . import query_api

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^admin', admin.site.urls),

    url(r'api/search$', query_api.search_api, name='search_api'),
    url(r'api/search/$', query_api.search_api, name='search_api'),
    url(r'api/query-questions$', query_api.query_questions, name='query_questions'),
    url(r'api/last-questions/(?P<start_id>[0-9]+)$', query_api.last_questions, name='last_questions'),
    url(r'api/last-questions/(?P<start_id>[0-9]+)/$', query_api.last_questions, name='last_questions'),
    url(r'api/answers/(?P<question_id>[0-9]+)$', query_api.answers, name='answers'),
    url(r'api/answers/(?P<question_id>[0-9]+)/$', query_api.answers, name='answers'),
    url(r'api/top-questions$', query_api.top_questions, name='top_questions'),
    url(r'api/top-questions/$', query_api.top_questions, name='top_questions'),
    url(r'api/answered-questions$', query_api.answered_questions, name='answered_questions'),
    url(r'api/answered-questions/$', query_api.answered_questions, name='answered_questions'),
    url(r'api/banned-questions$', query_api.banned_questions, name='banned_questions'),
    url(r'api/banned-questions/$', query_api.banned_questions, name='banned_questions'),

    url(r'api/post-api$', submit_api.post_api, name='post_api'),
    url(r'api/post-api/$', submit_api.post_api, name='post_api'),

    url(r'api/logout$', login_api.logout_ajax, name='logout_ajax'),
    url(r'api/logout/$', login_api.logout_ajax, name='logout_ajax'),
    url(r'api/check-logined$', login_api.check_logined, name='check_logined'),
    url(r'api/check-logined/$', login_api.check_logined, name='check_logined'),
    url(r'api/simple-login$', login_api.simple_login, name='simple_login'),
    url(r'api/simple-login/$', login_api.simple_login, name='simple_login'),
    url(r'api/registration$', login_api.registration, name='registration'),
    url(r'api/registration/$', login_api.registration, name='registration'),

    url(r'^', views.reactindex, name='reactindex'),
]
