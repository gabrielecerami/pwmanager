from django.conf.urls.defaults import patterns, include, url
from backend.api import DatabaseResource, AccountResource
from tastypie.api import Api

v1_api = Api(api_name='v1')
v1_api.register(AccountResource())
v1_api.register(DatabaseResource())

urlpatterns = patterns('',
    # The normal jazz here...
    #(r'^blog/', include('myapp.urls')),
    (r'^api/', include(v1_api.urls)),
#    (r'^static/(?P<path>.*)$', 'django.views.static.serve', {'document_root': "/var/www/pwmanager/backend/static/" }),
    # I don't know why, but it seems that Explorer put an additional / to svg files
#    (r'^/static/(?P<path>.*)$', 'django.views.static.serve', {'document_root': "/var/www/pwmanager/backend/static/" }),

)




# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

account_resource = AccountResource()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'passwordmanager.views.home', name='home'),
    # url(r'^passwordmanager/', include('passwordmanager.foo.urls')),
    url(r'^backend/', include('backend.urls')),    
    url(r'^api/', include(include(v1_api.urls))),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
)
