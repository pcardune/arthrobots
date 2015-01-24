var AppDispatcher = require('../dispatcher/AppDispatcher');
var Constants = require('../constants/Constants')

module.exports = {
  viewWorldsForTrack: function(track) {
    AppDispatcher.handleServerAction({
      type: Constants.ActionTypes.VIEW_WORLDS_FOR_TRACK,
      track: track
    });
  }
};