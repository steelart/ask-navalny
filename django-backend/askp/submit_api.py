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

from django.db import transaction

from django.http import JsonResponse
from django.http import Http404

from channels.channel import Group

from config.config import *

from .models import Question
from .models import Answer
from .models import QuestionVoteList
from .models import AnswerVoteList
from .models import ModeratorActions
from .models import obj_to_dict
from .models import answer_to_dict
from .models import add_new_question
from .models import add_new_youtube_answer

from .models import APPROVED
from .models import REJECTED
from .models import UNDECIDED
from .models import ANSWERED

from .models import VOTED
from .models import COMPLAIN
from .models import LIKE
from .models import DISLIKE

from .utils import pass_raise_dbg_filter_or_exception
from .utils import fail_json_response


def send_object(obj):
    if COMMON_APP_CONFIG['web_sockets']:
        Group('all').send({'text': json.dumps(obj)})

def update_and_send_question(question):
    question.save()
    qdict = obj_to_dict(question)
    send_object({'type': 'UPDATE_QUESTION', 'question': qdict})
    return qdict

def update_question(question_id, updater):
    question = Question.objects.get(id=question_id)
    res = updater(question)
    if res is not None and not res:
        return fail_json_response('could not change question')
    qdict = update_and_send_question(question)
    return {'success': True, 'question': qdict}

def update_and_send_answer(answer):
    answer.save()
    adict = answer_to_dict(answer)
    send_object({'type': 'SET_ANSWER_DATA', 'answer': adict})
    return adict

def update_answer(answer_id, updater):
    answer = Answer.objects.get(id=answer_id)
    res = updater(answer)
    if res is not None and not res:
        return fail_json_response('could not change answer')
    adict = update_and_send_answer(answer)
    return {'success': True, 'answer': adict}


def update_answer_status(answer_id, status):
    answer = Answer.objects.get(id=answer_id)
    if status == answer.status:
        return fail_json_response('The same status')
    question = answer.question
    qdict = obj_to_dict(question)
    all_answers = Answer.objects.filter(question=question, status=APPROVED)
    if question.status != REJECTED:
        if status == APPROVED and not all_answers.exists():
            # The first approved answer
            question.status = ANSWERED
            qdict = update_and_send_question(question)
        if status != APPROVED and all_answers.count() == 1:
            # Removed only one answer so return question to APPROVED status
            question.status = APPROVED
            qdict = update_and_send_question(question)
    if status == APPROVED:
        count = all_answers.count()
        answer.position = count + 1
    adict = {}
    if status == REJECTED and answer.position != 0:
        # Shift possitions of other approved answers
        need_shift = all_answers.filter(position__gt=answer.position)
        for a in need_shift:
            a.position -= 1
            ad = update_and_send_answer(a)
            adict[a.id] = ad
        answer.position = 0
    answer.status = status
    answer.save()

    ad = update_and_send_answer(answer)
    adict[answer.id] = ad

    return {
        'success': True,
        'answers': adict,
        'question': qdict}

def reorder_answer(answer_id, position):
    answer = Answer.objects.get(id=answer_id)
    if position <= 0:
        return fail_json_response('Incorrect position!')
    if answer.status != APPROVED:
        return fail_json_response('Not approved answer!')
    if answer.position == position:
        return fail_json_response('Same position!')
    question = answer.question
    all_answers = Answer.objects.filter(question=question, status=APPROVED)
    if position > all_answers.count() + 1:
        return fail_json_response('Incorrect position!')
    adict = {}
    if position > answer.position:
        need_shift = all_answers.filter(position__gt=answer.position, position__lte=position)
        for a in need_shift:
            a.position -= 1
            ad = update_and_send_answer(a)
            adict[a.id] = ad
    else:
        need_shift = all_answers.filter(position__gte=position, position__lt=answer.position)
        for a in need_shift:
            a.position += 1
            ad = update_and_send_answer(a)
            adict[a.id] = ad

    answer.position = position
    ad = update_and_send_answer(answer)
    adict[answer.id] = ad

    return {
        'success': True,
        'answers': adict}

def check_moderator_perms_and_log(request):
    user = request.user
    data = request.POST.dict()
    if not user.has_perm('askp.moderator_perm'):
        raise Http404('No api for action ' + data['action'])
    # log all moderator actions
    ModeratorActions.objects.create(
        json=json.dumps(data),
        author=user)

def new_question(author, text_str):
    q = add_new_question(text_str=text_str, author=author)
    qdict = obj_to_dict(q)
    send_object({'type': 'NEW_QUESTION', 'question': qdict})
    return {'success': True, 'id': q.id}

def new_youtube_answer(author, question_id, video_id, start, end):
    # TODO: add video validations (for existance and time)
    question = Question.objects.get(id=question_id)

    a = add_new_youtube_answer(
        author=author,
        question=question,
        video_id=video_id,
        start=start,
        end=end)
    adict = answer_to_dict(a)
    send_object(
        {'type': 'SET_ANSWER_DATA',
         'question_id': question_id,
         'answer': adict})
    return {'success': True, 'id': a.id}

def vote_for_question(user, question_id):
    def updater(q):
        exists = QuestionVoteList.objects.filter(
            question=q, user=user).exists()
        if exists:
            return False
        QuestionVoteList.objects.create(question=q, user=user, state=VOTED)
        q.votes_number += 1
        return True
    return update_question(question_id, updater)

def complain_about_question(user, question_id):
    def updater(q):
        exists = QuestionVoteList.objects.filter(
            question=q, user=user).exists()
        if exists:
            return False
        QuestionVoteList.objects.create(question=q, user=user, state=COMPLAIN)
        q.complains += 1
        return True
    return update_question(question_id, updater)

def like_answer(user, answer_id):
    def updater(a):
        exists = AnswerVoteList.objects.filter(
            answer=a, user=user).exists()
        if exists:
            return False
        AnswerVoteList.objects.create(
            question=a.question,
            answer=a,
            user=user,
            state=LIKE)
        a.like_number += 1
        return True
    return update_answer(answer_id, updater)

def dislike_answer(user, answer_id):
    def updater(a):
        exists = AnswerVoteList.objects.filter(
            answer=a, user=user).exists()
        if exists:
            return False
        AnswerVoteList.objects.create(
            question=a.question,
            answer=a,
            user=user,
            state=DISLIKE)
        a.dislike_number += 1
        return True
    return update_answer(answer_id, updater)


def approve_question(question_id):
    def updater(q):
        answers = Answer.objects.filter(question=q, status=APPROVED)
        if (answers.exists()):
            q.status = ANSWERED
        else:
            q.status = APPROVED
    return update_question(question_id, updater)


def ban_question(question_id):
    def updater(q):
        q.status = REJECTED
    return update_question(question_id, updater)


def post_api_main(request):
    pass_raise_dbg_filter_or_exception(request)
    data = request.POST
    user = request.user
    if not user.is_authenticated:
        return fail_json_response('user is not authenticated')
    print(data)
    action = data['action']
    if action == 'NEW_QUESTION':
        return new_question(user, data['text'])

    if action == 'VOTE_FOR_QUESTION':
        return vote_for_question(user, data['id'])

    if action == 'LIKE_ANSWER':
        return like_answer(user, data['id'])

    if action == 'DISLIKE_ANSWER':
        return dislike_answer(user, data['id'])

    if action == 'COMPLAIN_ABOUT_QUESTION':
        return complain_about_question(user, data['id'])

    if action == 'NEW_YOUTUBE_ANSWER':
        question_id = data['question_id']
        video_id = data['video_id']
        start = data['start']
        end = data['end']
        return new_youtube_answer(user, question_id, video_id, start, end)

    # Now moderator actions:
    check_moderator_perms_and_log(request)

    if action == 'APPROVE_QUESTION' or action == 'UNBAN_QUESTION':
        return approve_question(data['id'])

    if action == 'BAN_QUESTION':
        return ban_question(data['id'])

    if action == 'APPROVE_ANSWER':
        return update_answer_status(data['id'], APPROVED)

    if action == 'REJECT_ANSWER':
        return update_answer_status(data['id'], REJECTED)

    if action == 'REORDER_ANSWER':
        return reorder_answer(data['id'], data['position'])

    raise Http404('No api for action ' + action)

@transaction.atomic
def post_api(request):
    dres = post_api_main(request)
    return JsonResponse(dres)
