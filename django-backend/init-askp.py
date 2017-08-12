from django.contrib.auth.models import Group
from django.contrib.auth.models import Permission

moderator_group, created = Group.objects.get_or_create(name='moderator')

proj_add_perm = Permission.objects.get(codename='ban_question')
moderator_group.permissions.add(proj_add_perm)

proj_add_perm = Permission.objects.get(codename='choose_answer')
moderator_group.permissions.add(proj_add_perm)
