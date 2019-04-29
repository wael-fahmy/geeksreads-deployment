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
    /////////////makerrrr/////////////     
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
 * @param {string} MakerId- the id of the user who made the action.
 * @param {string} ReviewId - the id of the review 
 * @param {string} Comment1Id - the id of the comment
 * @param {string} Type - the type of the statuses its one of three ( Rate, Review ,Comment) stick with the naming
 * @param {string} Book1Id the Id of the book (review or rated)
 * @param {string} NumberOfStars if rating must send number of stars
 * 
 */

async function CreatStatuses( FollowerId ,ReviewId , Comment1Id, Type, MakerId, NumberOfStars, Book1Id )
{
// basic infos
console.log(FollowerId ,ReviewId , Comment1Id, Type, MakerId, NumberOfStars, Book1Id);
  var  newStatus = new Statuses(
    {
      "UserId":FollowerId,
      "StatusType":Type, 
      "CommentIsLiked" : false,
      "ReviewIsLiked": false,
      "BookStatus": null
    });
    newStatus.StatusId=newStatus._id;
//get the Maker Infos//
    await User.findOne({"UserId":MakerId},(err,doc )=>
    {
      if (!doc)
      {
        return console.log("Wrong Maker Id")
      }
      else{
        newStatus.MakerId=doc.UserId;
        newStatus.MakerPhoto=doc.Photo;
        newStatus.MakerName =doc.UserName;    
      }

    });
/////////////////////////////////////////
//////// three types/////////////////
//////////////////////////////////////////
/////review//////
if ( Type == "Review")
{
await review.findOne({"reviewId":ReviewId},(err,doc) =>
{    
    if (!doc)
  {
    return console.log("Wrong review Id")
  }
  else
  {
    newStatus.ReviewId=doc.reviewId;
    newStatus.ReviewBody=doc.reviewBody;
    newStatus.ReviewDate=doc.reviewDate;
    newStatus.ReviewLikesCount= doc.likesCount;
  
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
    }


});
}
else if ( Type == "Rate")
{
  await Books.findOne({"BookId":Book1Id},(err,doc) =>
  {    
      if (!doc)
    {
      return console.log("Wrong book Id")
    }
    else{
      newStatus.BookId=doc.BookId;
      newStatus.BookName=doc.Title;
      newStatus.BookPhoto=doc.Cover;    
    }
  });
newStatus.NumberOfStars =NumberOfStars;

}
else // if comment
{
  
await review.findOne({"reviewId":ReviewId},(err,doc) =>
{    
    if (!doc)
  {
    return console.log("Wrong review Id")
  }
  else
  {
    newStatus.ReviewId=doc.reviewId;
    newStatus.ReviewBody=doc.reviewBody;
    newStatus.ReviewDate=doc.reviewDate;
    newStatus.ReviewLikesCount= doc.likesCount;
  
  }


});

await comment.findOne({CommentId:Comment1Id},(err,doc) =>
{    
    if (!doc)
  {
    return console.log("Wrong comment Id")
  }
  else
  {
    newStatus.CommentId=doc.CommentId;
    newStatus.CommentBody=doc.Body;
    newStatus.CommentDate=doc.date;
    newStatus.CommentLikesCount= doc.likesCount;
  
  }
});

};

newStatus.save();
}

// Important Exports 
exports.CreatStatuses = CreatStatuses;
exports.Status = Statuses;
exports.validate = validateStatuses;
