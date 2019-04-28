///////////////////Required Modules//////////////////////////
var express = require('express');

var Router = express.Router();
const mongoose = require('mongoose');
const {validate,review} = require('../models/reviews.model');
const user = require('../models/User').User;
const Joi = require('joi');
///////////////////Req and Res Logic////////////////////////

/**
 * @api{POST}/review/add Add new review on a book 
 * @apiName addNewReviewOnBook 
 * @apiGroup Reviews
 * @apiError {400} Bad request
 * @apiSuccess {Bool} AddedReviewSuc the review was added succesfuly
 * @apiSuccessExample
 * HTTP/1.1 200 OK
 *{ 
 *"AddedReviewSuc": true 
 *}
 * @apiParam{String} reviewBody body of the review written on the book
 * @apiParam{Date} reviewDate the date the review where written at the date is in iso format
 * @apiParam{ObjectID} bookId the id of the book reviewed by the user
 * @apiParam{ObjectID} userId the id of the user

 */


////post////
Router.post('/add', async (req, res) => {
     const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    var review1= new review();
    let check = await user.findOne({ UserId: req.body.userId });
    if (!check) return res.status(400).send({"ReturnMsg":"User Doesn't Exist"});
    const user1 = await user.findById(req.body.userId); 
        review1.reviewId=review1._id; //1  
        review1.bookId=req.body.bookId; //2 
        review1.reviewBody=req.body.reviewBody; //4
        review1.reviewDate=req.body.reviewDate; //5
        review1.userId=user1.UserId; //7
        review1.liked=false;
        review1.userName=user1.UserName; //8
        review1.photo=user1.Photo; //9 Users Photo 
        review1.likesCount=0; //10
        console.log(user1.UserName);
        console.log(user1.UserId);
        console.log(review1.userName);
    review1.save((err,doc)=>{
        if (!err) {           
            {        review.findOneAndUpdate({"reviewId":review1._id},{$push:{rating:0}},function (err, user1) {
                if (!err) {             
                    return res.status(200).send({ "AddedReviewSuc": true });
                }
                else {
                    return res.status(404).send("Not found");
                    console.log('error during log insertion: ' + err);}
            });
        }  
        }
        else {
            res.json({ "AddedReviewSuc": false });
            console.log('error during log insertion: ' + err);
        }    
    })
});
///////////////////////////////////////////////
////////////////////// Get Review By ID /////////////////
Router.get('/getReview',async(req,res)=>{
    
    const {error} = validateget(req.body);

    if(error) return res.status(400).send(error.details[0].message);

   review.findOne( {'reviewId':req.body.reviewId},(err,doc)=>
   {
       if(err) { res.status(400).send("review doesn't exist!")}

       if(!doc) { 
        console.log(doc); 
        res.status(400).send("error while retrieving data!")}
       if(doc)
       { res.status(200).send(doc)}
   })

})
/////////////////////////////////////////
////Remove////
/**
 * @api{POST}/review/remove remove and review on a book using the reviewId 
 * @apiName removeRevById 
 * @apiGroup Reviews
 * @apiError {400} Bad request
 * @apiSuccess {Bool} deleteReviewSuc the review deleted succesfuly
 * @apiSuccessExample
 * HTTP/1.1 200 OK
 *{ 
 *"deleteReviewSuc": true 
 *}
   * @apiParam{ObjectID} reviewId the id of the book reviewed by the user

 */
//////////////////////////////
Router.post('/remove',async (req,res)=>{
    const { error } = validateget(req.body);
    if (error) return res.status(400).send(error.details[0].message);
 review.findOneAndDelete({'reviewId':req.body.reviewId},(err)=>{
    if(err)
    {res.status(400).json({"deleteReviewSuc": false})}
    else{ 
     res.status(200).json({"deleteReviewSuc": true});}
})
})
////Rate////
/**
 * @api{POST}/review/rate rate a book using the bookId 
 * @apiName rate
 * @apiGroup Reviews
 * @apiError {400} Bad request
* @apiError {404} not found
 * @apiSuccess {Bool} deleteReviewSuc the review deleted succesfuly
 * @apiSuccessExample
 * Updated Succesfuly
   * @apiParam{ObjectID} bookId the id of the book rated by the user
  * @apiParam{ObjectID} userId the id of the user rating the book
  * @apiParam{Number} rating the rating of the book by the user
 

 */
//////////bookId,userId,rating///////////////
Router.post('/rate', async (req, res) => {
    if (req.body.rating < 0 | req.body.rating > 5) {
        return res.status(400).send("sent Rating is out of range 0 to 5");
    }
    else if(req.body.rating==null){
        return res.status(400).send("sent Rating is out of range 0 to 5");
    }
    else {
        review.findOneAndUpdate({ "bookId": req.body.bookId, "userId": req.body.userId }, { $set: { rating: req.body.rating } },
            function (err, user1) {
                if (!err & user1!=null) {
                    user.findOneAndUpdate({"userId": req.body.userId }, { $push: { ratedBooks: { bookId: req.body.bookId, rating: req.body.rating } } }, (err1, user2)=>{
                        if(!err1) {
                            console.log(req.body);
                            return res.status(200).send("Updated Succesfuly");
                        }
                else {
                            return res.status(404).send("Not found");
                            console.log('error during log insertion: ' + err1);
                        }
                    });
                }
                else {
                    return res.status(404).send("Not found");
                    console.log('error during log insertion: ' + err);
                }
            });
    }  
}
);
///////get reviews by book//////////
/**
 * @api{GET}/review/getrevbybookid get Reviews on a book By BookId
 * @apiName getrevbybookid
 * @apiGroup Reviews
 * @apiError {400} Bad request
* @apiError {404} not found
 * @apiSuccess {ObjectId} _id the review id
* @apiSuccess {ObjectId} reviewId the review id
* @apiSuccess {Number} rating the rating of the book by the review writer
* @apiSuccess {String} reviewBody the body of the review
* @apiSuccess {String} reviewDate the date the review was written
* @apiSuccess {String} reviewBody the body of the review
* @apiSuccess{ObjectId} bookId the id of the book rated by the user
* @apiSuccess{ObjectId} userId the id of the user rating the book
* @apiSuccess{String} userName the name of the user who wrote the review
* @apiSuccess{Number} LikesCount the number of likes on this review
*@apiSuccess{Bool} Liked is the comment liked or not by the current user
 * @apiSuccessExample
 * [
*[{_id : "5c9620083a3c692cd445a32a",
 *reviewId : "5c9620083a3c692cd445a32a",
 *rating : 3,
 *reviewDate : 2008-09-15 ,
 *reviewBody: "Hello World !!",
 *bookId :"5c9620083a3c692cd445a32a",
 *userId:"5c9620083a3c692cd445a32a" ,
 *userName:"saad" ,
 *LikesCount : 2 }, true ],......
 *]
   * @apiParam{ObjectId} UserId the id of the book rated by the user
  * @apiParam{ObjectId} bookId the id of the user rating the book
  * @apiParam{Number} rating the rating of the book by the user


 */
////////////////////////////////////////////
Router.get('/getrevbybookid', async (req, res) => {
    const { error } = validateget(req.body);
   if (error) return res.status(400).send(error.details[0].message);
   var allReviews=review.findById(req.body.bookId).toArray();
       console.log(allReviews);
       res.json(allReviews);
  
      
});
///////Edit review by id/////////
/**
 * @api{POST}/review/editRevById edit a review on a book using the reviewId 
 * @apiName editRevById 
 * @apiGroup Reviews
 * @apiError {404} not found
 * @apiSuccess {Bool} UpdatedReviewSucthe review edited succesfuly
 * @apiSuccessExample
 * HTTP/1.1 200 OK
 *{ 
 *"UpdatedReviewSuc": true 
 *}
   * @apiParam{ObjectID} reviewId the id of the book reviewed by the user
* @apiParam{ObjectID} reviewBody the new body of the review

 */
/////////////////////////////////////
Router.post('/editRevById',async (req, res) =>{
    review.findOneAndUpdate({"reviewId":req.body.reviewId},{$set:{reviewBody:req.body.reviewBody}},function (err, user1) {
        if (!err) {             
            return res.status(200).send({ "UpdatedReviewSuc": true });
        }
        else {
            return res.status(404).send("Not found");
            console.log('error during log insertion: ' + err);}
    });
    
});
////Edit review by Id /expecting reviewID and reviewBody////

/////////////////////////////////
function validateget(reqin) {
    const schema = {
    bookId:Joi.string().min(24),
    UserId:Joi.string().min(24)
    };
    return Joi.validate(reqin, schema);
    }
//////////////////////////////////

   Router.get('/getrev',async(req,res)=>{
    const { error } = validateget(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    var likedArr =Array();
    let Review = await review.find({bookId:req.body.bookId});
    var n=Review.length;
    for (var i = 0; i < n; i++) {
        console.log(i);
        let Result = await user.find({ 'UserId': req.body.UserId, 'LikedReview[0]': Review[i].reviewId });
        console.log(Result);
                if (Result) {
                    Review[i].liked = true;
                    likedArr.push(Review[i]);
                }
                else {
                    Review[i].liked = false;
                    likedArr.push(Review[i]);
                }
    
    }
 console.log(likedArr);
 res.status(200).json(likedArr);
   })    

module.exports = Router;
