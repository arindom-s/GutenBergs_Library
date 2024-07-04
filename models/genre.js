const mongoose = require('mongoose');
const Schema=mongoose.Schema;

const GenreSchema= new Schema({
    Genre_names:{type:String, required: true, minlength:3, maxlength:100},
});

GenreSchema.virtual("url").get(function(){
    return `/catalog/genre/${this._id}`;
});
module.exports= mongoose.model("Genre", GenreSchema);