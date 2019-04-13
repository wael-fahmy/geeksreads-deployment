var app = require("../DB").app;
const request = require("supertest");
/////////////////////////////////////////////////////////////////////
//Update statuses request Tests
////////////////////////////////////////////////////////////////////
//check the validations of the requests  
it("can't accept requests with missing required argument",(done)=>
 {
     request(app)
     .post("/api/user_status/")
     .send ({"StatusId ":"56565"})
     .expect(400)
     .end(done)
    }) ;
//check the validations of the requests
 it("Update can't accept requests with false parmeters",(done)=>
 {
     request(app)
     .post("/api/user_status/")
     .send ({"BookId ":"1989"})
     .expect(400)
     .end(done)
 }); 
 //check the behavior of the requests on the datatbase
/* it("Normal acceptance for update",(done)=>
 {
     request(app)
     .post("/api/user_status/")
     .send ({
        "StatusId":"1ss998",
         "UserId":"28938983",
         "ReviewId":"83939839",
        "StatusBody":"Hsis likes a comment"
        })
     .expect(200)
     .end(done)
 });*/ 
////////////////////////////////////////////////////////////////////
//get statuses request Tests
////////////////////////////////////////////////////////////////////
//check the validations of the requests  
it("can't accept requests with missing required argument",(done)=>
 {
     request(app)
     .get("/api/user_status/show")
     .send ({})
     .expect(400)
     .end(done)
 }) ;
//check the validations of the requests  
it("can't accept requests with wrong argument",(done)=>
{
     request(app)
     .get("/api/user_status/show")
     .send ({"bookId ":"1989"})
     .expect(400)
     .end(done)
 }) ;
//check t
/*it("didn't find the status ",(done)=>
{
     request(app)
     .get("/api/user_status/show")
     .send({"StatusId":"198928"})
     .expect(404)
     .end(done)
 }) ;
//the resopnse of the right request 
 
it("Normal acceptance for show",(done)=>
{
    request(app)
    .get("/api/user_status/show")
    .send({"StatusId":"198998"})// already exicting data
    .expect(200)
    .end(done)
}); */