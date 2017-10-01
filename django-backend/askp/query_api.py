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
from django.db.models import Q

from config.config import *

from .models import Question
from .models import Answer

from .models import ModeratorAction

from .models import obj_to_dict
from .models import answer_to_dict
from .models import mod_act_to_dict

from .models import APPROVED
from .models import REJECTED
from .models import UNDECIDED
from .models import ANSWERED

from .utils import pass_raise_dbg_filter_or_exception
from .utils import fail_json_response

UPLOAD_QUESTIONS_COUNT = SERVER_CONFIG['upload_questions_count']

def query_questions(request):
    pass_raise_dbg_filter_or_exception(request)
    numbers = request.META['QUERY_STRING'].split(',')
    res = []
    for qid in numbers:
        q = Question.objects.get(id=qid)
        res.append(obj_to_dict(q))
    return JsonResponse({'questions': res})



def last_questions(request, list_type, start_id):
    pass_raise_dbg_filter_or_exception(request)

    start_filter = None
    if list_type == 'answered':
        #TODO: order by answer time
        start_filter = Question.objects.filter(status=ANSWERED)
    else:
        if not request.user.has_perm('askp.moderator_perm'):
            raise Http404('No permissions for ' + list_type)
    if list_type == 'all':
        start_filter = Question.objects.all()
    if list_type == 'unanswered':
        q = Q(status=UNDECIDED) | Q(status=APPROVED)
        start_filter = Question.objects.filter(q)
    if list_type == 'approved':
        start_filter = Question.objects.filter(status=APPROVED)
    if list_type == 'undecided':
        start_filter = Question.objects.filter(status=UNDECIDED)
    if list_type == 'banned':
        start_filter = Question.objects.filter(status=REJECTED)
    if list_type == 'newanswers':
        start_filter = Question.objects.filter(answer__status=UNDECIDED)

    if start_filter is None:
        raise Http404('Unknown list type ' + list_type)

    res = []
    if str(start_id) == '0':  # TODO!!
        from_filter = start_filter
    else:
        from_filter = start_filter.filter(id__lt=start_id)

    ids = set()
    for q in from_filter.order_by('-id')[:UPLOAD_QUESTIONS_COUNT]:
        if q.id not in ids:
            res.append(obj_to_dict(q))
            ids.add(q.id)
    return JsonResponse({'questions': res})


def sorted_questions(request, sort_type):
    pass_raise_dbg_filter_or_exception(request)
    query = None
    if sort_type == 'approved':
        query = Question.objects.filter(status=APPROVED)
    if sort_type == 'answered':
        query = Question.objects.filter(status=ANSWERED)

    if query is None:
        raise Http404('Unknown sort type ' + sort_type)

    query = query.order_by('-votes_number')

    # TODO: optimize it!
    qarr = []
    idarr = []
    num = 0
    for q in query:
        if num < UPLOAD_QUESTIONS_COUNT:
            qarr.append(obj_to_dict(q))
        idarr.append(q.id)
        num = num + 1
    return JsonResponse({'questions': qarr, 'id_list': idarr})



def answers(request, question_id):
    pass_raise_dbg_filter_or_exception(request)
    adict = {}
    query = Answer.objects.filter(question=question_id)

    if not request.user.has_perm('askp.moderator_perm'):
        query = query.filter(status=APPROVED)

    for a in query:
        adict[a.id] = answer_to_dict(a)
        # print(a.text_str)
    question = Question.objects.get(id=question_id)
    qdict = obj_to_dict(question)
    return JsonResponse({'question': qdict, 'answers': adict})


def moderator_actions(request, start_id):
    if not request.user.has_perm('askp.moderator_perm'):
        raise Http404('No permissions')
    query = ModeratorAction.objects.all().order_by('-id')
    #if str(start_id) != '0':  # TODO!!
    #    query = query.filter(id__lt=start_id)
    actdict = []
    #print('start:')
    for act in query:
        #print('  act:', act)
        actdict.append(mod_act_to_dict(act))
    return JsonResponse({'modlog': actdict})

# TODO: Could be slow! Every time we return all found questions.
def search_api(request):
    text = request.GET.get('text', '')
    if text == '':
        return JsonResponse({'success': False, 'diagnostic': 'text is empty!'})
    questions = Question.objects.filter(text_str__icontains=text)
    found = []
    for q in questions:
        found.append(obj_to_dict(q))

    return JsonResponse({'success': True, 'found': found})
