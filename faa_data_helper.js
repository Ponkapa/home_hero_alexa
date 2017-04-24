'use strict';

var _ = require('lodash');
var rp = require('request-promise');

var ENDPOINT = 'http://services.faa.gov/airport/status/'

function FAADataHelper() {}

FAADataHelper.prototype.requestAirportStatus = function(airportCode){

};

module.exports = FAADataHelper;