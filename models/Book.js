const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  Title: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50
  },
  Cover : {
    type:String
  },
  ReadStatus : {
    type:String
  },
  Publisher : {
    type:String
  },
  Published : {
    type:Date
  },
  Description : {
    type: String,
    minlength: 1,
    maxlength: 1024
  },
  Store:{
    type:"array",
    "items":{
        type:String
    }
  },
  Pages:{
      type:Number
  },
  BookId:{
    type: String,
    unique: true
  },
  AuthorId:{
    type: String,
    unique: true
  },
  ISBN:{
    type: String,
    unique: true
  },
  Genre:{
    type:String,
    minlength: 3,
    maxlength: 50
  }
  });


const Book = mongoose.model('Book', BookSchema);
function validateBook(Books) {
const schema = {
Title: Joi.string().min(3).max(50).required(),
Cover: Joi.string(),
ReadStatus: Joi.string(),
Publisher: Joi.string(),
Published: Joi.Date(),
Description: Joi.string().min(1).max(1024),
Store: Joi.string(),
Pages: Joi.Number(),
BookId: Joi.string().required(),
AuthorId: Joi.string().required(),
ISBN: Joi.string().required(),
Genre: Joi.string().min(3).max(50)
};
return Joi.validate(Books, schema);
}
exports.Books = Book;
exports.validate= validateBook;

