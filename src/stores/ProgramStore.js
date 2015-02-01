var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var Constants = require('../constants/Constants');
var assign = require('object-assign');
var ProgramModel = require('../models/ProgramModel');
var Fluxxor = require('fluxxor');

var CHANGE_EVENT = 'change';

var ProgramStore = Fluxxor.createStore({
  initialize: function() {
    this.loading = false;
    this.error = null;
    this.programs = {};
    this.bindActions(
      Constants.ActionTypes.LOAD_PROGRAMS, this.onLoadPrograms,
      Constants.ActionTypes.LOAD_PROGRAMS_SUCCESS, this.onLoadProgramsSuccess,
      Constants.ActionTypes.LOAD_PROGRAMS_FAIL, this.onLoadProgramsFail,

      Constants.ActionTypes.SAVE_PROGRAM, this.onLoadPrograms,
      Constants.ActionTypes.SAVE_PROGRAM_SUCCESS, this.onLoadProgramsSuccess,
      Constants.ActionTypes.SAVE_PROGRAM_FAIL, this.onLoadProgramsFail
    );
  },

  onLoadPrograms: function() {
    this.loading = true;
    this.emit(CHANGE_EVENT);
  },

  onLoadProgramsSuccess: function(payload) {
    this.loading = false;
    this.error = null;
    payload.programs.forEach(function(program){
      this.programs[program.id] = program;
    }.bind(this));
    this.emit(CHANGE_EVENT);
  },

  onLoadProgramsFail: function(payload) {
    this.loading = false;
    this.error = payload.error;
    this.emit(CHANGE_EVENT);
  },

  isLoading: function() { return this.loading; },

  getError: function() { return this.error; },

  getAllPrograms: function() {
    var programs = [];
    for (var id in this.programs) {
      var program = this.programs[id]
      programs.push(program);
    }
    programs.sort(function (a, b) { return a.createdAt < b.createdAt ? -1 : 1; });
    return programs;
  },

  getProgram: function(id) {
    return this.programs[id];
  },

  getProgramForWorld: function(worldId) {
    programs = []
    for (var id in this.programs) {
      var program = this.programs[id];
      if (program.get('world') && program.get('world').id == worldId) {
        programs.push(program);
      }
    }
    programs.sort(function(a, b) { return a.createdAt - b.createdAt; });
    return programs[0] || null;
  }
});

module.exports = ProgramStore;