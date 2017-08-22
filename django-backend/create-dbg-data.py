from time import sleep

from django.contrib.auth.models import Group
from django.contrib.auth.models import Permission
from django.contrib.auth.models import User

from askp.models import Question
from askp.models import Answer
from askp.models import add_new_question
from askp.models import add_new_youtube_answer


moderator_group = Group.objects.get(name='moderator')

admin = User.objects.create_user(username='admin', password='123')
moderator_group.user_set.add(admin)

sleep(0.1)

user = User.objects.create_user(username='asker', password='123')

sleep(0.1)

q = add_new_question(text_str='Как Вы поступите с РПЦ и законом об оскорблении чувств верующих?', author=user)
a = add_new_youtube_answer(author=user , question=q, video_id='R9wGGozRnTU', start=3423, end=3560)
a = add_new_youtube_answer(author=admin, question=q, video_id='B2l1RoWSzXw', start=2609, end=3048)
q.official_answer = a
q.save()

sleep(0.1)

q = add_new_question(text_str='Что думает Навальный о Ройзмане?', author=user)
a = add_new_youtube_answer(author=user , question=q, video_id='8UTINCXIYdg', start=1723, end=1809)

sleep(0.1)
add_new_question(text_str='Киким образом Вы собираетесь распускать парламент после вашего избрания?', author=user)
sleep(0.1)
add_new_question(text_str='Что Вы думаете о регулировании ГМО-продуктов в России?', author=user)
sleep(0.1)
add_new_question(text_str='По каким политическим или социальным вопросам Вы поменяли своё мнение?', author=user)
sleep(0.1)
add_new_question(text_str='Откуда и какая вам идёт зарплата? Вы говорили, что ваша работа - работа кандидата в призеденты. Вы подрабатываете ещё кем-то сейчас или Ваша зарплата идёт с бюджета предвыборной компании?', author=user)

user = User.objects.create_user(username='vandal', password='123')

sleep(0.1)
add_new_question(text_str='Алёшка вас всех за лохов держит и на бабло развдит, а тупые бараны за ним ведутся!', author=user)
sleep(0.1)
add_new_question(text_str='Ты какую себе зарплату хочешь на посту президента?', author=user)


#u = User.objects.get(username__exact='superadmin')
#u.set_password('hello')
#u.save()

