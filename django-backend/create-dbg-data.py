from time import sleep

from django.contrib.auth.models import Group
from django.contrib.auth.models import Permission
from django.contrib.auth.models import User

from askp.models import Question
from askp.models import Answer
from askp.models import add_new_question


moderator_group = Group.objects.get(name='moderator')

user = User.objects.create_user(username='first', password='123')
moderator_group.user_set.add(user)

sleep(0.1)

user = User.objects.create_user(username='second', password='123')

sleep(0.1)

user = User.objects.create_user(username='asker', password='123')

sleep(0.1)

q = add_new_question(text_str='Первый вопрос', author=user)
a = Answer.objects.create(text_str='Ответ на вопрос', question=q)
a = Answer.objects.create(text_str='Ещё ответ', question=q)
q.official_answer = a
q.save()

sleep(0.1)

add_new_question(text_str='Второй вопрос', author=user)

sleep(0.1)

add_new_question(text_str='Третий вопрос', author=user)


#u = User.objects.get(username__exact='superadmin')
#u.set_password('hello')
#u.save()
