from time import sleep

from django.contrib.auth.models import Group
from django.contrib.auth.models import User


from askp.models import APPROVED
from askp.models import REJECTED
from askp.models import UNDECIDED
from askp.models import ANSWERED


from askp.submit_api import new_question
from askp.submit_api import new_youtube_answer
from askp.submit_api import approve_question
from askp.submit_api import ban_question
from askp.submit_api import update_answer_status


moderator_group = Group.objects.get(name='moderator')

admin = User.objects.create_user(username='admin', password='123')
moderator_group.user_set.add(admin)

sleep(0.1)

user = User.objects.create_user(username='asker', password='123')

sleep(0.1)

qid = new_question(
    text_str='Как Вы поступите с РПЦ и законом об оскорблении чувств верующих?',
    author=user
    )['id']
approve_question(qid)
aid = new_youtube_answer(
    author=user,
    question_id=qid,
    video_id='AlxU_fCy3zc',
    start=0,
    end=100
    )['id']
aid = new_youtube_answer(
    author=user,
    question_id=qid,
    video_id='R9wGGozRnTU',
    start=3423,
    end=3560
    )['id']
update_answer_status(aid, APPROVED)
aid = new_youtube_answer(
    author=admin,
    question_id=qid,
    video_id='B2l1RoWSzXw',
    start=2609,
    end=3048
    )['id']


sleep(0.1)

qid = new_question(
    text_str='Что думает Навальный о Ройзмане?',
    author=user
    )['id']
approve_question(qid)
aid = new_youtube_answer(
    author=user,
    question_id=qid,
    video_id='8UTINCXIYdg',
    start=1723,
    end=1809
    )['id']
update_answer_status(aid, APPROVED)

sleep(0.1)
qid = new_question(
    text_str='Киким образом Вы собираетесь распускать парламент после вашего избрания?',
    author=user
    )['id']
approve_question(qid)
sleep(0.1)
qid = new_question(
    text_str='Что Вы думаете о регулировании ГМО-продуктов в России?',
    author=user
    )['id']
approve_question(qid)
sleep(0.1)
qid = new_question(
    text_str='По каким политическим или социальным вопросам Вы поменяли своё мнение?',
    author=user
    )['id']
approve_question(qid)
sleep(0.1)
qid = new_question(
    text_str='Как реформировать правоохранительные органы?',
    author=user
    )['id']
approve_question(qid)
sleep(0.1)
qid = new_question(
    text_str='Чей Крым - наш или не наш?',
    author=user
    )['id']
approve_question(qid)
sleep(0.1)
qid = new_question(
    text_str='Откуда и какая вам идёт зарплата? Вы говорили, что ваша работа - работа кандидата в призеденты. Вы подрабатываете ещё кем-то сейчас или Ваша зарплата идёт с бюджета предвыборной компании?',
    author=user
    )['id']

sleep(0.1)
qid = new_question(
    text_str='Ты какую себе зарплату хочешь на посту президента?',
    author=user
    )['id']

user = User.objects.create_user(username='vandal', password='123')

sleep(0.1)
qid = new_question(
    text_str='Алёшка вас всех за лохов держит и на бабло развдит, а тупые бараны за ним ведутся!',
    author=user
    )['id']
ban_question(qid)

sleep(0.1)
qid = new_question(
    text_str='Ну олёшка и дебил!!',
    author=user
    )['id']


# u = User.objects.get(username__exact='superadmin')
# u.set_password('hello')
# u.save()
