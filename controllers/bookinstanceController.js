var BookInstance = require('../models/bookinstance');
var Book = require('../models/book');
const { body, validationResult } = require('express-validator');
var async = require('async');

// Display list of all BookInstances.
exports.bookinstance_list = function(req, res, next) {

    BookInstance.find()
      .populate('book')
      .exec(function (err, list_bookinstances) {
        if (err) { return next(err); }
        // Successful, so render
        res.render('bookinstance_list', { title: 'Book Instance List', bookinstance_list: list_bookinstances });
      });
  
  };

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = function(req, res) {
    BookInstance.findById(req.params.id)
        .populate('book')
        .exec(function(err, result) {
            if (err) return next(err);
            if (result == null) {
                var err = new Error('Book Instance not found');
                err.status = 404;
                return next(err);
            }
            res.render('bookinstance_detail', { bookinstance: result })
        })
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = async (req, res, next) => {
    try {
        let books = await Book.find();
        // console.log(books);
        await res.render('bookinstance_form', {title: 'Create Book Intance', book_list: books });
    } catch (err) {
        return next(err);
    }
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
    // parse response
    body('book', 'Book must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('imprint', 'Imprint must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('due_back', 'Invalid Date.').optional({ checkFalsy: true }).isISO8601().toDate(),
    body('status', 'Status must not be empty.').escape(),
    //Process request
    async (req, res, next) => {
        // Extract validation errors
        const errors = validationResult(req);
        
        // create new book instance object
        var bookInstance = new BookInstance(
            {
                book: req.body.book,
                imprint: req.body.imprint,
                due_back: req.body.due_back,
                status: req.body.status,
            }
        );
        if (!errors.isEmpty()) {
            // handle errors by returning to form template
            try {
                let books = await Book.find();
                // console.log(books);
                await res.render('bookinstance_form', {title: 'Create Book Intance', bookinstance: bookInstance  });
            } catch (err) {
                return next(err);
            }
        }
        // Else: data is good, save book instance to database
        try {
            bookInstance.save();
            await res.redirect(bookInstance.url);
        } catch (err) {
            return next(err);
        }
    }
]

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance delete GET');
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance delete POST');
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance update GET');
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance update POST');
};