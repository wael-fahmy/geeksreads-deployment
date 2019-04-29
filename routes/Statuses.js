const mongoose = require('mongoose');
const express = require('express');
const {Status,validate} = require('../models/Statuses');
const auth = require('../middleware/auth');
const Joi = require('joi');
const {Notification}= require('../models/Notifications');
const User= require('../models/User').User;

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
 * @apiSuccess {string} StatusType  Wheather  it is Comment or Review or Rate
 * @apiSuccess {string} StatusId status id
 * @apiSuccess {string} UserId User id the user who is to see the status
 *
 * @apiSuccess {string} CommentId comment id if the type is comment <code>(optional)</code>
 * @apiSuccess {string} CommentBody Comment the comment body 
 * @apiSuccess {date} CommentDate The date of the comment
 * @apiSuccess {Number}  CommentLikesCount number of people liked this comment
 *  
 * 
 * @apiSuccess {string} BookId the Id of the book rated or reviewed
 * @apiSuccess {string} BookName the name (title) of the book rated or reviewed
 * @apiSuccess {string} BookPhoto the URL of the cover Photo of the book rated or revied
 * @apiSuccess {Number} NumberOfStars the number of stars in case of rating a book
 * 
 * @apiSuccess {string} ReviewId  review Id  alawys exisit weather the type is comment or review
 * @apiSuccess {string} ReviewBody Review Body in case of comment on review or reviews a book 
 * @apiSuccess {date}  ReviewDate the date of the review
 * @apiSuccess {Number}  ReviewLikesCount numbr of the people who liked the the review
 * 
 * @apiSuccess {string} MakerId the id of the user who made the status( Commented or rated or reviewd)
 * @apiSuccess {string} MakerPhoto the URL of the Photo of the User who did the thing ( Commented or rated or reviewd)
 * @apiSuccess {string}  MakerName the Name of the User Who made the status ( Commented or rated or reviewd)
 * 
 *  @apiSuccessExample  Expected Data on Success
 * {
 *
 *  StatusType : Review
 * "StatusId" : "82978363763"
 * "MakerId" : "shjfhghdsg"
 * "UserId" : "82sdfd8363763"
 * "ReviewId" : "82gf8363763"
 * "ReviewLikesCount": 11,
 *           "body": "Hello World !",
 *           
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


router.get("/show" ,auth,async(req,res)=>
 {
//      if(req.query.UserId==null)
//      {
//         return  res.status(400).send("Bad request no UserID  Id is there");
//     }

//       if (req.query.UserId.length == 0)
//      {
//        return  res.status(400).send("Bad request no Satatus Id is there");
//      }


  await Status.find( {'UserId':req.user._id},async(err,doc)=>

   {
    if(!doc)
    {  return res.status(404).send("No statuses were found"); }
    if(doc.lenght==0)
    {return res.status(404).send("No statuses were found");}
   
   
    var n = doc.length;
    console.log (n);
    let Result = await User.find({'UserId': req.user._id}).select('-_id LikedReview WantToRead Read Reading');
       console.log(Result);
      
    for (var i=0 ;i<n;i++)
   {
     if (doc[i].ReviewId)
     {
       var exsist = Result[0].LikedReview.indexOf(doc[i].ReviewId);
               if (exsist>=0) {
               
                 doc[i].ReviewIsLiked =true;  
                 }
               else
                {
                   doc[i].ReviewIsLiked =false;  
               
                 }
            if (doc[i].BookId) // in case of review thats mean we have book so we have to check is is reading or want to read ....     
                 {
                  var exsist = Result[0].WantToRead.indexOf(doc[i].BookId);
                  if (exsist>=0) {doc[i].BookStatus ="WantToRead";}
                  else
                   {
                    exsist = Result[0].Read.indexOf(doc[i].BookId);
                    if (exsist>=0) {doc[i].BookStatus ="Read";}
                    else
                    {
                      exsist = Result[0].Reading.indexOf(doc[i].BookId);
                    if (exsist>=0) {doc[i].BookStatus ="Reading";}
                    else{doc[i].BookStatus =null;}
                    }
                    }
     

                 }
      }    
  
  
   
    }
    res.status(200).send(doc )
   });
  });
   /**
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
module.exports = router;
