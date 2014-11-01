/** @jsx React.DOM */
var React = require('react');

require('./CodeEditor.css');
var CodeEditor = React.createClass({
  render: function() {
    return this.transferPropsTo(
      <textarea className="CodeEditor form-control"/>
    );
  }
});

module.exports = CodeEditor;