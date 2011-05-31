from django.conf.urls.defaults import patterns

from funnybag.core import feeds

urlpatterns = patterns('funnybag.core.views',
                       (r'^$', 'main'),

                       (r'^ajax/list/author/(?P<author>.+)$', 'list_by_author'),
                       (r'^ajax/list/tag/(?P<tag>.+)$', 'list_by_tag'),
                       (r'^ajax/list/$', 'list'),

                       (r'^ajax/details/(?P<hash>.+)/$', 'details'),
                       (r'^ajax/responses/(?P<hash>.+)/$', 'responses'),

                       (r'^ajax/response/(?P<hash>.+)/valid$', 'response_valid'),

                       (r'^ajax/new/$', 'new'),
                       (r'^ajax/new/valid/$', 'new_valid'),

                       (r'^ajax/login/$', 'login'),
                       (r'^ajax/login/valid/$', 'login_valid'),

                       (r'^ajax/logout/$', 'logout'),

                       (r'^ajax/registration/$', 'registration'),
                       (r'^ajax/registration/valid/$', 'registration_valid'),

                       (r'^rss/?$', feeds.BaseFeed()),
                       (r'^rss/t(ag)?/(?P<tag>.+)/?$', feeds.ByTagFeed()),
                       (r'^rss/a(uthor)?/(?P<author>.+)/?$', feeds.ByAuthorFeed()),
                       )

