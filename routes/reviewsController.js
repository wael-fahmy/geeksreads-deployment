///////////////////Required Modules//////////////////////////
var express = require('express');
var Router = express.Router();
const mongoose = require('mongoose');
const {validate,review} = require('../models/reviews.model');
const user = require('../models/User').User;
const Joi = require('joi');
///////////////////Req and Res Logic////////////////////////
////post////
/**
 * @apiSuccess  {Boolean} AddedReviewSuc Review was added successfully
 * @apiSuccessExample
 * HTTP/1.1 200 OK
 * {
 * "AddedCommentSuc": true
 * }
 * @api{POST} /review/add Add review
 * @apiName AddReview
 * @apiGroup Review
 * @apiParam{String} reviewBody The body of the review  
 * @apiParam{Number} bookId  id of book reviewd on
 * @apiParam{Number} reviewId  id review 
 * @apiParam{String} userName Name of user who wrote the review
 * @apiParam{Number} userID  Id of user who wrote the review
 * @apiParam{String} photo User Photo 
 * @apiParam{datePicker} reviewDate the date the review was written on
 * @apiParam{Number} likesCount number of likes on this review
 * @apiParam{Number} rating number rating on review
 * @apiParam{String} shelf shelf name in which review is in
 * @apiError EmptyComment Must Have At Least <code>1</code> Character In Comment
 */
Router.post('/add', async (req, res) => {
     const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    var review1= new review();
    let check = await user.findOne({ UserId: req.body.userId });
    if (!check) return res.status(400).send({"ReturnMsg":"User Doesn't Exist"});
    const user1 = await user.findById(req.body.userId); 
        review1.reviewId=review1._id; //1  
        review1.bookId=req.body.bookId; //2
        review1.rating=req.body.rating; //3 
        review1.reviewBody=req.body.reviewBody; //4
        review1.reviewDate=req.body.reviewDate; //5
        review1.shelf=req.body.shelf; //6
        review1.userId=user1.UserId; //7
        review1.userName=user1.UserName; //8
        review1.photo=user1.Photo; //9 Users Photo 
        review1.likesCount=0; //10
        console.log(user1.UserName);
        console.log(user1.UserId);
        console.log(review1.userName);
    review1.save((err,doc)=>{
        if (!err) {           
            
            res.json({ "AddedReviewSuc": true });
        }
        else {
            res.json({ "AddedReviewSuc": false });
            console.log('error during log insertion: ' + err);
        }    
    })
});
///////////////////////////////////////////////
////Remove////
/**
 * @api{DELETE} /review/remove Delete review 
 * @apiName deletereview
 * @apiParam{Number} reviewId  id review 
 * @apiGroup Review 
 * @apiError {404} NOTFOUND the review you are looking for does not exist
 * @apiSuccess {Boolean} deleteReviewSuc review was deleted
 * @apiSuccessExample
 * HTTP/1.1 200 OK
 * {
 * "deleteReviewSuc": true
 * }
 * @apiParam {ObjectId} review_Id Id of the review to be deleted
 */
Router.delete('/remove',async (req,res)=>{
    const { error } = validateget(req.body);
    if (error) return res.status(400).send(error.details[0].message);
 review.findOneAndDelete({'reviewId':req.body.reviewId},(err)=>{
    if(err){res.status(400).json({"deleteReviewSuc": false})};
    res.status(200).json({"deleteReviewSuc": true});
})
})
function validateget(reqin) {
    const schema = {
    ReviewId:Joi.string().min(24),
    };
    return Joi.validate(reqin, schema);
    }

module.exports = Router;
