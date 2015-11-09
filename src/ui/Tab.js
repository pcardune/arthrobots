var Link = require('react-router').Link;
var IndexLink = require('react-router').IndexLink;
var React = require('react');

var Tab = React.createClass({

  contextTypes: {
    history: React.PropTypes.object
  },

  render: function() {
    var isActive = this.context.history.isActive(this.props.to, this.props.params, this.props.query);
    var className = isActive ? 'active' : '';
    var link;
    if (this.props.index) {
      link = <IndexLink {...this.props} />;
    } else {
      link = <Link {...this.props} />;
    }
    return <li className={className}>{link}</li>;
  }

});

module.exports = Tab;