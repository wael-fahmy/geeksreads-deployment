const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');

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

});
const Notification = mongoose.model('Notification', NotificationSchema);

exports.Notification = Notification;


