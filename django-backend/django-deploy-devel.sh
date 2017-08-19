#!/bin/bash -e

python manage.py migrate
python manage.py makemigrations askp
python manage.py sqlmigrate askp 0001
python manage.py migrate

python manage.py shell < init-askp.py

#python manage.py shell < create-dbg-data.py

#python manage.py createsuperuser --username superadmin
