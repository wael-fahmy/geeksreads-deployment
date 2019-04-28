 const mongoose = require('mongoose');
 const Joi = require('joi');
 ObjectId = mongoose.Schema.Types.ObjectId;
 var commentSchema = new mongoose.Schema({
     CommentId: {
         type: ObjectId//1 /done
     }
     , BookId: {
         type: ObjectId//2 /done
     }
     , ReviewId: {
         type: ObjectId//3 /done
     },
     Body: {
         type: String//4 /to validate /done
     },
     userName: {
         type: String//5 /to validate /done
     },
     userId: {
         type: ObjectId//6 /done

     },
     date: {
         type: Date//7 / to validate /done
     },
     Photo: {
         type: String //8 /done
     },
     LikesCount: {
        type: Number //9 /done
        , minimum:0
    }
    ,liked:{
        type: Boolean //10 /done
    }
});
//const comment = mongoose.model('comment', UserSchema);

comment=mongoose.model('comment', commentSchema);
function validateComment(Comment) {
    const schema = {
    userName: Joi.string().min(3).max(50).required(),
    Body: Joi.string().min(6).max(255).required(),
    date: Joi.date().iso(),
    BookId:Joi.string().min(24),
    ReviewId:Joi.string().min(24),
    userId:Joi.string().min(24),
    Photo: Joi.string(),
    LikesCount: Joi.number()
    };
    return Joi.validate(Comment, schema);
    }
    //exports.comment=comment;
    exports.validate= validateComment;
    exports.comment=comment;