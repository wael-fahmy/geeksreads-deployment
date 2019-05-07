
const Joi = require('joi');
const express = require('express');
const mongoose= require ('mongoose');
const user= require('../models/User').User;
const {review} = require('../models/reviews.model');
const {comment}=require('../models/comments.model');
const{CreatNotification} = require('../models/Notifications');
const {CreatStatuses} = require("../models/Statuses")
const auth = require('../middleware/auth');
const router = express.Router();
/**
 * @api {Post} /api/resources/like Like a resource 
 * @apiName PutLike
 * @apiGroup Resources
 * @apiError {404} NOTFOUND Resource could not be found
 * @apiParam {string} resourceId Id of the resource being liked( the comment or the review)
 * @apiParam {string} Type must be (Review,Comment) Naming system is important
 * @apiParam {string} token token of user
 * @apiSuccess {boolen} Liked
 * 
 *   @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *          {
 *              "Liked": true
 *          }
 */
/*
    

*/
router.post('/like',auth,(req,res)=>{

   // input validation
    
   if (req.body.resourceId == null)
   { 
       res.status(400).send(" wrong parameters no id");
  
   }

if (req.body.resourceId.lenght == 0)
{
    res.status(400).send(" wrong parameters no id")
}   
if (req.body.Type == "Review")
   {
       let Result =  user.find({'UserId':req.body.User_Id}).select('-_id LikedReview');
      
    
          var exsist = Result[0].LikedReview.indexOf(req.body.resourceId);
          if (exsist >= 0)
          {
              res.status(401).send (" You Already liked it ")
          }
    



       review.findOneAndUpdate({ reviewId: req.body.resourceId},{ $inc: { likesCount: 1 } },function(err, doc){
          if(err){
              console.log("Something wrong when updating data!");
          }
      
          if (!doc)
          {
              console.log(req.body);
              return res.status(404).send("Not found");
         
          }
          if (doc)
          {
           user.findByIdAndUpdate(req.body.User_Id,
               { "$push": { "LikedReview": req.body.resourceId } },
               function (err, user1) {
                   if (!err) {           
                       review.findOne({"reviewId": req.body.resourceId},(err,doc)=>
           {
                
               if(doc)
               {
                   var NotifiedUserId = doc.userId;
                   var BookID = doc.bookId
                console.log (" i liked  a comment ");
                 CreatNotification(NotifiedUserId, doc.reviewId, null,"ReviewLike", req.body.User_Id,BookID);
               }

           });
          
                       return res.status(200).send("liked");
                   }
                   else {
                       return res.status(404).send("Not found");
                       console.log('error during log insertion: ' + err);
                   }});
          }
      });
   }          
else // wrong type
{
  res.status(400).send("wrong type");
}    


 
});


/////Unlike a Resource/////

/**
 * @api {POST} /api/resources/unlike Unlike a resource 
 * @apiName PutUnlike
 * @apiGroup  Resources
 * @apiError {404} NOTFOUND Resource could not be found
 * @apiParam {Number} resourceId Id of the resource being liked.
 * @apiParam {string} Type must be (Review,Comment) Naming system is important
  * @apiParam {string} token token of user
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *          {
 *              Unliked
 *          }
 * 
 */

router.post('/unlike',auth,(req,res)=>{

     // input validation
     console.log("hey");
     if (req.body.resourceId == null)
     { 
         res.status(400).send(" wrong parameters no id");
    
     }
 
  if (req.body.resourceId.lenght == 0)
  {
      res.status(400).send(" wrong parameters no id")
  }   
  if (req.body.Type == "Review")
     {
         console.log("heyReview");
         let Result =  user.find({'UserId':req.body.User_Id}).select('-_id LikedReview');
        
      
         var exsist = Result[0].LikedReview.indexOf(req.body.resourceId);
         if (exsist == -1)
         {
             res.status(401).send (" You Already unliked it ")
         }
   
 
 
        review.findOneAndUpdate({ reviewId: req.body.resourceId},{ $inc: { likesCount: -1 } },function(err, doc){
            if(err){
                console.log("Something wrong when updating data!");
            }
        
            if (!doc)
            {
                return res.status(404).send("Not found");
           
            }
            if (doc)
            {user.findByIdAndUpdate(req.body.User_Id,
             { "$pull": { "LikedReview": req.body.resourceId } },
             function (err, user1) {
                 if (!err) {           
                 
                     
                     return res.status(200).send("unliked");
                 }
                 else {
                     return res.status(404).send("Not found");
                     console.log('error during log insertion: ' + err);
                 }});
            }
        });
     }          
  else // wrong type
  {
    res.status(400).send("wrong type");
  }    
 
 
   
 });
 

module.exports = router;