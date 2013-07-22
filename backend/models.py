'''
Created on Mar 11, 2012

@author: cerami
'''

from django.db import models
from Crypto.Cipher import AES
import base64
import os
import datetime


# one-liner to sufficiently pad the text to be encrypted    
def pad(string, char, block_size):
    string = string + (block_size - len(string) % block_size) * char
    return string


class Database(models.Model):
    ''' 
    Password Database
    '''
    name = models.CharField(max_length=20)
    mastersecret_crypted = models.CharField(max_length=44)
    mastersecret_padding = models.CharField(max_length=32)
    mastersecret_blocksize = 32
    creation_time = models.DateTimeField('')
    description = models.CharField(max_length=100)
    
    
    def __unicode__(self):
        return (self.name)

    def __init__(self, *args, **kwargs):
        # django.models default constructor
        super(Database, self).__init__(*args, **kwargs) 
        # set times
        self.creation_time = datetime.datetime.now()
        return
    
    def createmastersecret(self, plaintextpassword):
        #check if mastersecret in not null otherwise bail out 
        # generate padding
        self.mastersecret_padding = base64.b64encode(os.urandom(24))
        key = plaintextpassword + self.mastersecret_padding[len(plaintextpassword):]
        # ecrypt master secret 
        cipher = AES.new(key, AES.MODE_ECB)
        self.mastersecret_crypted = base64.b64encode(cipher.encrypt(key))

    def checkmasterpassword(self, plaintextpassword):
        key = plaintextpassword + self.mastersecret_padding[len(plaintextpassword):]
        # ecrypt master secret with padded master passwor
        cipher = AES.new(key, AES.MODE_ECB)
        if self.mastersecret_crypted == base64.b64encode(cipher.encrypt(key)):
            #password is good
            return True
        else:
            #password is bad
            return False
            
    
    

class Account(models.Model):
    '''
    Account 
    '''
    database = models.ForeignKey(Database)
    group = models.CharField(max_length=20)
    title = models.CharField(max_length=50) #primary key
    username = models.CharField(max_length=20)
    url = models.URLField(max_length=50)
    password = models.CharField(max_length=50)
    password_length = models.IntegerField(null=True)
    note = models.CharField (max_length=200)
    creation_time = models.DateTimeField('',auto_now_add=True)
    access_time = models.DateTimeField('')
    modify_time = models.DateTimeField('',auto_now=True)
    expiry_time = models.DateField(null=True)
    tag_list = models.CharField(max_length=100)

    def __unicode__(self):
        return(self.title +" "+ self.access_time.isoformat() + " " + self.creation_time.isoformat())
    
    def __init__(self, *args, **kwargs):
        # django.models default constructor
        super(Account, self).__init__(*args, **kwargs) 
        # set times
        #self.creation_time = datetime.datetime.now()
        self.access_time = datetime.datetime.now()
        #self.modify_time = datetime.datetime.now()
        return
    
    def cryptpass(self, plaintextaccountpass,plaintextmasterpassword):
        # ecrypt account password with decrypted master secret
        if self.database.checkmasterpassword(plaintextmasterpassword):
            #password is good
            self.password_length = len (plaintextaccountpass)
            key = plaintextmasterpassword + self.database.mastersecret_padding[len(plaintextmasterpassword):]
            # ecrypt master secret with padded master passwor
            cipher = AES.new(key, AES.MODE_ECB)
            paddedpass = pad(plaintextaccountpass,'0',32)
            self.password = base64.b64encode(cipher.encrypt(paddedpass))
            return True
        else:
            #password is bad
            return False

    def decryptpass(self, plaintextmasterpassword):
        if self.database.checkmasterpassword(plaintextmasterpassword):
            #password is good
            key = plaintextmasterpassword + self.database.mastersecret_padding[len(plaintextmasterpassword):]
            # ecrypt master secret with padded master passwor
            cipher = AES.new(key, AES.MODE_ECB)
            unpaddedpass = cipher.decrypt(base64.b64decode(self.password))
            return unpaddedpass[:self.password_length]
        else:
            return False
