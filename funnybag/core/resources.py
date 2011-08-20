from django.db import transaction

from djangorestframework.views import View
from djangorestframework.resources import Resource
from djangorestframework.response import Response
from djangorestframework import status

from funnybag.core.models import Record, RecordBlock


class User(Resource):
    fields = ("username", "gravatar")

    def gravatar(self, instance):
        import hashlib
        return hashlib.md5(instance.email).hexdigest()


class Block(Resource):
    exclude = ("id",)


class BlockResource(Resource):
    fields = (("data", "Block"), "data_type", "sequence")

    def data(self, instance):
        return instance.data

    def data_type(self, instance):
        return instance.data_type.model


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

        errors = []

        record = Record()
        record.title = self.CONTENT.get('title')
        record.parent = self.CONTENT.get('parent')
        record.created_by = self.user

        try:
            record.full_clean()
            record.save()
        except ValidationError, e:
            errors.append(str(e))

        for i, block in enumerate(self.CONTENT['blocks']):
            block_type = block.get('type')
            if not block_type:
                #TODO. append here information about available types
                errors.append(u"Block %s is missing type." % i)
                continue

            BlockModel = get_model('core', block['type'])
            del block['type']
            block_obj = BlockModel(**block)

            try:
                block_obj.full_clean()
                block_obj.save()
            except ValidationError, e:
                errors.append(str(e))

            recordblock = RecordBlock(sequence=i,
                                      record=record,
                                      data=block_obj)
            try:
                recordblock.full_clean()
                recordblock.save()
            except ValidationError, e:
                errors.append(str(e))


        if errors:
            transaction.rollback()
            return errors

        transaction.commit()
        return Response(status.HTTP_201_CREATED, record)

class RecordDetail(View):
    resource = RecordResource

    def get(self, request, pk, *args, **kwargs):
        return Record.objects.get(pk=pk)

    def post(self, request, *args, **kwargs):
        return
