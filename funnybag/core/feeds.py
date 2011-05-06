from tagging.models import TaggedItem, Tag

from django.contrib.syndication.views import Feed
from django.contrib.auth import models as auth_models
from django.shortcuts import get_object_or_404

from funnybag.core import models

class BaseFeed(Feed):
    def items(self, obj):
        return models.Record.objects.all()

    def item_link(self, record):
        return record.get_absolute_url()

    def item_title(self, record):
        return record.title

    def item_description(self, record):
        return str(record.created_time)

    def link(self, obj):
        return "/#%s" % self.title(obj)


class ByTagFeed(BaseFeed):
    def title(self, obj):
        return "t/%s" % (obj.name)

    def get_object(self, request, tag):
        return get_object_or_404(Tag, name=tag)

    def items(self, tag):
        return TaggedItem.objects.get_by_model(models.Record, tag)


class ByAuthorFeed(BaseFeed):
    def title(self, obj):
        return "a/%s" % (obj.username)

    def get_object(self, request, author):
        return get_object_or_404(auth_models.User, username=author)

    def items(self, user):
        return models.Record.objects.filter(created_by=user)
