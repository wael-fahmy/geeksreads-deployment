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
    UserId:
    {
        type: String
    },
    
    TheMakerId:
    {
        type: String
    },
    ReviewId:
    {
        type: String
    },
    CommentId:
    {
        type: String
    },
    
    StatusBody:
    {
        type: String
        
    },
    StatusDate:
    {
        type: Date
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
