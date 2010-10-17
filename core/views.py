from django.views.generic.simple import direct_to_template
from django.shortcuts import get_object_or_404, get_list_or_404

from funnybag.core.models import *

def details(request, record_id):
    return direct_to_template(request, 'core/details.html',
                              {'record': get_object_or_404(Record, pk=record_id) })

def list(request):
    records = Record.objects.order_by('-created_time')
    return direct_to_template(request, 'core/list.html',
                              {'records': records })
