'use strict';

// packages
var async = require("async");
var promise = require('bluebird');
var yaml_config = require('node-yaml-config');
var config = yaml_config.load(__dirname + '/openMongo.yaml');

var Db = require('mongodb').Db;
var Server = require('mongodb').Server;
var ReplSetServers = require('mongodb').ReplSetServers;


// project files
var errorInfoCode = require('./errorInfo');

//common
var READ_LIMIT = 100;

function openMongo(database, callback) {

    console.log('enter: openMongo: database: ' + database);

    if (config.replicas) {

        var servers = [];

        for (var index in config.replicas) {

            var replica = config.replicas[index];

            console.log('replica: ' + JSON.stringify(replica, null, 2));

            // NOTE: the first server (index 0) is the primary server
            // all others are secondary servers

            var server = new Server(replica.host, replica.port);

            servers.push(server);
        }

        console.log('servers.length: ' + servers.length);

        var replicaSet = new ReplSetServers(servers);

        // GLOBAL
        global.db = new Db(database, replicaSet, { w: 0 });
    }
    else {

        // GLOBAL
        global.db = new Db(database, new Server(config.host, config.port, { auto_reconnect: true }, {}), { safe: true });
    }

    return db.open(function (err) {

        if (err) return callback(err);

        console.log('db.open OK: database: ' + database);

        if (config.username && config.password) {

            console.log('authentication required: username: ' + config.username);

            return db.admin().authenticate(config.username, config.password, function (err) {

                if (err) return callback(err);

                console.log('authentication OK');

                return callback();
            });
        }

        return callback();
    });
}


function createCollections(collectionSpecs, callback) {

    console.log('enter: createCollections: collectionSpecs.length: ' + collectionSpecs.length);

    return async.forEachSeries(collectionSpecs, initializeCollection, function (err) {

        return callback(err);
    });
}

// async iterator
function initializeCollection(collectionSpec, callback) {

    var collectionName = collectionSpec.collectionName;
    var index = collectionSpec.index;

    console.log('initializeCollection: collectionName: ' + collectionName);

    return db.collection(collectionName, function (err, collection) {

        console.log('collection created: collectionName: ' + collectionName + ': err: ' + err);

        if (err) {

            var errorInfo = errorInfoCode.getErrorInfo(500, err.err);

            console.log('ticket: ' + errorInfo.ticket + ': code: ' + errorInfo.code + ': message: ' + errorInfo.message);

            return callback(errorInfo);
        }

        if (!index) return callback();

        return db.ensureIndex(collectionName, index, { unique: true }, function (err, collection) {

            console.log('return: ensureIndex: collectionName: ' + collectionName + ': err: ' + err);

            if (err) {

                var errorInfo = errorInfoCode.getErrorInfo(500, err.err);

                console.log('ticket: ' + errorInfo.ticket + ': code: ' + errorInfo.code + ': message: ' + errorInfo.message);

                return callback(errorInfo);
            }

            return callback();
        });
    });
}

// BEGIN: COMMON functions

function upsertCommon(collectionName, query, set) {

    return new promise (function (fulfill, reject) {

        console.log('enter: updateCommon: collectionName: ' + collectionName);

        return db.collection(collectionName, function (err, collection) {

            if (err) {

                var errorInfo = errorInfoCode.getErrorInfo(500, err.err);

                console.log('ticket: ' + errorInfo.ticket + ': code: ' + errorInfo.code + ': message: ' + errorInfo.message);

                return reject(errorInfo);
            }

            console.log('query: ' + JSON.stringify(query, null, 2));

            console.log('set: ' + JSON.stringify(set, null, 2));

            return collection.update(query, set, { safe: true, upsert: true, multi: true }, function (err, numberUpdated) {

                if (err) {

                    var errorInfo = errorInfoCode.getErrorInfo(500, err.err);

                    console.log('ticket: ' + errorInfo.ticket + ': code: ' + errorInfo.code + ': message: ' + errorInfo.message);

                    return reject(errorInfo);
                }

                console.log('numberUpdated: ' + numberUpdated);

                return fulfill(numberUpdated);
            });
        });
    });
}



function retrieveOneLimitFields(collectionName, query, fields) {

    return new promise (function (fulfill, reject) {

        console.log('enter: retrieveCommon: collectionName: ' + collectionName);

        return db.collection(collectionName, function (err, collection) {

            if (err) {

                var errorInfo = errorInfoCode.getErrorInfo(500, err.err);

                console.log('ticket: ' + errorInfo.ticket + ': code: ' + errorInfo.code + ': message: ' + errorInfo.message);

                return reject(errorInfo);
            }

            query = { $query: query };

            console.log('query: ' + JSON.stringify(query, null, 2));

            return collection.findOne(query, fields,function (err, results) {

                if (err) {

                    var errorInfo = errorInfoCode.getErrorInfo(500, err.err);

                    console.log('ticket: ' + errorInfo.ticket + ': code: ' + errorInfo.code + ': message: ' + errorInfo.message);

                    return reject(errorInfo);
                }

                console.log('results: ' + JSON.stringify(results));

                return fulfill(results);
            });
        });
    });

}


function retrieveLimitFields(collectionName, query, fields) {

    return new promise (function (fulfill, reject) {

        console.log('enter: retrieveCommon: collectionName: ' + collectionName);

        return db.collection(collectionName, function (err, collection) {

            if (err) {

                var errorInfo = errorInfoCode.getErrorInfo(500, err.err);

				console.log('ticket: ' + errorInfo.ticket + ': code: ' + errorInfo.code + ': message: ' + errorInfo.message);

                return reject(errorInfo);
            }

            query = { $query: query };

            console.log('query: ' + JSON.stringify(query, null, 2));

            return collection.find(query, fields, { limit: READ_LIMIT }).toArray(function (err, results) {

                if (err) {

                    var errorInfo = errorInfoCode.getErrorInfo(500, err.err);

                    console.log('ticket: ' + errorInfo.ticket + ': code: ' + errorInfo.code + ': message: ' + errorInfo.message);

                    return reject(errorInfo);
                }

                console.log('results.length: ' + results.length);

                return fulfill(results);
            });
        });
    });

}

// END: COMMON functions

// EXPORTS
exports.upsertCommon = upsertCommon;
exports.retrieveOneLimitFields = retrieveOneLimitFields;
exports.retrieveLimitFields = retrieveLimitFields;
exports.openMongo = openMongo;
