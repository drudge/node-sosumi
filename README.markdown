
# Susumi - Find My Phone support for node.js

Find My Phone support for Nodejs. This allows you to programmatically retrieve your phone's current location and push messages (and an optional alarm) to the remote device, or even remotely lock the device.

This is essentially a port of Tyler Hall's [PHP Sosumi Class](http://github.com/tylerhall/sosumi).

## Installation

  Install the [npm package manager for nodejs](http://github.com/isaacs/npm)
  and run:
  
      $ npm install sosumi

## Examples

Event handling is optional

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
            for (var i = 0; i < devices.length; i++) {
                fmiService.sendMessage('This is a test of the emergency broadcast system.', false, i, 'Important Message');
                
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


## License 

(The MIT License)

Copyright (c) 2010 Nicholas Penree <drudge@conceited.net>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.