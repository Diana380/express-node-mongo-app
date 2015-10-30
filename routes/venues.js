var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'); //used to manipulate POST

//Any requests to this controller must pass through this 'use' function
//Copy and pasted from method-override
router.use(bodyParser.urlencoded({ extended: true }))
router.use(methodOverride(function(req, res){
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
      }
}))

//build the REST operations at the base for venues
//this will be accessible from http://127.0.0.1:3000/venues if the default route for / is left unchanged
router.route('/')
    //GET all venues
    .get(function(req, res, next) {
        //retrieve all venues from Mongo
        mongoose.model('Venue').find({}, function (err, venues) {
              if (err) {
                  return console.error(err);
              } else {
                  
                  res.format({
                      
                    html: function(){
                        res.render('venues/index', {
                              title: 'All my Venues',
                              "venues" : venues
                          });
                    },
                    //JSON response will show all venues in JSON format
                    json: function(){
                        res.json(venues);
                    }
                });
              }     
        });
    })
    //POST a new venue
    .post(function(req, res) {     
       var name = req.body.name;
       var streetAddress = req.body.streetAddress;
       var town = req.body.town;
       var postCode = req.body.postCode;
       var contactName = req.body.contactName;
       var contactNumber =  req.body.contactNumber;
       var type = req.body.type;
       var surfaceType = req.body.surfaceType;
        //call the create function for the database
        mongoose.model('Venue').create({
            name : name,
            streetAddress: streetAddress,
            town : town,
            postCode : postCode,
            contactName: contactName,
            type : type,
            surfaceType : surfaceType
        }, function (err, venue) {
              if (err) {
                  res.send("There was a problem adding the information to the database.");
              } else {
                  //venue has been created
                  console.log('POST creating new venue: ' + venue);
                  res.format({
                      //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
                    html: function(){
                        
                        res.location("venues");
                        // And forward to success page
                        res.redirect("/venues");
                    },
                    //JSON response will show the newly created venue
                    json: function(){
                        res.json(venue);
                    }
                });
              }
        })
    });

/* GET New Venue page. */
router.get('/new', function(req, res) {
    res.render('venues/new', { title: 'Add New Venue' });
});

// route middleware to validate :id
router.param('id', function(req, res, next, id) {
    //console.log('validating ' + id + ' exists');
    //find the ID in the Database
    mongoose.model('Venue').findById(id, function (err, venue) {
        //if it isn't found, we are going to repond with 404
        if (err) {
            console.log(id + ' was not found');
            res.status(404)
            var err = new Error('Not Found');
            err.status = 404;
            res.format({
                html: function(){
                    next(err);
                 },
                json: function(){
                       res.json({message : err.status  + ' ' + err});
                 }
            });
        //if it is found we continue on
        } else {
            
            console.log(venue);
            // once validation is done save the new item in the req
            req.id = id;
            
            next(); 
        } 
    });
});

router.route('/:id')
  .get(function(req, res) {
    mongoose.model('Venue').findById(req.id, function (err, venue) {
      if (err) {
        console.log('GET Error: There was a problem retrieving: ' + err);
      } else {
        console.log('GET Retrieving ID: ' + venue._id);
        res.format({
          html: function(){
              res.render('venues/show', {
                "venue" : venue
              });
          },
          json: function(){
              res.json(venue);
          }
        });
      }
    });
  });

router.route('/:id/edit')
	//GET the individual venue by Mongo ID
	.get(function(req, res) {
	    //search for the venue within Mongo
	    mongoose.model('Venue').findById(req.id, function (err, venue) {
	        if (err) {
	            console.log('GET Error: There was a problem retrieving: ' + err);
	        } else {
	            //Return the venue
	            console.log('GET Retrieving ID: ' + venue._id);
	            res.format({
	                //HTML response will render the 'edit.jade' template
	                html: function(){
	                       res.render('venues/edit', {
	                          title: 'Venue' + venue._id,
	                          "venue" : venue
	                      });
	                 },
	                 //JSON response will return the JSON output
	                json: function(){
	                       res.json(venue);
	                 }
	            });
	        }
	    });
	})
	//PUT to update a venue by ID
	.put(function(req, res) {
	    // Get our REST or form values. These rely on the "name" attributes
	    var name = req.body.name;
       var streetAddress = req.body.streetAddress;
       var town = req.body.town;
       var postCode = req.body.postCode;
       var contactName = req.body.contactName;
       var contactNumber =  req.body.contactNumber;
       var type = req.body.type;
       var surfaceType = req.body.surfaceType;

	    //find the document by ID
	    mongoose.model('Venue').findById(req.id, function (err, venue) {
	        //update it
	        venue.update({
	          name : name,
            streetAddress: streetAddress,
            town : town,
            postCode : postCode,
            contactName: contactName,
            type : type,
            surfaceType : surfaceType
	        }, function (err, venueID) {
	          if (err) {
	              res.send("There was a problem updating the information to the database: " + err);
	          } 
	          else {
	                  //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
	                  res.format({
	                      html: function(){
	                           res.redirect("/venues/" + venue._id);
	                     },
	                     //JSON responds showing the updated values
	                    json: function(){
	                           res.json(venue);
	                     }
	                  });
	           }
	        })
	    });
	})
	//DELETE a Venue by ID
	.delete(function (req, res){
	    //find venue by ID
	    mongoose.model('Venue').findById(req.id, function (err, venue) {
	        if (err) {
	            return console.error(err);
	        } else {
	            //remove it from Mongo
	            venue.remove(function (err, venue) {
	                if (err) {
	                    return console.error(err);
	                } else {
	                    //Returning success messages saying it was deleted
	                    console.log('DELETE removing ID: ' + venue._id);
	                    res.format({
	                        //HTML returns us back to the main page, or you can create a success page
	                          html: function(){
	                               res.redirect("/venues");
	                         },
	                         //JSON returns the item with the message that is has been deleted
	                        json: function(){
	                               res.json({message : 'deleted',
	                                   item : venue
	                               });
	                         }
	                      });
	                }
	            });
	        }
	    });
	});

module.exports = router;