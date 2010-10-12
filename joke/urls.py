from django.conf.urls.defaults import *

urlpatterns = patterns('joke.views',

                       (r'^$', 'list'),
                       (r'^in_line/?$', 'list'),


                       (r'^(?P<joke_id>\d+)/$', 'details'),)


