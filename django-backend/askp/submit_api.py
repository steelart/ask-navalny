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

from channels.channel import Group

from .models import Question
from .models import Answer
from .models import QuestionVoteList
from .models import AnswerVoteList
from .models import obj_to_dict
from .models import answer_to_dict
from .models import add_new_question
from .models import add_new_youtube_answer

from .models import VOTED
from .models import COMPLAIN
from .models import LIKE
from .models import DISLIKE

from .utils import pass_raise_dbg_filter_or_exception
from .utils import fail_json_response


def send_object(obj):
    if COMMON_APP_CONFIG['web_sockets']:
        Group('all').send({'text': json.dumps(obj)})


def update_question(data, updater):
    question = Question.objects.get(id=data['id'])
    res = updater(question)
    if res is not None and not res:
        return fail_json_response('could not change state of question')
    question.save()
    qdict = obj_to_dict(question)
    send_object({'type': 'UPDATE_QUESTION', 'question': qdict})
    return JsonResponse({'success': True})


def update_answer(data, updater):
    answer = Answer.objects.get(id=data['id'])
    res = updater(answer)
    if res is not None and not res:
        return fail_json_response('could not change state of question')
    answer.save()
    adict = answer_to_dict(answer)
    send_object({'type': 'SET_ANSWER_DATA', 'answer': adict})
    return JsonResponse({'success': True})


@transaction.atomic
def post_api(request):
    pass_raise_dbg_filter_or_exception(request)
    data = request.POST
    if not request.user.is_authenticated:
        return fail_json_response('user is not authenticated')
    user = request.user
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

    if action == 'BAN_QUESTION':
        if not request.user.has_perm('askp.ban_question'):
            return fail_json_response('no permissions')

        def updater(q):
            q.banned = True
        return update_question(data, updater)

    if action == 'UNBAN_QUESTION':
        if not request.user.has_perm('askp.ban_question'):
            return fail_json_response('no permissions')

        def updater(q):
            q.banned = False
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

    if action == 'CHOOSE_ANSWER':
        if not request.user.has_perm('askp.choose_answer'):
            return fail_json_response('no permissions')
        # TODO: check rights!
        answer = Answer.objects.get(id=data['id'])
        question = answer.question
        question.official_answer = answer
        question.save()
        qdict = obj_to_dict(question)
        send_object({'type': 'UPDATE_QUESTION', 'question': qdict})
    return JsonResponse({'success': True})
