const config = require('config');
const crypto = require('crypto');
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
//const sendgrid = require('sendgrid');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const {User,validate} = require('../models/User');
const mongoose = require('mongoose');
const nodeMailer = require('nodemailer');
//const sgMail = require('@sendgrid/mail');
const express = require('express');
const router = express.Router();
const Author= require('../models/Author.model');

//get current User

/**
 *
 * @api {GET}  /user/me/GetUser Gets Information of Current User
 * @apiName GetUser
 * @apiGroup User
 * @apiHeader {String} x-auth-token Authentication token
 * @apiSuccess {String}   UserName   UserName of Current User
 * @apiSuccess {String} UserId Id of Current User
 * @apiSuccess {String} UserEmail Email of Current User
 * @apiSuccess {String[]} FollowingAuthorId Ids of Authors Current User is Following
 * @apiSuccess {String[]} FollowingUserId Ids of Users Current User is Following
 * @apiSuccess {String[]} FollowersUserId Ids of Users Following Current User
 * @apiSuccess {String[]} OwnedBookId Ids of Books Owned by Current User
 * @apiSuccessExample {json}  Success
 *     HTTP/1.1 200 OK
 *   {
 *     "FollowingAuthorId": [],
 *     "FollowingUserId": [],
 *     "FollowersUserId": [],
 *     "OwnedBookId": [],
 *     "ShelfId": [],
 *     "Confirmed": true,
 *     "UserName": "Ahmed1913",
 *     "UserEmail": "AhmedAmrKhaled@gmail.com",
 *     "UserId": "5ca23e81783e981f88e1618c"
 * }
 * @apiErrorExample {json} NoTokenMatch-Response:
 *     HTTP/1.1 400
 *   {
 *    "ReturnMsg":"User Doesn't Exist"
 *   }
 *
 * @apiErrorExample {json} UnConfirmedUser-Response:
 *     HTTP/1.1 401
 *  {
 *     "ReturnMsg" :'Your account has not been verified.'
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
 *
 */

router.get('/me', auth, async (req, res) => {
  let check = await User.findOne({ UserId: req.user._id });
  if (!check) return res.status(400).send({"ReturnMsg":"User Doesn't Exist"});
  const user = await User.findById(req.user._id).select('-UserPassword  -_id  -__v ');
  if (!user.Confirmed) return res.status(401).send({  "ReturnMsg" : 'Your account has not been verified.' });
  res.status(200).send(user);
});




//Verify From Email Link


/**
 *
 * @api {POST}  /user/Verify/ Verifies User From Email
 * @apiName EmailVerify
 * @apiGroup User
 * @apiHeader {String} x-auth-token Authentication token
 * @apiSuccess {String}   ReturnMsg   Notifies that User is Confirmed
 * @apiSuccessExample {json}  Success
 *     HTTP/1.1 200 OK
 *   {
 *     "ReturnMsg": "User Confirmed"
 *   }
 * @apiErrorExample {json} NoTokenMatch-Response:
 *     HTTP/1.1 400
 *   {
 *    "ReturnMsg":"User Doesn't Exist"
 *   }
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
 *
 */


router.post('/verify', auth, async (req, res) => {
  let check = await User.findOne({ UserId: req.user._id });
  if (!check) return res.status(400).send({"ReturnMsg":"User Doesn't Exist"});
  const user = await User.findById(req.user._id).select('-UserPassword');
  user.Confirmed = true;
  user.save();
//  const token = user.generateAuthToken();

  res.status(200).send({
    "ReturnMsg": "User Confirmed"
  });
});

//Sign Up Api sends verification mail


/**
 *
 * @api {POST}  /user/SignUp/ Signs User Up and Sends Verification Email
 * @apiName SignUp
 * @apiGroup User
 * @apiParam {String} UserName User Name to Sign Up.
 * @apiParam {String} UserEmail User Email to Sign Up.
 * @apiParam {String} UserPassword User Password to Sign Up.
 * @apiSuccess {String}   ReturnMsg   Notifies that User a verification Email is sent
 * @apiSuccessExample {json}  Success
 *     HTTP/1.1 200 OK
 *   {
 *     "ReturnMsg":"A verification email has been sent to UserEmail."
 *   }
 * @apiErrorExample {json} InvalidName-Response:
 *     HTTP/1.1 400
 *   {
 *    "ReturnMsg": "\"UserName\" length must be at least 3 characters long"
 *   }
 *
 * @apiErrorExample {json} InvalidEmail-Response:
 *     HTTP/1.1 400
 *   {
 *      "ReturnMsg": "\"UserEmail\" must be a valid email"
 *   }
 *
 * @apiErrorExample {json} InvalidPassword-Response:
 *     HTTP/1.1 400
 * {
 *   "ReturnMsg": "\"UserPassword\" length must be at least 6 characters long"
 * }
 * @apiErrorExample {json} ExistingEmail-Response:
 *     HTTP/1.1 400
 * {
 *   "ReturnMsg":"User already registered."
 * }
 *
 */


router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send({"ReturnMsg":error.details[0].message});
  let user = await User.findOne({ UserEmail: req.body.UserEmail });
  if (user) return res.status(400).send({"ReturnMsg":"User already registered."});
user = new User ({
  "UserName":req.body.UserName,
  "UserEmail":req.body.UserEmail,
  "UserPassword":req.body.UserPassword
});
const salt = await bcrypt.genSalt(10);
user.UserId = user._id;
user.UserPassword = await bcrypt.hash(user.UserPassword, salt);
await user.save();
const token = user.generateAuthToken();
let transporter = nodeMailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
              user: 'geeksreads@gmail.com',
              pass: 'AaBb1234'
          }
      });
  let mailOptions = {
     from: 'no-reply@codemoto.io',
to: user.UserEmail,
subject: 'Account Verification Token',
text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/verify\/'+ token +'.\n' };
let info = await transporter.sendMail(mailOptions);
transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              return console.log(error);
          }
res.status(200).send({"ReturnMsg":"A verification email has been sent to " + user.UserEmail + "."});
//res.header('x-auth-token', token).send(_.pick(user, ['_id', 'UserName', 'UserEmail']));
});
});


/**
 * @api {GET} /Shelf/GetUserReadStatus.json  Gets information about a book's read Status
 * @apiName GetUserReadStatus
 * @apiGroup Shelves
 *
 * @apiHeader {String} x-auth-token Authentication token
 * @apiParam {String} BookId  The Book Id To Get Status for.
 * @apiSuccess {String} ReturnMsg        Book Status.
 * @apiSuccessExample {json} Success
 *     HTTP/1.1 200 OK
 *     {
 *       "ReturnMsg":"Read"
 *     }
 * @apiSuccessExample {json} Success
 *     HTTP/1.1 200 OK
 *     {
 *       "ReturnMsg":"Currently Reading"
 *     }
 *
 * @apiSuccessExample {json} Success
 *     HTTP/1.1 200 OK
 *     {
 *       "ReturnMsg":"Want to Read"
 *     }
 * @apiErrorExample {json} NoBook-Response:
 *     HTTP/1.1 400
 * {
 *   "ReturnMsg": "Invalid Book Id"
 * }
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
 * @apiErrorExample {json} NoTokenMatch-Response:
 *     HTTP/1.1 400
 *   {
 *    "ReturnMsg":"User Doesn't Exist"
 *   }
 *
 */



 router.get('/GetBookReadStatus', auth, async (req, res) => {
   let check = await User.findOne({ UserId: req.user._id });
   if (!check) return res.status(400).send({"ReturnMsg":"User Doesn't Exist"});
   let Read =  await User.findOne({ Read:req.body.BookId });
   let WantToRead = await User.findOne({ WantToRead:req.body.BookId });
   let Reading =  await User.findOne({ Reading:req.body.BookId });
   if(!Read && !WantToRead && !Reading) return res.status(400).send({"ReturnMsg": "Invalid Book Id"});

  if (Read) res.status(200).send({"ReturnMsg": "Read"});
  else if (WantToRead) {res.status(200).send({"ReturnMsg": "Want To Read"});}
  else if (Reading) {res.status(200).send({"ReturnMsg": "Currently Reading"});}
 });




/**
 *
 * @api {POST}  /api/Users/Follow Follow a user
 * @apiName Follow user
 * @apiGroup User
 * @apiError {404} id-not-found The<code>userId_tobefollowed</code> was not found.
 * @apiSuccess {200} Follow Successful or not
 * @apiParam  {String} myuserId GoodReads User ID
 * @apiParam  {String} userId_tobefollowed GoodReads User ID
 * @apiSuccessExample {JSON}
 * HTTP/1.1 200 OK
   {
      "success": true,
      "Message":"Successfully done"
   }
 *  @apiErrorExample {JSON}
 *HTTP/1.1 404 Not Found
 * {
 * "success": false,
 * "Message":"User Id not  found !"
 * }
 *
 *
 */


//Follow User
router.post('/Follow', async (req, res) => { //sends post request to /Follow End point through the router
  /* console.log(req.body.userId_tobefollowed);
  console.log(req.userId_tobefollowed);
  console.log(req.params.userId_tobefollowed);
  console.log(req.query.userId_tobefollowed);  //ONLY WORKINGGGGGGGGGGGG
  console.log("my"+req.query.myuserid);*/
    mongoose.connection.collection("Users").updateOne( // accesses basic mongodb driver to update one document of Users Collection
      {
          UserId :  req.query.userId_tobefollowed //access document of user i want to follow
      },
      {$push: { // Push to end of array of the user's followers
        FollowersUserId:req.query.myuserid
      }}
      ,function (err,doc) { // error handling and checking for returned mongo doc after query

         if (doc.matchedCount==0 || err) //matched count checks for number of affected documents by query
         { res.status(404).json({ // sends a json with 404 code
          success: false , // Follow Failed
           "Message":"User Id not  found !"});
         }
       else
       {
       res.status(200).json({ //sends a json with 200 code
         success: true ,//Follow Done
          "Message":"Sucessfully done"});
       }
    });
    mongoose.connection.collection("Users").updateOne( // accesses basic mongodb driver to update one document of Users Collection
        {
            UserId :req.query.myuserid//access document of currently logged In user
        },
        {$push: { // Push to end of array of the users I follow
          FollowingUserId: req.query.userId_tobefollowed
        }});



        });



  //UNFollow User
 /**
 *
 * @api {POST}  /api/Users/unFollow Unfollow a user
 * @apiName Unfollow user
 * @apiGroup User
 * @apiError {404} id-not-found The<code>userId_tobefollowed</code> was not found.
 * @apiSuccess {200} UNFollow Successful
 * @apiParam  {String} myuserId GoodReads User ID
 * @apiParam  {String} userId_tobefollowed GoodReads User ID

 * @apiSuccessExample {JSON}
 * HTTP/1.1 200 OK
   {
      "success": true,
      "Message":"Successfully done"
   }
 *  @apiError id-not-found The<code>userId</code> was not found.
 *  @apiErrorExample {JSON}
 *  HTTP/1.1 404 Not Found
 * {
 * "success": false,
 * "Message":"User Id not  found !"
 * }
 *
 *
 */

  //UNFollow User
  router.post('/unFollow', async (req, res) => { //sends post request to /unFollow End point through the router
    /* console.log(req.body.userId_tobefollowed);
    console.log(req.userId_tobefollowed);
    console.log(req.params.userId_tobefollowed);
    console.log(req.query.userId_tobefollowed);  //ONLY WORKINGGGGGGGGGGGG
    console.log("my"+req.query.myuserid);*/
      mongoose.connection.collection("Users").updateOne( // accesses basic mongodb driver to update one document of Users Collection

        {
            UserId :  req.query.userId_tobefollowed //access document of user i want to unfollow
        },
        {$pull: { // pull from end of array of the users I follow
          FollowersUserId:req.query.myuserid
        }}
        ,function (err,doc) { // error handling and checking for returned mongo doc after query

          if ( doc.matchedCount==0 || err)   //matched count checks for number of affected documents by query
          {

            res.status(404).json({  // sends a json with 404 code
           success: false ,  // unFollow Failed
            "Message":"User Id not  found !"});
          }
        else
        {
        //console.log(doc);
        res.status(200).json({ //sends a json with 200 code
          success: true , //unFollow Done
           "Message":"Sucessfully done"});
        }
      });
      mongoose.connection.collection("Users").updateOne(
          {
              UserId :req.query.myuserid//access document of currently logged In user
          },
          {$pull: { // pull from end of array of the users I follow
            FollowingUserId: req.query.userId_tobefollowed
          }});


          });


module.exports = router;
