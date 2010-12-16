import re

from django import forms
from django.utils.translation import ugettext as _

from funnybag.core.models import *
from funnybag.core import services

class JokeForm(forms.ModelForm):
    class Meta:
        model = Joke
        fields = ('title', 'content', 'source')


class ImageForm(forms.ModelForm):
    url = forms.CharField(required=False)
    
    class Meta:
        model = Image
        fields = ('title', 'image', 'source')


class QuoteForm(forms.ModelForm):
    class Meta:
        model = Quote
        fields = ('title', 'content', 'source')

class VideoForm(forms.ModelForm):
    
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

    class Meta:
        model = Wideo
        fields = ('title', 'embed', 'source')

