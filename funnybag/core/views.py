from tagging.models import TaggedItem

from django.views.generic.simple import direct_to_template
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import login as auth_login

from registration import forms as registration_forms
from funnybag.core.utils import success, failed
from funnybag.core import models
from funnybag.core import forms


def main(request):
    return direct_to_template(request, 'base.html')


def list(request, tags=None):
    if tags:
        records = TaggedItem.objects.get_by_model(models.Record, tags.split("/")).order_by('-created_time')
    else:
        records = models.Record.objects.order_by('-created_time')
    return direct_to_template(request,
                              'core/list.html',
                              {'records': records})


def new(request):
    record_form = forms.RecordForm()

    blockset = forms.Blockset()

    return direct_to_template(request, 'core/new.html',
                              {'record_form': record_form,
                               'blocksset': blockset})


def new_valid(request):
    if request.method == "POST":
        record_form = forms.RecordForm(request.POST)

        blockset = forms.Blockset(request.POST, request.FILES)

        if record_form.is_valid() and blockset.is_valid():
            record = record_form.save()

            for block in blockset:

                for form in block.forms:
                    models.RecordBlock.objects.create(record=record,
                                                      sequence=form.cleaned_data['sequence'],
                                                      data=form.save())
            return success()
        else:
            errors = record_form.errors.items()
            errors.extend(blockset.errors())

            return failed(data=dict(errors))


def details(request, hash):
    record = models.Record.objects.get(pk=hash)
    return direct_to_template(request, 'core/details.html',
                              {"record": record})


def login(request):
    if request.method == "POST":
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            auth_login(request, form.get_user())

            return success()

        return failed(data=dict(form.errors.items()))
    else:
        form = AuthenticationForm()

    return direct_to_template(request, 'registration/login.html',
                              {"form": form})


def registration(request):
    form = registration_forms.RegistrationForm()

    return direct_to_template(request, 'registration/registration.html',
                              {"form": form})

