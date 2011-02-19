from django.conf.urls.defaults import patterns

urlpatterns = patterns('funnybag.core.views',
                       (r'^$', 'main'),

                       (r'^ajax/list/?', 'list'),
                       (r'^ajax/new/$', 'new'),
                       (r'^ajax/new/valid/(?P<record_type>.+?)/$', 'new_valid'),
                       (r'^ajax/new/(?P<record_type>.+)/$', 'new'),


                       # (r'^in_line/?$', 'list'),
                       (r'^(?P<record_id>\d+)$', 'details'),
                       (r'^new/(?P<record_type>.+)/$', 'new'),
                       (r'^new/$', 'new')
                       )
