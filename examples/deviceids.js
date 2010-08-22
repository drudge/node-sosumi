//
//  deviceids.js
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
    sys.puts('======================================================================');
    sys.puts('=== Listing Device IDs for MobileMe account: ' + fmiService.username);
    sys.puts('======================================================================');
 
    if (devices != null) {
        // Let's loop through and print our device ids, this is useful to save ids
        // for later use, without relying on that extra api call.
        for (var deviceIndex = 0; deviceIndex < devices.length; deviceIndex++) {
            sys.puts('    ' + devices[deviceIndex].name + ': ');
            sys.puts('      ' + devices[deviceIndex].id);
        }
    }
    
    sys.puts('======================================================================');
    sys.puts('Listed '+ devices.length + ' id' + (devices.length == 1)? '' : 's' );
});

// if something goes wrong, an error event is emitted with a description of the problem.
fmiService.on('error', function(err) {
    throw err;
});