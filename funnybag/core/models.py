from pygments.lexers import get_all_lexers, get_lexer_by_name
from pygments import highlight
from pygments.formatters import HtmlFormatter

from tagging import fields

from django.db import models
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes import generic
from django.utils.safestring import mark_safe
from django.template import Context, loader
from django.template.defaultfilters import slugify


class Record(models.Model):
    title = models.CharField(max_length=1024)
    tags = fields.TagField()
    slug = models.SlugField(max_length=40)
    created_time = models.DateTimeField(auto_now_add=True)
    modified_time = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey('auth.User')

    def __unicode__(self):
        return "%s :%s" % (self.id, self.title)

    def save(self, *args, **kwargs):
        self.slug = slugify(self.title)
        super(Record, self).save(args, kwargs)


class RecordBlock(models.Model): # Proxy
    record = models.ForeignKey('Record', related_name="blocks")
    sequence = models.PositiveIntegerField()

    data_type = models.ForeignKey(ContentType)
    data_id = models.PositiveIntegerField()
    data = generic.GenericForeignKey('data_type', 'data_id')

    class Meta:
        ordering = ['sequence']

    def __unicode__(self):
        return "%s %s" % (self.record.title, self.data.__class__.__name__)


class Text(models.Model):
    type = "text"
    text = models.TextField()

    def render(self):
        return self.text

    def __unicode__(self):
        return self.text


class Link(models.Model):
    type = "link"
    name = models.CharField(blank=True, max_length=1024)
    link = models.URLField(verify_exists=False)

    def render(self):
        if self.name:
            return mark_safe('<a target="_blank" href="%s">%s</a>' % (self.link, self.name))
        return mark_safe('<a target="_blank" href="%s">%s</a>' % (self.link,self.link))

    def __unicode__(self):
        return self.link


class Video(models.Model):
    type = "video"
    embed = models.TextField()

    def render(self):
        return mark_safe(self.embed)


class Map(models.Model):
    type = "map"
    location = models.CharField(max_length=1024)

    def render(self):
        return self.location


class Image(models.Model):
    type = "image"
    image = models.ImageField(upload_to="blocks/images")

    def render(self):
        template = loader.get_template('core/blocks/image.html')
        return template.render(Context({'image': self.image}))

    def save(self, *args, **kwargs):
        super(Image, self).save(*args, **kwargs)
        from easy_thumbnails.files import get_thumbnailer
        tumb = get_thumbnailer(self.image)
        tumb.generate_thumbnail({'size': (650, 650)})


class Code(models.Model):
    type = "code"
    LANGUAGE_NAME = map(lambda lexer: (lexer[1][0], lexer[0]),get_all_lexers())

    language = models.CharField(max_length=30, choices=LANGUAGE_NAME)
    code = models.TextField()

    def render(self):
        lexer = get_lexer_by_name(self.language)
        formatter = HtmlFormatter(linenos=True)
        code = mark_safe(highlight(self.code, lexer, formatter))
        template = loader.get_template('core/blocks/code.html')
        return template.render(Context({'code': code,
                                        'styles' : formatter.get_style_defs('.highlight')}))


# ToDo:
# Image, ImageGallery, Map, Poll
# Text: textile
