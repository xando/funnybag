from django.db import transaction
from django.utils.text import get_text_list
from django.contrib.auth import authenticate, login

from djangorestframework.views import View
from djangorestframework.resources import Resource
from djangorestframework.response import Response, ErrorResponse
from djangorestframework import status

from funnybag.core.models import Record, RecordBlock


class UserAuthorization(View):

    def post(self, request, *args, **kwargs):

        username = self.CONTENT.get('username')
        password = self.CONTENT.get('password')
        user = authenticate(username=username, password=password)
        if user:
            login(request, user)
            return Response(status.HTTP_200_OK, user)

        raise ErrorResponse(status.HTTP_203_NON_AUTHORITATIVE_INFORMATION, None)

    def put(self, *args, **kwargs):
        return self.post(*args, **kwargs)


class User(Resource):
    fields = ("username", "gravatar")

    def gravatar(self, instance):
        import hashlib
        return hashlib.md5(instance.email).hexdigest()


class Block(Resource):
    exclude = ("id",)


class BlockResource(Resource):
    fields = (("data", "Block"), "type", "sequence")

    def data(self, instance):
        return instance.data

    def type(self, instance):
        return instance.data._meta.verbose_name


class RecordResource(Resource):
    fields = ("id", "title", "slug", "tags", "created_time", "modified_time", "blocks",
              ("created_by","User"), ("parent", ["id"]), ("blocks", "BlockResource"))


class RecordList(View):
    resource = RecordResource

    def get(self, request, *args, **kwargs):
        queryset = Record.objects.filter(parent=None)
        if request.GET.get('author'):
            queryset.filter(created_by__username=request.GET.get('author'))
        return queryset

    @transaction.commit_manually
    def post(self, request, *args, **kwargs):
        from django.db.models import get_model
        from django.core.exceptions import ValidationError

        errors = {}

        record = Record()
        record.title = self.CONTENT.get('title')
        record.parent = self.CONTENT.get('parent')
        record.created_by = self.request.user

        try:
            record.full_clean()
            record.save()
        except ValidationError, e:
            errors.update(e.message_dict)

        errors["blocks"] = []
        for i, block in enumerate(self.CONTENT.get('blocks', [])):
            block_error = {}
            errors["blocks"].append(block_error)

            if not isinstance(block, dict):
                block_error['__all__'] = u"Definition of block has to be presented as a dict"
                continue

            block_type = block.pop('type', None)
            if not block_type:
                block_error['type'] = u"Block is missing a type."
                continue

            BlockModel = get_model('core', block_type)
            if not BlockModel:
                block_error['type'] = u"Block is in a wrong type."
                continue

            block_obj = BlockModel(**block['data'])

            try:
                block_obj.full_clean()
                block_obj.save()
            except ValidationError, e:
                message_dict = dict([(e[0], get_text_list(e[1])) for e in e.message_dict.items()])
                block_error.update(message_dict)

            recordblock = RecordBlock(sequence=i,
                                      record=record,
                                      data=block_obj)
            try:
                recordblock.full_clean()
                recordblock.save()
            except ValidationError, e:
                pass #TODO: not shure if errors from this are needed

        if not any(errors["blocks"]):
            del errors["blocks"]

        if errors:
            transaction.rollback()

            raise ErrorResponse(status.HTTP_203_NON_AUTHORITATIVE_INFORMATION, errors)

        transaction.commit()
        return Response(status.HTTP_201_CREATED, record)


class RecordDetail(View):
    resource = RecordResource

    def get(self, request, pk, *args, **kwargs):
        return Record.objects.get(pk=pk)

    def post(self, request, *args, **kwargs):
        return
