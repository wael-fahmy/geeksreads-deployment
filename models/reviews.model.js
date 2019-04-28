const mongoose = require('mongoose');
const Joi = require('joi');
ObjectId = mongoose.Schema.Types.ObjectId;
var reviewSchema = new mongoose.Schema({

/*      reviewId //1  
        bookId //2
        rating //3 
        reviewBody //4
        reviewDate //5
        shelf //6
        done userId //7
        done userName //8
        done Photo //9 Users Photo 
        done LikesCount //10
 */

    reviewId: {
        type: ObjectId//1 /done
    }
    , bookId: {
        type: ObjectId//2 /done
    }
    ,
    rating: {
        type: Number, //3 /done
        default: 0
    }
    ,
    reviewBody: {
        type: String//4 /to validate /done
    },
    reviewDate: {
        type: Date//5 / to validate done
    },
    shelf:
    {
        type: String //6 /done
    },
    userId: {
        type: ObjectId//7 /done

    }
    ,
    userName: {
        type: String, //8 done
        required: true,
        minlength: 3,
        maxlength: 50
    },
    photo: { // user photo
        type: String //9 /done
    },
    likesCount: {
       type: Number //10 /done
   }
});
review=mongoose.model('review', reviewSchema);
function validateReview(Review) {
    const schema = {
    rating: Joi.number().min(0).max(5),
    reviewBody: Joi.string().min(6).max(255).required(),
    reviewDate: Joi.date().iso(),
    shelf: Joi.string(),
    photo: Joi.string(),
    bookId: Joi.string(),
    userId: Joi.string(),
    likesCount: Joi.number().min(0).max(5)
    };
    return Joi.validate(Review, schema);
    }
    exports.validate= validateReview;
    exports.review=review;