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

from django.http import JsonResponse
from django.http import Http404
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth import login
from django.contrib.auth import logout

from django.contrib.auth.models import Group as ModelsGroup

from config.config import *

from .models import QuestionVoteList
from .models import AnswerVoteList

from .models import VOTED
from .models import COMPLAIN
from .models import LIKE
from .models import DISLIKE

from .utils import pass_raise_dbg_filter_or_exception
from .utils import fail_json_response


def logout_ajax(request):
    pass_raise_dbg_filter_or_exception(request)
    logout(request)
    return JsonResponse({'success': True})


def answers_list(user, state):
    res = []
    for av in AnswerVoteList.objects.filter(user=user, state=state):
        res.append(av.answer.id)
    return res


def questions_list(user, state):
    res = []
    for qv in QuestionVoteList.objects.filter(user=user, state=state):
        res.append(qv.question.id)
    return res


def login_responce(user):
    moderator_perm = user.has_perm('askp.moderator_perm')
    return JsonResponse({
        'success': True,
        'username': user.username,
        'is_moderator': moderator_perm,
        'selections': {
            'votes': questions_list(user, VOTED),
            'complains': questions_list(user, COMPLAIN),
            'likes': answers_list(user, LIKE),
            'dislikes': answers_list(user, DISLIKE)
        }
    })


def check_logined(request):
    pass_raise_dbg_filter_or_exception(request)
    if not request.user.is_authenticated:
        return fail_json_response('user is not authenticated')
    return login_responce(request.user)


def simple_login(request):
    pass_raise_dbg_filter_or_exception(request)
    if COMMON_APP_CONFIG['local_users'] is None:
        raise Http404('Simple login is not configured')

    username = request.POST['username']
    password = request.POST['password']
    if password == '':
        return fail_json_response('empty password')
    user = authenticate(username=username, password=password)
    if user is not None:
        login(request, user)
        return login_responce(user)
    else:
        return fail_json_response('incorrect user or password')


def registration(request):
    pass_raise_dbg_filter_or_exception(request)
    if COMMON_APP_CONFIG['local_users'] is None:
        raise Http404('Simple login is not configured')

    username = request.POST['username']
    password = request.POST['password']
    admin = (request.POST['admin'] == 'true')

    if admin and not COMMON_APP_CONFIG['local_users']['admin_registration']:
        raise Http404('Admin registration is not allowed')

    if password == '':
        return fail_json_response('empty password')
    if User.objects.filter(username=username).exists():
        return fail_json_response('user with such name exists')
    else:
        user = User.objects.create_user(username=username, password=password)
        if admin:
            moderator_group = ModelsGroup.objects.get(name='moderator')
            moderator_group.user_set.add(user)
        return JsonResponse({'success': True})
