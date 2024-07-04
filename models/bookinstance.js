const mongoose = require('mongoose');
const Schema=mongoose.Schema;
const {dateTime, DateTime}= require("luxon");

const BookInstanceSchema=new Schema({
    book:{type: Schema.Types.ObjectId, ref: "Book", required: true},
    imprint: {type: String, required: true},
    status: {
    type: String,
    required: true,
    enum: ["Available", "Maintenance", "Loaned", "Reserved"],
    default: "Maintenance",
  },
  due_back: { type: Date, default: Date.now },
});

BookInstanceSchema.virtual("url").get(function(){
    return `/catalog/bookinstance/${this._id}`;
});
BookInstanceSchema.virtual("due_back_formatted").get(function(){
  return dateTime.fromJSDate(this.due_back).toLocaleString(dateTime.DATE_MED);
});
BookInstanceSchema.virtual("due_back_yyyy_mm_dd").get(function(){
  return DateTime.fromJSDate(this.due_back).toISODate();
})
module.exports= mongoose.model("BookInstance", BookInstanceSchema);