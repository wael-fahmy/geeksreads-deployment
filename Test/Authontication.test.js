const request = require('supertest');
var app = require('../DB').app;

it("Invalid Email Sign Up",  (done) => {
    request(app)
     .post('/api/Users/')
     .send({
             "UserName": "sad",
             "UserEmail": "samersostagmail.com",
             "UserPassword": "123456"
        })
    .expect(400,done);
});
it("Invalid Email Login",  (done) => {
    request(app)
     .post('/api/Auth/')
     .send({
             "UserEmail": "samersostagmail.com",
             "UserPassword": "123456"
        })
    .expect(400,done);
});
it("Invalid Name Sign Up",  (done) => {
    request(app)
     .post('/api/Users/')
     .send({
             "UserName": "sa",
             "UserEmail": "samersosta@gmail.com",
             "UserPassword": "123456"
        })
    .expect(400,done);
});
 it("Unverified User",  (done) => {
     request(app)
      .post('/api/Auth/')
      .send({
              "UserEmail": "samersosta@hotmail.com",
              "UserPassword": "123456"
         })
     .expect(401,done);
 });
 /*it("Send Verification Email",  (done) => {
     request(app)
      .post('/api/Users/')
      .send({
              "UserName": "Saad",
              "UserEmail": "samersosta2@Outlook.com",
              "UserPassword": "123456"
         })
     .expect(200,done);
 })
 it("Login Succefully",  (done) => {
     request(app)
      .post('/api/Auth/')
      .send({
              "UserEmail": "samersosta@gmail.com",
              "UserPassword": "123456"
         })
     .expect(200,done);
})
*/