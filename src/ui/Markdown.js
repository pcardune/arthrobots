
var React = require('react');

var showdown = require('showdown');

var converter = new showdown.Converter();

var Markdown = React.createClass({
  render: function() {
  	if (!this.props.children) {
  		return <div />
  	}
    return (
      <div
        dangerouslySetInnerHTML={{
          __html: converter.makeHtml(this.props.children)
        }}
      />
    );
  }
});
module.exports = Markdown;