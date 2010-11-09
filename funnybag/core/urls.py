from django.conf.urls.defaults import patterns

urlpatterns = patterns('funnybag.core.views',
                       (r'^$', 'list'),
                       (r'^in_line/?$', 'list'),
                       (r'^(?P<record_id>\d+)$', 'details'),
                       (r'^new/(?P<record_type>.+)/$', 'new'),
                       (r'^new/$', 'new')
                       )
