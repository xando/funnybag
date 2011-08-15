from django.conf.urls.defaults import patterns, url, include

from funnybag.core import feeds
from funnybag.core import resources

urlpatterns = patterns('funnybag.core.views',
                       url(r'^api/record/$', resources.RecordList.as_view()),
                       url(r'^api/record/(?P<pk>[^/]+)/$', resources.RecordDetail.as_view()),

                       (r'^$', 'main'),
                       (r'^index/$', 'index'),

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
