

Meteor.startup(function () {

//Configuration/Adding routes 'must'be done from within the Meteor.startup() callback. 


Restivus.configure({
	
api_path: 'api/new', //changed from 'api/v1'
use_auth: true,
pretty_json: true
//auth user: //IMPORTANT for later steps 
});



// Given a url e.g. "/anime/5"
Restivus.add('/anime/:_id', {

get: function () {
	authRequired: false
    action: function () {
    	
    var response = {anime: Anime.findOne({_id: this.urlParams._id})}; 
    

   return {
      invalidInput: function() {
			return [400, {
				success: 'false',
				message: 'Invalid input'
			}];
		},
     responseJSON: function(response,responseCode) {
     if (responseCode)
				return [responseCode, {'Content-Type': 'application/json'}, response];
			else
				return [200, {'Content-Type': 'application/json'}, response];
     		}
      
        }
      };
    }
  }
});


// Given the url: "/anime?q={searched}"
Restivus.add('/anime', {
  get: function () {
    //var id = this.urlParams._id;
    var query = this.queryParams; // query.q -> {searched}

    var search = function() { EasySearch.search('anime', query, function (err, data) {
    // data.total contains a number of all found results
    // data.results contains all the limited results

    return data.total;
     });
   }

   return search;
  }
});




// Given a url e.g. "/user/5" - need to setup authentication for the function to be called since all JSON data is being passed
Restivus.add('/user/:_id', {

get: function () {
    
    var user_id = this.urlParams._id; // "5"
    var response = {user: Meteor.users.findOne({_id: user_id)}; 
    
    authRequired: true 
    action: function () {
    return response;
   }
  }
});



Restivus.add('libraryEntries/:id.', {authRequired: true}, {
  get: function () {
    authRequired: false
    action: function () {
      // GET entry
    }
  },
  post: function () {
    // POST entry
  },
  put: function () {
    // PUT entry
  },
  patch: function () {
    // entry
  },
  delete: function () {
    // entry
  }

});




}//end of startup function
