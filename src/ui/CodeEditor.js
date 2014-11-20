/** @jsx React.DOM */
var React = require('react');

require('./CodeEditor.css');
var CodeEditor = React.createClass({
  render: function() {
    return <textarea {...this.props} className="CodeEditor form-control"/>;
  }
});

module.exports = CodeEditor;