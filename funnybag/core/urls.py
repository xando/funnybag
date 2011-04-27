from django.conf.urls.defaults import patterns
# from core.views import login_registration

urlpatterns = patterns('funnybag.core.views',
                       (r'^$', 'main'),
                       (r'^ajax/list/(?P<tags>.+)?$', 'list'),
                       (r'^ajax/new/$', 'new'),
                       (r'^ajax/new/valid/$', 'new_valid'),
                       (r'^ajax/details/(?P<hash>.+)/$', 'details'),
                       (r'^ajax/login/$', 'login_registration'),
                       (r'^ajax/login/valid/$', 'login_valid'),
                       (r'^ajax/registration/valid/$', 'registration_valid'),
                       # (r'^ajax/registration/activate/$', 'registration_activate'),
                       )


# urlpatterns+= patterns('django.contrib.auth.views',
#                        (r'^ajax/login/$', 'login', {'template_name': 'registration/login.html'})
#                        )

