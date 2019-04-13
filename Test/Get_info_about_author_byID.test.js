
const request = require('supertest'); //imports supertest framework
var app = require('../DB').app; // imports server app
it("Get info about author by ID (invalid)",  (done) => { //Test for an invalid Author ID to fetch 
    request(app) //sends request to server
     .get('/api/Authors/byid')//Define request as post  specific end point
     .query({ //adds Request Paramters 
        auth_id:"551"
        })
    .expect(404,done);//expects status 404 to pass test 
});



it("Get info about author by ID  (valid)",  (done) => { //Test for an valid  Request
    request(app)// imports server app
     .get('/api/Authors/byid')//Define request as post 
     .query({ //sends request to server
        auth_id:"5c91157301d63f812a141932"
        })
    .expect(200,done);//expects status 200 to pass test 
});
