var assign = require('object-assign');
var ServerActionCreators = require('../actions/ServerActionCreators');


var TrackModel = Parse.Object.extend("TrackModel");

assign(TrackModel, {
  fetchTracks: function() {
    var query = new Parse.Query(TrackModel);
    query.ascending("createdAt");
    query.find({success: ServerActionCreators.receiveTracks});
  }
})

module.exports = TrackModel;