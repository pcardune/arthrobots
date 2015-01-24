var Dispatcher = require('flux').Dispatcher;
var Constants = require('../constants/Constants');
var assign = require('object-assign');

var AppDispatcher = assign(new Dispatcher(), {

  /**
   * @param {object} action The details of the action, including the action's
   * type and additional data coming from the server.
   */
  handleServerAction: function(action) {
    var payload = {
      source: Constants.PayloadSources.SERVER_ACTION,
      action: action
    };
    this.dispatch(payload);
  },

  /**
   * A bridge function between the views and the dispatcher, marking the action
   * as a view action.  Another variant here could be handleServerAction.
   * @param  {object} action The data coming from the view.
   */
  handleViewAction: function(action) {
    this.dispatch({
      source: Constants.PayloadSources.VIEW_ACTION,
      action: action
    });
  }

});

module.exports = AppDispatcher;