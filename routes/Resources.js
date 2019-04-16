
const Joi = require('joi');
const express = require('express');
const mongoose= require ('mongoose');
const {review} = require('../models/reviews.model');
const {comment}=require('../models/comments.model');
const router = express.Router();
/**
 * @api {Post} /like Like a resource 
 * @apiName PutLike
 * @apiGroup Resources
 * @apiError {404} NOTFOUND Resource could not be found
 * @apiParam {string} resourceId Id of the resource being liked( the comment or the review)
 * @apiParam {string} Type must be (Review,Comment) Naming system is important
 *  
 * @apiSuccess {boolen} Liked
 * 
 *   @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *          {
 *              "Liked": true
 *          }
 */

router.post('/like',(req,res)=>{

    // input validation
    console.log(req.body.resourceId);
    if (req.body.resourceId == null)
    { 
        res.status(400).send(" wrong parameters no id");
   
    }

 if (req.body.resourceId.lenght == 0)
 {
     res.status(400).send(" wrong parameters no id")
 }   

 if (req.body.Type == "Comment")
 {
    comment.findOneAndUpdate({CommentId: req.body.resourceId},{ $inc: { LikesCount: 1 } },function(err, doc){
        if(err){
            console.log("Something wrong when updating data!");
        }
    
        if (!doc)
        {
            return res.status(404).send("Not found");
       
        }
        if (doc)
        {
            return res.status(200).send("liked");
       
        }
    });
}
   else if (req.body.Type == "Review")
    {
       review.findOneAndUpdate({ reviewId: req.body.resourceId},{ $inc: { LikesCount: 1 } },function(err, doc){
           if(err){
               console.log("Something wrong when updating data!");
           }
       
           if (!doc)
           {
               return res.status(404).send("Not found");
          
           }
           if (doc)
           {
               return res.status(200).send("liked");
          
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
 * @api {PUT} /unlike Unlike a resource 
 * @apiName PutUnlike
 * @apiGroup  Resources
 * @apiError {404} NOTFOUND Resource could not be found
 * @apiParam {Number} resourceId Id of the resource being liked.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *          {
 *              Unliked
 *          }
 * 
 */

router.post('/like',(req,res)=>{

    // input validation
    console.log(req.body.resourceId);
    if (req.body.resourceId == null)
    { 
        res.status(400).send(" wrong parameters no id");
   
    }

 if (req.body.resourceId.lenght == 0)
 {
     res.status(400).send(" wrong parameters no id")
 }   

 if (req.body.Type == "Comment")
 {
    comment.findOneAndUpdate({CommentId: req.body.resourceId},{ $inc: { LikesCount: -1 } },function(err, doc){
        if(err){
            console.log("Something wrong when updating data!");
        }
    
        if (!doc)
        {
            return res.status(404).send("Not found");
       
        }
        if (doc)
        {
            return res.status(200).send("liked");
       
        }
    });
}
   else if (req.body.Type == "Review")
    {
       review.findOneAndUpdate({ reviewId: req.body.resourceId},{ $inc: { LikesCount: -1 } },function(err, doc){
           if(err){
               console.log("Something wrong when updating data!");
           }
       
           if (!doc)
           {
               return res.status(404).send("Not found");
          
           }
           if (doc)
           {
               return res.status(200).send("liked");
          
           }
       });
    }          
 else // wrong type
 {
   res.status(400).send("wrong type");
 }    


  
});

module.exports = router;