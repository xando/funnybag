from funnybag.core.models import Record, RecordBlock

from djangorestframework.views import View
from djangorestframework.resources import Resource


class User(Resource):
    fields = ("username", "gravatar")

    def gravatar(self, instance):
        import hashlib
        return hashlib.md5(instance.email).hexdigest()


class BlockResource(Resource):
    fields = ("data", "data_type", "sequence", ("record",["id"]),"data")

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
            return errors[str(e)]

        for i, block in enumerate(self.CONTENT['blocks']):
            BlockModel = get_model('core', block['type'])
            del block['type']
            block_obj = BlockModel(**block)
            try:
                block_obj.full_clean()
                block_obj.save()

                recordblock = RecordBlock(sequence=i,
                                          record=record,
                                          data=block_obj)
                recordblock.full_clean()
                recordblock.save()

            except ValidationError, e:
                return errors[str(e)]

        return "test"

class RecordDetail(View):
    resource = RecordResource

    def get(self, request, pk, *args, **kwargs):
        return Record.objects.get(pk=pk)

    def post(self, request, *args, **kwargs):
        return
