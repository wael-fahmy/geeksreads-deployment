// Important requires
const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');
const {User} = require('../models/User');
const {Books} =require('../models/Book');
const {review} = require('../models/reviews.model');
const {comment}=require('../models/comments.model');

const StatusesSchema = new mongoose.Schema({
    StatusId: {
        type: String,
        unique :true // it must be unique
    },
    
    StatusType:
    {
        type:String // wheather a comment or rate or review 
    },
    
    UserId:
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
    ReviewMakerId:
      {
        type: String
      },
    ReviewMakerPhoto:
      {
        type: String//url
      },
    ReviewMakerName:
      {
        type: String
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
    CommentMakerId:
      {
        type: String
      },
    CommentMakerPhoto:
      {
        type: String//url
      },
    CommentMakerName:
      {
        type: String
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
    AuthorName:
    {
      type: String
   
    },
    AuthorId:
    {
      type: String
   
    },
    BookStatus: // Read WantToRead Reading 
    {
    type: String
    },
    NumberOfStars:// for rating
    {
        type: Number
    }
    });

const Statuses = mongoose.model('Statuses', StatusesSchema);
   
 // Important vaidations for the schema  
function validateStatuses(Status) {
    const schema = {
        StatusId: Joi.string().required(),
        UserId: Joi.string().required(),
        StatusBody: Joi.string().required().max(200),
        ReviewId: Joi.string(),
        CommentId: Joi.string(),
        StatusDate:  Joi.date().iso()
    };
    return Joi.validate(Status, schema);
    }
    /**
 * Creating new statuses.
 * @constructor
 * @param {string} FollowerId - the Id of the ppl who will see the statuses in his new feed.
 * @param {string} ReviewId - the id of the review 
 * @param {string} Comment1Id - the id of the comment
 * @param {string} Type - the type of the statuses its one of three ( Rate, Review ,Comment) stick with the naming
 * @param {string} Book1Id the Id of the book (review or rated)
 * @param {string} NumberOfStars if rating must send number of stars
 * 
 */

async function CreatStatuses( FollowerId ,ReviewId , Comment1Id, Type, NumberOfStars, Book1Id )
{ 
// basic infos
if (Type != "Comment" &&Type != "Review" )
{
  var x ={"TypeSuccess": false };
  return x;
}
  var  newStatus = new Statuses(
    {
      "UserId":FollowerId,
      "StatusType":Type, 
      "ReviewIsLiked": false,
      "BookStatus": null
    });
    newStatus.StatusId=newStatus._id;
//get the Maker Infos//
 /////////////////////////////////////////
//////// three types/////////////////
//////////////////////////////////////////
/////review//////

await review.findOne({"reviewId":ReviewId},(err,doc) =>
{    
    if (!doc)
  {
    return "Wrong review Id"
  }
  else
  {
    newStatus.ReviewId=doc.reviewId;
    newStatus.ReviewBody=doc.reviewBody;
    newStatus.ReviewDate=doc.reviewDate;
    newStatus.ReviewLikesCount= doc.likesCount;
    newStatus.ReviewMakerId = doc.userId;
    newStatus.ReviewMakerName = doc.userName;
    newStatus.ReviewMakerPhoto = doc.photo;
    Book1Id = doc.bookId; 
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
      newStatus.BookId=doc.BookId;
      newStatus.BookName=doc.Title;
      newStatus.BookPhoto=doc.Cover;    
      newStatus.AuthorName=doc.AuthorName;
      newStatus.AuthorId= doc.AuthorId;

    }



});
if ( Type == "Comment")
{
  
await comment.findOne({CommentId:Comment1Id},(err,doc) =>
{    
    if (!doc)
  {
    return "Wrong comment Id"
    }
  else
  {
    newStatus.CommentId=doc.CommentId;
    newStatus.CommentBody=doc.Body;
    newStatus.CommentDate=doc.date;
    newStatus.CommentLikesCount= doc.likesCount;
    newStatus.CommentMakerId = doc.userId;
    newStatus.CommentMakerName = doc.userName;
    newStatus.CommentMakerPhoto = doc.Photo;
   
  }
});

};

newStatus.save();
}

// Important Exports 
exports.CreatStatuses = CreatStatuses;
exports.Status = Statuses;
exports.validate = validateStatuses;
