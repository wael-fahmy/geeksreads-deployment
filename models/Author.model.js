const mongoose = require('mongoose');
ObjectId = mongoose.Schema.Types.ObjectId;
var AuthorSchema = new mongoose.Schema({
    AuthorId: {
        type: ObjectId
    },
    BookId: {
        type:"array",
        "items":{
          type:String
        }},
    
    AuthorName: {
        type: String
    },
    FollowingUserId: {
        type:"array",
        "items":{
          type:String
    }},
    Photo: {
        type: String
    }, 
    About:
    {
      type: String
    } 
    });
Authors= mongoose.model('Authors', AuthorSchema);
exports.Authors =Authors ;
  /* ShelfId:{
    type:"array",
    "items":{
      type:Number
    */