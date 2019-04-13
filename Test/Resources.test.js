const request = require('supertest');
var app = require('../DB').app;
it("Not Found ResourceID",  (done) => {
    request(app)
     .put('/Resource.json')
     .send({
        "ResourceID":"!"
        })
    .expect(404,done); 
});

it("Not Found ResourceID",  (done) => {
    request(app)
     .put('/Resource.json')
     .send({
        "ResourceID":" "
        })
    .expect(404,done);
});
it("Not Found ResourceID",  (done) => {
    request(app)
     .put('/Resource.json')
     .send({
        "ResourceID":"21"
        })
    .expect(404,done);
});

it("NotFound ResourceID",  (done) => {
    request(app)
     .put('/Resource.json')
     .send({
        "ResourceID":"7c9243a5beb4101160e30fdd"
        })
    .expect(404,done);
});

it("Not Found ResourceID",  (done) => {
    request(app)
     .put('/Resource.json')
     .send({
        "ResourceID":"5c9275cf1215a31756b4a6ab"
        })
    .expect(404,done);
});