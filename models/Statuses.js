// Important requires
const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');

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
// Important Exports   
exports.Status = Statuses;
exports.validate = validateStatuses;
