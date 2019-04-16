const mongoose = require('mongoose');
const express = require('express');
const {Status,validate} = require('../models/Statuses');
const {User} = require('../models/User');
const auth = require('../middleware/auth');
const Joi = require('joi');
//const auth = require('../middleware/auth');
const router = express.Router();



/**
 * @api{Post} /user_status/ Update user status
 * @apiVersion 0.0.0
 * @apiName UpdateUserStatuses
 * @apiGroup Status
 *
 * @apiParam {string} StatusID status id
 * @apiParam {string} UserID User id
 * @apiparam {String} StatusBody the body of this status
 * @apiparam {datePicker} StatusDate the date when the status was written
 * @apiparam {string} CommentId comment id <code>(optional)</code>
 * @apiparam {string} ReviewId <code>(optional)</code>
 *
 *  @apiSuccess {boolen} UpdateSucc  if the update happend successfully or not
 *
 * @apiSuccessExample  Expected Data on Success
 * {
 *  "UpdateSucc": true
 * }
 * @apiError User-Not-Found The <code>User</code> was not found
 * @apiError Status-Not-Found The <code>Status</code> was not found
 */

router.post("/",(req,res)=>
{

 if (req.body.length == 0)
 {
    return res.status(400).send("No parameters was sent")
 }


 var  newStatus = new Status(
   {
   "StatusId":req.body.StatusId,
    "UserId":req.body.UserId,
    "ReviewId":req.body.ReviewId,
    "CommentId":req.body.CommentId,
   "StatusBody":req.body.StatusBody,
    "StatusDate":req.body.StatusDate
   });

  const {error} = validate(newStatus.body);
  if (error) return res.status(400).send(error.details[0].message);


   Status.findOne({'StatusId': newStatus.StatusId},(err,doc)=>
   {
    if(doc)
    {
   return res.status(400).send("already exist");
    }
    newStatus.save()
    res.status(200).send(
        {
            UpdateSucc : true
        }
    );
   });


});
  /**
 * @api{Get} /user_status/show Get User Status
 * @apiVersion 0.0.0
 * @apiName GetUserStatuses
 * @apiGroup Status
 * @apiHeader {String} x-auth-token Authentication token
 *
 * @apiSuccess {string} StatusId status id
 * @apiSuccess {string} UserId User id the user who is to see the status
 * @apiSuccess {datePicker} StatusDate the date when the status was written
 * @apiSuccess {string} CommentId comment id if the type is comment <code>(optional)</code>
 * @apiSuccess {string} ReviewId  review Id  alawys exisit weather the type is comment or review
 * @apiSuccess {string} MakerId the id of the user who made the status
 * @apiSuccess {string} Type  Wheather  it is Comment or Review
 * @apiSuccessExample  Expected Data on Success
 * {
 *
 * type : Review
 * StatusId : "82978363763"
 * MakerId : "shjfhghdsg"
 * UserId : "82sdfd8363763"
 * ReviewId : "82gf8363763"
 *
 * },
 * {
 *
 * type : Comment
 * CommentId : "hisadsfjhdld"
 * StatusId : "82978363763"
 * MakerId : "shjfhghdsg"
 * UserId : "82sdfd8363763"
 * ReviewId : "82gf8363763"
 * .......
 * },.....
 * @apiErrorExample {json} NotFound statuses:
 *     HTTP/1.1 400
 *  {
 *    "ReturnMsg":"No statuses were found"
 *  }
 *
 * @apiErrorExample {json} Invalidtoken-Response:
 *     HTTP/1.1 400
 *   {
 *      "ReturnMsg":'Invalid token.'
 *   }
 *
 * @apiErrorExample {json} NoTokenSent-Response:
 *     HTTP/1.1 401
 * {
 *   "ReturnMsg":'Access denied. No token provided.'
 * }
 * @apiError User-Not-Found The <code>User</code> was not found
 * @apiError Status-Not-Found The <code>Status</code> was not found
 */


router.get("/show",auth ,(req,res)=>
{
     if(req.body.UserId==null)
     {
        return  res.status(400).send("Bad request no UserID  Id is there");
    }

      if (req.body.UserId.length == 0)
     {
       return  res.status(400).send("Bad request no Satatus Id is there");
     }


  Status.find( {'UserId':req.body.UserId},(err,doc)=>

   {
    if(!doc)
    {
   return res.status(404).send("No statuses were found");
    }
    if(doc.lenght==0)
    {
   return res.status(404).send("No statuses were found");
    }

    res.status(200).send(
        doc
    )
   }
)


});/**
* @api{Post} /user_status/delete Delete User Status
* @apiVersion 0.0.0
* @apiName DeleteStatus
* @apiGroup Status
*
* @apiParam {string} StatusId Status id
*
* @apiSuccess {boolen} DeleteStatusSuc  if the delete happend successfully or not
* @apiSuccessExample  Expected Data on Success
* {
* "DeleteSTatusSuc": true
* }
* @apiError Status-Not-Found The <code>StatusID</code> was not found
*/
router.post("/delete",(req,res)=>
{
     if(req.body.StatusId==null)
     {
        return  res.status(400).send("Bad request no statusID  Id is there");
    }

      if (req.body.StatusId.length == 0)
     {
       return  res.status(400).send("Bad request no Satatus Id is there");
     }


  Status.findOneAndRemove( {'StatusId':req.body.StatusId},(err,doc)=>

   {
    if(!doc)
    {
   return res.status(404).send("Status Not found");
    }
    if(doc.lenght==0)
    {
   return res.status(404).send("Statuses Not found for this User");
    }

    res.status(200).send(
   {
       "DeleteSTatusSuc" : true

    }
    )
   }
)


});

function CreatStatuses( FollowerId ,ReviewId , CommentId, Type, MakerId, NumberOfStars, BookId )
{

if ( type == "Review")
{

}
else if ( type == "Rate")
{

}
else 
{
  
}


  var  newStatus = new Status(
{
  "UserId":FollowerId,
  "ReviewId":ReviewId,
  "CommentId":CommentId,
  });
 newStatus.StatusId=newStatus._id;

 const {error} = validate(newStatus.body);
 if (error) return console.log(error.details[0].message);

  if (StatusBody)
  {
    newStatus.body=StatusBody;
  }
}



module.exports = CreatStatuses;
module.exports = router;
