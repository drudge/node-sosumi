//
//  broadcast.js
//  node-sosumi
//
//  Created by Nicholas Penree on 8/21/10.
//  Copyright 2010 Conceited Software. All rights reserved.
//

var sys = require('sys'),
    Sosumi = require('sosumi'),
    fmiService = new Sosumi('stevejobs', 'jizzmodo');

// by default, devices are fetched when you create a new Sosumi object, a 'devices'
// event is emitted on successful fetch. At this point, fmiService.devices is populated
// as well.
fmiService.on('devices', function (devices) {
    sys.puts('Got our devices: ' + sys.inspect(devices));
 
    if (devices != null) {
        // Blast a message out to all your registered devices
        for (var deviceIndex = 0; deviceIndex < devices.length; deviceIndex++) {
            fmiService.sendMessage('This is a test of the emergency broadcast system.', false, deviceIndex, 'Important Message');
            
            // We can grab an event when a specific message has been sent
            fmiService.on('messageSent', function (content) {
                sys.puts('Sent the message: ' + sys.inspect(content));
            });
        }
    }
});

// if something goes wrong, an error event is emitted with a description of the problem.
fmiService.on('error', function(err) {
    throw err;
});