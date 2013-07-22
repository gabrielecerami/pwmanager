from django.shortcuts import render_to_response
from django.http import HttpResponse
from models import Account

def status(request):
    #latest_poll_list = Poll.objects.all().order_by('-pub_date')[:5]
    #return render_to_response('polls/status.html', {'latest_poll_list': latest_poll_list})
    return # not sure what to return
    
def index(request):
    return render_to_response ("backend/index.html")

def nojs(request):
    account_list = Account.objects.all().order_by('-group')
    masterpass = request.GET.get('masterpass')
    if masterpass == None:
        return HttpResponse (status=403)
    else:
        for account in account_list:
            account.password = account.decryptpass(masterpass)
            if account.password == False:
                return HttpResponse (status=403)
        else:
            return render_to_response ("backend/index-nojs.html", {'account_list': account_list})