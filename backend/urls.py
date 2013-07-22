'''
Created on Mar 11, 2012

@author: cerami
'''

from django.conf.urls.defaults import patterns, include, url
urlpatterns = patterns('',
    url(r'^status/$', 'backend.views.status'),
    url(r'^nojs/$','backend.views.nojs'),    
    url(r'^$', 'backend.views.index'),    
)
