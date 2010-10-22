from django.conf.urls.defaults import *

urlpatterns = patterns('core.views',
                       (r'^$', 'list'),
                       (r'^in_line/?$', 'list'),
                       (r'^(?P<record_id>\d+)$', 'details'),
                       (r'^new$', 'new')
                       )
