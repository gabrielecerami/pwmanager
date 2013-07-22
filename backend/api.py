'''
Created on Mar 11, 2012

@author: cerami
'''
from django.http import HttpResponse
from django.conf.urls.defaults import *
from django.contrib.auth.models import User
from django.utils import simplejson
from tastypie.resources import ModelResource
from models import Account, Database
from tastypie.authentication import BasicAuthentication
from tastypie.authorization import Authorization
from tastypie import fields
from tastypie.utils import trailing_slash
from django.http import Http404
from django.core.exceptions import ObjectDoesNotExist
from subprocess import call
from tastypie.exceptions import NotFound, BadRequest

class DatabaseResource(ModelResource):
    '''
    TastyPie Database Resource
    '''
    #accounts = fields.ToManyField('backend.api.AccountResource', 'account_set', related_name='database')

    class Meta:
        queryset = Database.objects.all()
        resource_name = 'database'
        authentication = BasicAuthentication()
        authorization = Authorization()
        allowed_methods = ['get']

    def override_urls(self):
        return [
            url(r"^(?P<resource_name>%s)/(?P<pk>\w[\w/-]*)/checkpass%s$" % (self._meta.resource_name, trailing_slash()), self.wrap_view('get_checkpass'), name="api_checkpass"),
        ]

    def get_checkpass(self,request,**kwargs):
        obj = self.cached_obj_get(request=request, **self.remove_api_resource_names(kwargs))
        passwd = request.GET.get('masterpass')
        to_json = {
                   "result": obj.checkmasterpassword(passwd)
        }
        return HttpResponse(simplejson.dumps(to_json), mimetype='application/json')
        
class AccountResource(ModelResource):
    '''
    TastyPie Account Resource
    '''
    # Relationship
    database = fields.ForeignKey(DatabaseResource, 'database', full= False)
    
    class Meta:
        queryset = Account.objects.all()
        resource_name = 'account'
        excludes = ['password']
        authentication = BasicAuthentication()
        authorization = Authorization()
        allowed_methods = ['get', 'post', 'put', 'delete', 'patch']
        
    def override_urls(self):
        return [
            url(r"^(?P<resource_name>%s)/(?P<pk>\w[\w/-]*)/decryptpass%s$" % (self._meta.resource_name, trailing_slash()), self.wrap_view('get_decryptpass'), name="api_decryptpass"),
            url(r"^(?P<resource_name>%s)/search%s$" % (self._meta.resource_name, trailing_slash()), self.wrap_view('get_search'), name="api_get_search"),
            url(r"^(?P<resource_name>%s)/export/(?P<pk_list>\w[\w/;-]*)/$" % self._meta.resource_name, self.wrap_view('get_export'), name="api_get_export")
        ]

    def get_decryptpass(self,request,**kwargs):
        obj = self.cached_obj_get(request=request, **self.remove_api_resource_names(kwargs))
        passwd = request.GET.get('masterpass')
        to_json = {
                   "password": obj.decryptpass(passwd)
        }
        return HttpResponse(simplejson.dumps(to_json), mimetype='application/json')
        
    def get_search(self, request, **kwargs):
        search_string = request.GET.get("searchtext")
        variable_column = request.GET.get("searchfields")
        search_type = request.GET.get("searchquery")
        searchfilter = variable_column + '__' + search_type
        search_list=Account.objects.filter(**{ searchfilter: search_string })
        
        

        self.method_check(request, allowed=['get'])
        self.is_authenticated(request)
        self.throttle_check(request)

        objects = []

        for result in search_list:
            bundle = self.full_dehydrate(result)
            bundle.obj.password = ""
            
            objects.append(bundle)

        if (len(objects) > 0): 
            object_list = {
                           'meta': {
                                    'total_count' : len(objects),
                                    },
                           'objects': objects,
            }
            self.log_throttled_access(request)
            return self.create_response(request,object_list)
        else : 
            raise Http404("No results")
        
    def get_export(self,request, **kwargs):
        # export: /export/(list of id)

        self.method_check(request, allowed=['get'])
        self.is_authenticated(request)
        self.throttle_check(request)
        
        # Rip apart the list then iterate.
        obj_pks = kwargs.get('pk_list', '').split(';')
        objects = []
        not_found = []
        
        for pk in obj_pks:
            try:
                obj = self.obj_get(request, pk=pk)
                bundle = self.full_dehydrate(obj)
                objects.append(bundle)
            except ObjectDoesNotExist:
                not_found.append(pk)
        
        object_list = {
            'objects': objects,
        }
        
        if len(not_found):
            object_list['not_found'] = not_found
            

        #    
        self.log_throttled_access(request)
        return self.create_response(request, object_list)

    
    def obj_create(self, bundle, request=None, **kwargs):
        bundle.obj = self._meta.object_class()
        
        for key, value in kwargs.items():
            setattr(bundle.obj, key, value)
        bundle = self.full_hydrate(bundle)

        plaintextpassword = bundle.data["password"]
        plaintextmasterpassword = bundle.data['masterpassword']
        if bundle.obj.cryptpass(plaintextpassword,plaintextmasterpassword):
            bundle.obj.save()
            return bundle
        else:
            return False
        
    def obj_delete(self, request=None, **kwargs):
        """
        Override of the ORM-specific implementation of ``obj_delete``.
        
        Takes optional ``kwargs``, which are used to narrow the query to find
        the instance.
        """
        try:
            obj = self.obj_get(request, **kwargs)
        except ObjectDoesNotExist:
            raise NotFound("A model instance matching the provided arguments could not be found.")
        
        # Check if the timestamps are correct
        print obj.creation_time 
        print request.GET.get("creation_time")
        if str(obj.creation_time) == request.GET.get("creation_time"):
            obj.delete()
        else:
            raise BadRequest("timesteamp incorrect, concurrency problem")
        
    def obj_update(self, bundle, request, **kwargs):
        """
        A ORM-specific implementation of ``obj_update``.
        """
	f = open('/tmp/pwlog', 'w')
        if not bundle.obj or not bundle.obj.pk:
            # Attempt to hydrate data from kwargs before doing a lookup for the object.
            # This step is needed so certain values (like datetime) will pass model validation.
            try:
                bundle.obj = self.get_object_list(request).model()
                bundle.data.update(kwargs)
                bundle = self.full_hydrate(bundle)
                lookup_kwargs = kwargs.copy()
                lookup_kwargs.update(dict(
                    (k, getattr(bundle.obj, k))
                    for k in kwargs.keys()
                    if getattr(bundle.obj, k) is not None))
            except:
                # if there is trouble hydrating the data, fall back to just
                # using kwargs by itself (usually it only contains a "pk" key
                # and this will work fine.
                lookup_kwargs = kwargs
            try:
                bundle.obj = self.obj_get(request, **lookup_kwargs)
            except ObjectDoesNotExist:
                raise NotFound("A model instance matching the provided arguments could not be found.")
       
        bundle = self.full_hydrate(bundle)

	f.write(bundle.data["password"] + "\n")
        plaintextpassword = bundle.data["password"]
        plaintextmasterpassword = bundle.data['masterpassword']
        if not bundle.obj.cryptpass(plaintextpassword,plaintextmasterpassword):
            return False

 
        if (str(bundle.obj.creation_time) == request.GET.get("creation_time")):
	    f.close()       
            bundle.obj.save()
            # Now pick up the M2M bits.
            m2m_bundle = self.hydrate_m2m(bundle)
            self.save_m2m(m2m_bundle)
            return bundle
        else:
	    f.close()       
            raise NotFound("timestamp incorrect, concurrency problems")

