var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var Constants = require('../constants/Constants');
var assign = require('object-assign');
var TrackModel = require('../models/TrackModel');

var CHANGE_EVENT = 'change';

var _tracks = {};

var TrackStore = assign({}, EventEmitter.prototype, {

  getAllTracks: function() {
    var tracks = [];
    for (var id in _tracks) {
      var track = _tracks[id]
      tracks.push(track);
    }
    tracks.sort(function (a, b) { return a.get('name') < b.get('name') ? -1 : 1; });
    return tracks;
  },

  getTrack: function(trackId) {
    return _tracks[trackId];
  },

  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },

  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },

  dispatcherIndex: AppDispatcher.register(function(payload) {
    var action = payload.action;
    var text;

    switch(action.type) {
      case Constants.ActionTypes.RECEIVE_TRACKS:
        action.tracks.forEach(function(track) {
          _tracks[track.id] = track;
        });
        TrackStore.emitChange();
        break;
    }

    return true; // No errors. Needed by promise in Dispatcher.
  })

});

module.exports = TrackStore;