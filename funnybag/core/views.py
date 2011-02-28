from django.views.generic.simple import direct_to_template
from django.shortcuts import get_object_or_404, get_list_or_404
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect
from django.contrib.auth import forms as auth_form

from funnybag.core import utils
from funnybag.core import models
from funnybag.core import forms

def main(request):
    return direct_to_template(request, 'base.html')

def list(request):
    records = models.Record.objects.order_by('-created_time')
    return direct_to_template(request,
                              'core/list.html',
                              {'records': records})

def details(request, record_id):
    return direct_to_template(request, 'core/details.html',
                              {'record': get_object_or_404(Record, pk=record_id) })

def new(request):
    record_form = forms.RecordForm()

    #Something like constructor
    blocksset = [block(queryset=block.model.objects.none()) for block in forms.blocksset]

    return direct_to_template(request, 'core/new.html',
                              {'record_form': record_form,
                               'blocksset': blocksset})


@utils.json_response
def new_valid(request):
    if request.method == "POST":
        record_form = forms.RecordForm(request.POST)

        #Something like constructor, again ...
        blocksset = [block(request.POST) for block in forms.blocksset]

        # Something like validation method, ...
        if record_form.is_valid() and\
                not [block for block in blocksset if not block.is_valid()]:

            record = record_form.save()
            for block in blocksset:

                print block
                for form in block.forms:
                    models.RecordBlock.objects.create(record=record,
                                                      sequence=form.cleaned_data['sequence'],
                                                      data=form.save())

            return utils.success()
        else:
            print [block.errors for block in blocksset]
            return utils.failed()


