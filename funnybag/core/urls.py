from django.conf.urls.defaults import patterns

urlpatterns = patterns('funnybag.core.views',
                       (r'^$', 'main'),

                       (r'^ajax/list/author/(?P<author>.+)$', 'list_by_author'),
                       (r'^ajax/list/tag/(?P<tag>.+)$', 'list_by_tag'),
                       (r'^ajax/list/$', 'list'),

                       (r'^ajax/details/(?P<hash>.+)/$', 'details'),

                       (r'^ajax/new/$', 'new'),
                       (r'^ajax/new/valid/$', 'new_valid'),

                       (r'^ajax/login/$', 'login'),
                       (r'^ajax/login/valid/$', 'login_valid'),

                       (r'^ajax/registration/$', 'registration'),
                       (r'^ajax/registration/valid/$', 'registration_valid'),
                       )

