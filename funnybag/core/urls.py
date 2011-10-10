from django.conf.urls.defaults import patterns, url, include

from funnybag.core import feeds
from funnybag.core import resources

urlpatterns = patterns('funnybag.core.views',
                       url(r'^$', 'index'),

                       url(r'^api/record/$', resources.RecordList.as_view()),
                       url(r'^api/record/(?P<pk>[^/]+)/$', resources.RecordDetail.as_view()),
                       url(r'^api/user/authorization/$', resources.UserAuthorization.as_view()),
                       url(r'^upload/$', 'upload'),

                       (r'^rss/?$', feeds.BaseFeed()),
                       (r'^rss/t(ag)?/(?P<tag>.+)/?$', feeds.ByTagFeed()),
                       (r'^rss/a(uthor)?/(?P<author>.+)/?$', feeds.ByAuthorFeed()),
                       )
