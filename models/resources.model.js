const mongoose = require('mongoose');
ObjectId = mongoose.Schema.Types.ObjectId;
var resourcesSchema = new mongoose.Schema({
    resourceId: {
        type: ObjectId//1
    },
    reviewId: {
        type: ObjectId//2
    },
    userId: {
        type: ObjectId//3
    },
    commentId: {
        type: ObjectId//4
    },
    likes: {
        type: Number//5
    },
    type: {
        type: String//6
    }
});
Recources= mongoose.model('Resources', resourcesSchema);
exports.Resource =Recources ;