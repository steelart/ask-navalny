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

def update_question(data, updater):
    question = Question.objects.get(id=data['id'])
    res = updater(question)
    if res is not None and not res:
        return fail_json_response('could not change question')
    qdict = update_and_send_question(question)
    return JsonResponse({'success': True, 'question': qdict})

def update_and_send_answer(answer):
    answer.save()
    adict = answer_to_dict(answer)
    send_object({'type': 'SET_ANSWER_DATA', 'answer': adict})
    return adict

def update_answer(data, updater):
    answer = Answer.objects.get(id=data['id'])
    res = updater(answer)
    if res is not None and not res:
        return fail_json_response('could not change answer')
    adict = update_and_send_answer(answer)
    return JsonResponse({'success': True, 'answer': adict})


def update_answer_status(data, status):
    answer = Answer.objects.get(id=data['id'])
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

    return JsonResponse({
        'success': True,
        'answers': adict,
        'question': qdict})

def reorder_answer(data):
    answer = Answer.objects.get(id=data['id'])
    position = data['position']
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

    return JsonResponse({
        'success': True,
        'answers': adict})


def check_moderator_perms_and_log(request):
    user = request.user
    if not user.has_perm('askp.moderator_perm'):
        raise Http404('No permissions')
    # log all moderator actions
    data = request.POST.dict()
    ModeratorActions.objects.create(
        json=json.dumps(data),
        author=user)

@transaction.atomic
def post_api(request):
    pass_raise_dbg_filter_or_exception(request)
    data = request.POST
    user = request.user
    if not user.is_authenticated:
        return fail_json_response('user is not authenticated')
    print(data)
    action = data['action']
    if action == 'NEW_QUESTION':
        text_message = data['text']
        q = add_new_question(text_str=text_message, author=user)
        qdict = obj_to_dict(q)
        send_object({'type': 'NEW_QUESTION', 'question': qdict})
        return JsonResponse({'success': True, 'id': q.id})

    if action == 'VOTE_FOR_QUESTION':
        def updater(q):  # TODO: make atomic BD operation
            exists = QuestionVoteList.objects.filter(
                question=q, user=user).exists()
            if exists:
                return False
            QuestionVoteList.objects.create(question=q, user=user, state=VOTED)
            q.votes_number += 1
            return True
        return update_question(data, updater)

    if action == 'COMPLAIN_ABOUT_QUESTION':
        def updater(q):  # TODO: make atomic BD operation
            exists = QuestionVoteList.objects.filter(
                question=q, user=user).exists()
            if exists:
                return False
            QuestionVoteList.objects.create(
                question=q,
                user=user,
                state=COMPLAIN)
            q.complains += 1
            return True
        return update_question(data, updater)

    if action == 'NEW_YOUTUBE_ANSWER':
        question_id = data['question_id']
        video_id = data['video_id']
        start = data['start']
        end = data['end']
        # TODO: add video validations (for existance and time)
        question = Question.objects.get(id=question_id)

        a = add_new_youtube_answer(
            author=user,
            question=question,
            video_id=video_id,
            start=start,
            end=end)
        adict = answer_to_dict(a)
        send_object(
            {'type': 'SET_ANSWER_DATA',
             'question_id': question_id,
             'answer': adict})

    if action == 'LIKE_ANSWER':
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
        return update_answer(data, updater)

    if action == 'DISLIKE_ANSWER':
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
        return update_answer(data, updater)

    # Now moderator actions:

    if action == 'APPROVE_QUESTION':
        check_moderator_perms_and_log(request)
        def updater(q):
            if (q.status == UNDECIDED):
                q.status = APPROVED
        return update_question(data, updater)

    if action == 'BAN_QUESTION':
        check_moderator_perms_and_log(request)
        def updater(q):
            q.status = REJECTED
        return update_question(data, updater)

    if action == 'UNBAN_QUESTION':
        check_moderator_perms_and_log(request)
        def updater(q):
            answers = Answer.objects.filter(question=q, status=APPROVED)
            if (answers.exists()):
                q.status = ANSWERED
            else:
                q.status = APPROVED
        return update_question(data, updater)

    if action == 'APPROVE_ANSWER':
        check_moderator_perms_and_log(request)
        return update_answer_status(data, APPROVED)

    if action == 'REJECT_ANSWER':
        check_moderator_perms_and_log(request)
        return update_answer_status(data, REJECTED)

    if action == 'REORDER_ANSWER':
        check_moderator_perms_and_log(request)
        return reorder_answer(data)

    return fail_json_response('unknown action ' + action)
