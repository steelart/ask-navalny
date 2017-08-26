#!/bin/bash -e

echo Build front-end

cd npm-front-end
webpack -p
cd ..

cd dbg-filter
webpack -p
cd ..

echo Copy

rm -rf server-dist
mkdir server-dist

mkdir server-dist/askp
mkdir server-dist/askp_site
mkdir server-dist/config

cp -Lr django-backend/askp/static server-dist/askp/
cp -Lr django-backend/askp/templates server-dist/askp/
cp django-backend/askp/*.py server-dist/askp/

cp django-backend/askp_site/*.py server-dist/askp_site/

cp django-backend/config/*.py server-dist/config/

cp django-backend/*.py server-dist/
cp django-backend/*.sh server-dist/
cp django-backend/*.txt server-dist/

tar -zcvf server-dist-$(date +"%Y%m%d%H%M").tar.gz server-dist
rm -rf server-dist
