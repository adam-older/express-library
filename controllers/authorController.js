var Author = require('../models/author');
const Book = require('../models/book');
const { body, validationResult } = require('express-validator');
var async = require('async');

// Display list of all Authors.
exports.author_list = function(req, res, next) {

  Author.find()
    .sort([['last_name', 'ascending']])
    .exec(function (err, list_authors) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('author_list', { title: 'Author List', author_list: list_authors });
    });

};

// Display detail page for a specific Author.
exports.author_detail = function(req, res, next) {
  async.parallel({
    author: function(callback) {
      Author.findById(req.params.id)
        .exec(callback);
    },
    author_books: function(callback) {
      Book.find({'author' : req.params.id })
        .exec(callback);
    }
  }, function(err, results) {
    if (err) return next(err);
    if (results.author == null) {
      var err = new Error('Author not found');
      err.status = 404;
      return next(err);
    }
    res.render('author_detail', { author: results.author, author_books: results.author_books});
  })
};

// Display Author create form on GET.
exports.author_create_get = function(req, res) {
  res.render('author_form', { title: 'Create Author' });
};

// Handle Author create on POST.
exports.author_create_post = [ 
  // validate and sanitize fields
  body('first_name').trim().isLength({ min: 1 }).escape().withMessage('First name must be specified.')
    .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
  body('last_name').trim().isLength({ min: 1 }).escape().withMessage('Last name must be specified.')
    .isAlphanumeric().withMessage('Last name has non-alphanumeric characters.'),
  body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601().toDate(),
  body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601().toDate(),

  // Process request
  (req, res, next) => {
    // Extract validation errors from request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // handle errors
      res.render('author_form', { title: 'Create Author', author: req.body, errors: errors.array() })
    } else { // data form is valid
      // create an Author object with escaped and trimmed data
      var author = new Author( {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        date_of_birth: req.body.date_of_birth,
        date_of_death: req.body.date_of_death
      });
      author.save(function(err) {
        if (err) return next(err);
        // successful = redirect to created author record
        res.redirect(author.url);
      })
    }
  }
];

// Display Author delete form on GET.
exports.author_delete_get = async (req, res, next) => {
  try {
    var author = await Author.findById(req.params.id);
    var author_books = await Book.find({ 'author': req.params.id });
    res.render('author_delete', {title:'Delete Author', author, author_books });
  } catch (err) {
    next(err);
  }
}

// Handle Author delete on POST.
exports.author_delete_post = async (req, res, next) => {
  try {
    var author = await Author.findById(req.params.id);
    var author_books = await Book.find({ 'author': req.params.id });
    if (author_books.length > 0) {
      res.render('author_delete', {title:'Delete Author', author, author_books });
    } else {
      await Author.findByIdAndDelete(req.params.id);
      await res.redirect('/catalog/authors');
    }
  } catch (err) {
    next(err);
  }
};

// Display Author update form on GET.
exports.author_update_get = function(req, res) {
  res.send('NOT IMPLEMENTED: Author update GET');
};

// Handle Author update on POST.
exports.author_update_post = function(req, res) {
  res.send('NOT IMPLEMENTED: Author update POST');
};