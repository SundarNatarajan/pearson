

process.env.NAME = "sampleApplication";

// BEGIN: initialize tracing
var yaml_config = require('node-yaml-config');
var config = yaml_config.load(__dirname + '/server.yaml');


var promise = require('bluebird');
var cjson = require('cjson');
var validate = require("json-schema").validate;     // schema validation
// project files
var postSchema = require('./datas/schema.json');
var mongodb = require('./mongodb.js');
var list = require('./list.js');
var errorInfoCode = require('./errorInfo');

// BEGIN: express app for authentication REST service
application_root = __dirname,
    express = require("express"),
    path = require("path");


var app = express();


app.configure(function () {
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(application_root, "public")));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});


/*
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://172.16.1.175:7790");
	res.header("Access-Control-Allow-Methods", "GET, POST");
  next();
});
*/

// BEGIN: mongodb stuff
OpenMongo = function () {

    return mongodb.openMongo(config.databasename, function (err) {

        if (err) {

            console.log('PROCESS EXIT: cannot open database: err: ' + JSON.stringify(err, null, 2));

            process.exit(-1);
        }

        console.log('MongoDB opened OK, database name: ' + config.databasename);

        return db.collection('board', function (err, collection) {

            console.log(' collection created: ' + err);
        });
    });
};

OpenMongo();


// END: mongodb stuff

//BEGIN REST API
app.post('/api/addentry', function (req, res) {
	res.header("Access-Control-Allow-Origin", config.origin_name);
	res.header("Access-Control-Allow-Methods", "GET, POST");
	
    console.log('>>>>>>>>>>>>>>>> /api/addentry');
    promise.delay(0000).then(function() {

        var validation = validate(JSON.parse(req.body.mydata), postSchema);

        //trace.debug('validation/workloadSchema: ' + JSON.stringify(validation, null, 2));

        if (!validation.valid) {
            console.log(JSON.parse(req.body.mydata).email);

            var message = validation.errors[0].property + ' ' + validation.errors[0].message;
            var errorInfo = errorInfoCode.getErrorInfo(400, 'invalid update: ' + message);

            console.log('ticket: ' + errorInfo.ticket + ': code: ' + errorInfo.code + ': message: ' + errorInfo.message);

            res.send(errorInfo, errorInfo.code);
            return null;
        } else {
            if (validateEmail(JSON.parse(req.body.mydata).email)) {
                return JSON.parse(req.body.mydata);
            }
            else {
                res.send({error: 'InvalidEmailAddress'});
                return null;
            }

        }
    }).then(function (request){
		if(request){
			console.log(JSON.stringify(request));
            return list.createList(request);
        }
    }).then(function (listId){
        if(listId)
            return res.send({email: listId});
    }).catch(function onReject(err) {
        if (err.stack) {
            console.log(err.stack);
            res.statusCode = 500;
            res.send({});
        }
        else {
            res.statusCode = 200;
            res.send({error: err});
        }
    }).catch(function (error) {
        if (error && error.stack)
            console.log('common.Catch:' + error);
        res.statusCode = 500;
        res.send({error: null});
    });
});

/*

app.get('/api/getemailsearchresult/:emailstring', function (req, res) {
	res.header("Access-Control-Allow-Origin", "http://172.16.1.175:7790");
	res.header("Access-Control-Allow-Methods", "GET, POST");
    emailString = req.params.emailstring;
    promise.delay(0000).then(function(){
        return list.retrieveAllList(emailString)
    }).then(function (listDetails) {
        if(listDetails){
            listDetails.email = emailString;
		}
        return res.send(listDetails);
    }).catch(function onReject(err) {
        console.log(err);
        res.statusCode = 500;
        res.send({});
    }).catch(function (error) {
        console.log(error);
        if (error.stack)
            console.log('common.Catch:' + error);
        res.statusCode = 500;
        res.send({error: null});
    });
});

*/

app.get('/api/getemailsearchresult', function (req, res) {
	res.header("Access-Control-Allow-Origin", config.origin_name);
	res.header("Access-Control-Allow-Methods", "GET, POST");
	console.log('>>>>>getemaileearchresult');
    emailString = null;
    promise.delay(0000).then(function(){
        return list.retrieveAllList(emailString)
    }).then(function (users) {
        if(users){

			str='[';
			users.forEach( function(user) {
				str = str + '{ "name" : "' + user.username + '"},' +'\n';
			});
			str = str.trim();
			str = str.substring(0,str.length-1);
			str = str + ']';
			res.send(str);
		}else{
			res.send(null);
		}
            
        
    }).catch(function onReject(err) {
        console.log(err);
        res.statusCode = 500;
        res.send({});
    }).catch(function (error) {
        console.log(error);
        if (error.stack)
            console.log('common.Catch:' + error);
        res.statusCode = 500;
        res.send({error: null});
    });
});


function validateEmail(email) {
    // First check if any value was actually set
    if (email.length == 0) return false;
    // Now validate the email format using Regex
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;
    return re.test(email);
}

var port = process.env.PORT;

if (port === undefined) {

    port = config.port; // 8000


}

app.listen(port);

console.log(' server listening on port: ' + port);
