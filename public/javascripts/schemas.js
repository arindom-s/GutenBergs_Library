const mongoose = require('mongoose');
const Schema=mongoose.Schema;
const Schema1= new Schema({
    a_string: String,
    a_date:Date,
});
const someModel= mongoose.model("someModel",Schema1);