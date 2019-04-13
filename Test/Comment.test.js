
const request = require('supertest');
var app = require('../DB').app;
it("Invalid comment Body",  (done) => {
    request(app)
     .post('/api/comments')
     .send({
        "Body":"!"
        ,"userName":"dodoshark"
        ,"BookId":"5c9114a012d11bb226399497"
        , "ReviewId":"5c9243a5beb4101160e23fdd"
        ,"userId":"5c9132dd47cb909f7fbbe885"
        ,"date":"2008-09-15T15:53:00"
        })
    .expect(400,done);
});
it("Invalid comment userName",  (done) => {
    request(app)
     .post('/api/comments')
     .send({
        "Body":"Hello World!"
        ,"userName":"k"
        ,"BookId":"5c9114a012d11bb226399497"
        , "ReviewId":"5c9243a5beb4101160e23fdd"
        ,"userId":"5c9132dd47cb909f7fbbe885"
        ,"date":"2008-09-15T15:53:00"
        })
    .expect(400,done);
});
it("Invalid comment BookId",  (done) => {
    request(app)
     .post('/api/comments')
     .send({
        "Body":"Hello World!"
        ,"userName":"caffAddict"
        ,"BookId":"5c9114a012d11bb2263994"
        , "ReviewId":"5c9243a5beb4101160e23fdd"
        ,"userId":"5c9132dd47cb909f7fbbe885"
        ,"date":"2008-09-15T15:53:00"
        })
    .expect(400,done);
});
it("Invalid comment ReviewId",  (done) => {
    request(app)
     .post('/api/comments')
     .send({
        "Body":"Hello World!"
        ,"userName":"caffAddict"
        ,"BookId":"5c9114a012d11bb226399497"
        , "ReviewId":"5c9243a5beb4101160e"
        ,"userId":"5c9132dd47cb909f7fbbe885"
        ,"date":"2008-09-15T15:53:00"
        })
    .expect(400,done);
});
it("Invalid comment userId",  (done) => {
    request(app)
     .post('/api/comments')
     .send({
        "Body":"Hello World!"
        ,"userName":"dodoshark"
        ,"BookId":"5c9114a012d11bb226399497"
        , "ReviewId":"5c9243a5beb4101160e23fdd"
        ,"userId":"5c9132dd47cb909f7fbbe"
        ,"date":"2008-09-15T15:53:00"
        })
    .expect(400,done);
});
it("Invalid comment userId",  (done) => {
    request(app)
     .post('/api/comments')
     .send({
        "Body":"Hello World!"
        ,"userName":"dodoshark"
        ,"BookId":"5c9114a012d11bb226399497"
        , "ReviewId":"5c9243a5beb4101160e23fdd"
        ,"userId":"5c9132dd47cb909f7fbbe"
        ,"date":"22-5"
        })
    .expect(400,done);
});
it("Valid Request",  (done) => {
    request(app)
     .post('/api/comments')
     .send({
            "Body":"Hello World!"
            ,"userName":"coffeAddict"
            ,"BookId":"5c9114a012d11bb226399497"
            , "ReviewId":"5c9243a5beb4101160e23fdd"
            ,"userId":"5c9132dd47cb909f7fbbe885"
            ,"date":"2008-09-15T15:53:00"
        })
    .expect(200,done);
});
it("invalid ReviewId",  (done) => {
    request(app)
     .get('/api/comments')
     .send({
        "ReviewId":"5c9243a5beb4101160e23f"
        })
    .expect(400,done);
});
it("Valid ReviewId",  (done) => {
    request(app)
     .get('/api/comments')
     .send({
        "ReviewId":"5c9243a5beb4101160e23fdd"
        })
    .expect(200,done);
});

it("Not found ReviewId",  (done) => {
    request(app)
     .get('/api/comments')
     .send({
        "ReviewId":"5c9243a5beb4101160e30fdd"
        })
    .expect(404,done);
});