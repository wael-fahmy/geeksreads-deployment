///////////////////Required Modules//////////////////////////
var express = require('express');
var Router = express.Router();
const mongoose = require('mongoose');

const user = require('../models/User').User;
const Joi = require('joi');
var ownedBookSchema = new mongoose.Schema({
    bookId: ObjectId,
    conditionCode: Number,
    conditionDescription: String,
    purchaseDate: Date,
    purchaseLocation: String
});
ownedBook=mongoose.model('ownedBook', ownedBookSchema);
///////////////////Req and Res Logic////////////////////////
Router.post('/', async (req, res) => {
    book1 = new ownedBook();
    book1.bookId = req.body.bookid; //1
    book1.conditionCode = req.body.conditionCode; //2
    book1.conditionDescription = req.body.conditionDescription; //3
    book1.purchaseDate = req.body.purchaseDate; //4
    book1.purchaseLocation = req.body.purchaseLocation; //5
    user.findByIdAndUpdate(req.body.User_Id,
        { "$push": { "OwnedBookId": book1 } },
        { "new": true, "upsert": true },
        function (err, user1) {
            if (!err) {           
            
                res.json({ "AddedOwnedBookSuc": true });
            }
            else {
                res.json({ "AddedOwnedBookSuc": false });
                console.log('error during log insertion: ' + err);
            }
        }
    );
}
)
/////////////Delete//////////
Router.post('/destroy', async (req, res) => {
    let check = await user.findOne({ UserId: req.body.User_Id });
    if (!check) return res.status(400).send({ "ReturnMsg": "User Doesn't Exist" });
    user.findByIdAndUpdate(req.body.User_Id, {
        "$pull": { "OwnedBookId._id": req.body.ownedBookId }}, function(err, user1) {
            if (!err) {

                res.json({ "AddedOwnedBookSuc": true });
            }
            else {
                res.json({ "AddedOwnedBookSuc": false });
                console.log('error during log insertion: ' + err);
            }
        }
    );
})
module.exports = Router;