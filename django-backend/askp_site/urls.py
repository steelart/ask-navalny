"""askp_site URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.10/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import include, url

urlpatterns = [
    url(r'^', include('askp.urls')),
]

# TODO: better move it somewhere
def check_and_reset_auth_data():
    from django.db.utils import OperationalError
    from django.contrib.sites.models import Site
    from allauth.socialaccount.models import SocialApp

    from config.config import COMMON_APP_CONFIG
    from config.config import SERVER_CONFIG

    if COMMON_APP_CONFIG['social_auth'] is None:
        return

    try:
        site = Site.objects.get(id=1)
    except OperationalError: # This happens during database initializations
        return
    site.name = SERVER_CONFIG['domain']
    site.domain = SERVER_CONFIG['domain']
    site.save()

    # Providers could be set via django admin
    auth_config = SERVER_CONFIG['auth_config']
    if auth_config is None:
        return

    cfg = auth_config['google']
    if cfg is not None:
        try:
            app = SocialApp.objects.get(provider='google')
            app.secret = cfg['secret']
            app.client_id = cfg['client_id']
            app.save()
        except SocialApp.DoesNotExist:
            app = SocialApp.objects.create(
                provider='google',
                secret=cfg['secret'],
                client_id=cfg['client_id'],
                name='google provider')
            app.sites.add(site)
            app.save()

# Perform this code once when server starts
check_and_reset_auth_data()
