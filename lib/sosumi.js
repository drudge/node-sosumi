//
//  sosumi.js
//  node-sosumi
//
//  Created by Nicholas Penree on 8/21/10.
//  Copyright 2010 Conceited Software. All rights reserved.
//

var util = require('util'),
    events = require('events'),
    http = require('http'),
    Buffer = require('buffer').Buffer,
    Sosumi = exports = module.exports = 

function Sosumi(mobileMeUsername, mobileMeUserPassword, performUpdateNow)
{
    var self = this;
    events.EventEmitter.call(this);
    this.devices = [];
    this.username = mobileMeUsername;
    this.password = mobileMeUserPassword;
    
    if (typeof performUpdateNow === 'undefined' || performUpdateNow === true) {
        self.updateDevices();
    }
}

util.inherits(Sosumi, events.EventEmitter);

Sosumi.prototype.locate = function(deviceIndex, timeout)
{    
    var self = this;

    self.updateDevices();   
     
    self.on('devices', function (devices) {    
        var seekedDevice = self.devices[deviceIndex];
        
        if (seekedDevice.locationFinished) {
            self.emit('located', {
                latitude: seekedDevice.location.latitude, 
                longitude: seekedDevice.location.longitude,
                accuracy: seekedDevice.location.horizontalAccuracy,
                timestamp: seekedDevice.location.timeStamp,
                type: seekedDevice.location.positionType 
            });
        } else {
            setTimeout(self.locate(deviceIndex, 10000));
        }
    });
}

Sosumi.prototype.sendMessage = function(msg, alarm, deviceIndex, subject)
{
    if (deviceIndex >= this.devices.length) return;
    
    var self = this,
    body = JSON.stringify({
        "clientContext" : {
            "appName" : "FindMyiPhone",
            "appVersion" : "1.0",
            "buildVersion" : "57",
            "deviceUDID" : "0000000000000000000000000000000000000000",
            "inactiveTime" : 5911,
            "osVersion" : "3.2",
            "productType" : "iPad1,1",
            "selectedDevice" : this.devices[deviceIndex].id,
            "shouldLocate":false
        },
        "device" : this.devices[deviceIndex].id,
        "serverContext" : {
            "callbackIntervalInMS": 3000,
            "clientId" : "0000000000000000000000000000000000000000",
            "deviceLoadStatus" : "203",
            "hasDevices" : true,
            "lastSessionExtensionTime" : null,
            "maxDeviceLoadTime" : 60000,
            "maxLocatingTime" : 90000,
            "preferredLanguage" : "en",
            "prefsUpdateTime" : 1276872996660,
            "sessionLifespan" : 900000,
            "timezone" : {
                "currentOffset" : -25200000,
                "previousOffset" : -28800000,
                "previousTransition" : 1268560799999,
                "tzCurrentName" : "Pacific Daylight Time",
                "tzName" : "America/Los_Angeles"
            },
            "validRegion" : true
        },
        "sound" : (alarm) ? 'true' : 'false',
        "subject" : subject,
        "text" : msg
    });

    this.postAPICall('/fmipservice/device/' + this.username + '/sendMessage', body, function (content) {
        self.emit('messageSent', { subject: subject, message: msg, alarm: alarm, deviceIndex: deviceIndex });
    });
}

Sosumi.prototype.remoteLock = function(passcode, deviceIndex)
{
    if (deviceIndex >= this.devices.length) return;
    
    var self = this,
    body = JSON.stringify({
        "clientContext" : {
            "appName" : "FindMyiPhone",
            "appVersion" : "1.0",
            "buildVersion" : "57",
            "deviceUDID" : "0000000000000000000000000000000000000000",
            "inactiveTime" : 5911,
            "osVersion" : "3.2",
            "productType" : "iPad1,1",
            "selectedDevice" : this.devices[deviceIndex].id,
            "shouldLocate":false
        },
        "device" : this.devices[deviceIndex].id,
        "serverContext" : {
            "callbackIntervalInMS": 3000,
            "clientId" : "0000000000000000000000000000000000000000",
            "deviceLoadStatus" : "203",
            "hasDevices" : true,
            "lastSessionExtensionTime" : null,
            "maxDeviceLoadTime" : 60000,
            "maxLocatingTime" : 90000,
            "preferredLanguage" : "en",
            "prefsUpdateTime" : 1276872996660,
            "sessionLifespan" : 900000,
            "timezone" : {
                "currentOffset" : -25200000,
                "previousOffset" : -28800000,
                "previousTransition" : 1268560799999,
                "tzCurrentName" : "Pacific Daylight Time",
                "tzName" : "America/Los_Angeles"
            },
            "validRegion" : true
        },
        "oldPasscode" : "",
        "passcode" : passcode
    });

    this.postAPICall('/fmipservice/device/' + this.username + '/remoteLock', body, function (content) {
        self.emit('locked', { passcode: passcode, deviceIndex: deviceIndex });
    });
}

Sosumi.prototype.postAPICall = function(url, body, callback)
{
    var self = this;
    var headers = {
        'Host' : 'fmipmobile.me.com',
        'Authorization' : 'Basic ' + new Buffer(this.username + ':' + this.password, 'utf8').toString('base64'),
        'X-Apple-Realm-Support' : '1.0',
        'Content-Type' : 'application/json; charset=utf-8',
        'Content-Length' : body.length,
        'X-Client-Name' : 'Steve\'s iPad',
        'X-Client-Uuid' : '0cf3dc491ff812adb0b202baed4f94873b210853'
    },
    fmi = http.createClient(443, 'fmipmobile.me.com', true),
    request = fmi.request('POST', url, headers);
    request.end(body, 'utf8');
        
    request.on('response', function (response) {
        response.setEncoding('utf8');
        var result = '';
        
        if (response.statusCode == 200 ) {
            response.on('data', function (chunk) {
                result = result + chunk;
            });
            
            response.on('end', function () {
                var jsonData = JSON.parse(result);
                
                if (typeof jsonData !== 'undefined' && jsonData.statusCode == '200') {
                    callback(jsonData.content);
                } else {
                    callback(null);
                }
            });
        } else if (response.statusCode == 401 || response.statusCode == 403) {
            self.emit('error', new Error('Invalid credentials passed for MobileMe account: ' + self.username));
        } else {
            self.emit('error', new Error('HTTP Status returned non-successful: ' + response.statusCode));
        }
    });
}

Sosumi.prototype.updateDevices = function()
{
    var self = this,
    body = JSON.stringify({
        "clientContext" : {
            "appName" : "FindMyiPhone",
            "appVersion" : "1.0",
            "buildVersion" : "57",
            "deviceUDID" : "0cf3dc989ff812adb0b202baed4f37274b210853",
            "inactiveTime" : 2147483647,
            "osVersion" : "3.2",
            "productType" : "iPad1,1"
        }
    });

    this.postAPICall('/fmipservice/device/' + this.username + '/initClient', body, function (devices) {
        self.devices = devices;
        self.emit('devices', self.devices);
    });
}