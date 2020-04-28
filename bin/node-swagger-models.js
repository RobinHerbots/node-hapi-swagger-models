#!/usr/bin/env node
var nsm = require('../lib/swagger-models'),
    sep = require('path').sep;


var config;
if (process.argv[2] !== undefined) {
    config = require(process.cwd() + sep + process.argv[2]);
} else {
    var pkg = require(process.cwd() + sep + "package.json");
    config = pkg["node-swagger-models"];
    if(config === undefined) {
        console.log("No \"node-swagger-models\" section in package.json");
    }
}

nsm(config || {}).then(function(data) {
    console.log(data);
}).catch(function(data){
    console.log(data);
});
