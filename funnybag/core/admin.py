from django.contrib import admin
from mptt.admin import MPTTModelAdmin
from funnybag.core.models import *

admin.site.register(Record, MPTTModelAdmin)
admin.site.register(RecordBlock)

admin.site.register(Text)
admin.site.register(Video)
admin.site.register(Image)
