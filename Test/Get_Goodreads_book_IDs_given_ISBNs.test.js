const request = require('supertest'); //imports supertest framework
var app = require('../DB').app; // imports server app
it("Get book ID using its own ISBN (invalid)", (done) => { //Test for an invalid book ISBN to fetch 
    request(app) //sends request to server
        .get('/api/Books/byisbn')//Define request as post  specific end point
        .query({ //adds Request Paramters 
            book_isbn: "551"
        })
        .expect(404, done);//expects status 404 to pass test 
});



it("Get book ID using its own ISBN  (valid)", (done) => { //Test for an valid  Request
    request(app)// imports server app
        .get('/api/Books/byisbn')//Define request as post 
        .query({ //sends request to server
            book_isbn: "5c911452f03269139ce699af"
        })
        .expect(200, done);//expects status 200 to pass test 
});