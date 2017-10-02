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

__author__ = 'Merkulov Alexey'

from django.db import models
from django.forms.models import model_to_dict
from django.contrib.auth.models import User

from polymorphic.models import PolymorphicModel


APPROVED='a'
REJECTED='r'
UNDECIDED='u'
ANSWERED='c'  # use c as closed


class Question(models.Model):
    QuestionStatus = (
        (UNDECIDED, 'Undecided'),
        (ANSWERED, 'Answered'),
        (APPROVED, 'Approbed'),
        (REJECTED, 'Rejected'),
    )
    status = models.CharField(
        max_length=1,
        choices=QuestionStatus,
        default=UNDECIDED)
    text_str = models.CharField(max_length=500)
    author = models.ForeignKey(User)
    submit_date = models.DateTimeField(auto_now_add=True)
    answered = models.IntegerField(default=1)
    votes_number = models.IntegerField(default=1)
    complains = models.IntegerField(default=0)

    class Meta:
        permissions = (
            ('moderator_perm', 'Can do moderator actions'),
        )
    def __str__(self):
        return '%s %s %s' % (
            self.text_str,
            self.status,
            self.author.username)


VOTED = 'v'
LIKE = 'l'
DISLIKE = 'd'
COMPLAIN = 'c'


class QuestionVoteList(models.Model):
    QuestionVoteState = (
        (VOTED, 'Voted'),
        (COMPLAIN, 'Complain')
    )
    question = models.ForeignKey(Question)
    user = models.ForeignKey(User)
    state = models.CharField(max_length=1, choices=QuestionVoteState)

    def __str__(self):
        return '%s %s %s' % (
            self.question.text_str,
            self.user.username,
            self.state)


SOFT_BAN = 'v' # banned only content, not user
# content is so bad, that user should be banned with all his unreviewed content
HARD_BAN = 'h'
AUTO_BAN = 'a' # automatic content ban because of user ban

class QuestionBanReason(models.Model):
    QuestionBanReasonType = (
        (SOFT_BAN, 'SoftBan'),
        (HARD_BAN, 'HardBan'),
        (AUTO_BAN, 'AutoBan')
    )
    question = models.ForeignKey(Question)
    user = models.ForeignKey(User)
    ban_type = models.CharField(max_length=1, choices=QuestionBanReasonType)


YOUTUBE = 'y'
TEXT = 't'  # not implemented now

class Answer(PolymorphicModel):
    AnswerTypes = (
        (YOUTUBE, 'Youtube'),
        (TEXT, 'Text')
    )
    AnswerStatus = (
        (UNDECIDED, 'Undecided'),
        (APPROVED, 'Approbed'),
        (REJECTED, 'Rejected'),
    )
    answer_type = models.CharField(max_length=1, choices=AnswerTypes)
    status = models.CharField(
        max_length=1,
        choices=AnswerStatus,
        default=UNDECIDED)
    author = models.ForeignKey(User)
    question = models.ForeignKey(Question)
    submit_date = models.DateTimeField(auto_now_add=True)
    position = models.IntegerField(default=0)  # 0 means undecided
    like_number = models.IntegerField(default=0)
    dislike_number = models.IntegerField(default=0)


class YoutubeAnswer(Answer):
    video_id = models.CharField(max_length=20)
    start = models.IntegerField(default=0)
    end = models.IntegerField(default=0)

class TextAnswer(Answer):
    answer_text = models.CharField(max_length=500)


class AnswerVoteList(models.Model):
    AnswerVoteState = (
        (LIKE, 'Like'),
        (DISLIKE, 'Dislike'),
        (COMPLAIN, 'Complain')
    )
    question = models.ForeignKey(Question)  # unnecessary
    user = models.ForeignKey(User)
    answer = models.ForeignKey(Answer)
    state = models.CharField(max_length=1, choices=AnswerVoteState)

    def __str__(self):
        return '%s %s %s' % (
            self.answer.text_str,
            self.user.username,
            self.state)


class AnswerBanReason(models.Model):
    AnswerBanReasonType = (
        (SOFT_BAN, 'SoftBan'),
        (HARD_BAN, 'HardBan'),
        (AUTO_BAN, 'AutoBan')
    )
    answer = models.ForeignKey(Answer)
    user = models.ForeignKey(User)
    ban_type = models.CharField(max_length=1, choices=AnswerBanReasonType)


def obj_to_dict(obj):
    res = model_to_dict(obj)
    res['submit_date'] = str(obj.submit_date)
    return res


def answer_to_dict(answer):
    res = obj_to_dict(answer)
    return res


def add_new_question(text_str, author):
    q = Question.objects.create(
        text_str=text_str,
        author=author)
    QuestionVoteList.objects.create(
        question=q,
        user=author,
        state=VOTED)
    return q


def add_new_youtube_answer(author, question, video_id, start, end):
    a = YoutubeAnswer.objects.create(
        answer_type=YOUTUBE,
        author=author,
        question=question,
        video_id=video_id,
        start=start,
        end=end)
    return a


# Moderator actions logging
class ModeratorAction(PolymorphicModel):
    submit_date = models.DateTimeField(auto_now_add=True)
    moderator = models.ForeignKey(User)

class ChangeQuestionStatusAction(ModeratorAction):
    ChageStatusAction = (
        (APPROVED, 'Approbed'),
        (REJECTED, 'Rejected'),
        (HARD_BAN, 'UserBanned')
    )
    question = models.ForeignKey(Question)
    new_status = models.CharField(max_length=1, choices=ChageStatusAction)


class ChangeAnswerStatusAction(ModeratorAction):
    ChageStatusAction = (
        (APPROVED, 'Approbed'),
        (REJECTED, 'Rejected'),
        (HARD_BAN, 'UserBanned')
    )
    question = models.ForeignKey(Question)
    answer = models.ForeignKey(Answer)
    new_status = models.CharField(max_length=1, choices=ChageStatusAction)


class ReorderAnswerAction(ModeratorAction):
    new_position = models.IntegerField()
    question = models.ForeignKey(Question)
    answer = models.ForeignKey(Answer)

def mod_act_to_dict(act):
    res = obj_to_dict(act)
    res['type'] = type(act).__name__
    res['moderator_name'] = act.moderator.username
    return res
