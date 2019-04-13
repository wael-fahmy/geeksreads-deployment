
const request = require('supertest'); //imports supertest framework
var app = require('../DB').app; // imports server app
it("Find Author by name(invalid)",  (done) => { //Test for an invalid Author Name to fetch 
    request(app) //sends request to server
     .get('/api/Authors')//Define request as post  specific end point
     .query({ //adds Request Paramters 
        auth_name:"sally 1"
        })
    .expect(404,done);//expects status 404 to pass test 
});



it("Find Author by name(valid)",  (done) => { //Test for an valid  Request
    request(app)// imports server app
     .get('/api/Authors')//Define request as post 
     .query({ //sends request to server
        auth_name:"Alberta Bean"
        })
    .expect(200,done);//expects status 200 to pass test 
});
