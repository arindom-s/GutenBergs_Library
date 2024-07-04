const mongoose= require("mongoose");
const Schema=mongoose.Schema;

const AuthorSchema = new Schema({
   first_name: { type: String, required: true, maxLength: 100 },
  family_name: { type: String, required: true, maxLength: 100  
},
    date_of_birth: { type: Date },
});

AuthorSchema.virtual("name").get(function(){
     let fullname = "";
  if (this.first_name && this.family_name) {
    fullname = `${this.family_name}, ${this.first_name}`;
  }return fullname;
});
AuthorSchema.virtual("url").get(function(){ //We've also declared a virtual for the AuthorSchema named "url" that returns the absolute URL required to get a particular instance of the model 
    return `/catalog/author/${this.id}`;
});

AuthorSchema.virtual("Dateofbirth").get(function(){
  return dateTime.fromJSDate(this.due_back).toLocaleString(dateTime.DATE_MED);
});
AuthorSchema.virtual("Dateofdeath").get(function(){
  return dateTime.fromJSDate(this.due_back).toLocaleString(dateTime.DATE_MED);
});

module.exports=mongoose.model("Author", AuthorSchema);