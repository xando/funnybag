from tagging.models import TaggedItem

from django.views.generic.simple import direct_to_template
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import login as auth_login
from django.contrib.auth import logout as auth_logout
from django.contrib.auth import models as auth_models
from django.http import HttpResponseRedirect

from registration import forms as registration_forms
from funnybag.core.utils import success, failed
from funnybag.core import models
from funnybag.core import forms


def main(request):
    return direct_to_template(request, 'base.html')


def list(request):
    records = models.Record.objects.filter(parent=None)
    return direct_to_template(request,
                              'core/list.html',
                              {'records': records})

def list_by_tag(request, tag):
    records = TaggedItem.objects.get_by_model(models.Record, tag).filter(parent=None)
    return direct_to_template(request,
                              'core/list.html',
                              {'records': records,
                               "title": tag})

def list_by_author(request, author):
    records = models.Record.objects.filter(created_by__username=author).filter(parent=None)
    return direct_to_template(request,
                              'core/list.html',
                              {'records': records,
                               "title": author})

def new(request):
    if not request.user.is_authenticated():
        return failed()

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
            record = record_form.save(commit=False)
            record.created_by = request.user
            record.save()
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
    form = forms.TextForm(initial={"sequence": 0})
    return direct_to_template(request, 'core/details.html',
                              {"record": record,
                               "form": form})

def responses(request, hash):
    record = models.Record.objects.get(pk=hash)
    return direct_to_template(request, 'core/responses.html',
                              {"record": record})


def response_valid(request, hash):
    if request.method == "POST":
        record = models.Record.objects.get(pk=hash)
        form = forms.TextForm(request.POST)
        if form.is_valid():
            record = models.Record.objects.create(parent=record,
                                                  created_by=request.user)
            models.RecordBlock.objects.create(record=record,
                                              sequence=0,
                                              data=form.save())

            return success(data={"record": record.id})

        return failed()


def login(request):
    form = AuthenticationForm()
    return direct_to_template(request, 'registration/login.html',
                              {"form": form})


# ToDo: post and ajax check
def login_valid(request):
    form = AuthenticationForm(data=request.POST)
    if form.is_valid():
        user = form.get_user()
        auth_login(request, user)
        return success(data={"username": user.username})

    return failed(data=dict(form.errors.items()))


def logout(request):
    auth_logout(request)
    return success()


def registration(request):
    form = forms.RegistrationForm()
    return direct_to_template(request, 'registration/registration.html',
                              {"form": form})


def registration_valid(request):
    form = forms.RegistrationForm(data=request.POST)
    if form.is_valid():
        username, email, password = request.POST['username'], request.POST['email'], request.POST['password1']
        auth_models.User.objects.create_user(username, email, password)
        return success()
    else:
        return failed(data=dict(form.errors))

