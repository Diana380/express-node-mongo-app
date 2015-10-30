var mongoose = require('mongoose');  
var venueSchema = new mongoose.Schema({  
  name: String,
  streetAddress: String,
  town: String,
  postCode: String,
  contactName : String,
  contactNumber: String,
  type : String,
  surfaceType: String
});
mongoose.model('Venue', venueSchema);

