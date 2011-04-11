from django.views.generic.simple import direct_to_template
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import login as auth_login

from registration import forms as registration_forms

from funnybag.core.utils import json_response, success, failed
from funnybag.core import models
from funnybag.core import forms


def main(request):
    return direct_to_template(request, 'base.html')


def list(request):
    records = models.Record.objects.order_by('-created_time')
    return direct_to_template(request,
                              'core/list.html',
                              {'records': records})


def new(request):
    record_form = forms.RecordForm()

    #Something like constructor
    blocksset = [block(queryset=block.model.objects.none()) for block in forms.blocksset]

    return direct_to_template(request, 'core/new.html',
                              {'record_form': record_form,
                               'blocksset': blocksset})


@json_response
def new_valid(request):
    if request.method == "POST":
        record_form = forms.RecordForm(request.POST)

        #Something like constructor, again ...
        blocksset = [block(request.POST, request.FILES) for block in forms.blocksset]

        # Something like validation method, ...
        if record_form.is_valid() and\
                not [block for block in blocksset if not block.is_valid()]:

            record = record_form.save()
            for block in blocksset:

                for form in block.forms:
                    models.RecordBlock.objects.create(record=record,
                                                      sequence=form.cleaned_data['sequence'],
                                                      data=form.save())

            return success()
        else:
            print [block.errors for block in blocksset]

            return failed()


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

