from django import forms
from funnybag.core.models import *

class JokeForm(forms.ModelForm):
    class Meta:
        model = Joke


class ImageForm(forms.ModelForm):
    url = forms.CharField(required=False)
    class Meta:
        model = Image


class QuoteForm(forms.ModelForm):
    class Meta:
        model = Quote


class VideoForm(forms.ModelForm):
    class Meta:
        model = Wideo

