
var React = require('react');

var Markdown = require('../Markdown');
var LoadingBlock = require('../LoadingBlock');

require('./LeaderboardPage.css');
var aboutUrl = require('../../../ABOUT.md');

var AboutPage = React.createClass({

  getInitialState: function() {
    return {
      content: null
    }
  },

  componentDidMount: function() {
    $.get(aboutUrl, function(content) {
      this.setState({content:content});
    }.bind(this))
  },

  render: function() {
    if (!this.state.content) {
      return <LoadingBlock/>;
    }
    return (
      <div className="row AboutPage">
        <div className="col-md-3">
        </div>
        <div className="col-md-6">
          <Markdown>{this.state.content}</Markdown>
        </div>
      </div>
    );
  }
});

module.exports = AboutPage;