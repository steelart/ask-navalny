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

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^admin', admin.site.urls),
    url(r'steamlogin$', views.steam_login, name='steam_login'),
    url(r'steamlogin/$', views.steam_login, name='steam_login'),
    url(r'steamlogin/check$', views.steam_login_check, name='steam_login_check'),
    url(r'steamlogin/check/$', views.steam_login_check, name='steam_login_check'),
    url(r'api/post-api$', views.post_api, name='post_api'),
    url(r'api/post-api/$', views.post_api, name='post_api'),
    url(r'api/search$', views.search_api, name='search_api'),
    url(r'api/search/$', views.search_api, name='search_api'),
    url(r'api/logout$', views.logout_ajax, name='logout_ajax'),
    url(r'api/logout/$', views.logout_ajax, name='logout_ajax'),
    url(r'api/check-logined$', views.check_logined, name='check_logined'),
    url(r'api/check-logined/$', views.check_logined, name='check_logined'),
    url(r'api/simple-login$', views.simple_login, name='simple_login'),
    url(r'api/simple-login/$', views.simple_login, name='simple_login'),
    url(r'api/registration$', views.registration, name='registration'),
    url(r'api/registration/$', views.registration, name='registration'),
    url(r'api/query-questions$', views.query_questions, name='query_questions'),
    url(r'api/last-questions/(?P<start_id>[0-9]+)$', views.last_questions, name='last_questions'),
    url(r'api/last-questions/(?P<start_id>[0-9]+)/$', views.last_questions, name='last_questions'),
    url(r'api/answers/(?P<question_id>[0-9]+)$', views.answers, name='answers'),
    url(r'api/answers/(?P<question_id>[0-9]+)/$', views.answers, name='answers'),
    url(r'api/top-questions$', views.top_questions, name='top_questions'),
    url(r'api/top-questions/$', views.top_questions, name='top_questions'),
    url(r'api/answered-questions$', views.answered_questions, name='answered_questions'),
    url(r'api/answered-questions/$', views.answered_questions, name='answered_questions'),
    url(r'api/banned-questions$', views.banned_questions, name='banned_questions'),
    url(r'api/banned-questions/$', views.banned_questions, name='banned_questions'),

    url(r'^', views.reactindex, name='reactindex'),
]
