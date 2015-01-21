/** @jsx React.DOM */
var Button = require('react-bootstrap').Button;
var Glyphicon = require('react-bootstrap').Glyphicon;
var Input = require('react-bootstrap').Input;
var Modal = require('react-bootstrap').Modal;
var ModalTrigger = require('react-bootstrap').ModalTrigger;
var Nav = require('react-bootstrap').Nav;
var Navbar = require('react-bootstrap').Navbar;
var Navigation = require('react-router').Navigation;
var State = require('react-router').State;
var React = require('react');

var Markdown = require('../Markdown');
var CodeEditor = require('../CodeEditor');
var TrackDropdown = require('../TrackDropdown');

var WorldModel = require('../../models/WorldModel');
var WorldCanvas = require('../WorldCanvas');

require('./WorldPage.css');
var WorldPage = React.createClass({

  mixins: [Navigation, State],

  getDefaultProps: function() {
    return {
      world: null,
      onWorldChange: function() {}
    };
  },

  render: function() {
    return (
      <div className="WorldPage">
        <div className="row">
          <div className="col-md-2"/>
          <div className="col-md-4">
            <h3>{this.props.world.getTitle()}</h3>
          </div>
        </div>
        <div className="row">
          <div className="col-md-2"/>
          <div className="col-md-4">
            <Markdown>{this.props.world.get('description')}</Markdown>
          </div>
          <div className="col-md-4">
            <WorldCanvas worldDefinition={this.props.world.get('definition')} />
          </div>
        </div>
      </div>
    );
  },

});

module.exports = WorldPage;