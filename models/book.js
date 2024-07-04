const mongoose = require('mongoose');
const Schema=mongoose.Schema;

const BookSchema= new Schema({
    title:{type:String, required:true},
    author:{type: Schema.Types.ObjectId, ref: "Author", required:true}, //author is a reference to a single Author model object
    summary: { type: String, required: true },
    isbn: { type: String, required: true },
    genre: [{ type: Schema.Types.ObjectId, ref: "Genre" }], //genre is a reference to an array of Genre model objects
});
BookSchema.virtual("url").get(function(){
    return `/catalog/book/${this._id}`;
});

module.exports= mongoose.model("Book", BookSchema);