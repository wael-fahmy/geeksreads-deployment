
const request = require('supertest'); //imports supertest framework
var app = require('../DB').app; // imports server app
it("Following a User(invalid)",  (done) => { //Test for an invalid user ID to follow 
    request(app) //sends request to server
     .post('/api/Users/Follow')//Define request as post  specific end point
     .query({ //adds Request Paramters 
        "myuserid":"1",
        "userId_tobefollowed":"55"
        })
    .expect(404,done);//expects status 404 to pass test 
});



it("Following a user(Successfull)",  (done) => { //Test for an valid Follow Request
    request(app)// imports server app
     .post('/api/Users/Follow')//Define request as post 
     .query({ //sends request to server
        userId_tobefollowed:"5c9132dd04ea424bf938e8f8",
        myuserid:"5c9132dd0a604ca6b1f34117"
        })
    .expect(200,done);//expects status 200 to pass test 
});
