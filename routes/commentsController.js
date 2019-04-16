///////////////////Required Modules//////////////////////////
var express = require('express');
var Router = express.Router();
const mongoose = require('mongoose');
const {validate,comment} = require('../models/comments.model');
const user = require("../models/User").User;
const resource =mongoose.model('Resources');
const Joi = require('joi');
///////////////////Req and Res Logic////////////////////////
////get////
/**
 * @api{GET}/comment/list List comments on a subject 
 * @apiName listCommentsOnSubject
 * @apiGroup Comments 
 * @apiError {404} NOTFOUND no comments on this subject
 * @apiSuccess {Number} likes number of likes on each comment
 * @apiSuccess {String} body body text of each comment
 * @apiSuccess {String} userName name of the user who wrote each comment
 * @apiSuccess {Number} userId the id of the user who wrote each comment
 * @apiSuccess {datePicker} date the date of each comment
 * @apiSuccessExample
 * HTTP/1.1 200 OK
 * {
 * "comment":[
 *         {"likes": 11,
 *           "body": "Hello World !",
 *           "userName": "zzzdwsdsdsdsd zzzdwsdsdsdsd",
 *           "userId": "567890987654567890",
 *           "Photo": "url",
 *           "date": "2019-01-02T09:00:16.204Z"
 *         },......
 * ]
 * }
 * @apiParam{Number} ReviewId Id of review given as type Parameter
 */
Router.get('/list', async (req, res) => {
    const { error } = validateget(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  comment.find({"ReviewId" : req.body.ReviewId}).then(commArr => {
      if(commArr.length==0) return res.status(404).json({ success: false });
      res.status(200).json(commArr);
  }).catch(err => res.status(404).json({ success: false }));
  
      
});
////post////
/**
 * @apiSuccess  {Boolean} AddedCommentSuc comment was added successfully
 * @apiSuccessExample
 * HTTP/1.1 200 OK
 * {
 * "AddedCommentSuc": true
 * }
 * @api{POST}/comment/create Create a comment
 * @apiName creatComment
 * @apiGroup Comments
 * @apiParam{String} Body The body of the comment  
 * @apiParam{String} type Subject Type Commented On; book,review,etc
 * @apiParam{Number} BookId  id of book commented on
 * @apiParam{Number} ReviewId  id review commented on
 * @apiParam{Number} CommentId  id of comment
 * @apiParam{String} userName Name of user who wrote the comment
 * @apiParam{Number} userID  Id of user who wrote the comment
 * @apiParam{String} Photo User Photo 
 * @apiParam{datePicker} date the date the comment was written on
 * @apiParam{Number} LikesCount number of likes on this comment
 * @apiError EmptyComment Must Have At Least <code>1</code> Character In Comment
 */

Router.post('/create', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    var comment1 = new comment();
    //////////////////////////////////////////////////////////////
    let check = await user.findOne({ UserId: req.body.userId });
    if (!check) return res.status(400).send({"ReturnMsg":"User Doesn't Exist"});
    const user1 = await user.findById(req.body.userId);
    //////////////////////////////////////////////////////////////
    comment1.Body = req.body.Body;//1
    comment1.userId=req.body.userId;//2
    comment1.userName = user1.UserName; //3
    comment1.date = req.body.date;//4
    comment1.BookId=req.body.BookId;//5
    comment1.ReviewId=req.body.ReviewId;//6
    comment1.CommentId=comment1._id;  //7
    comment1.Photo= user1.Photo; //8
    comment1.LikesCount= 0; //9
    console.log(user1.UserName);
    console.log(user1.UserId);
    console.log(comment1);
    comment1.save((err, doc) => {
        if (!err) {           
            
            res.json({ "AddedCommentSuc": true });
        }
        else {
            res.json({ "AddedCommentSuc": false });
            console.log('error during log insertion: ' + err);
        }
    });
});
function validateget(reqin) {
    const schema = {
    ReviewId:Joi.string().min(24),
    };
    return Joi.validate(reqin, schema);
    }


module.exports = Router;
