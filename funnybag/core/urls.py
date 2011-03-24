from django.conf.urls.defaults import patterns

urlpatterns = patterns('funnybag.core.views',
                       (r'^$', 'main'),

                       (r'^ajax/list/?', 'list'),
                       (r'^ajax/new/$', 'new'),
                       (r'^ajax/new/valid/$', 'new_valid'),

                       (r'^(?P<record_id>\d+)$', 'details'),
                       (r'^new/(?P<record_type>.+)/$', 'new'),
                       (r'^new/$', 'new')
                       )
