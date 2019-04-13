const request = require('supertest');
var app = require('../DB').app;

it("Book Id Does't Exist in User Shelves",  (done) => {
    request(app)
     .get('/api/Users/GetBookReadStatus')
     .set('x-auth-token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1Y2E5MDc2MDRmOWZhNTNjYzQ0Y2JlY2MiLCJpYXQiOjE1NTQ1ODEzNDV9.CbaF0pOQBoe7lu2ofdxtWmmA9NpqaDTY2TGVScIcCB4')
     .send({ "BookId":"Book" })
    .expect(400,done);
});
it("Book Exist in one of User Shelves",  (done) => {
    request(app)
     .get('/api/Users/GetBookReadStatus')
     .set('x-auth-token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1Y2E5MDc2MDRmOWZhNTNjYzQ0Y2JlY2MiLCJpYXQiOjE1NTQ1ODEzNDV9.CbaF0pOQBoe7lu2ofdxtWmmA9NpqaDTY2TGVScIcCB4')
     .send({ "BookId":"Book1" })
    .expect(200,done);
});
