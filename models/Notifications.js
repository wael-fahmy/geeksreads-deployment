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
    UserName:
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
      AutorName:
      {
        type: String
      },
      AutorId:
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

if (MakerId)
{
  await User.findOne({"UserId": MakerId},(err,doc)=>
  {
    if (!doc)
    {
      return console.log("Wrong User Id")
    }
    else
    {
      newNotification.MakerId = doc.UserId;
      newNotification.MakerName = doc.UserName;
      newNotification.MakerPhoto = doc.Photo;

    }

  });

}
await review.findOne({ "reviewId": ReviewId},(err,doc) =>
{   if (!doc)
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
    Book1Id= doc.bookId;
    console.log(doc.userName);
    console.log(newNotification.UserName);
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
      newNotification.BookId=doc.BookId;
      newNotification.BookName=doc.Title;
      newNotification.BookPhoto=doc.Cover;
      newNotification.AuthorName= doc.AuthorName;
      newNotification.AuthorId= doc.AuthorId;

    }


});/////////////////////////////////////////
//////// three types/////////////////
//////////////////////////////////////////
/////review//////
 if(Type == "Comment")
{
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


