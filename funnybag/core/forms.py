import re

from django import forms
from django.forms.models import modelformset_factory, BaseModelFormSet
from django.utils.translation import ugettext as _

from funnybag.core.models import *
from django.contrib.auth.models import User
from django.core.files.uploadedfile import InMemoryUploadedFile
from funnybag.core import services


class RecordForm(forms.ModelForm):
    class Meta:
        model = Record
        fields = ("title",'tags')


class RecordResponseForm(forms.ModelForm):
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


class TextForm(ContentNodeForm):
    class Meta(ContentNodeForm.Meta):
        model = Text


class ImageForm(ContentNodeForm):
    image = forms.FileField(required=False)
    url = forms.URLField(required=False)

    class Meta(ContentNodeForm.Meta):
        model = Image

    def clean(self):
        cleaned_data = self.cleaned_data
        url = cleaned_data['url']

        if not url:
            return cleaned_data

        import urllib2
        import StringIO

        response = urllib2.urlopen(url)

        image_file = StringIO.StringIO(response.read())
        image_file_name =  url.split("/")[-1]

        content_lenght = response.info().get('content-length')
        content_type = response.info().get('content-type')

        url_file = InMemoryUploadedFile(
            file = image_file,
            field_name = "image",
            name = image_file_name,
            content_type = content_type,
            size = int(content_lenght),
            charset = "utf-8"
            )

        cleaned_data["image"] = url_file

        print "test"
        return cleaned_data

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


class CodeForm(ContentNodeForm):
    class Meta(ContentNodeForm.Meta):
        model = Code


VideoFormSet = modelformset_factory(Video,
                                    form=VideoForm,
                                    formset=ContentNodeFormSet)

TextFormSet = modelformset_factory(Text,
                                   form=ContentNodeForm,
                                   formset=ContentNodeFormSet)

LinkFormSet = modelformset_factory(Link,
                                   form=ContentNodeForm,
                                   formset=ContentNodeFormSet)

ImageFormSet = modelformset_factory(Image,
                                    form=ImageForm,
                                    formset=ContentNodeFormSet)

CodeFormSet = modelformset_factory(Code,
                                   form=ContentNodeForm,
                                   formset=ContentNodeFormSet)


class Blockset(object):
    blocks_types = [TextFormSet,
                    LinkFormSet,
                    VideoFormSet,
                    ImageFormSet,
                    CodeFormSet]

    def __init__(self, data=None, files=None):
        if data:
            self.blocks = [block(data, files) for block in self.blocks_types]
        else:
            self.blocks = [block(queryset=block.model.objects.none()) for block in self.blocks_types]

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


class RegistrationForm(forms.Form):
    """
    Form for registering a new user account.

    Validates that the requested username is not already in use, and
    requires the password to be entered twice to catch typos.

    Subclasses should feel free to add any additional validation they
    need, but should avoid defining a ``save()`` method -- the actual
    saving of collected user data is delegated to the active
    registration backend.

    """
    username = forms.RegexField(required=True,
                                regex=r'^\w+$',
                                max_length=30,
                                widget=forms.TextInput(),
                                label=_("Username"),
                                error_messages={'invalid': _("This value must contain only letters, numbers and underscores.")})

    email = forms.EmailField(required=True,
                             label=_("E-mail"))

    password1 = forms.CharField(required=True,
                                widget=forms.PasswordInput(),
                                label=_("Password"))

    password2 = forms.CharField(required=True,
                                widget=forms.PasswordInput(),
                                label=_("Password (again)"))

    def clean_username(self):
        """
        Validate that the username is alphanumeric and is not already
        in use.

        """
        try:
            User.objects.get(username__iexact=self.cleaned_data['username'])
        except User.DoesNotExist:
            return self.cleaned_data['username']
        raise forms.ValidationError(_("A user with that username already exists."))

    def clean_email(self):
        """
        Validate that the supplied email address is unique for the
        site.

        """
        if User.objects.filter(email__iexact=self.cleaned_data['email']):
            raise forms.ValidationError(_("This email address is already in use. Please supply a different email address."))
        return self.cleaned_data['email']

    def clean(self):
        """
        Verifiy that the values entered into the two password fields
        match. Note that an error here will end up in
        ``non_field_errors()`` because it doesn't apply to a single
        field.

        """
        if 'password1' in self.cleaned_data and 'password2' in self.cleaned_data:
            if self.cleaned_data['password1'] != self.cleaned_data['password2']:
                raise forms.ValidationError(_("The two password fields didn't match."))
        return self.cleaned_data
