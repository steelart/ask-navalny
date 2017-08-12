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

import json
import urllib2
import requests

from django.db import transaction

from django.shortcuts import render
from django.shortcuts import redirect
from django.http import HttpResponse
from django.http import JsonResponse
from django.template import loader
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth import login
from django.contrib.auth import logout
from django.forms.models import model_to_dict

from django.http import Http404

from channels.channel import Group

from django.contrib.auth.models import Group as Group2

from .models import Question
from .models import Answer
from .models import QuestionVoteList
from .models import AnswerVoteList
from .models import obj_to_dict
from .models import add_new_question

from .models import VOTED
from .models import COMPLAIN
from .models import LIKE
from .models import DISLIKE

try:
    # Python 3
    from urllib.parse import urlparse, parse_qs, urlencode
except ImportError:
    # Python 2
    from urlparse import urlparse, parse_qs
    from urllib import urlencode

try:
    from .local_config import *
except ImportError:
    pass


def check_dbg_filter(request):
    if not 'DEBUG_FILTER_CODE' in globals():
        return True
    dbgcode = request.COOKIES.get('dbgcode', '')
    if dbgcode != DEBUG_FILTER_CODE:
        return False
    return True

def pass_raise_dbg_filter_or_exception(request):
    if not check_dbg_filter(request):
        raise Http404("You need to pass debug filter")

def reactindex(request):
    index = 'askp/reactindex.html'
    if not check_dbg_filter(request):
        index = 'askp/filter.html'
    template = loader.get_template(index)
    context = {}
    return HttpResponse(template.render(context, request))


def query_questions(request):
    pass_raise_dbg_filter_or_exception(request)
    numbers = request.META['QUERY_STRING'].split(',')
    res = []
    for qid in numbers:
        q = Question.objects.get(id=qid)
        res.append(obj_to_dict(q))
    return JsonResponse({ 'questions' : res })

def last_questions(request, start_id):
    pass_raise_dbg_filter_or_exception(request)
    res = []
    start_filter = Question.objects.filter(banned=False).filter(official_answer__isnull=True)
    if str(start_id) == '0': #TODO!!
        from_filter = start_filter
    else:
        from_filter = start_filter.filter(id__lt=start_id)

    for q in from_filter.order_by('-id')[:3]:
        res.append(obj_to_dict(q))
    return JsonResponse({ 'questions' : res })


def extract_questions_list(request, questions_filter):
    #TODO: optimize it!
    qarr = []
    idarr = []
    num = 0
    for q in questions_filter:
        if num < 3:
            qarr.append(obj_to_dict(q))
        idarr.append(q.id)
        num = num + 1
    return JsonResponse({ 'questions' : qarr, 'id_list' : idarr })

def top_questions(request):
    pass_raise_dbg_filter_or_exception(request)
    return extract_questions_list(request, Question.objects.filter(banned=False).filter(official_answer__isnull=True).order_by('-votes_number'))

def banned_questions(request):
    pass_raise_dbg_filter_or_exception(request)
    return extract_questions_list(request, Question.objects.filter(banned=True))

def answered_questions(request):
    pass_raise_dbg_filter_or_exception(request)
    return extract_questions_list(request, Question.objects.filter(official_answer__isnull=False))

def answers(request, question_id):
    pass_raise_dbg_filter_or_exception(request)
    adict = {}
    for a in Answer.objects.filter(question=question_id):
        adict[a.id] = obj_to_dict(a)
        #print(a.text_str)
    question = Question.objects.get(id=question_id)
    qdict = obj_to_dict(question)
    return JsonResponse({ 'question' : qdict, 'answers' : adict })


def get_domain(uri):
    parsed_uri = urlparse(uri)
    domain = '{uri.scheme}://{uri.netloc}/'.format(uri=parsed_uri)
    return domain

def logout_ajax(request):
    pass_raise_dbg_filter_or_exception(request)
    logout(request)
    return JsonResponse({ 'success' : True })


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
    perm_ban_question = user.has_perm('askp.ban_question')
    perm_choose_answer = user.has_perm('askp.choose_answer')
    return JsonResponse({
        'success' : True,
        'username' : user.username,
        'permissions' : {
            'ban_question' : perm_ban_question,
            'choose_answer' : perm_choose_answer
        },
        'selections' : {
            'votes' : questions_list(user, VOTED),
            'complains' : questions_list(user, COMPLAIN),
            'likes' : answers_list(user, LIKE),
            'dislikes' : answers_list(user, DISLIKE)
        }
    })

def check_logined(request):
    pass_raise_dbg_filter_or_exception(request)
    if not request.user.is_authenticated:
        return JsonResponse({ 'success' : False, 'diagnostic' : 'user is not authenticated' })
    return login_responce(request.user)

def simple_login(request):
    pass_raise_dbg_filter_or_exception(request)
    username = request.POST['username']
    password = request.POST['password']
    if password == '':
        return JsonResponse({ 'success' : False, 'diagnostic' : 'empty password' })
    user = authenticate(username=username, password=password)
    if user is not None:
        login(request, user)
        return login_responce(user)
    else:
        return JsonResponse({ 'success' : False, 'diagnostic' : 'incorrect user or password' })


def send_object(obj):
    Group('all').send({'text': json.dumps(obj)})

def update_question(data, updater):
    question = Question.objects.get(id=data['id'])
    res = updater(question)
    if res != None and res == False:
        return JsonResponse({ 'success' : False, 'diagnostic' : 'could not change state of question' })
    question.save()
    qdict = obj_to_dict(question)
    send_object({'type':'UPDATE_QUESTION', 'question': qdict})
    return JsonResponse({ 'success' : True })


def update_answer(data, updater):
    answer = Answer.objects.get(id=data['id'])
    res = updater(answer)
    if res != None and res == False:
        return JsonResponse({ 'success' : False, 'diagnostic' : 'could not change state of question' })
    answer.save()
    adict = obj_to_dict(answer)
    send_object({'type':'SET_ANSWER_DATA', 'answer': adict})
    return JsonResponse({ 'success' : True })


@transaction.atomic
def post_api(request):
    pass_raise_dbg_filter_or_exception(request)
    data = request.POST
    if not request.user.is_authenticated:
        return JsonResponse({ 'success' : False, 'diagnostic' : 'user is not authenticated' })
    user = request.user
    print(data)
    action = data['action']
    if action == 'NEW_QUESTION':
        text_message = data['text']
        q = add_new_question(text_str=text_message, author=user)
        qdict = obj_to_dict(q)
        send_object({'type':'NEW_QUESTION', 'question': qdict})
        return JsonResponse({ 'success' : True, 'id' : q.id})

    if action == 'vote':
        def updater(q): #TODO: make atomic BD operation
            exists = QuestionVoteList.objects.filter(question=q,user=user).exists()
            if exists:
                return False
            QuestionVoteList.objects.create(question=q,user=user,state=VOTED)
            q.votes_number += 1
            return True
        return update_question(data, updater)

    if action == 'COMPLAIN_ON_QUESTION':
        def updater(q): #TODO: make atomic BD operation
            exists = QuestionVoteList.objects.filter(question=q,user=user).exists()
            if exists:
                return False
            QuestionVoteList.objects.create(question=q,user=user,state=COMPLAIN)
            q.complains += 1
            return True
        return update_question(data, updater)

    if action == 'BAN_QUESTION':
        if not request.user.has_perm('askp.ban_question'):
            return JsonResponse({ 'success' : False, 'diagnostic' : 'no permissions' })
        def updater(q): q.banned = True
        return update_question(data, updater)

    if action == 'UNBAN_QUESTION':
        if not request.user.has_perm('askp.ban_question'):
            return JsonResponse({ 'success' : False, 'diagnostic' : 'no permissions' })
        def updater(q): q.banned = False
        return update_question(data, updater)

    if action == 'new_answer':
        text_message = data['text']
        question_id = data['question']
        question = Question.objects.get(id=question_id)

        a = Answer.objects.create(text_str=text_message, question=question)
        adict = obj_to_dict(a)
        send_object({'type':'SET_ANSWER_DATA', 'question_id': question_id, 'answer': adict})

    if action == 'LIKE_ANSWER':
        def updater(a):
            exists = AnswerVoteList.objects.filter(answer=a,user=user).exists()
            if exists:
                return False
            AnswerVoteList.objects.create(question=a.question,answer=a,user=user,state=LIKE)
            a.like_number += 1
            return True
        return update_answer(data, updater)

    if action == 'DISLIKE_ANSWER':
        def updater(a):
            exists = AnswerVoteList.objects.filter(answer=a,user=user).exists()
            if exists:
                return False
            AnswerVoteList.objects.create(question=a.question,answer=a,user=user,state=DISLIKE)
            a.dislike_number += 1
            return True
        return update_answer(data, updater)

    if action == 'CHOOSE_ANSWER':
        if not request.user.has_perm('askp.choose_answer'):
            return JsonResponse({ 'success' : False, 'diagnostic' : 'no permissions' })
        #TODO: check rights!
        answer = Answer.objects.get(id=data['id'])
        question = answer.question
        question.official_answer = answer
        question.save()
        qdict = obj_to_dict(question)
        send_object({'type':'UPDATE_QUESTION', 'question': qdict})
    return JsonResponse({ 'success' : True })



def registration(request):
    pass_raise_dbg_filter_or_exception(request)
    #request.POST.get("title", "")7
    username = request.POST['username']
    password = request.POST['password']
    admin = (request.POST['admin'] == 'true')
    print('registration:', username, admin)
    print (admin)
    if password == '':
        return JsonResponse({ 'success' : False, 'diagnostic' : 'empty password' })
    if User.objects.filter(username=username).exists():
        return JsonResponse({ 'success' : False, 'diagnostic' : 'user with such name exists' })
    else:
        user = User.objects.create_user(username=username, password=password)
        if admin:
            moderator_group = Group2.objects.get(name='moderator')
            moderator_group.user_set.add(user)
        return JsonResponse({ 'success' : True })

def steam_login(request):
    if not 'STEAM_REQUEST_KEY_STR' in globals():
        raise Http404("steam is not supported")
    pass_raise_dbg_filter_or_exception(request)
    uri = request.META['HTTP_REFERER']
    domain = get_domain(uri)
    query = {}
    query['openid.ns'] = 'http://specs.openid.net/auth/2.0'
    query['openid.mode'] = 'checkid_setup'
    query['openid.return_to'] = domain + 'steamlogin/check?returnUrl=' + uri
    query['openid.realm'] = domain
    query['openid.identity'] = 'http://specs.openid.net/auth/2.0/identifier_select'
    query['openid.claimed_id'] = 'http://specs.openid.net/auth/2.0/identifier_select'
    res = 'https://steamcommunity.com/openid/login?' + urlencode(query)
    print res
    return redirect(res);


#TODO: replace by google or other open id loginning
STEAM_API_PREFIX="https://api.steampowered.com/"
STEAM_64_ID_BASE = 76561197960265728


def getJsonObj(url):
    print 'getJsonObj: ' + str(url)
    f = urllib2.urlopen(url)
    return json.load(f)

def getPlayerSummariesUrl64(account_64_id):
    return STEAM_API_PREFIX + "ISteamUser/GetPlayerSummaries/v0002/" + STEAM_REQUEST_KEY_STR + "&steamids=" + str(account_64_id)


#TODO: debug invalid login!
def steam_login_check(request):
    pass_raise_dbg_filter_or_exception(request)
    if not 'STEAM_REQUEST_KEY_STR' in globals():
        raise Http404("steam is not supported")
    print '******'
    print request.build_absolute_uri()
    print '******'
    params = request.GET.copy()
    retParam = params['returnUrl']
    domain = get_domain(retParam)
    del params['returnUrl']
    params['openid.mode'] = 'check_authentication'
    r = requests.post('https://steamcommunity.com/openid/login', params)
    responce_prefix = 'ns:http://specs.openid.net/auth/2.0\nis_valid:'

    invalid_steam_responce = domain + '/loginfail?' + urlencode({'problem' : 'invalid-steam-auth-responce', 'back' : retParam})
    if not r.text.startswith(responce_prefix):
        return redirect(invalid_steam_responce)

    answer = r.text[len(responce_prefix):]

    if answer == 'false\n':
        return domain + '/loginfail?' + urlencode({'problem' : 'authentication-failed', 'back' : retParam})

    if answer == 'true\n':
        responce = redirect(retParam)
        steam_64_id = request.GET['openid.claimed_id'].split('/')[-1]

        if User.objects.filter(username=steam_64_id).exists():
            user = User.objects.get(username=steam_64_id)
        else:
            user = User.objects.create_user(username=steam_64_id)
        print user

        try:
            player_data = getJsonObj(getPlayerSummariesUrl64(steam_64_id))
            player_data_lst = player_data['response']['players']
            personaname = player_data_lst[0]['personaname']
            responce.set_cookie('personaname', personaname)
        except Exception as e:
            print e
            responce.set_cookie('personaname', 'TODO:FIXIT')

        login(request, user)
        #responce.set_cookie('steam_64_id', steam_64_id)
        #responce.set_cookie('steam_32_id', int(steam_64_id) - STEAM_64_ID_BASE)
        return responce

    return redirect(invalid_steam_responce)

#unused for now
def getImage(valid_image, image_type):
    try:
        with open(valid_image, "rb") as f:
            return HttpResponse(f.read(), content_type=("image/" + image_type))
    except IOError:
        red = Image.new('RGBA', (1, 1), (255,0,0,0))
        response = HttpResponse(content_type=("image/" + image_type))
        red.save(response, image_type.upper())
        return response
