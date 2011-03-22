import re

from django import forms
from django.forms.models import modelformset_factory
from django.forms.models import BaseModelFormSet
from django.utils.translation import ugettext as _

from funnybag.core.models import *
from funnybag.core import services


class RecordForm(forms.ModelForm):
    class Meta:
        model = Record
        fields = ("title",)


class ContentNodeForm(forms.ModelForm):
    sequence = forms.CharField(widget=forms.HiddenInput)
    class Meta:
        exclude = ('record',)


class ContentNodeFormSet(BaseModelFormSet):
    def __init__(self, *args, **kwargs):
        kwargs['prefix'] = self.model.type
        super(ContentNodeFormSet, self).__init__(*args, **kwargs)


class VideoForm(ContentNodeForm):
    class Meta(ContentNodeForm.Meta):
        model = Video

    source = forms.CharField(required=False, widget=forms.HiddenInput)
    def clean(self):
        cleaned_data = self.cleaned_data

        if cleaned_data.get("embed"):
            try:
                embed_source = re.search("src\=\"(.+?)\"", cleaned_data.get("embed")).groups()[0]
                cleaned_data["source"] = embed_source

                for name, embed in services.items():
                    if name in embed_source.split("."):
                        cleaned_data["embed"] = embed.replace("$name", embed_source)

            except AttributeError:
                self._errors["embed"] = self.error_class([_("Embed looks wrong")])

        return cleaned_data


class MapForm(ContentNodeForm):
    class Meta(ContentNodeForm.Meta):
        model = Map


VideoFormSet = modelformset_factory(Video,
                                    form=VideoForm,
                                    formset=ContentNodeFormSet,
                                    extra=0)

TextFormSet = modelformset_factory(Text,
                                   form=ContentNodeForm,
                                   formset=ContentNodeFormSet,
                                   extra=0)

ImageFormSet = modelformset_factory(Image,
                                    form=ContentNodeForm,
                                    formset=ContentNodeFormSet,
                                    extra=0)

blocksset = [TextFormSet,
             VideoFormSet,
             ImageFormSet]
