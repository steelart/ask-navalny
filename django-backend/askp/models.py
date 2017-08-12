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

from __future__ import unicode_literals

__author__      = "Merkulov Alexey"

from django.db import models
from django.forms.models import model_to_dict
from django.contrib.auth.models import User


class Question(models.Model):
    text_str = models.CharField(max_length=20000)
    author = models.ForeignKey(User)
    submit_date = models.DateTimeField(auto_now_add=True)
    votes_number = models.IntegerField(default=1)
    official_answer = models.ForeignKey('Answer', null=True, blank=True, default=None, related_name='+')
    banned = models.BooleanField(default=False)
    complains = models.IntegerField(default=0)
    class Meta:
        permissions = (
            ('ban_question', 'Can ban quesion'),
            ('choose_answer', 'Can choose oficial answer'),
        )

VOTED='v'
LIKE='l'
DISLIKE='d'
COMPLAIN='c'

class QuestionVoteList(models.Model):
    QuestionVoteState = (
        (VOTED, 'Voted'),
        (COMPLAIN, 'Complain')
    )
    question = models.ForeignKey(Question)
    user = models.ForeignKey(User)
    state = models.CharField(max_length=1, choices=QuestionVoteState)
    def __str__(self):
        return '%s %s %s' % (self.question.text_str, self.user.username, self.state)

class Answer(models.Model):
    question = models.ForeignKey(Question)
    text_str = models.CharField(max_length=20000)
    submit_date = models.DateTimeField(auto_now_add=True)
    like_number = models.IntegerField(default=0)
    dislike_number = models.IntegerField(default=0)


class AnswerVoteList(models.Model):
    AnswerVoteState = (
        (LIKE, 'Like'),
        (DISLIKE, 'Dislike'),
        (COMPLAIN, 'Complain')
    )
    question = models.ForeignKey(Question) #unnecessary
    user = models.ForeignKey(User)
    answer = models.ForeignKey(Answer)
    state = models.CharField(max_length=1, choices=AnswerVoteState)
    def __str__(self):
        return '%s %s %s' % (self.answer.text_str, self.user.username, self.state)


def obj_to_dict(obj):
    res = model_to_dict(obj)
    res['submit_date'] = str(obj.submit_date)
    return res

def add_new_question(text_str, author):
    q = Question.objects.create(text_str=text_str, author=author)
    QuestionVoteList.objects.create(question=q,user=author,state=VOTED)
    return q

