var Constants = require('../constants/Constants');
var Fluxxor = require('fluxxor');

var CHANGE_EVENT = 'change';

var TrackStore = Fluxxor.createStore({
  initialize: function() {
    this.loading = false;
    this.error = null;
    this.tracks = {};
    this.bindActions(
      Constants.ActionTypes.LOAD_TRACKS, this.onLoadTracks,
      Constants.ActionTypes.LOAD_TRACKS_SUCCESS, this.onLoadTracksSuccess,
      Constants.ActionTypes.LOAD_TRACKS_FAIL, this.onLoadTracksFail,

      Constants.ActionTypes.LOAD_TRACKS_AND_WORLDS, this.onLoadTracks,
      Constants.ActionTypes.LOAD_TRACKS_AND_WORLDS_SUCCESS, this.onLoadTracksSuccess,
      Constants.ActionTypes.LOAD_TRACKS_AND_WORLDS_FAIL, this.onLoadTracksFail
    );
  },

  onLoadTracks: function() {
    this.loading = true;
    this.emit(CHANGE_EVENT);
  },

  onLoadTracksSuccess: function(payload) {
    this.loading = false;
    this.error = null;
    payload.tracks.forEach(function(track){
      this.tracks[track.id] = track;
    }.bind(this));
    this.emit(CHANGE_EVENT);
  },

  onLoadTracksFail: function(payload) {
    this.loading = false;
    this.error = payload.error;
    this.emit(CHANGE_EVENT);
  },

  isLoading: function() { return this.loading; },

  getError: function() { return this.error; },

  getAllTracks: function() {
    var tracks = [];
    for (var id in this.tracks) {
      var track = this.tracks[id]
      tracks.push(track);
    }
    tracks.sort(function (a, b) { return a.get('name') < b.get('name') ? -1 : 1; });
    return tracks;
  },

  getTrack: function(id) {
    return this.tracks[id];
  }
});

module.exports = TrackStore;