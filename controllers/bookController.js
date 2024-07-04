const Book = require("../models/book");
const Author = require("../models/author");
const Genre=require("../models/genre");
const BookInstance=require("../models/bookinstance");
const asyncHandler=require("express-async-handler");
const {body, validationResult}=require("express-validator");
// const bookinstance = require("../models/bookinstance");

exports.index= asyncHandler(async(req,res,next)=>{
    const [
        numBooks, numBookInstances,numAvailableBookInstances, numAuthors,numGenres,
    ]=await Promise.all([     //Because the queries for document counts are independent of each other we use Promise.all()
        Book.countDocuments({}).exec(),  
        BookInstance.countDocuments({}).exec(),
        BookInstance.countDocuments({status: "Available"}).exec(),
        Author.countDocuments({}).exec(),
        Genre.countDocuments({}).exec(),
    ]);   //The query can be executed by calling exec(), which returns a Promise that is either fulfilled with a result, or rejected if there is a database error.
    res.render("index",{
        title: "GutenBergs",
        book_count: numBooks,
        bookinstance_count:numBookInstances,
        bookinstanceavailable_count: numAvailableBookInstances,
        author_count: numAuthors,
        genre_count: numGenres,
    });
});

exports.book_list=asyncHandler(async(req,res,next)=>{
    const allBooks= await Book.find({}, "Title Author")
    .sort({title:1})
    .populate("author")
    .exec();   //exec() is then daisy-chained on the end in order to execute the query and return a promise.

    res.render("book_list",{
        title: "Book List", 
        book_list:allBooks  // If the promise is fulfilled, the results of the query are saved to the allBooks variable
    });
})


//Extras
exports.book_create_get = asyncHandler(async(req, res,next) => {
    const [allAuthors, allGenres]= await Promise.all(
        [
            Author.find().sort({family_name:1}).exec(),
            Genre.find().sort({name:1}).exec(),
        ]
    );
    res.render("book_form",{
        title: "Create Book",
        authors: allAuthors,
        genres: allGenres,
    });
});

exports.book_create_post = [
    (req, res,next) => {
      if(!Array.isArray(req.body.genre)){
        req.body.genre= typeof req.body.genre === "undefined" ? [] : [req.body.genre];
      }
      next()
 },
  body("title", "Title must not be empty").trim().isLength({min: 1}).escape(),
  body("author", "Author must not be empty").trim().isLength({min: 1}).escape(),
  body("summary", "Summary must not be empty").trim().isLength({min:1}).escape(),
  body("isbn","ISBN must not be empty").trim().isLength({min: 1}).escape(),
  body("genre.*").escape(),   //wildcard to individually validate each of genre array entries

  asyncHandler(async(req,res,next)=>{
    const errors= validationResult(req);
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        summary: req.body.summary,
        isbn: req.body.isbn,
        genre: req.body.genre,
    });
    if(!errors.isEmpty()){
        const [allAuthors, allGenres]=await Promise.all([
            Author.find().sort({family_name:1}).exec(),
            Genre.find().sort({name:1}).exec(),
        ]);
        for(const genre of allGenres){
            if(book.genre.includes(genre._id)){
                genre.checked="true";
            }
        }
        res.render("book_form",{
            title: "Create Book",
            authors: allAuthors,
            genres: allGenres,
            book: book,
            errors: errors.array(), 
        });
    }
    else{
        await book.save();
        res.redirect(book.url);
    }
  }),
];

exports.book_delete_get = (req, res) => {
    res.send("NOT IMPLEMENTED: Book delete GET");
};

exports.book_delete_post = (req, res) => {
    res.send("NOT IMPLEMENTED: Book delete POST");
};

exports.book_update_get = asyncHandler(async(req, res, next) => {
    const [book, allAuthors, allGenres]= await Promise.all([
        Book.findById(req.params.id).populate("author").exec(),
        Author.find().sort({family_name:1}).exec(),
        Genre.find().sort({name: 1}).exec(),
    ]);
    if(book===null){
        const err= new Error("Book not found");
        err.status=404;
        return next(err);
    }
    allGenres.forEach((genre)=>{
        if(book.genre.includes(genre._id))genre.checked="true";
    });
    res.render("book_form",{
        title: "Update Book",
        authors:allAuthors,
        genres: allGenres,
        book: book,
    });
});

exports.book_update_post =[
     (req, res,next) => {
        if(!Array.isArray(req.body.genre)){
            req.body.genre= typeof req.body.genre=== "undefined" ? []:
            [req.body.genre];
        }
        next();
    },
    body("title","Title must not be empty").trim().isLength({min:1}).escape(),
    body("author", "Author must not be empty").trim().isLength({min: 1}).escape(),
    body("summary", "Summary must not be empty").trim().isLength({min: 1}).escape(),
    body("isbn","ISBN must not be empty").trim().isLength({min:1 }).escape(),
    body("genre.*").escape(),
    asyncHandler(async(req,res,next)=>{
        const errors= validationResult(req);
        const book = new Book({
            title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: typeof req.body.genre === "undefined" ? [] : req.body.genre,
            _id: req.params.id,
        })
        if(!errors.isEmpty()){
            const [allAuthors , allGenres]= await Promise.all([
                Author.find().sort({family_name:1}).exec(),
                Genre.find().sort({name:1}).exec(),
            ]);
            for(const genre of allGenres){
                if(book.genre.indexOf(genre._id)>-1){
                    genre.checked = "true";
                }
            }
            res.render("book_form",{
                title: "Update Book",
                authors: allAuthors,
                genres: allGenres,
                book: book,
                errors: errors.array(),
            });
            return;
        }
        else{
            const updatedBook = await Book.findByIdAndUpdate(req.params.id,book,{});
            Book.findByIdAndUpdate(req.params.id, book, {});
            res.redirect(updatedBook.url);
        }
    }),
];

exports.book_detail = asyncHandler(async(req, res,next) => {
     const [book,bookinstances]=await Promise.all([
        Book.findById(req.params.id).populate("author").populate("genre").exec(),
        BookInstance.find({book:req.params.id}).exec(),
    ]);
    if(book===null){
        const err= new Error("No Book");
        err.status=404;
        return next(err);
    }
    res.render("book_detail",{
        title:book.title,
        book: book,
        book_instances : bookinstances
    });
});
