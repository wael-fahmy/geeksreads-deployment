const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');
const {User} = require('../models/User');
const {Books} =require('../models/Book');
const {review} = require('../models/reviews.model');
const {comment}=require('../models/comments.model');

const NotificationSchema = new mongoose.Schema({



    NotificationId: 

    {
        type:String
    },
NotificationType:
{
    type:String // wheather a comment or rate or review 
},
Seen:
{
    type: Boolean
},
//////////////////////////////////////////
/////////////USER///////////////////
UserId:
      {
        type: String
      },
    UserPhoto:
      {
        type: String//url
      },
    UsesrName:
      {
        type: String
      },

/////////////////////////////////////////
//////////////////maker//////////////////
MakerId:
      {
        type: String
      },
MakerPhoto:
      {
        type: String//url
      },
MakerName:
      {
        type: String
      },

 //////////////////////////////////
      /////////////Revieww////////////   
      ReviewId:
      {
          type: String
      },
      ReviewBody: {
          type: String
      },
      ReviewDate: {
          type: Date
      },
      
      ReviewLikesCount: {
          type: Number 
      },
      
    ReviewIsLiked:
    {
      type: Boolean 
    },
      //////////////////////////////////
      ////////////Comment//////////////
      CommentId:
      {
          type: String
      },
      CommentBody: 
      {
          type: String//4 /to validate /done
      },
      CommentDate:
      {
      type: Date
      },
      CommentLikesCount: {
          type: Number //9 /done
      },
      
    CommentIsLiked:
    {
      type: Boolean 
    },
    
      ////////////////////////////////////////
      //////////BOook/////////////////////
      BookId:
      {
          type: String
      },
      BookName:
      {
          type: String
      },
      BookPhoto:
      {
          type: String
      },

      BookStatus: // Read WantToRead Reading 
      {
      type: String
      },
});
const Notification = mongoose.model('Notification', NotificationSchema);

async function CreatNotification( NotifiedUserId ,ReviewId , Comment1Id, Type, MakerId, Book1Id )
{
  console.log( NotifiedUserId ,ReviewId , Comment1Id, Type, MakerId, Book1Id )
// basic infos
if ( NotifiedUserId ==MakerId)
{
return   console.log(" no notification will be added for the same user")
}
  var  newNotification = new Notification(
    {
      "UserId":NotifiedUserId,
      "NotificationType":Type, 
      "ReviewIsLiked": false,
      "BookStatus": null
    
    });
    newNotification.NotificationId=newNotification._id;
//get the Maker Infos//
   await User.findOne({ "UserId" : MakerId},(err,doc )=>
    {

      if (!doc)
      {
        return console.log("Wrong Maker Id")
      }
      else{
        newNotification.MakerId=doc.UserId;
        newNotification.MakerPhoto=doc.Photo;
        newNotification.MakerName =doc.UserName; 
  
      }

    });
/////////////////////////////////////////
//////// three types/////////////////
//////////////////////////////////////////
/////review//////
if ( Type == "ReviewLike")
{
  await review.findOne({ "reviewId": ReviewId},(err,doc) =>
{      console.log (" indk");
    if (!doc)
  {
    return console.log("Wrong review Id")
  }
  else
  {
    newNotification.ReviewId=doc.reviewId;
    newNotification.ReviewBody=doc.reviewBody;
    newNotification.ReviewDate=doc.reviewDate;
    newNotification.ReviewLikesCount= doc.likesCount;
    newNotification.UserName=doc.userName;
    newNotification.UserPhoto=doc.photo;
    
  }

});

await Books.findOne({"BookId":Book1Id},(err,doc) =>
  {    
      if (!doc)
    {
      return console.log("Wrong book Id")
    }
    else
    {
      console.log (doc);
      newNotification.BookId=doc.BookId;
      newNotification.BookName=doc.Title;
      newNotification.BookPhoto=doc.Cover;    
    }


});
}
else if(Type == "Comment")
{
  await review.findOne({"reviewId":ReviewId},(err,doc) =>
{     if (!doc)
  {
    return console.log("Wrong review Id")
  }
  else
  {
    
   
    newNotification.ReviewId=doc.reviewId;
    newNotification.ReviewBody=doc.reviewBody;
    newNotification.ReviewDate=doc.reviewDate;
    newNotification.ReviewLikesCount= doc.likesCount;
    newNotification.UserName=doc.userName;
    newNotification.UserPhoto=doc.photo;
  }


});

await comment.findOne({"CommentId":Comment1Id},(err,doc) =>
{    
    if (!doc)
  {
    return console.log("Wrong comment Id")
  }
  else
  {
    
   
    newNotification.CommentId=doc.CommentId;
    newNotification.CommentBody=doc.Body;
    newNotification.CommentDate=doc.date;
    newNotification.CommentLikesCount= doc.likesCount;
  }


}) 
};

newNotification.Seen = false;
newNotification.save();
}
 
exports.CreatNotification = CreatNotification;
exports.Notification = Notification;


