from django.conf.urls.defaults import patterns

urlpatterns = patterns('funnybag.core.views',
                       (r'^$', 'main'),

                       (r'^ajax/list/?', 'list'),
                       (r'^ajax/new/$', 'new'),
                       (r'^ajax/new/valid/$', 'new_valid'),
                       (r'^ajax/details/(?P<hash>.+)/$', 'details'),
                       (r'^ajax/login/(?P<hash>.+)/$', 'login'),

                       )


# urlpatterns+= patterns('django.contrib.auth.views',
#                        (r'^ajax/login/$', 'login', {'template_name': 'registration/login.html'})
#                        )

