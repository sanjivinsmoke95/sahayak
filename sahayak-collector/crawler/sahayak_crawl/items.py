"""Scrapy item: a raw fetched page handed to the extraction pipeline."""
import scrapy


class PageItem(scrapy.Item):
    url = scrapy.Field()
    html = scrapy.Field()
    source_name = scrapy.Field()
    default_department = scrapy.Field()
    default_state = scrapy.Field()
    default_language = scrapy.Field()
