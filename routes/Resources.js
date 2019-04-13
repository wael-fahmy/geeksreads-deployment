/**
 * @api {PUT} /like Like a resource 
 * @apiName PutLike
 * @apiGroup Resources
 * @apiError {404} NOTFOUND Resource could not be found
 * @apiParam {Number} resourceId Id of the resource being liked.
 *  @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *          {
 *              Liked
 *          }
 */

const Joi = require('joi');
 const express = require('express');
 const mongoose= require ('mongoose');
const {Resource} =require('../models/resources.model');
const router = express.Router();

router.put('/like',(req,res)=>{

    // input validation
    

 var error= null;
 if (req.body.ResourceID.lenght = 0)
 {
     error=1 ;
 }  

    if(error)
    {
       return res.status(404).send(error.details[0].message);
    }
    
   Resource.findByIdAndUpdate({ResourceID:req.body.ResourceID},{ $inc: { likes: 1 } },
    function(err, doc){
    if(err){
        console.log("Something wrong when updating data!");
    }

    if (!doc)
    {
        return res.status(200).send("liked");
   
    }
    console.log(doc);
    res.send(doc);
    res.send('liked..')

});
   
 
  
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

router.put('/unlike',(req,res)=>{
    // input validation
      console.log(req.body);
   
      const {error}= validate(req.body);
   
      console.log(error);
      if(error)
      {
         return res.status(404).send(error.details[0].message);
      }
      
     Resource.findByIdAndUpdate({ResourceID:req.body.ResourceID},{ $inc: { likes: -1 } },
      function(err, doc){
      if(err){
          console.log("Something wrong when updating data!");
      }
   
      if (!doc)
      {
          return res.status(404).send("resource not found");
     
      }
      console.log(doc);
      res.send(doc);
   
   });

   });
module.exports = router;