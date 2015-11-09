var React = require('react');

var CodeMirror = require('react-code-mirror');

require('./CodeEditor.css');
var CodeEditor = React.createClass({
  getInitialState: function() {
    return {
      editing: true,
      selectedLine: null
    };
  },

  getValue: function() {
    return this.refs.editor.editor.getValue();
  },

  render: function() {
    if (this.state.editing || true) {
      return (
        <CodeMirror
          {...this.props}
          ref="editor"
          lineNumbers={true}
          indentWithTabs={false}
          extraKeys={{
            Tab: function(cm) {
              var spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
              cm.replaceSelection(spaces);
            }
          }}
          viewportMargin={Infinity}
          textAreaClassName="form-control"
          className="CodeEditor"
          theme="solarized"/>
      );
      // return <textarea {...this.props} ref="textarea" className="CodeEditor editing form-control"/>;
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