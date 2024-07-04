const Author=require("../models/author");
const asyncHandler= require("express-async-handler");
const Book=require("../models/book");
const debug=require("debug")("author");
const {body, validationResult }=require("express-validator");
exports.author_list=asyncHandler(async (req,res,next)=>{
  const allAuthors= await Author.find().sort({
    family_name: 1
  }).exec();
  res.render("author_list",{  //The first argument is the name of the template file (without the file extension), and the second argument is an object containing the data to be passed to the template.
    title: "Author List",
    author_list: allAuthors,
  });

});
exports.author_detail= asyncHandler(async(req,res,next)=>{
   const [author, allBooksbyAuthor]= await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({author: req.params.id},"title summary").exec(),
   ]);
   if(author=== null){
    const err= new Error("Author where :o ");
    err.status=404;
    return next(err);
   }
   res.render("author_detail",{
    title: "Author detail",
    author: author,
    author_books: allBooksbyAuthor,
   });
});
exports.author_create_get= ((req,res,next)=>{
    res.render("author_form",{title:"Create Author"});
});
exports.author_create_post=[
    body("first_name").trim().isLength({min: 1}).escape().withMessage("First name must be specified").isAlphanumeric().withMessage("First Name has non-alphanumeric characters"),
    body("family_name").trim().isLength({min:1}).escape().withMessage("Family name must be specified").isAlphanumeric().withMessage("family name has non alphanumeric characters"),
    body("Dateofbirth", "Invalid date of birth")
    .optional({values: "falsy"}).isISO8601().toDate(),
    body("Dateofdeath", "Invalid date of death")
    .optional({values: "falsy"}).isISO8601().toDate(),
    asyncHandler(async(req,res,next)=>{
      const errors=validationResult(req);
      const author= new Author({
        first_name: req.body.first_name,
        family_name: req.body.family_name,
        date_of_birth: req.body.date_of_birth,
        date_of_death: req.body.date_of_death,
      });
      if(!errors.isEmpty()){
        res.render("author_form",{
            title: "Create Author",
            author: author,
            errors: errors.array(),
        });
        return;
      }
      else{
        await author.save();
        res.redirect(author.url);
      }
}),
];
exports.author_delete_get= asyncHandler(async(req,res,next)=>{
   const [author, allBooksbyAuthor]=await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({author: req.params.id},"title summary").exec(),
   ]);
   if(author===null){
    res.redirect("/catalog/authors");
   }
    res.render("author_delete",{
      title: "Delete Author",
      author: author,
      author_books: allBooksbyAuthor,
    });
});

exports.author_delete_post= asyncHandler(async(req,res,next)=>{
   const [author, allBooksbyAuthor]=await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({author: req.params.id},"title summary").exec(),
   ]);
   if(allBooksbyAuthor.length > 0){
    res.render("author_delete",{
      title:"Delete Author",
      author: author,
      author_books: allBooksbyAuthor,
    });
    return;
   }else{
    await Author.findByIdAndDelete(req.body.authorid);
    res.redirect("/catalog/authors");
   }
});


exports.author_update_get= asyncHandler(async(req,res,next)=>{
  const author=await Author.findById(req.params.id).exec();
  if(author===null){
    debug(`id not found on update: ${req.params.id}`);
    const err= new Error("Author not found");
    err.status=404;
    return next(err);
  }
    res.render("author_form",{
      title: "Update Author",
       author: author
    });
});

exports.author_update_post= asyncHandler(async(req,res,next)=>{
    res.send("Not Implemented : Author update post");
});