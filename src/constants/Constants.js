var keyMirror = require('keymirror');

var Constants = {
  PayloadSources: keyMirror({
    VIEW_ACTION: null,
    SERVER_ACTION: null
  }),

  ActionTypes: keyMirror({
    LOAD_PROGRAMS: null,
    LOAD_PROGRAMS_SUCCESS: null,
    LOAD_PROGRAMS_FAIL: null,

    SAVE_PROGRAM: null,
    SAVE_PROGRAM_SUCCESS: null,
    SAVE_PROGRAM_FAIL: null,

    LOAD_TRACKS_AND_WORLDS: null,
    LOAD_TRACKS_AND_WORLDS_SUCCESS: null,
    LOAD_TRACKS_AND_WORLDS_FAIL: null,

    LOAD_TRACKS: null,
    LOAD_TRACKS_SUCCESS: null,
    LOAD_TRACKS_FAIL: null,

    LOAD_WORLDS: null,
    LOAD_WORLDS_SUCCESS: null,
    LOAD_WORLDS_FAIL: null,

    ADD_WORLD: null,
    ADD_WORLD_SUCCESS: null,
    ADD_WORLD_FAIL: null,

    DESTROY_WORLD: null,
    DESTROY_WORLD_SUCCESS: null,
    DESTROY_WORLD_FAIL: null,

    SAVE_WORLD: null,
    SAVE_WORLD_SUCCESS: null,
    SAVE_WORLD_FAIL: null,
    SAVE_WORLD_LOCAL: null
  })
};

module.exports = Constants;