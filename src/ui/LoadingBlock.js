/** @jsx React.DOM */


var ProgressBar = require('react-bootstrap').ProgressBar;
var React = require('react');

var LoadingBlock = React.createClass({
  render: function() {
    return (
      <div className="row">
        <div className="col-md-4"></div>
        <div className="col-md-4">
          Loading...
          <ProgressBar active now={100}/>
        </div>
      </div>
    );
  }
});

module.exports = LoadingBlock;