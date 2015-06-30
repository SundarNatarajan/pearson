Single Page Application with Angular.js, Node.js and MongoDB (mongobb Module)
=============================================================================

Verify the origin_name (UI Host Ip with port), database (mongoDb) name in ./server/server.yaml
Verify the host (mongodb host ip) in ./server/openMongo.yaml
Make sure the services.test.com in UI server is pointed to app server.


=============================================================================
BDD details for NodeJs are available in ./server/BDD/bdd.txt

=============================================================================
Description:
Its a single page web application with Angular Js for front end, and the App code done in 
Node Js having MongoDb.

By using the front end, One can save the profile details (username, password, email)
Email is unique. 
Upsert functionality was used here.

Saved username will be listed on UI on page load itself and will be updated with creating new users.



