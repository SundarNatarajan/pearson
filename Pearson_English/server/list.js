var promise = require('bluebird');
var mongodb = require('./mongodb.js');



function createList(list){
    return new promise(function(fulfill,reject) {
        promise.delay(0000).then(function () {
            var jsonBody = {};
            jsonBody.username = list.username;
            jsonBody.password = list.password;
            jsonBody = {$set: jsonBody};

            //jsonBody._id = list.email;

            return mongodb.upsertCommon('list', {_id: list.email}, jsonBody);

        }).then(function (listResult) {
            return fulfill(list.email);
        }).catch(function onReject(err) {
            console.log(err);
            return reject(error);

        }).catch(function (error) {
            console.log(error);
            if (error.stack)
                console.log('common.Catch:' + error);
            return reject(error);
        });
    });
}

function retrieveAllList(email){
    return new promise(function(fulfill,reject) {
        promise.delay(0000).then(function(){
			var query = {};
			/*
			if (email !== null){
				query = {_id:email};
			}
			* */
            return fulfill(mongodb.retrieveLimitFields('list',{},{_id:0,username:1}));
        }).catch(function onReject(err) {
            console.log(err);
            return reject(error);

        }).catch(function (error) {
            console.log(error);
            if (error.stack)
                console.log('common.Catch:' + error);
            return reject(error);
        });
    });
}


//EXPORTS
exports.createList = createList;
exports.retrieveAllList = retrieveAllList;
