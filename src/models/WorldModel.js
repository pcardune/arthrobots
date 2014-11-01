var Parse = require('parse').Parse;

var ProgramModel = require('./ProgramModel');

var WorldModel = Parse.Object.extend("WorldModel", {
  loadCurrentUserPrograms: function(success) {
    var query = new Parse.Query(ProgramModel);
    query.equalTo("world", this);
    query.equalTo("owner", Parse.User.current());
    query.find({
      success: success,
      error: function() {
        alert("there was an error loading programs:"+error.code+" "+error.message);
      }
    });
  }
});



module.exports = WorldModel;