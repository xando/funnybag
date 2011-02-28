from django.http import HttpResponse
from django.utils import simplejson as json

def json_response(func):
    def _jsonize(*args,**kwargs):
        return HttpResponse(json.dumps(func(*args,**kwargs)),
                        content_type='application/json; charset=UTF-8')
    return _jsonize

def success(message=None, **kwargs):
    return { "success" : True,
             "message" : message,
             "data" : kwargs.get("data", None)}

def failed(message=None, **kwargs):
    return { "success" : False,
             "message" : message,
             "data" : kwargs.get("data", None)}
