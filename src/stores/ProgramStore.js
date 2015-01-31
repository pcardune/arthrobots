var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var Constants = require('../constants/Constants');
var assign = require('object-assign');
var ProgramModel = require('../models/ProgramModel');

var CHANGE_EVENT = 'change';

var _programs = {};

var ProgramStore = assign({}, EventEmitter.prototype, {

  getAllPrograms: function() {
    var programs = [];
    for (var id in _programs) {
      var program = _programs[id]
      programs.push(program);
    }
    programs.sort(function (a, b) { return a.get('name') < b.get('name') ? -1 : 1; });
    return programs;
  },

  getProgram: function(programId) {
    return _programs[programId];
  },

  getProgramForWorld: function(worldId) {
    programs = []
    for (var id in _programs) {
      var program = _programs[id];
      if (program.get('world') && program.get('world').id == worldId) {
        programs.push(program);
      }
    }
    programs.sort(function(a, b) { return a.createdAt - b.createdAt; });
    return programs[0] || null;
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
      case Constants.ActionTypes.RECEIVE_PROGRAMS:
        action.programs.forEach(function(program) {
          _programs[program.id] = program;
        });
        ProgramStore.emitChange();
        break;
    }

    return true; // No errors. Needed by promise in Dispatcher.
  })

});

module.exports = ProgramStore;