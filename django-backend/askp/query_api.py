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

from django.http import JsonResponse


from .models import Question
from .models import Answer
from .models import obj_to_dict
from .models import answer_to_dict

from .utils import check_dbg_filter
from .utils import pass_raise_dbg_filter_or_exception


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
    return extract_questions_list(request, Question.objects.filter(official_answer__isnull=False).order_by('-votes_number'))

def answers(request, question_id):
    pass_raise_dbg_filter_or_exception(request)
    adict = {}
    for a in Answer.objects.filter(question=question_id):
        adict[a.id] = answer_to_dict(a)
        #print(a.text_str)
    question = Question.objects.get(id=question_id)
    qdict = obj_to_dict(question)
    return JsonResponse({ 'question' : qdict, 'answers' : adict })



# TODO: Could be slow! Every time we return all found questions.
def search_api(request):
    text = request.GET.get('text', '')
    if text == '':
        return JsonResponse({ 'success' : False, 'diagnostic' : 'text is empty!' })
    questions = Question.objects.filter(text_str__icontains=text)
    found=[]
    for q in questions:
        found.append(obj_to_dict(q))

    return JsonResponse({ 'success' : True, 'found' : found })
