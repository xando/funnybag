from django.http import HttpResponse
from django.utils import simplejson as json

def json_response(func):
    def _jsonize(*args,**kwargs):
        return HttpResponse(json.dumps(func(*args,**kwargs)),
                        content_type='application/json; charset=UTF-8')
    return _jsonize

def success(**kwargs):
    return { "success" : True,
             "message" : kwargs.get("message", None),
             "data" : kwargs.get("data", None) }

def failed(**kwargs):
    return { "success" : False,
             "message" : kwargs.get("message", None),
             "data" : kwargs.get("data", None) }
