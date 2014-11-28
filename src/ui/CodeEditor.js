/** @jsx React.DOM */
var React = require('react');

require('./CodeEditor.css');
var CodeEditor = React.createClass({
  getInitialState: function() {
    return {editing:true};
  },

  render: function() {
    if (this.state.editing) {
      return <textarea {...this.props} ref="textarea" className="CodeEditor editing form-control"/>;
    } else {
      return (
        <div className="CodeEditor notEditing form-control">
          {this.props.value.split('\n').map(function(line, index){
            return <div className={index == this.props.selectedLine ? "selected" : ''}>{line}</div>;
          }.bind(this))}
        </div>
      );
    }
  }
});

module.exports = CodeEditor;