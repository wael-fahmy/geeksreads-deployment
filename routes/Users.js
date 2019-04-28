const config = require('config');
const isImageUrl = require('is-image-url');
const crypto = require('crypto');
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
//const sendgrid = require('sendgrid');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const {User,validate,DateValidate,NewPassWordValidate} = require('../models/User');
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

////////////////////////
//////////get user by id////////////
router.get('/getUser',async(req,res)=>{

  const {error}=validateUserOnly(req.body);
  if (error) return res.status(400).send(error.details[0].message);

const GettingUser=new User();

GettingUser=User.findById({UserId: req.body.UserId},'UserName UserEmail UserBirthDate Photo FollowingAuthorId FollowingUserId FollowersUserId Read WantToRead Reading Confirmed',(err,doc)=>
{
  if(err) { res.status(400).send("uset doesn't exist!")}

       if(!doc) { res.status(400).send("error while retrieving data!")}
       if(doc)
       { res.status(200).send(doc)}

})

})

///////////////////////////////




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

  let check = await User.findOne({ UserEmail: req.user.UserEmail });
  if (!check) return res.status(400).send({"ReturnMsg":"User Doesn't Exist"});
  const user = await User.findOne({UserEmail: req.user.UserEmail }).select('-UserPassword');
//  console.log(user);
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


router.post('/SignUp', async (req, res) => {
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




//Update User Password


 /**
  *
  * @api {POST}  /user/UpdateUserPassword.json Update User Password.
  * @apiName UpdateUserPassword
  * @apiGroup User
  *
  * @apiHeader {String} x-auth-token Authentication token
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
 * @api {POST}  /user/UpdateUserInfo.json Update User Information (UserName, Photo, Date).
 * @apiName SignIn
 * @apiGroup User
 *
 * @apiHeader {String} x-auth-token Authentication token
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
   let Read =  await User.findOne({ UserId: req.user._id, Read:req.body.BookId });
   let WantToRead = await User.findOne({ UserId: req.user._id, WantToRead:req.body.BookId });
   let Reading =  await User.findOne({ UserId: req.user._id, Reading:req.body.BookId });
   if(!Read && !WantToRead && !Reading) return res.status(400).send({"ReturnMsg": "Invalid Book Id"});

  if (Read) res.status(200).send({"ReturnMsg": "Read"});
  else if (WantToRead) {res.status(200).send({"ReturnMsg": "Want To Read"});}
  else if (Reading) {res.status(200).send({"ReturnMsg": "Currently Reading"});}
 });



 //Get User's Shelves


 /**
  * @api {GET} /Shelf/GetUserShelves.json  Gets All User's Shelves
  * @apiName GetUserShelves
  * @apiGroup Shelves
  *
  * @apiHeader {String} x-auth-token Authentication token
  *
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


  router.get('/GetUserShelves', auth, async (req, res) => {
    let check = await User.findOne({ UserId: req.user._id });
    if (!check) return res.status(400).send({"ReturnMsg":"User Doesn't Exist"});

    //const user = await User.findById(req.user._id).select('-UserBirthDate -UserPassword  -_id  -__v -UserId -UserEmail -Photo -Confirmed -UserName -FollowingAuthorId -FollowingUserId -FollowersUserId -OwnedBookId');
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




  //Add Book to Shelf



  /**
   * @api {POST} /Shelf/AddToShelf.json  Add a Book to a Shelf
   * @apiName AddToShelf
   * @apiGroup Shelves
   *
   * @apiHeader {String} x-auth-token Authentication token
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
  * @api {POST} /Shelf/RemoveFromShelf.json  Removes a Books From User Shelves
  * @apiName RemoveFromShelf
  * @apiGroup Shelves
  *
  * @apiHeader {String} x-auth-token Authentication token
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
   * @api {POST} /Shelf/UpdateWantToReading.json  Updates Book Status From Want to Read to Reading
   * @apiName UpdateWantToReading
   * @apiGroup Shelves
   *
   * @apiHeader {String} x-auth-token Authentication token
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
    * @api {POST} /Shelf/UpdateReadingToRead.json  Updates Book Status From Reading to Read
    * @apiName UpdateReadingToRead
    * @apiGroup Shelves
    *
    * @apiHeader {String} x-auth-token Authentication token
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
 * @api {POST}  /api/Users/Follow Follow a user
 * @apiName Follow user
 * @apiGroup User
 * @apiError {404} id-not-found The<code>userId_tobefollowed</code> was not found.
 * @apiSuccess {200} Follow Successful or not
 * @apiParam  {String} myuserid GoodReads User ID
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
 // console.log("my"+req.query.myuserid);
  //console.log(req.query.userId_tobefollowed);
    mongoose.connection.collection("users").updateOne( // accesses basic mongodb driver to update one document of Users Collection
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
    mongoose.connection.collection("users").updateOne( // accesses basic mongodb driver to update one document of Users Collection
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
 * @apiParam  {String} myuserid GoodReads User ID
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
   
      mongoose.connection.collection("users").updateOne( // accesses basic mongodb driver to update one document of Users Collection

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
      mongoose.connection.collection("users").updateOne(
          {
              UserId :req.query.myuserid//access document of currently logged In user
          },
          {$pull: { // pull from end of array of the users I follow
            FollowingUserId: req.query.userId_tobefollowed
          }});


          });

  //Get User Notifications

  /**
 * @api{Get} /User/Notifications Get User Status
 * @apiVersion 0.0.0
 * @apiName Get User's Notification
 * @apiGroup User
 * @apiHeader {String} x-auth-token Authentication token
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


router.get("/Notifications" ,(req,res)=>
{
     if(req.query.UserId==null)
     {
        return  res.status(400).send("Bad request no UserID  Id is there");
    }

      if (req.query.UserId.length == 0)
     {
       return  res.status(400).send("Bad request no Satatus Id is there");
     }


  Notification.find( {'UserId':req.query.UserId},(err,doc)=>

   {
    if(!doc)
    {
   return res.status(404).send("No Notifications were found");
    }
    if(doc.lenght==0)
    {
   return res.status(404).send("No Notifications were found");
    }

    res.status(200).send(
        doc
    )
   }
)


});
  /**
 * @api{Post} /User/Notification/seen
 * @apiVersion 0.0.0
 * @apiName Set the notification to seen
 * @apiGroup User
 * @apiHeader {String} x-auth-token Authentication token
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
router.post("/Notification/seen" ,(req,res)=>
{
     if(req.body.NotificationId==null)
     {
        return  res.status(400).send("Bad request no UserID  Id is there");
    }

      if (req.body.NotificationId.length == 0)
     {
       return  res.status(400).send("Bad request no Satatus Id is there");
     }


  Notification.findOneAndUpdate( {'NotificationId':req.body.NotificationId},
  { $set : {'Seen' :true} },
  (err,doc)=>

   {
    if(!doc)
    {
   return res.status(404).send("No Notifications were found");
    }
    if(doc.lenght==0)
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
    * @api{POST}/api/Users/getfollowing Get People a user is following 
    * @apiName Get People a user is following
    * @apiGroup User 
    * @apiError {404} id-not-found The<code>user_id</code> was not found.
    * @apiSuccess {200} Request  Successful or not
    * @apiParam  {String} user_id GoodReads User ID

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
router.post('/getfollowing', async (req, res) => { //sends post request to /getfollowing End point through the router
  /* console.log(req.body.userId_tobefollowed);
  console.log(req.userId_tobefollowed);
  console.log(req.params.userId_tobefollowed);
  console.log(req.query.userId_tobefollowed);  //ONLY WORKINGGGGGGGGGGGG
  console.log("my"+req.query.myuserid);*/
    mongoose.connection.collection("users").findOne({UserId:req.query.user_id},
      (err,doc) =>{
       
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
         res.status(200).json(doc.FollowingUserId);
        
         }
        });
 });

  /***************************
    //Get User's Followers
   /**
    * @api{POST}/api/Users/getfollowers Get User's Followers
    * @apiName Get User's Followers
    * @apiGroup User 
    * @apiError {404} id-not-found The<code>user_id</code> was not found.
    * @apiSuccess {200} Request  Successful or not
    * @apiParam  {String} user_id GoodReads User ID

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
router.post('/getfollowers', async (req, res) => { //sends post request to /getfollowers End point through the router
  /* console.log(req.body.userId_tobefollowed);
  console.log(req.userId_tobefollowed);
  console.log(req.params.userId_tobefollowed);
  console.log(req.query.userId_tobefollowed);  //ONLY WORKINGGGGGGGGGGGG
  console.log("my"+req.query.myuserid);*/
    mongoose.connection.collection("users").findOne({UserId:req.query.user_id},
      (err,doc) =>{
       
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
         res.status(200).json(doc.FollowersUserId);
        
         }
        });
 });


            
module.exports = router;
