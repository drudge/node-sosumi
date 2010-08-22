//
//  notify.js
//  node-sosumi
//
//  Created by Nicholas Penree on 8/21/10.
//  Copyright 2010 Conceited Software. All rights reserved.
//

var Sosumi = require('sosumi'),
var exports.notify = notify = function(subject, message, critical)
{
    // pass a third parameter of false so it doesn't fetch the device list if we don't need it
    sosumi = new Sosumi('stevejobs', 'jizzmodo', false);
    sosumi.devices = [{ id: 'OA#$3jasdsdkasdkasdasdsaDASDQ@DASDSDS~', name: 'Steve\'s iPhone 4' }];
    
    // default to no audible alerts
    if (typeof critical === 'undefined') {
        critical = false
    }
    
    // send off the message. no need to check the response unless you really care if it made it
    sosumi.sendMessage(message, critical, 0, subject);
}

// test it out
notify('Gizmodo Leak Detected', 'All sensors reporting disturbance in the force.', true);
