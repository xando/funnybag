from django.http import HttpResponse
from django.utils import simplejson as json

def json_response(func):
    def _jsonize(*args,**kwargs):
        return HttpResponse("%s" % json.dumps(func(*args,**kwargs)), # tricked, becouse file because
                            content_type='application/json')


    return _jsonize

@json_response
def success(message=None, **kwargs):
    return { "success" : True,
             "message" : message,
             "data" : kwargs.get("data", None)}

@json_response
def failed(message=None, **kwargs):
    return { "success" : False,
             "message" : message,
             "data" : kwargs.get("data", None)}
