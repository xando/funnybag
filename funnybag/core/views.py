from django.views.generic.simple import direct_to_template
from django.contrib.auth.forms import AuthenticationForm
from django.core.files.storage import FileSystemStorage
from django.utils import simplejson as json
from django.http import HttpResponse

from funnybag.core import forms


def upload(request):
    LOCATION =  "blocks/images"
    fs = FileSystemStorage(location=LOCATION)

    file_paths = []
    for uploaded_file in request.FILES.getlist("image"):
        file_paths.append("%s/%s" % (LOCATION,
                                     fs.save(uploaded_file.name, uploaded_file)))

    return HttpResponse(json.dumps(file_paths))


def index(request):
    return direct_to_template(request, 'index.html',
                              {"login_form": AuthenticationForm(),
                               "record_form": forms.RecordForm(),
                               "block_form_list": [forms.TextForm(), forms.ImageForm()]})
