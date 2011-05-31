from django.conf.urls.defaults import patterns, include
from django.conf import settings

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
                       (r'^', include('funnybag.core.urls')),
                       (r'^root/doc/', include('django.contrib.admindocs.urls')),
                       (r'^root/', include(admin.site.urls)),
                       )

if settings.DEBUG:
    urlpatterns += patterns('',
                            (r'^media/(?P<path>.*)$', 'django.views.static.serve',
                             {'document_root': settings.MEDIA_ROOT,
                              'show_indexes': True}),
                            )
