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
        fields = ("title",'tags')


class ContentNodeForm(forms.ModelForm):
    sequence = forms.CharField(widget=forms.HiddenInput)
    class Meta:
        exclude = ('record',)


class ContentNodeFormSet(BaseModelFormSet):
    def __init__(self, *args, **kwargs):
        kwargs['prefix'] = self.model.type
        self.can_delete = True
        self.extra = 0
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
                                    formset=ContentNodeFormSet)

TextFormSet = modelformset_factory(Text,
                                   form=ContentNodeForm,
                                   formset=ContentNodeFormSet)

ImageFormSet = modelformset_factory(Image,
                                    form=ContentNodeForm,
                                    formset=ContentNodeFormSet)

blocksset = [TextFormSet,
             VideoFormSet,
             ImageFormSet]


class Blockset(object):
    blocks_types = [TextFormSet,
                    VideoFormSet,
                    ImageFormSet]

    def __init__(self, data, files):
        self.blocks = [block(data, files) for block in self.blocks_types]

    def is_valid(self):
        return not [block for block in self.blocks if not block.is_valid()]

    def errors(self):
        errors = []

        for block in self.blocks:
            for i, error in  enumerate(block.errors):
                errors.extend(map(lambda x: ("%s-%s-%s" % (block.prefix,i,x[0]), x[1]),
                                  error.items()))

        return errors

    def __iter__(self):
        for block in self.blocks:
            yield block
