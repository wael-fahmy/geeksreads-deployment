///////////////////Required Modules//////////////////////////
var express = require('express');
const {CreatStatuses} = require("../models/Statuses")
var Router = express.Router();
const mongoose = require('mongoose');
const {validate,review} = require('../models/reviews.model');
const book =require('../models/Book').Books;
const user = require('../models/User').User;
const Joi = require('joi');
const auth = require('../middleware/auth');
///////////////////Req and Res Logic////////////////////////

/**
 * @api{POST} /api/reviews/add Add new review on a book 
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
* @apiParam {String} token Authentication token
 */


////post////
Router.post('/add', auth,async (req, res) =>{
    if(req.body.rating!=null)
    {
        rate = req.body.rating;
    }
    else{
        rate = 0;
        req.body.rating=0;
    }
 const { error } = validate(req.body);
if (error) return res.status(400).send(error.details[0].message);
var review1= new review();
let check = await user.findOne({ UserId: req.body.userId });
if (!check) return res.status(400).send({"ReturnMsg":"User Doesn't Exist"});
const user1 = await user.findById(req.body.userId);
let check1 = await book.findOne({ BookId: req.body.bookId });
console.log(check1);
if (!check1) return res.status(400).send({"ReturnMsg":"Book Doesn't Exist"});

const book1 =check1;
console.log(book1);
    review1.reviewId=review1._id; //1  
    review1.bookId=req.body.bookId; //2
    review1.bookCover=  book1.Cover; 
    review1.reviewBody=req.body.reviewBody; //4
    review1.reviewDate=req.body.reviewDate; //5
    review1.userId=user1.UserId; //7
    review1.liked=false;
    review1.commCount=0;
    review1.userName=user1.UserName; //8
    review1.photo=user1.Photo; //9 Users Photo 
    review1.likesCount=0; //10
    console.log(user1.UserName);
    console.log(user1.UserId);
    console.log(review1.userName);
review1.save(async(err,doc)=>{
    if (!err) {           
        {       await review.findOneAndUpdate({"reviewId":review1._id},{$set:{rating:rate}},function (err, user1) {
            if (!err) {             

                console.log ("we  saving")
              
              if (user1.FollowersUserId)
              {  
              var n = user1.FollowersUserId.length; 
               console.log(n);
                 for (i=0;i<n;i++)
               {

                     CreatStatuses( FollowersUserId[i] ,review1.reviewId , null , "Review" , null, review1.bookId);

               }  
            }



                return res.status(200).send({ "AddedReviewSuc": true });
            }
            else {
                console.log('error during log insertion: ' + err);
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

/////////////////////////////////////////
////Remove////
/**
 * @api{POST}/api/reviews/remove remove and review on a book using the reviewId 
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
Router.post('/remove',auth,async (req,res)=>{
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
 * @api{POST} /api/reviews/rate rate a book using the bookId 
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
Router.post('/rate', auth,async (req, res) => {
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
 * @api{GET} /api/reviews/getrev get Reviews on a book By BookId
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
* @apiSuccess {ObjectId} bookId the id of the book rated by the user
* @apiSuccess {ObjectId} userId the id of the user rating the book
* @apiSuccess {String} userName the name of the user who wrote the review
* @apiSuccess {Number} LikesCount the number of likes on this review
* @apiSuccess {Bool} Liked is the comment liked or not by the current user
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
   * @apiParam {ObjectId} UserId the id of the book rated by the user
  * @apiParam {ObjectId} bookId the id of the user rating the book
  


 */
////////////////////////////////////////////
   Router.all('/getrev',async(req,res)=>{
    const { error } = validateget(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    var likedArr =Array();
    let Review = await review.find({bookId:req.body.bookId});
    let Result = await user.find({ 'UserId': req.body.UserId}).select('-_id LikedReview');
    var n=Review.length;
    console.log(Review);
    Result=Result[0].LikedReview;
    console.log(Result);
    for (var i = 0; i < n; i++) {
        var exsist = Result.indexOf(Review[i]._id);
        console.log(exsist);
                if (exsist>=0) {
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
///////Edit review by id/////////
/**
 * @api{POST}/api/reviews/editRevById edit a review on a book using the reviewId 
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
Router.post('/editRevById',auth,async (req, res) =>{
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



module.exports = Router;
