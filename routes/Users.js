const config = require('config');
const isImageUrl = require('is-image-url');
const crypto = require('crypto');
const auth = require('../middleware/auth');
const authAll = require('../middleware/authAll');
const jwt = require('jsonwebtoken');
//const sendgrid = require('sendgrid');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const {User,validate,DateValidate,NewPassWordValidate,Mailvalidate,NewPasswordOnlyValidate} = require('../models/User');
const {Notification}= require('../models/Notifications');
const mongoose = require('mongoose');
const nodeMailer = require('nodemailer');
//const sgMail = require('@sendgrid/mail');
const express = require('express');
const router = express.Router();
const Author= require('../models/Author.model');




//get current User

/**
 *
 * @api {POST}  /api/users/me Gets Information of Current User
 * @apiName User
 * @apiGroup User
 * @apiGroup User
 * @apiParam {String} token Authentication token
 * @apiSuccess {String}   UserName   UserName of Current User
 * @apiSuccess {String} UserId Id of Current User
 * @apiSuccess {String} UserEmail Email of Current User
 * @apiSuccess {Number} NoOfFollowings No. of Followings
 * @apiSuccess {Number} NoOfFollowers No. of Followers
 * @apiSuccess {String} Photo Profile Photo
 * @apiSuccess {Date} UserBirthDate User Birth Date
 * @apiSuccessExample {json}  Success
 *     HTTP/1.1 200 OK
 *   {
 *       "NoOfFollowings": 1,
 *       "NoOfFollowers": 0,
 *       "UserId":"5cc5df8c2e9c5800172864c9",
 *       "UserEmail": "samersosta@gmail.com",
 *       "UserName": "Ashraaaaaaaaaaaaaf",
 *       "Photo": "",
 *       "UserBirthDate": "2000-01-01T00:00:00.000Z"
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

router.all('/me', auth, async (req, res) => {
  let check = await User.findOne({ UserId: req.user._id });
  if (!check) return res.status(400).send({"ReturnMsg":"User Doesn't Exist"});
  const user = await User.findById(req.user._id).select('-UserPassword  -_id  -__v ');
  if (!user.Confirmed) return res.status(401).send({  "ReturnMsg" : 'Your account has not been verified.' });
  var NoOfFollowings = user.FollowingUserId.length;
  var NoOfFollowers = user.FollowersUserId.length;
  var Result={
    "NoOfFollowings":NoOfFollowings,
    "NoOfFollowers":NoOfFollowers,
    "UserEmail":user.UserEmail,
    "UserName":user.UserName,
    "Photo":user.Photo,
    "UserBirthDate":user.UserBirthDate
  }
  res.status(200).send(Result);
});
//Forgot Password
/**
 *
 * @api {POST}  /api/users/ForgotPassword Sends email to change forgotten password
 * @apiName ForgotPassword
 * @apiGroup User
 * @apiParam {String} UserEmail User Email to Sign Up.
 * @apiSuccess {String}   ReturnMsg   Notifies the User an Email to change his password was sent
 * @apiSuccessExample {json}  Success
 *     HTTP/1.1 200 OK
 *   {
 *     "ReturnMsg":"ReturnMsg":"An Email has been Sent to change your Forgotten Password UserEmail"
 *   }
 * @apiErrorExample {json} InvalidEmail-Response:
 *     HTTP/1.1 400
 *   {
 *      "ReturnMsg": "\"UserEmail\" must be a valid email"
 *   }
 *
 * @apiErrorExample {json} NonExistingEmail-Response:
 *     HTTP/1.1 400
 * {
 *   "ReturnMsg":"User Doesn't Exist"
 * }
 *
 */


router.post('/ForgotPassword', async (req, res) => {
  const { error } = Mailvalidate(req.body);
  if (error) return res.status(400).send({"ReturnMsg":error.details[0].message});
  let user = await User.findOne({ UserEmail: req.body.UserEmail.toLowerCase() });
  if(!user)  return res.status(400).send({"ReturnMsg":"User Doesn't Exist"});
  const token = jwt.sign({ UserEmail:req.body.UserEmail.toLowerCase() }, config.get('jwtPrivateKey'), {expiresIn: '1h'});
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
subject: 'Assign New Password',
text: 'Hello,\n\n' + 'Please Click on this link to change your Password: \nhttp:\/\/' + req.headers.host + '/password-reset'+'\n Copy And Paste this Verification Code to change your password :\n' +token+'\n' };
let info = await transporter.sendMail(mailOptions);
transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              return console.log(error);
          }
//res.redirect('/password-reset')
res.status(200).send({"ReturnMsg":"An Email has been Sent to change your Forgotten Password " + req.body.UserEmail.toLowerCase() + "."});
//res.header('x-auth-token', token).send(_.pick(user, ['_id', 'UserName', 'UserEmail']));
});
});



//Change Forgotten Password From Email token
/**
 *
 * @api {POST}  api/users/ChangeForgotPassword Change Forgotten Password From Email token
 * @apiName ChangeForgotPassword
 * @apiGroup User
 * @apiParam {String} token token from mail sent to change password.
 * @apiParam {String} NewUserPassword New Password to replace forgotten password.
 * @apiSuccess {String}   ReturnMsg   Notifies the User that his password is changed
 * @apiSuccessExample {json}  Success
 *     HTTP/1.1 200 OK
 *   {
 *     "ReturnMsg": "Update Successful"
 *   }
 * @apiErrorExample {json} InvalidNewPassword-Response:
 *     HTTP/1.1 400
 *   {
 *      "ReturnMsg": "\"NewUserPassword\" length must be at least 6 characters long"
 *   }
 *
 * @apiErrorExample {json} NonExistingEmail-Response:
 *     HTTP/1.1 400
 * {
 *   "ReturnMsg":"User Doesn't Exist"
 * }
 *
 */


router.post('/ChangeForgotPassword', auth, async (req, res) => {

  let check = await User.findOne({ UserEmail: req.user.UserEmail });
  if (!check) return res.status(400).send({"ReturnMsg":"User Doesn't Exist"});
  const user = await User.findOne({UserEmail: req.user.UserEmail }).select('-UserPassword');
  const { error } = NewPasswordOnlyValidate(req.body);
  if (error) return res.status(400).send({"ReturnMsg":error.details[0].message});
//  console.log(user);
const salt = await bcrypt.genSalt(10);
user.UserPassword = await bcrypt.hash(req.body.NewUserPassword, salt);
await user.save();

res.status(200).send({
  "ReturnMsg": "Update Successful"
});

});
//Signs Out Users
/**
 *
 * @api {POST}  /api/users/SignOut Signs User Out
 * @apiName SignOut
 * @apiGroup User
 * @apiParam {String} token Authentication token
 * @apiSuccess {String}   ReturnMsg   Notifies the User that he signed out
 * @apiSuccessExample {json}  Success
 *     HTTP/1.1 200 OK
 *   {
 *     "ReturnMsg": "Signed out Successfully"
 * }
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
 */
router.post('/SignOut', auth, async (req, res) => {

  let check = await User.findOne({ UserId: req.user._id });
  if (!check) return res.status(400).send({"ReturnMsg":"User Doesn't Exist"});
  res.status(200).send({
  "ReturnMsg": "Signed out Successfully"
  });

});
//Get Info by UserID
/**
 *
 * @api {POST}  api/users/GetUserById Gets Information of  User by Id
 * @apiName GetUserById
 * @apiGroup User
 * @apiParam {String} token Authentication token
 * @apiSuccess {String}   UserName   UserName of Current User
 * @apiSuccess {String} UserId Id of Current User
 * @apiSuccess {String} UserEmail Email of Current User
 * @apiSuccess {Number} NoOfFollowings No. of Followings
 * @apiSuccess {Number} NoOfFollowers No. of Followers
 * @apiSuccess {String} Photo Profile Photo
 * @apiSuccess {Date} UserBirthDate User Birth Date
 * @apiSuccess {String} IsFollowing tells if Current User is Following this User
 * @apiSuccessExample {json}  Success
 *     HTTP/1.1 200 OK
 *   {
 *       "NoOfFollowings": 1,
 *       "NoOfFollowers": 0,
 *       "UserId":"5cc5df8c2e9c5800172864c9",
 *       "UserEmail": "samersosta@gmail.com",
 *       "UserName": "Ashraaaaaaaaaaaaaf",
 *       "Photo": "",
 *       "UserBirthDate": "2000-01-01T00:00:00.000Z",
 *       "IsFollowing": "True"
 * }
 * @apiErrorExample {json} NoTokenMatch-Response:
 *     HTTP/1.1 400
 *   {
 *    "ReturnMsg":"User Doesn't Exist"
 *   }
 *
 * @apiErrorExample {json} InvalidUserId-Response:
 *     HTTP/1.1 401
 *  {
 *     "ReturnMsg":"User Doesn't Exist"
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
router.all('/GetUserById', auth, async (req, res) => {////////////////////other profile
  let check = await User.findOne({ UserId: req.user._id });
  if (!check) return res.status(400).send({"ReturnMsg":"User Doesn't Exist"});
  const userdisplay = await User.findById(req.body.UserId).select('-UserPassword  -_id  -__v ');
  const user = await User.findById(req.user._id).select('-UserPassword  -_id  -__v ');
  if (!user.Confirmed) return res.status(401).send({  "ReturnMsg" : 'Your account has not been verified.' });
  var NoOfFollowings = userdisplay.FollowingUserId.length;
  var NoOfFollowers = userdisplay.FollowersUserId.length;
  var x; 
  let finding = await User.findOne({ UserId: req.user._id, FollowingUserId:req.body.UserId  });
  if (finding) x= "True"; 
  if(!finding) x= "False";
  var Result={
    "NoOfFollowings":NoOfFollowings,
    "NoOfFollowers":NoOfFollowers,
    "UserEmail":userdisplay.UserEmail,
    "UserName":userdisplay.UserName,
    "Photo":userdisplay.Photo,
    "UserBirthDate":userdisplay.UserBirthDate,
    "IsFollowing":x
  }
  res.status(200).send(Result);
});


//Update User Information (Name, Photo, Bithdate)


/**
 *
 * @api {POST}  /users/update Update User Information (UserName, Photo, Date).
 * @apiName SignIn
 * @apiGroup User
 *
 * @apiParam  {String} NewUserName New User Name
 * @apiParam  {String} NewUserPhoto New User Photo
 * @apiParam  {Date} NewUserBirthDate New User BirthDate
 * @apiSuccess {String}   ReturnMsg   Return Message Update is Successful
 * @apiSuccessExample {json}  Success
 *     HTTP/1.1 200 OK
 * {
 *        "ReturnMsg": "Update Successful"
 *   }
 * @apiErrorExample {json} InvalidName-Response:
 *     HTTP/1.1 400
 *  {
 *    "ReturnMsg":"Error Detail"
 *  }
 * @apiErrorExample {json} InvalidPhoto-Response:
 *     HTTP/1.1 400
 *  {
 *    "ReturnMsg":"Error Detail"
 *  }
 * @apiErrorExample {json} InvalidDate-Response:
 *     HTTP/1.1 400
 *  {
 *    "ReturnMsg":"Error Detail"
 *  }
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
 *
 */

router.all('/update', auth, async (req, res) => {
  let check = await User.findOne({ UserId: req.user._id });
  if (!check) return res.status(400).send({"ReturnMsg":"User Doesn't Exist"});
  const { error } = DateValidate(req.body);
  if (error) return res.status(400).send({"ReturnMsg":error.details[0].message});
  const user = await User.findById(req.user._id).select('-UserPassword');
  if(req.body.NewUserPhoto!=null) user.Photo = req.body.NewUserPhoto;
  if(req.body.NewUserName!=null) user.UserName = req.body.NewUserName;
  if(req.body.NewUserBirthDate!=null) user.UserBirthDate = req.body.NewUserBirthDate;
  user.save();
//  const token = user.generateAuthToken();

  res.status(200).send({
    "ReturnMsg": "Update Successful"
  });
});


//Verify From Email Link


/**
 *
 * @api {GET}  /api/users/verify Verifies User From Email
 * @apiName EmailVerify
 * @apiGroup User
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


router.get('/verify/:token', authAll, async (req, res) => {
  let check = await User.findOne({ UserEmail: req.user.UserEmail });
  if (!check) return res.status(400).send({"ReturnMsg":"User Doesn't Exist"});
  const user = await User.findOne({UserEmail: req.user.UserEmail }).select('-UserPassword');
  user.Confirmed = true;
  user.save();
  res.redirect('/verified');
 
});



//Sign Up Api sends verification mail

/**
 *
 * @api {POST}  /api/users/signup Signs User Up and Sends Verification Email
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


router.post('/signup', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send({"ReturnMsg":error.details[0].message});
  let user = await User.findOne({ UserEmail: req.body.UserEmail.toLowerCase() });
  if (user) return res.status(400).send({"ReturnMsg":"User already registered."});

user = new User ({
  "UserName":req.body.UserName,
  "UserEmail":req.body.UserEmail.toLowerCase(),
  "UserPassword":req.body.UserPassword
});
const salt = await bcrypt.genSalt(10);
user.UserId = user._id;
user.UserPassword = await bcrypt.hash(user.UserPassword, salt);
await user.save();
const token = jwt.sign({ UserEmail:req.body.UserEmail.toLowerCase() }, config.get('jwtPrivateKey'));;
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
text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '/api/users/verify/'+ token +'.\n' };
let info = await transporter.sendMail(mailOptions);
transporter.sendMail(mailOptions, (error, info) => {
          if (error) {

              return console.log(error);
          }
res.status(200).send({"ReturnMsg":"A verification email has been sent to " + user.UserEmail + "."});
//res.header('x-auth-token', token).send(_.pick(user, ['_id', 'UserName', 'UserEmail']));
});
});




//Update User Password


 /**
  *
  * @api {POST}  /api/users/UpdateUserPassword Update User Password.
  * @apiName UpdateUserPassword
  * @apiGroup User
  * @apiParam {String} token user token
  * @apiParam  {String} NewUserPassword New User Password
  * @apiParam  {String} OldUserPassword Old User Password
  * @apiSuccess {String}   ReturnMsg   Return Message Update is Successful
  * @apiSuccessExample {json}  Success
  *     HTTP/1.1 200 OK
  * {
  *        "ReturnMsg": "Update Successful"
  *   }
  * @apiErrorExample {json} InvalidNewPassword-Response:
  *     HTTP/1.1 400
  *  {
  *    "ReturnMsg":"Error Detail"
  *  }
  * @apiErrorExample {json} InvalidOldPassword-Response:
  *     HTTP/1.1 400
  *  {
  *    "ReturnMsg":"Error Detail"
  *  }
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
  *
  */




  router.post('/UpdateUserPassword', auth, async (req, res) => {
    let check = await User.findOne({ UserId: req.user._id });
    if (!check) return res.status(400).send({"ReturnMsg":"User Doesn't Exist"});
    const { error } = NewPassWordValidate(req.body);
    if (error) return res.status(400).send({"ReturnMsg":error.details[0].message});
    const user = await User.findById(req.user._id);
    const validPassword = await bcrypt.compare(req.body.OldUserPassword, user.UserPassword);
    if (!validPassword) return res.status(400).send({"ReturnMsg":"Invalid Old password."});
    const salt = await bcrypt.genSalt(10);
    user.UserPassword = await bcrypt.hash(req.body.NewUserPassword, salt);
    await user.save();
    res.status(200).send({
      "ReturnMsg": "Update Successful"
    });
  });






//Update User Information (Name, Photo, Bithdate)


/**
 *
 * @api {POST}  /api/users/UpdateUserInfo Update User Information (UserName, Photo, Date).
 * @apiName SignIn
 * @apiGroup User
 * @apiParam {String} token user token
 * @apiParam  {String} NewUserName New User Name
 * @apiParam  {String} NewUserPhoto New User Photo
 * @apiParam  {Date} NewUserBirthDate New User BirthDate
 * @apiSuccess {String}   ReturnMsg   Return Message Update is Successful
 * @apiSuccessExample {json}  Success
 *     HTTP/1.1 200 OK
 * {
 *        "ReturnMsg": "Update Successful"
 *   }
 * @apiErrorExample {json} InvalidName-Response:
 *     HTTP/1.1 400
 *  {
 *    "ReturnMsg":"Error Detail"
 *  }
 * @apiErrorExample {json} InvalidPhoto-Response:
 *     HTTP/1.1 400
 *  {
 *    "ReturnMsg":"Error Detail"
 *  }
 * @apiErrorExample {json} InvalidDate-Response:
 *     HTTP/1.1 400
 *  {
 *    "ReturnMsg":"Error Detail"
 *  }
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
 *
 */

router.post('/UpdateUserInfo', auth, async (req, res) => {
  let check = await User.findOne({ UserId: req.user._id });
  if (!check) return res.status(400).send({"ReturnMsg":"User Doesn't Exist"});
  const { error } = DateValidate(req.body);
  if (error) return res.status(400).send({"ReturnMsg":error.details[0].message});
  const user = await User.findById(req.user._id).select('-UserPassword');
  if(req.body.NewUserPhoto!=null)
  {
    var piccheck=isImageUrl(req.body.NewUserPhoto);
    if(!piccheck) return res.status(400).send({"ReturnMsg":"Invalid Image"});
    user.Photo = req.body.NewUserPhoto;
  }
  if(req.body.NewUserName!=null) user.UserName = req.body.NewUserName;
  if(req.body.NewUserBirthDate!=null) user.UserBirthDate = req.body.NewUserBirthDate;
  await user.save();
//  const token = user.generateAuthToken();

  res.status(200).send({
    "ReturnMsg": "Update Successful"
  });
});





/**
 * @api {Post} /api/users/GetBookReadStatus  Gets information about a book's read Status
 * @apiName GetUserReadStatus
 * @apiGroup Shelves
 * @apiParam {String} token
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



 router.all('/GetBookReadStatus', auth, async (req, res) => {
   let check = await User.findOne({ UserId: req.user._id });
   if (!check) return res.status(400).send({"ReturnMsg":"User Doesn't Exist"});
   let Read =  await User.findOne({ UserId: req.user._id, Read:req.body.BookId });
   let WantToRead = await User.findOne({ UserId: req.user._id, WantToRead:req.body.BookId });
   let Reading =  await User.findOne({ UserId: req.user._id, Reading:req.body.BookId });
   if(!Read && !WantToRead && !Reading) return res.status(200).send({"ReturnMsg": "This BookId is Not in any Shelf, Please Add it to Shelf First"});
  if (Read) res.status(200).send({"ReturnMsg": "Read"});
  else if (WantToRead) {res.status(200).send({"ReturnMsg": "Want To Read"});}
  else if (Reading) {res.status(200).send({"ReturnMsg": "Currently Reading"});}
  });



 //Get User's Shelves


 /**
  * @api {GET} /api/users/GetUserShelves  Gets All User's Shelves
  * @apiName GetUserShelves
  * @apiGroup Shelves
  * @apiParam {String} token
  * @apiSuccess {String[]} Read        Gives the User the Book Ids of His Read.
  * @apiSuccess {Number} NoOfRead        Gives the User the Number of Book Ids of His Read.
  * @apiSuccess {String[]} WantToRead       Gives the User the Book Ids of His Want to Read.
  * @apiSuccess {Number} NoOfWantToRead        Gives the User the Number of Book Ids of His Want to Read.
  * @apiSuccess {String[]} Reading       Gives the User the Book Ids of His Currently Reading.
  * @apiSuccess {Number} NoOfReading        Gives the User the Number of Book Ids of His Currently Reading.
  * @apiSuccessExample {json} Success
  *     HTTP/1.1 200 OK
  *     {
  *       "Read": [
  *                          "Book1",
  *                          "Book2",
  *                          "Book3"
  *                     ],
  *       "NoOfRead": 3,
  *       "Reading": [
  *                          "Book4",
  *                          "Book5",
  *                          "Book6"
  *                     ],
  *       "NoOfReading": 3,
  *       "WantToRead": [
  *                          "Book7",
  *                          "Book8",
  *                          "Book9"
  *                     ],
  *       "NoOfWantToRead": 3
  *     }
  *
  * @apiErrorExample {json} NoShelvesExist-Response:
  *     HTTP/1.1 400
  * {
  *   "ReturnMsg": "User has No Shelves"
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
  */


  router.all('/GetUserShelves', auth, async (req, res) => {
    let check = await User.findOne({ UserId: req.user._id });
    if (!check) return res.status(400).send({"ReturnMsg":"User Doesn't Exist"});
    const user = await User.findById(req.user._id).select('-_id Read WantToRead Reading');
    var NoOfRead = user.Read.length;
    var NoOfReading = user.Reading.length;
    var NoOfWantToRead = user.WantToRead.length;
    const Result =  {
                      "Read":user.Read,
                      "NoOfRead":NoOfRead,
                      "Reading":user.Reading,
                      "NoOfReading":NoOfReading,
                      "WantToRead":user.WantToRead,
                      "NoOfWantToRead":NoOfWantToRead
                    }
    res.status(200).send(Result);
  });





  //Number of Read Books


  /**
   * @api {GET} /api/users/ShelvesCount  Number of Read Books
   * @apiName ShelvesCount
   * @apiGroup Shelves
   *
   * @apiParam {String} token
   *
   * @apiSuccess {Number} NoOfRead        Gives the User the Number of Book Ids of His Read.
   * @apiSuccessExample {json} Success
   *     HTTP/1.1 200 OK
   *     {
   *       "NoOfRead": 3
   *       "NoOfReading": 3,
   *       "NoOfWantToRead": 3
   *     }
   *
   * @apiErrorExample {json} NoShelvesExist-Response:
   *     HTTP/1.1 400
   * {
   *   "ReturnMsg": "User has No Shelves"
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
   */


   router.all('/ShelvesCount', auth, async (req, res) => {
     let check = await User.findOne({ UserId: req.user._id });
     if (!check) return res.status(400).send({"ReturnMsg":"User Doesn't Exist"});
     const user = await User.findOne({ UserId: req.body.UserId}).select('-_id Read WantToRead Reading');
     if (!user) return res.status(400).send({  "ReturnMsg" : "User Doesn't Exist" });
     var NoOfRead = user.Read.length;
     var NoOfReading = user.Reading.length;
     var NoOfWantToRead = user.WantToRead.length;
     const Result =  {
                       "NoOfRead":NoOfRead,
                       "NoOfReading":NoOfReading,
                       "NoOfWantToRead":NoOfWantToRead
                     }
     res.status(200).send(Result);
   });





// Get User Shelves Details


/**
 * @api {GET} /api/users/GetUserShelvesDetails  Gets All User's Shelves Details
 * @apiName GetUserShelvesDetails
 * @apiGroup Shelves
 *
 * @apiParam {String} token
 *
 * @apiSuccess {List} ReadData        Gives the User the Book Data of His Read.
 * @apiSuccess {List} WantToReadData       Gives the User the Book Data of His Want to Read.
 * @apiSuccess {List} Reading       Gives the User the Book Data of His Currently Reading.
 * @apiSuccessExample {json} Success
 *     HTTP/1.1 200 OK
 *     {
 *     "ReadData": [
 *        {
 *            "BookId": "5c9114526f1439874b7cca1a",
 *            "Title": "consequat",
 *            "AuthorId": "5c911452938ffea87b4672d7",
 *            "BookRating": {
 *                "$numberDecimal": "2.0"
 *            },
 *            "Cover": "http://placehold.it/32x32",
 *            "Pages": 340,
 *            "Published": "2007-01-29T22:00:00.000Z"
 *        },
 *        {
 *            "BookId": "5c911452bbfd1717b8a7a169",
 *            "Title": "sit",
 *            "AuthorId": "5c911452a48b42bb84bc785c",
 *            "BookRating": {
 *                "$numberDecimal": "5.0"
 *            },
 *            "Cover": "http://placehold.it/32x32",
 *            "Pages": 226,
 *            "Published": "2001-05-03T22:00:00.000Z"
 *        },
 *        {
 *            "BookId": "5c9114a012d11bb226399497",
 *            "Title": "do",
 *            "AuthorId": "5c911452a48b42bb84bc785c",
 *            "BookRating": {
 *                "$numberDecimal": "1.0"
 *            },
 *            "Cover": "http://placehold.it/32x32",
 *            "Pages": 299,
 *            "Published": "2004-01-10T22:00:00.000Z"
 *        },
 *        {
 *            "BookId": "5c9114a01c049771a04cbce4",
 *            "Title": "culpa",
 *            "AuthorId": "5c911452a48b42bb84bc785c",
 *            "BookRating": {
 *                "$numberDecimal": "3.0"
 *            },
 *            "Cover": "http://placehold.it/32x32",
 *            "Pages": 148,
 *            "Published": "2018-12-16T22:00:00.000Z"
 *        }
 *      ],
 *     "ReadingData": [],
 *     "WantToReadData": []
 *     }
 *
 * @apiErrorExample {json} NoShelvesExist-Response:
 *     HTTP/1.1 400
 * {
 *   "ReturnMsg": "User has No Shelves"
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
 */



  router.all('/GetUserShelvesDetails', auth, async (req, res) => {
    let check = await User.findOne({ UserId: req.user._id });
    if (!check) return res.status(400).send({"ReturnMsg":"User Doesn't Exist"});

    //const user = await User.findById(req.user._id).select('-UserBirthDate -UserPassword  -_id  -__v -UserId -UserEmail -Photo -Confirmed -UserName -FollowingAuthorId -FollowingUserId -FollowersUserId -OwnedBookId');
    const user = await User.findById(req.user._id).select('-_id Read WantToRead Reading');
    var Result = {
                    "ReadData":[],
                    "ReadingData":[],
                    "WantToReadData":[]

                 }
    var NoOfRead = user.Read.length;
    var NoOfReading = user.Reading.length;
    var NoOfWantToRead = user.WantToRead.length;
    for (var i=0; i<NoOfRead;i++)
    {
       const book = await mongoose.connection.collection("books").findOne({BookId:user.Read[i]});
       const bookinfo =
       {
          "BookId":book.BookId,
          "Title":book.Title,
          "AuthorId": book.AuthorId,
          "BookRating":  String(book.BookRating),
          "Cover":book.Cover,
          "Pages": book.Pages,
          "BookName": book.BookName,
          "AuthorName": book.AuthorName,
          "RateCount":book.RateCount,
          "Published": book.Published,
          "Publisher": book.Publisher,
          "ReviewCount":book.ReviewCount
       };
       Result.ReadData.push(bookinfo);
    }
    for (var i=0;  i<NoOfReading;i++)
    {
       const book = await mongoose.connection.collection("books").findOne({BookId:user.Reading[i]});
       const bookinfo =
       {
          "BookId":book.BookId,
          "Title":book.Title,
          "AuthorId": book.AuthorId,
          "BookRating":  String(book.BookRating),
          "Cover":book.Cover,
          "Pages": book.Pages,
          "BookName": book.BookName,
          "AuthorName": book.AuthorName,
          "RateCount":book.RateCount,
          "Published": book.Published,
          "Publisher": book.Publisher,
          "ReviewCount":book.ReviewCount
       };
       Result.ReadingData.push(bookinfo);
    }
    for (var i=0;  i<NoOfWantToRead;i++)
    {
       const book = await mongoose.connection.collection("books").findOne({BookId:user.WantToRead[i]});
       const bookinfo =
       {
          "BookId":book.BookId,
          "Title":book.Title,
          "AuthorId": book.AuthorId,
          "BookRating":  String(book.BookRating),
          "Cover":book.Cover,
          "Pages": book.Pages,
          "BookName": book.BookName,
          "AuthorName": book.AuthorName,
          "RateCount":book.RateCount,
          "Published": book.Published,
          "Publisher": book.Publisher,
          "ReviewCount":book.ReviewCount
       };
       Result.WantToReadData.push(bookinfo);
    }
    res.status(200).send(Result);
  });






  // Get User Read shelf Details


  // Get User Read shelf Details
  /**
   * @api {POST} /api/users/GetUserReadDetails   Get User Read shelf Details
   * @apiName GetUserReadDetails
   * @apiGroup Shelves
   *
   * @apiParam {String} token Authentication token
   * @apiParam {String} UserId User to get his Read Shelf Data
   * @apiSuccess {List} ReadData        Gives the User the Book Data of His Read.
   * @apiSuccessExample {json} Success
   *     HTTP/1.1 200 OK
   *     {
   *     "ReadData": [
   *        {
   *            "BookId": "5c9114526f1439874b7cca1a",
   *            "Title": "consequat",
   *            "AuthorId": "5c911452938ffea87b4672d7",
   *            "BookRating": {
   *                "$numberDecimal": "2.0"
   *            },
   *            "Cover": "http://placehold.it/32x32",
   *            "Pages": 340,
   *            "Published": "2007-01-29T22:00:00.000Z"
   *        },
   *        {
   *            "BookId": "5c911452bbfd1717b8a7a169",
   *            "Title": "sit",
   *            "AuthorId": "5c911452a48b42bb84bc785c",
   *            "BookRating": {
   *                "$numberDecimal": "5.0"
   *            },
   *            "Cover": "http://placehold.it/32x32",
   *            "Pages": 226,
   *            "Published": "2001-05-03T22:00:00.000Z"
   *        },
   *        {
   *            "BookId": "5c9114a012d11bb226399497",
   *            "Title": "do",
   *            "AuthorId": "5c911452a48b42bb84bc785c",
   *            "BookRating": {
   *                "$numberDecimal": "1.0"
   *            },
   *            "Cover": "http://placehold.it/32x32",
   *            "Pages": 299,
   *            "Published": "2004-01-10T22:00:00.000Z"
   *        },
   *        {
   *            "BookId": "5c9114a01c049771a04cbce4",
   *            "Title": "culpa",
   *            "AuthorId": "5c911452a48b42bb84bc785c",
   *            "BookRating": {
   *                "$numberDecimal": "3.0"
   *            },
   *            "Cover": "http://placehold.it/32x32",
   *            "Pages": 148,
   *            "Published": "2018-12-16T22:00:00.000Z"
   *        }
   *      ]
   *     }
   *
   * @apiErrorExample {json} NoUser-Response:
   *     HTTP/1.1 400
   * {
   *   "ReturnMsg": "User Doesn't Exist"
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
   */


    router.all('/GetUserReadDetails', auth, async (req, res) => {
     let check = await User.findOne({ UserId: req.user._id });
      if (!check) return res.status(400).send({"ReturnMsg":"User Doesn't Exist"});
      const user = await User.findOne({UserId:req.body.UserId}).select('-_id Read WantToRead Reading');
      if (!user) return res.status(400).send({  "ReturnMsg" : "User Doesn't Exist" });
    var Result = {
                      "ReadData":[]
                   }
      var NoOfRead = user.Read.length;
      for (var i=0; i<NoOfRead;i++)
      {
         const book = await mongoose.connection.collection("books").findOne({BookId:user.Read[i]});
         const bookinfo =
         {
            "BookId":book.BookId,
            "Title":book.Title,
            "AuthorId": book.AuthorId,
            "BookRating":  String(book.BookRating),
            "Cover":book.Cover,
            "Pages": book.Pages,
            "BookName": book.BookName,
            "AuthorName": book.AuthorName,
            "RateCount":book.RateCount,
            "Published": book.Published,
            "Publisher": book.Publisher,
            "ReviewCount":book.ReviewCount
         };
         Result.ReadData.push(bookinfo);
      }
      res.status(200).send(Result);
    });





// Get User Reading shelf Details
    /**
     * @api {GET} /api/users/GetUserReadingDetails  Get User Reading shelf Details
     * @apiName GetUserReadingDetails
     * @apiGroup Shelves
     *
     * @apiParam {String} token Authentication token
     * @apiParam {String} UserId User to get his Shelf Details
     * @apiSuccess {List} ReadingData        Gives the User the Book Data of His Reading.
     * @apiSuccessExample {json} Success
     *     HTTP/1.1 200 OK
     *     {
     *     "ReadingData": [
     *        {
     *            "BookId": "5c9114526f1439874b7cca1a",
     *            "Title": "consequat",
     *            "AuthorId": "5c911452938ffea87b4672d7",
     *            "BookRating": {
     *                "$numberDecimal": "2.0"
     *            },
     *            "Cover": "http://placehold.it/32x32",
     *            "Pages": 340,
     *            "Published": "2007-01-29T22:00:00.000Z"
     *        },
     *        {
     *            "BookId": "5c911452bbfd1717b8a7a169",
     *            "Title": "sit",
     *            "AuthorId": "5c911452a48b42bb84bc785c",
     *            "BookRating": {
     *                "$numberDecimal": "5.0"
     *            },
     *            "Cover": "http://placehold.it/32x32",
     *            "Pages": 226,
     *            "Published": "2001-05-03T22:00:00.000Z"
     *        },
     *        {
     *            "BookId": "5c9114a012d11bb226399497",
     *            "Title": "do",
     *            "AuthorId": "5c911452a48b42bb84bc785c",
     *            "BookRating": {
     *                "$numberDecimal": "1.0"
     *            },
     *            "Cover": "http://placehold.it/32x32",
     *            "Pages": 299,
     *            "Published": "2004-01-10T22:00:00.000Z"
     *        },
     *        {
     *            "BookId": "5c9114a01c049771a04cbce4",
     *            "Title": "culpa",
     *            "AuthorId": "5c911452a48b42bb84bc785c",
     *            "BookRating": {
     *                "$numberDecimal": "3.0"
     *            },
     *            "Cover": "http://placehold.it/32x32",
     *            "Pages": 148,
     *            "Published": "2018-12-16T22:00:00.000Z"
     *        }
     *      ]
     *     }
     *
     * @apiErrorExample {json} NoUser-Response:
     *     HTTP/1.1 400
     * {
     *   "ReturnMsg": "User Doesn't Exist"
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
     */



      router.all('/GetUserReadingDetails', auth, async (req, res) => {
       let check = await User.findOne({ UserId: req.user._id });
        if (!check) return res.status(400).send({"ReturnMsg":"User Doesn't Exist"});
        const user = await User.findOne({UserId:req.body.UserId}).select('-_id Read WantToRead Reading');
        if (!user) return res.status(400).send({  "ReturnMsg" : "User Doesn't Exist" });
        var Result = {
                        "ReadingData":[]
                     }
        var NoOfReading = user.Reading.length;
        for (var i=0; i<NoOfReading;i++)
        {
           const book = await mongoose.connection.collection("books").findOne({BookId:user.Reading[i]});
           const bookinfo =
           {
              "BookId":book.BookId,
              "Title":book.Title,
              "AuthorId": book.AuthorId,
              "BookRating":  String(book.BookRating),
              "Cover":book.Cover,
              "Pages": book.Pages,
              "BookName": book.BookName,
              "AuthorName": book.AuthorName,
              "RateCount":book.RateCount,
              "Published": book.Published,
              "Publisher": book.Publisher,
              "ReviewCount":book.ReviewCount
           };
           Result.ReadingData.push(bookinfo);
        }
        res.status(200).send(Result);
      });






      // Get User WantToRead shelf Details
      /**
       * @api {GET} /api/users/GetUserWantToReadDetails   Get User WantToRead shelf Details
       * @apiName GetUserWantToReadDetails
       * @apiGroup Shelves
       *
       * @apiParam {String} token Authentication token
       * @apiParam {String} UserId User to get his Shelf Details
       * @apiSuccess {List} ReadingData        Gives the User the Book Data of His WantToRead.
       * @apiSuccessExample {json} Success
       *     HTTP/1.1 200 OK
       *     {
       *     "WantToReadData": [
       *        {
       *            "BookId": "5c9114526f1439874b7cca1a",
       *            "Title": "consequat",
       *            "AuthorId": "5c911452938ffea87b4672d7",
       *            "BookRating": {
       *                "$numberDecimal": "2.0"
       *            },
       *            "Cover": "http://placehold.it/32x32",
       *            "Pages": 340,
       *            "Published": "2007-01-29T22:00:00.000Z"
       *        },
       *        {
       *            "BookId": "5c911452bbfd1717b8a7a169",
       *            "Title": "sit",
       *            "AuthorId": "5c911452a48b42bb84bc785c",
       *            "BookRating": {
       *                "$numberDecimal": "5.0"
       *            },
       *            "Cover": "http://placehold.it/32x32",
       *            "Pages": 226,
       *            "Published": "2001-05-03T22:00:00.000Z"
       *        },
       *        {
       *            "BookId": "5c9114a012d11bb226399497",
       *            "Title": "do",
       *            "AuthorId": "5c911452a48b42bb84bc785c",
       *            "BookRating": {
       *                "$numberDecimal": "1.0"
       *            },
       *            "Cover": "http://placehold.it/32x32",
       *            "Pages": 299,
       *            "Published": "2004-01-10T22:00:00.000Z"
       *        },
       *        {
       *            "BookId": "5c9114a01c049771a04cbce4",
       *            "Title": "culpa",
       *            "AuthorId": "5c911452a48b42bb84bc785c",
       *            "BookRating": {
       *                "$numberDecimal": "3.0"
       *            },
       *            "Cover": "http://placehold.it/32x32",
       *            "Pages": 148,
       *            "Published": "2018-12-16T22:00:00.000Z"
       *        }
       *      ]
       *     }
       *
       * @apiErrorExample {json} NoShelvesExist-Response:
       *     HTTP/1.1 400
       * {
       *   "ReturnMsg": "User has No Shelves"
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
       */
        router.all('/GetUserWantToReadDetails', auth, async (req, res) => {
           let check = await User.findOne({ UserId: req.user._id });
          if (!check) return res.status(400).send({"ReturnMsg":"User Doesn't Exist"});
          const user = await User.findOne({UserId:req.body.UserId}).select('-_id Read WantToRead Reading');
          if (!user) return res.status(400).send({  "ReturnMsg" : "User Doesn't Exist" });
           var Result = {
                          "WantToReadData":[]
                       }
          var NoOfWantToRead = user.WantToRead.length;
          for (var i=0; i<NoOfWantToRead;i++)
          {
             const book = await mongoose.connection.collection("books").findOne({BookId:user.WantToRead[i]});
             const bookinfo =
             {
                "BookId":book.BookId,
                "Title":book.Title,
                "AuthorId": book.AuthorId,
                "BookRating": String(book.BookRating),
                "Cover":book.Cover,
                "Pages": book.Pages,
                "BookName": book.BookName,
                "AuthorName": book.AuthorName,
                "RateCount":book.RateCount,
                "Published": book.Published,
                "Publisher": book.Publisher,
                "ReviewCount":book.ReviewCount
             };
             Result.WantToReadData.push(bookinfo);
          }
          res.status(200).send(Result);
        });






  //Add Book to Shelf



 //Add Book to Shelf
  /**
   * @api {POST} api/users/AddToShelf  Add a Book to a Shelf
   * @apiName AddToShelf
   * @apiGroup Shelves
   *
   * @apiParam {String} token Authentication token
   * @apiParam {String} ShelfType Shelf Type to add book to.
   * @apiParam {String} BookId Book id to add to shelf.
   *
   * @apiSuccess {String} ReturnMsg         Notifies User that the Book was added successfully.
   * @apiSuccessExample {json} Success
   *     HTTP/1.1 200 OK
   *     {
   *       "ReturnMsg": "Book was added successfully."
   *     }
   *
   *
   * @apiErrorExample {json} NoShelf-Response:
   *     HTTP/1.1 400
   *   {
   *      "ReturnMsg":"Invalid Shelf"
   *   }
   * @apiErrorExample {json} NoBook-Response:
   *     HTTP/1.1 400
   *   {
   *      "ReturnMsg":"Book Doesn't Exist."
   *   }
   *
   * @apiErrorExample {json} BookExist-Response:
   *     HTTP/1.1 400
   * {
   *   "ReturnMsg": "Book Already in Shelf."
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
   */


   router.post('/AddToShelf', auth, async (req, res) => {
     let check = await User.findOne({ UserId: req.user._id });
     if (!check) return res.status(400).send({"ReturnMsg":"User Doesn't Exist"});
     if(req.body.ShelfType != "Read" && req.body.ShelfType != "Reading" && req.body.ShelfType != "WantToRead" )
     return res.status(400).send({"ReturnMsg":"Invalid Shelf"});
     const book = await mongoose.connection.collection("books").findOne({ BookId: req.body.BookId });
     if(!book) return res.status(400).send({"ReturnMsg":"Book Doesn't Exist"});
     const read = await User.findOne({UserId: req.user._id, Read:  req.body.BookId});
     const reading = await User.findOne({UserId: req.user._id, Reading:  req.body.BookId});
     const wanttoread = await User.findOne({UserId: req.user._id, WantToRead:  req.body.BookId});
     if(read || reading || wanttoread ) return res.status(400).send({"ReturnMsg":"Book Already in Shelf."});
     const user = await User.findById(req.user._id).select('-UserPassword');
     if(req.body.ShelfType == "Read") user.Read.push(req.body.BookId);
     if(req.body.ShelfType == "Reading") user.Reading.push(req.body.BookId);
     if(req.body.ShelfType == "WantToRead") user.WantToRead.push(req.body.BookId);
     await user.save();
     res.status(200).send({
       "ReturnMsg": "Book was added successfully."
     });
   });



 //Remove Book From Shelf
/**
  * @api {POST} /api/users/RemoveFromShelf  Removes a Books From User Shelves
  * @apiName RemoveFromShelf
  * @apiGroup Shelves
  *
  * @apiParam {String} token Authentication token
  * @apiParam {String} BookId  The Book Id To Remove.
  * @apiSuccess {String} ReturnMsg        Notifies is Successfully Removed.
  * @apiSuccessExample {json} Success
  *     HTTP/1.1 200 OK
  *     {
  *       "ReturnMsg":"Book Removed"
  *     }
  * @apiErrorExample {json} WrongBookId-Response:
  *     HTTP/1.1 400
  * {
  *   "ReturnMsg": "Book Does't Exist"
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
  */

  router.post('/RemoveFromShelf', auth, async (req, res) => {
    let check = await User.findOne({ UserId: req.user._id });
    if (!check) return res.status(400).send({"ReturnMsg":"User Doesn't Exist"});
    const book = await mongoose.connection.collection("books").findOne({ BookId: req.body.BookId });
    if(!book) return res.status(400).send({"ReturnMsg":"Book Doesn't Exist"});
    const read = await User.findOne({UserId: req.user._id, Read:  req.body.BookId});
    const reading = await User.findOne({UserId: req.user._id, Reading:  req.body.BookId});
    const wanttoread = await User.findOne({UserId: req.user._id, WantToRead:  req.body.BookId});
    if(!read && !wanttoread && !reading) return res.status(400).send({"ReturnMsg":"Book Doesn't Exist in Shelf."});
    const user = await User.findById(req.user._id).select('-UserPassword');
    if(read) user.Read.splice( user.Read.indexOf(req.body.BookId), 1 );
    if(reading) user.Reading.splice( user.Reading.indexOf(req.body.BookId), 1 );
    if(wanttoread) user.WantToRead.splice( user.WantToRead.indexOf(req.body.BookId), 1 );
    await user.save();
    res.status(200).send({
      "ReturnMsg": "Book Removed"
    });
  });







  //Update Book Status from Want to Read to Reading
  /**
   * @api {POST} /api/users/UpdateWantToReading Updates Book Status From Want to Read to Reading
   * @apiName UpdateWantToReading
   * @apiGroup Shelves
   *
   * @apiParam {String} token Authentication token
   * @apiParam {String} BookId  The Book Id To Update.
   * @apiSuccess {String} ReturnMsg        Notifies is Successfully updated.
   * @apiSuccessExample {json} Success
   *     HTTP/1.1 200 OK
   *     {
   *       "ReturnMsg":"Book Status Updated"
   *     }
   * @apiErrorExample {json} WrongBookId-Response:
   *     HTTP/1.1 400
   * {
   *   "ReturnMsg": "Book Does't Exist"
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
   */


   router.post('/UpdateWantToReading', auth, async (req, res) => {
     let check = await User.findOne({ UserId: req.user._id });
     if (!check) return res.status(400).send({"ReturnMsg":"User Doesn't Exist"});
     const book = await mongoose.connection.collection("books").findOne({ BookId: req.body.BookId });
     if(!book) return res.status(400).send({"ReturnMsg":"Book Doesn't Exist"});
     const wanttoread = await User.findOne({UserId: req.user._id, WantToRead:  req.body.BookId});
     if(!wanttoread) return res.status(400).send({"ReturnMsg":"Book Doesn't Exist in WantToRead."});
     const user = await User.findById(req.user._id).select('-UserPassword');
     user.WantToRead.splice( user.WantToRead.indexOf(req.body.BookId), 1 );
     user.Reading.push(req.body.BookId);
     await user.save();
     res.status(200).send({
       "ReturnMsg": "Book Status Updated"
     });
   });





  //Update Book Status From Reading to Read
   /**
    * @api {POST} /api/users/UpdateReadingToRead  Updates Book Status From Reading to Read
    * @apiName UpdateReadingToRead
    * @apiGroup Shelves
    *
    * @apiParam {String} token Authentication token
    * @apiParam {String} BookId  The Book Id To Update.
    * @apiSuccess {String} ReturnMsg        Notifies is Successfully updated.
    * @apiSuccessExample {json} Success
    *     HTTP/1.1 200 OK
    *     {
    *       "ReturnMsg":"Book Status Updated"
    *     }
    * @apiErrorExample {json} WrongBookId-Response:
    *     HTTP/1.1 400
    * {
    *   "ReturnMsg": "Book Does't Exist"
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
    */




    router.post('/UpdateReadingToRead', auth, async (req, res) => {
      let check = await User.findOne({ UserId: req.user._id });
      if (!check) return res.status(400).send({"ReturnMsg":"User Doesn't Exist"});
      const book = await mongoose.connection.collection("books").findOne({ BookId: req.body.BookId });
      if(!book) return res.status(400).send({"ReturnMsg":"Book Doesn't Exist"});
      const reading = await User.findOne({UserId: req.user._id, Reading:  req.body.BookId});
      if(!reading) return res.status(400).send({"ReturnMsg":"Book Doesn't Exist in Reading."});
      const user = await User.findById(req.user._id).select('-UserPassword');
      user.Reading.splice( user.Reading.indexOf(req.body.BookId), 1 );
      user.Read.push(req.body.BookId);
      await user.save();
      res.status(200).send({
        "ReturnMsg": "Book Status Updated"
      });
    });







/**
 *
 * @api {POST}  /api/users/follow Follow a user
 * @apiName Follow user
 * @apiGroup User
 * @apiError {404} id-not-found The<code>userId_tobefollowed</code> was not found.
 * @apiSuccess {200} Follow Successful or not
 * @apiParam  {String} myuserId GoodReads User ID
 * @apiParam  {String} userId_tobefollowed GoodReads User ID
 * @apiparam {String} token Authentication token
 
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
router.post('/follow', auth,async (req, res) => { //sends post request to /Follow End point through the router
  /* console.log(req.body.userId_tobefollowed);
  console.log(req.userId_tobefollowed);
  console.log(req.params.userId_tobefollowed);
  console.log(req.query.userId_tobefollowed);  //ONLY WORKINGGGGGGGGGGGG
  console.log("my"+req.query.myuserid);*/
 // console.log("my"+req.query.myuserid);
  //console.log(req.query.userId_tobefollowed);
  await mongoose.connection.collection("users").findOne({  UserId :  req.body.userId_tobefollowed},
    function (err,doc) { // error handling and checking for returned mongo doc after query

      if (!doc || err) //matched count checks for number of affected documents by query
      { res.status(404).json({ // sends a json with 404 code
       success: false , // Follow Failed
        "Message":"userId_tobefollowed not  found !"});
      }
      else
      {
         mongoose.connection.collection("users").findOne({  UserId :  req.body.myuserid},
          function (err,doc) { // error handling and checking for returned mongo doc after query

            if (!doc  || err) //matched count checks for number of affected documents by query
            { res.status(404).json({ // sends a json with 404 code
             success: false , // Follow Failed
              "Message":"myuserid not  found !"});
            }
            else
            {
              mongoose.connection.collection("users").findOne({$and: [{UserId:req.body.myuserid},{FollowingUserId:req.body.userId_tobefollowed}]},
            function (err,doc) { // error handling and checking for returned mongo doc after query

              if(!doc || err)
              {
                mongoose.connection.collection("users").updateOne( // accesses basic mongodb driver to update one document of Users Collection
                  {
                      UserId :  req.body.userId_tobefollowed //access document of user i want to follow
                  },
                  {$push: { // Push to end of array of the user's followers
                    FollowersUserId:req.body.myuserid
                  }}
                  ,function (err,doc) { // error handling and checking for returned mongo doc after query
            
                     if (!doc  || err) //matched count checks for number of affected documents by query
                     { res.status(404).json({ // sends a json with 404 code
                      success: false , // Follow Failed
                       "Message":"error !"});
                     }
                   else
                   {
                   res.status(200).json({ //sends a json with 200 code
                     success: true ,//Follow Done
                      "Message":"Sucessfully done"});
                   }
                });
                mongoose.connection.collection("users").updateOne( // accesses basic mongodb driver to update one document of Users Collection
                    {
                        UserId :req.body.myuserid//access document of currently logged In user
                    },
                    {$push: { // Push to end of array of the users I follow
                      FollowingUserId: req.body.userId_tobefollowed
                    }});
              }
              else
              {
                if (doc || err) //matched count checks for number of affected documents by query
                { res.status(404).json({ // sends a json with 404 code
                 success: false , // Follow Failed
                  "Message":"user ALREADY FOLLOWED!"});
                }
              }
              
          
            
              
            
            }
            );
             
            }
          }
          );
      }
    }
    );
  });
  //UNFollow User
 /**
 *
 * @api {POST}  /api/users/unfollow Unfollow a user
 * @apiName Unfollow user
 * @apiGroup User
 * @apiError {404} id-not-found The<code>userId_tobefollowed</code> was not found.
 * @apiSuccess {200} UNFollow Successful
 * @apiParam  {String} myuserId GoodReads User ID
 * @apiParam  {String} userId_tobefollowed GoodReads User ID
* @apiparam {String} token Authentication token
 
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
  router.post('/unfollow', auth,async (req, res) => { //sends post request to /unFollow End point through the router
    /* console.log(req.body.userId_tobefollowed);
    console.log(req.userId_tobefollowed);
    console.log(req.params.userId_tobefollowed);
    console.log(req.query.userId_tobefollowed);  //ONLY WORKINGGGGGGGGGGGG
    console.log("my"+req.query.myuserid);*/

      mongoose.connection.collection("users").updateOne( // accesses basic mongodb driver to update one document of Users Collection

        {
            UserId :  req.body.userId_tobefollowed //access document of user i want to unfollow
        },
        {$pull: { // pull from end of array of the users I follow
          FollowersUserId:req.body.myuserid
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
      mongoose.connection.collection("users").updateOne(
          {
              UserId :req.body.myuserid//access document of currently logged In user
          },
          {$pull: { // pull from end of array of the users I follow
            FollowingUserId: req.body.userId_tobefollowed
          }});


          });

   //Get User Notifications

  /**
 * @api{Get} /api/users/Notifications Get User Status
 * @apiVersion 0.0.0
 * @apiName Get User's Notification
 * @apiGroup User
 * @apiparam {String} token Authentication token
 *
 * @apiSuccess {string} NotificationType  Wheather  it is CommentLike or ReviewLike or Comment
 * @apiSuccess {string} NotificationId status id
  *  @apiSuccess {boolean} Seen
 *
 *@apiSuccess {string} UserId User id the user who must be notified
 *@apiSuccess {string} UserPhoto photo of the user who must be notifed in case of Commentlike/reviewlike He will be the maker of the review or the comment in case of comment he would be the maker of the reviwe and the Maker is the maker of the commnet
 *@apiSuccess {string} UserName name of the same pervious User
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
 *
 *
 * @apiSuccess {string} ReviewId  review Id  alawys exisit weather the type is comment or review
 * @apiSuccess {string} ReviewBody Review Body in case of comment on review or reviews a book
 * @apiSuccess {date}  ReviewDate the date of the review
 * @apiSuccess {Number}  ReviewLikesCount numbr of the people who liked the the review
 *
 * @apiSuccess {string} MakerId the id of the user who made the status( Commented or rated or reviewd)
 * @apiSuccess {string} MakerPhoto the URL of the Photo of the User who did the thing ( Commented or rated or reviewd)
 * @apiSuccess {string}  MakerName the Name of the User Who made the status ( Commented or rated or reviewd)
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


router.all("/Notifications" ,auth ,async(req,res)=>
{
//      if(req.user._id==null)
//      {
//         return  res.status(400).send("Bad request no UserID  Id is there");
//     }

//       if (req.user._id.length == 0)
//      {
//        return  res.status(400).send("Bad request no Satatus Id is there");
//      }


  Notification.find( {'UserId':req.user._id},async (err,doc)=>

   {
    if(!doc)
    {
   return res.status(404).send("No Notifications were found");
    }
    if(doc.lenght==0)
    {
   return res.status(404).send("No Notifications were found");
    }
      var n = doc.length;
      console.log (n);
      let Result = await User.find({'UserId': req.user._id}).select('-_id LikedReview WantToRead Reading Read');
         console.log(Result);

      for (var i=0 ;i<n;i++)
     {
       if (doc[i].ReviewId)
       {
        console.log(doc[i].ReviewId);
         var exsist = Result[0].LikedReview.indexOf(doc[i].ReviewId);
         console.log(exsist);

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

    res.status(200).send(
        doc
    )
   }
)


});
  /**
 * @api{Post} /api/users/Notification/seen
 * @apiVersion 0.0.0
 * @apiName Set the notification to seen
 * @apiGroup User
 * @apiparam {String} token Authentication token
 * @apiParam {String} NotificationId  the id of the notification seen
 *
 *  @apiSuccess {Boolean}  SeenSuccess  wheather is was updated in the database or not
 *
 * @apiSuccessExample  Expected Data on Success
 * {
 *"SeenSucces": true
 * }
 * @apiError Notification-Not-Found The <code>Notification</code> was not found
 *
  */
 router.post("/Notification/seen" ,auth,(req,res)=>
 {
      if(req.body.NotificationId==null)
      {
         return  res.status(400).send("Bad request no .NotificationId  Id is there");
     }
 
       if (req.body.NotificationId.length == 0)
      {
        return  res.status(400).send("Bad request .NotificationId Id is there");
      }
 
 
   Notification.findOneAndUpdate( {'NotificationId':req.body.NotificationId},
   { $set : {'Seen' :true} },
   (err,doc)=>
 
    {
     if(!doc)
     {
     return res.status(404).send("No Notifications were found");
     }
     if(doc.length==0)
     {
 
    return res.status(404).send("No Notifications were found");
     }
 
     res.status(200).send(" 'SeenSucces' : true " )
    }
 )
   });
 
           function validateUserOnly(reqin) {
             const schema = {
             UserId:Joi.string().min(24).max(24),
             };
             return Joi.validate(reqin, schema);
             }
 
 






 /***************************
    //Get People a user is following
   /**
    * @api{POST}/api/users/getfollowing Get People a user is following
    * @apiName Get People a user is following
    * @apiGroup User
    * @apiError {404} id-not-found The<code>user_id</code> was not found.
    * @apiSuccess {200} Request  Successful or not
    * @apiParam  {String} user_id GoodReads User ID
	* @apiparam {String} token Authentication token
 

 * @apiSuccessExample {JSON}
 * HTTP/1.1 200 OK
   {
   [
    "5c9132dd2b1afd02f4f8c909",
    "5c9132dd3bd70fb83625a86a"
    ]
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


//Get people a user is following
router.post('/getfollowing', auth,async (req, res) => { //sends post request to /getfollowers End point through the router
  /* console.log(req.body.userId_tobefollowed);
  console.log(req.userId_tobefollowed);
  console.log(req.params.userId_tobefollowed);
  console.log(req.query.userId_tobefollowed);  //ONLY WORKINGGGGGGGGGGGG
  console.log("my"+req.query.myuserid);*/
    mongoose.connection.collection("users").findOne({UserId:req.query.user_id},
      async (err,doc) =>{

      //  console.log(doc);

        if(!doc || err)
        {
       //   console.log(doc);
          res.status(404).json({  // sends a json with 404 code
            success: false ,  // user not retrieved
             "Message":"User ID not  found !"});
        }
         else
         {
         //console.log(doc);
         FollowingUserId=doc.FollowingUserId;
         var followingData = Array();
         //console.log(FollowingUserId);
         n=FollowingUserId.length;
         for(i=0;i<n;i++)
         {
          let X= await User.findById(FollowingUserId[i]).select('-UserPassword');
          followingData.push(X);
         }
         res.status(200).json(followingData);


         }
        });
 });

  /***************************
    //Get User's Followers
   /**
    * @api{POST} /api/users/getfollowers Get User's Followers
    * @apiName Get User's Followers
    * @apiGroup User
    * @apiError {404} id-not-found The<code>user_id</code> was not found.
    * @apiSuccess {200} Request  Successful or not
    * @apiParam  {String} user_id GoodReads User ID
	* @apiparam {String} token Authentication token
 

 * @apiSuccessExample {JSON}
 * HTTP/1.1 200 OK
   {
   [
    "5c9132dd2b1afd02f4f8c909",
    "5c9132dd3bd70fb83625a86a"
    ]
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


//Get User's Followers
router.post('/getfollowers', auth,async (req, res) => { //sends post request to /getfollowers End point through the router
  /* console.log(req.body.userId_tobefollowed);
  console.log(req.userId_tobefollowed);
  console.log(req.params.userId_tobefollowed);
  console.log(req.query.userId_tobefollowed);  //ONLY WORKINGGGGGGGGGGGG
  console.log("my"+req.query.myuserid);*/
    mongoose.connection.collection("users").findOne({UserId:req.query.user_id},
      async (err,doc) =>{

      //  console.log(doc);

        if(!doc || err)
        {
       //   console.log(doc);
          res.status(404).json({  // sends a json with 404 code
            success: false ,  // user not retrieved
             "Message":"User ID not  found !"});
        }
         else
         {
         //console.log(doc);
         FollowersUserId=doc.FollowersUserId;
         var FollowersData = Array();
         n=FollowersUserId.length;
         for(i=0;i<n;i++)
         {
          let X= await User.findById(FollowersUserId[i]).select('-UserPassword');
          FollowersData.push(X);
         }
         res.status(200).json(FollowersData);


         }
        });
 });
//Login Authentication

/**
 *
 * @api {POST}  /api/auth/signin Signing in by Email and Password
 * @apiName SignIn
 * @apiGroup User
 *
 * @apiParam  {String} UserEmail Email of User
 * @apiParam  {String} UserPassword Password of User
 * @apiSuccess {String}   ReturnMsg   Return Message Log in Successful.
 * @apiSuccess {String} UserId Id of User after Successfully Signing in
 * @apiSuccess {String} token Authentication Access Token
 * @apiSuccessExample {json}  Success
 *     HTTP/1.1 200 OK
 * {
 *        "ReturnMsg": "Log in Successful.",
 *        "UserId": "5ca23e81783e981f88e1618c",
 *        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1Y2EyM2U4MTc4M2U5ODFmODhlMTYxOGMiLCJpYXQiOjE1NTQxMzcxMjJ9.rUfROgeq1wgmsUxljg_ZLI2UbFMQubHQEYLKz2zd29Q"
 *   }
 * @apiErrorExample {json} InvalidEmailorPassword-Response:
 *     HTTP/1.1 400
 *  {
 *    "ReturnMsg":"Invalid email or password."
 *  }
 *
 * @apiErrorExample {json} UnConfirmedUser-Response:
 *     HTTP/1.1 401
 *  {
 *    "ReturnMsg" :'Your account has not been verified.'
 *  }
 *
 */

module.exports = router;
