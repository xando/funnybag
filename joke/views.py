from django.views.generic.simple import direct_to_template
from django.shortcuts import get_object_or_404, get_list_or_404

from funnybag.joke.models import *

def details(request, joke_id):
    return direct_to_template(request, 'joke/details.html',
                              {'joke': get_object_or_404(Joke, pk=joke_id) })

def list(request):
    records = Joke.objects.order_by('-created_time')
    return direct_to_template(request, 'joke/list.html',
                              {'records': records })


