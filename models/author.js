var mongoose = require('mongoose')

var Schema = mongoose.Schema

var AuthorSchema = new Schema(
  {
    first_name: {type: String, required: true, maxLength: 100},
    last_name: {type: String, required: true, maxLength: 100},
    date_of_birth: {type: Date},
    date_of_death: {type: Date},
  }
)

// Virtual for author's full name (name will come back with first and last)
AuthorSchema
  .virtual('name')
  .get(function () {
    return this.last_name + ", " + this.first_name
  })

// Virtual for author's lifespan
AuthorSchema.virtual('lifespan').get(function() {
  var lifetime_string = '';
  if (this.date_of_birth) {
    lifetime_string = DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED);
  }
  lifetime_string += ' - ';
  if (this.date_of_death) {
    lifetime_string += DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED)
  }
  return lifetime_string;
});

// Virtual for author's url
AuthorSchema.virtual('url').get(function () {
  return '/catalog/author/' + this._id
})

module.exports = mongoose.model('Author', AuthorSchema)
