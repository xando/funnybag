from django.views.generic.simple import direct_to_template
from django.shortcuts import get_object_or_404, get_list_or_404
from django.contrib.auth.decorators import login_required

from django.contrib.auth import forms as auth_form

from funnybag.core.models import Record
from funnybag.core.forms import JokeForm, ImageForm, QuoteForm, VideoForm

def details(request, record_id):
    return direct_to_template(request, 'core/details.html',
                              {'record': get_object_or_404(Record, pk=record_id) })

def list(request):
    records = Record.objects.order_by('-created_time')
    login_form = auth_form.AuthenticationForm()
    return direct_to_template(request, 'core/list.html',
                              {'records': records ,
                               'login_form' : login_form,
                               'login_next' : "/"})

def new(request):
    if request.method == 'POST':
        form = JokeForm(request.POST)
        if form.is_valid():
            record = form.save()
            return HttpResponseRedirect(record.get_absolute_url)
    else:
        joke_form = JokeForm()
        image_form = ImageForm()
        quote_form = QuoteForm()
        video_form = VideoForm()

    return direct_to_template(request, 'core/new.html',
                              {'joke_form': joke_form,
                               'image_form': image_form,
                               'quote_form' : quote_form,
                               'video_form' : video_form})
