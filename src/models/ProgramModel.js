var assign = require('object-assign');
var ServerActionCreators = require('../actions/ServerActionCreators');


var ProgramModel = Parse.Object.extend("ProgramModel");

assign(ProgramModel, {
  fetchPrograms: function() {
    var query = new Parse.Query(ProgramModel);
    query.equalTo("owner", Parse.User.current());
    query.include('world');
    query.find({success: ServerActionCreators.receivePrograms});
  },

  saveProgram: function(data, program, callback) {
    program.save(data, {
      success: function(program) {
        ServerActionCreators.receivePrograms([program]);
        callback();
      },
      error: function(program, error) {
        alert("There was an error while saving the program: "+error.code+" "+error.message);
      }
    });
  }
});

module.exports = ProgramModel;