const mongoose = require('mongoose');
require('./comments.model');
require('./resources.model');
mongoose.connect('mongodb://localhost/Greeksreads',{useNewUrlParser : true}, err=>
{
    if(err)
        console.log("cannot connect: "+err);
    else
        console.log("connection succeded Wohohohohhoho");
});