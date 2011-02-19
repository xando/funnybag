from django.views.generic.simple import direct_to_template
from django.shortcuts import get_object_or_404, get_list_or_404
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect
from django.contrib.auth import forms as auth_form

from funnybag.core import utils
from funnybag.core.models import Record
from funnybag.core.forms import JokeForm, ImageForm, QuoteForm, VideoForm

def main(request):
    return direct_to_template(request, 'base.html')

def list(request):
    records = Record.objects.order_by('-created_time')
    return direct_to_template(request,
                              'core/list.html',
                              {'records': records})

def details(request, record_id):
    return direct_to_template(request, 'core/details.html',
                              {'record': get_object_or_404(Record, pk=record_id) })

# def list(request):
#     records = Record.objects.order_by('-created_time')
#     login_form = auth_form.AuthenticationForm()
#     return direct_to_template(request, 'core/list.html',
#                               {'records': records ,
#                                'login_form' : login_form,
#                                'login_next' : "/"})

form_types = {'joke' : JokeForm,
              'image' : ImageForm,
              'quote' : QuoteForm,
              'video' : VideoForm}

# @login_required
def new(request, record_type=None):
    print record_type
    if not record_type:
        return direct_to_template(request, 'core/new.html', {})

    form = form_types[record_type]()

    return direct_to_template(request, 'core/new.html',
                              {'form': form,
                               'record_type' : record_type })


@utils.json_response
def new_valid(request, record_type=None):
    if request.method == "POST":
        form = form_types[record_type](request.POST)
        if form.is_valid():
            record_object = form.save(commit=False)
            record_object.save(user=request.user)
            return utils.success()

        return utils.failed()
