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
from .models import ModeratorAction
from .models import QuestionBanReason
from .models import AnswerBanReason

from .models import ChangeQuestionStatusAction
from .models import ChangeAnswerStatusAction
from .models import ReorderAnswerAction

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

from .models import SOFT_BAN
from .models import HARD_BAN
from .models import AUTO_BAN

from .utils import pass_raise_dbg_filter_or_exception
from .utils import fail_dict


def get_question(question_id):
    return Question.objects.get(id=question_id)

def get_answer(answer_id):
    return Answer.objects.get(id=answer_id)

def send_object(obj):
    if COMMON_APP_CONFIG['web_sockets']:
        Group('all').send({'text': json.dumps(obj)})

def update_and_send_question(question):
    question.save()
    qdict = obj_to_dict(question)
    send_object({'type': 'UPDATE_QUESTION', 'question': qdict})
    return qdict

def update_question(question_id, updater):
    question = get_question(question_id)
    res = updater(question)
    if res is not None and not res:
        return fail_dict('could not change question')
    qdict = update_and_send_question(question)
    return {'success': True, 'question': qdict}

def update_and_send_answer(answer):
    answer.save()
    adict = answer_to_dict(answer)
    send_object({'type': 'SET_ANSWER_DATA', 'answer': adict})
    return adict

def update_answer(answer_id, updater):
    answer = get_answer(answer_id)
    res = updater(answer)
    if res is not None and not res:
        return fail_dict('could not change answer')
    adict = update_and_send_answer(answer)
    return {'success': True, 'answer': adict}

def set_ban_for_question(question, ban_type):
    QuestionBanReason.objects.create(
        question=question,
        user=question.author,
        ban_type=ban_type)

def set_ban_for_answer(answer, ban_type):
    AnswerBanReason.objects.create(
        answer=answer,
        user=answer.author,
        ban_type=ban_type)


def unban_auto_banned_if_needed(ban):
    qdict = {}
    adict = {}
    rdict = {'questions': qdict, 'answers': adict}
    if ban.ban_type != HARD_BAN:
        return rdict
    hard_ban_q_count = QuestionBanReason.objects.filter(
            user=ban.user,
            ban_type=HARD_BAN
        ).count()
    hard_ban_a_count = AnswerBanReason.objects.filter(
            user=ban.user,
            ban_type=HARD_BAN
        ).count()
    if hard_ban_q_count + hard_ban_a_count == 1:
        # unban autobanned questions:
        auto_banned = QuestionBanReason.objects.filter(
            user=ban.user,
            ban_type=AUTO_BAN)
        for b in auto_banned:
            q = b.question
            q.status = UNDECIDED
            qd = update_and_send_question(q)
            qdict[q.id] = qd
        auto_banned.delete()
        # unban autobanned answers:
        auto_banned = AnswerBanReason.objects.filter(
            user=ban.user,
            ban_type=AUTO_BAN)
        for b in auto_banned:
            a = b.answer
            a.status = UNDECIDED
            ad = update_and_send_answer(a)
            adict[a.id] = ad
        auto_banned.delete()
    return rdict


def auto_ban_undecided(content, content_type):
    qdict = {}
    adict = {}
    rdict = {'questions': qdict, 'answers': adict}
    user = content.author
    answers = Answer.objects.filter(author=user, status=UNDECIDED)
    for a in answers:
        if content_type == 'answer' and a.id == content.id:
            continue
        a.status = REJECTED
        set_ban_for_answer(a, AUTO_BAN)
        ad = update_and_send_answer(a)
        adict[a.id] = ad
    questions = Question.objects.filter(author=user, status=UNDECIDED)
    for q in questions:
        if content_type == 'question' and q.id == content.id:
            continue
        q.status = REJECTED
        set_ban_for_question(q, AUTO_BAN)
        qd = update_and_send_question(q)
        qdict[q.id] = qd
    return rdict

# status is extended by HARD_BAN
def update_answer_status(answer_id, status):
    answer = get_answer(answer_id)
    old_status = answer.status
    if status == HARD_BAN and old_status == REJECTED:
        if AnswerBanReason.objects.get(answer=answer).ban_type == HARD_BAN:
            return fail_dict('The same status')

    if status == HARD_BAN:
        status = REJECTED
        hard_ban = True
    else:
        hard_ban = False

    if status == answer.status:
        return fail_dict('The same status')
    question = answer.question
    qdict = obj_to_dict(question)
    approved_answers = Answer.objects.filter(question=question, status=APPROVED)
    if question.status != REJECTED:
        if status == APPROVED and not approved_answers.exists():
            # The first approved answer
            question.status = ANSWERED
            qdict = update_and_send_question(question)
        if status != APPROVED and approved_answers.count() == 1:
            # Removed only one answer so return question to APPROVED status
            question.status = APPROVED
            qdict = update_and_send_question(question)
    if status == APPROVED:
        count = approved_answers.count()
        answer.position = count + 1
    adict = {}

    if status == REJECTED:
        if hard_ban:
            auto_ban_undecided(answer, 'answer')
            set_ban_for_answer(answer, HARD_BAN)
        else:
            # Soft ban
            set_ban_for_answer(answer, SOFT_BAN)
    elif old_status == REJECTED:
        # Unban answer
        ban = AnswerBanReason.objects.get(answer=answer)
        unban_auto_banned_if_needed(ban)
        ban.delete()

    if status == REJECTED and answer.position != 0:
        # Shift possitions of other approved answers
        need_shift = approved_answers.filter(position__gt=answer.position)
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
    answer = get_answer(answer_id)
    print('reorder new position: ' + str(position))
    if position <= 0:
        return fail_dict('Incorrect position!')
    if answer.status != APPROVED:
        return fail_dict('Not approved answer!')
    if answer.position == position:
        return fail_dict('Same position!')
    question = answer.question
    all_answers = Answer.objects.filter(question=question, status=APPROVED)
    #print('reorder all answers: ' + str(all_answers.count()))
    if position > all_answers.count() + 1:
        return fail_dict('Incorrect position!')
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
    ModeratorAction.objects.create(
        json=json.dumps(data),
        moderator=user)

def new_question(author, text_str):
    q = add_new_question(text_str=text_str, author=author)
    qdict = obj_to_dict(q)
    send_object({'type': 'NEW_QUESTION', 'question': qdict})
    return {'success': True, 'id': q.id}

def new_youtube_answer(author, question_id, video_id, start, end):
    # TODO: add video validations (for existance and time)
    question = get_question(question_id)

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
    qdict = {}
    def updater(q):
        if q.status == REJECTED:
            ban = QuestionBanReason.objects.get(question=q)
            unban_auto_banned_if_needed(ban)
            QuestionBanReason.objects.filter(question=q).delete()
        answers = Answer.objects.filter(question=q, status=APPROVED)
        if (answers.exists()):
            q.status = ANSWERED
        else:
            q.status = APPROVED
    return update_question(question_id, updater)


def ban_question(question_id):
    def updater(q):
        q.status = REJECTED
        set_ban_for_question(q, SOFT_BAN)
    return update_question(question_id, updater)


def ban_question_and_user(question_id):
    def updater(q):
        q.status = REJECTED
        set_ban_for_question(q, HARD_BAN)
    res = update_question(question_id, updater)
    question = get_question(question_id)
    auto_ban_undecided(question, 'question')
    return res


def user_is_banned(user):
    if AnswerBanReason.objects.filter(user=user, ban_type=HARD_BAN):
        return True
    if QuestionBanReason.objects.filter(user=user, ban_type=HARD_BAN):
        return True
    return False

def post_api_main(request):
    pass_raise_dbg_filter_or_exception(request)
    data = request.POST
    user = request.user
    if not user.is_authenticated:
        return fail_dict('user is not authenticated')
    if user_is_banned(user):
        return fail_dict('user is banned')

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
    if not user.has_perm('askp.moderator_perm'):
        raise Http404('No API for action ' + data['action'])

    content_id = data['id']

    if action == 'APPROVE_QUESTION' or action == 'UNBAN_QUESTION':
        res = approve_question(content_id)
        ChangeQuestionStatusAction.objects.create(
            moderator=user,
            question=get_question(content_id),
            new_status=APPROVED
        )
        return res

    if action == 'BAN_QUESTION':
        res = ban_question(content_id)
        ChangeQuestionStatusAction.objects.create(
            moderator=user,
            question=get_question(content_id),
            new_status=REJECTED
        )
        return res

    if action == 'BAN_QUESTION_AND_AUTHOR':
        res = ban_question_and_user(content_id)
        ChangeQuestionStatusAction.objects.create(
            moderator=user,
            question=get_question(content_id),
            new_status=HARD_BAN
        )
        return res

    if action == 'APPROVE_ANSWER':
        res = update_answer_status(content_id, APPROVED)
        answer = get_answer(content_id)
        ChangeAnswerStatusAction.objects.create(
            moderator=user,
            answer=answer,
            question=answer.question,
            new_status=APPROVED
        )
        return res

    if action == 'REJECT_ANSWER':
        res = update_answer_status(content_id, REJECTED)
        answer = get_answer(content_id)
        ChangeAnswerStatusAction.objects.create(
            moderator=user,
            answer=answer,
            question=answer.question,
            new_status=REJECTED
        )
        return res

    if action == 'BAN_ANSWER_AND_AUTHOR':
        res = update_answer_status(content_id, HARD_BAN)
        answer = get_answer(content_id)
        ChangeAnswerStatusAction.objects.create(
            moderator=user,
            answer=answer,
            question=answer.question,
            new_status=HARD_BAN
        )
        return res

    if action == 'REORDER_ANSWER':
        position = int(data['position'])
        res = reorder_answer(content_id, position)
        answer = get_answer(content_id)
        ReorderAnswerAction.objects.create(
            moderator=user,
            answer=answer,
            question=answer.question,
            new_position=position
        )
        return res

    raise Http404('No API for action ' + action)

@transaction.atomic
def post_api(request):
    dres = post_api_main(request)
    print dres
    return JsonResponse(dres)
