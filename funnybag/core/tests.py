from django.test import TestCase
from django.contrib.contenttypes.models import ContentType
from django.db import IntegrityError
from funnybag.core.models import Record, Text

class RecordSimpleTest(TestCase):

    def test_create_text(self):
        text = Text.objects.create(text="text")
        record = Record.objects.create(title="test",
                                       content=text)

        self.assertEquals(text.id, record.content.id)


    def test_create_two_segments_text(self):
        text2 = Text.objects.create(text="text2")
        text1 = Text.objects.create(text="text1",
                                    content=text2)

        record = Record.objects.create(title="test",
                                       content=text1)

        self.assertEquals(text1.id, record.content.id)
        self.assertEquals(text2.id, record.content.content.id)


    def test_blocks_two_segments_text(self):
        text2 = Text.objects.create(text="Paragref 2")
        text1 = Text.objects.create(text="Paragraf 1",
                                    content=text2)

        test_blocks = [text1, text2]
        record = Record.objects.create(title="test",
                                       content=text1)

        for block in record.blocks:
            self.assertTrue(block in test_blocks)


