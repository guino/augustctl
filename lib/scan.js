'use strict';

var Promise = require('bluebird');
var noble = require('noble');

var Lock = require('./lock');

var firstRun = true;

function scan(uuid) {
  if (firstRun) {
    firstRun = false;

    noble.on('stateChange', function(state) {
      console.log("stateChange="+state);
      if (state === 'poweredOn') {
        // The original code searched only for BLE_COMMAND_SERVICE but it would not return ANYTHING a lot of the time
        //noble.startScanning([ Lock.BLE_COMMAND_SERVICE ], false);
        // Scan for ANYTHING instead -- this consistently returns results
        noble.startScanning([ ], true);
      } else {
        noble.stopScanning();
      }
    });
  }

  return new Promise(function(resolve) {
    noble.on('discover', function(peripheral) {
      console.log("discover="+peripheral.uuid+" "+peripheral.advertisement.serviceUuids);
      // Since we scanned for everything we have to filter for our service here
      if ( peripheral.advertisement.serviceUuids == Lock.BLE_COMMAND_SERVICE && (uuid === undefined || peripheral.uuid === uuid) ) {
        console.log("got peripheral");
        noble.stopScanning();
        resolve(peripheral);
      }
    });
  });
}

module.exports = scan;
