var State = require('react-router').State;
var Button = require('react-bootstrap').Button;
var Glyphicon = require('react-bootstrap').Glyphicon;
var Link = require('react-router').Link;
var Jumbotron = require('react-bootstrap').Jumbotron;
var History = require('react-router').History;
var OverlayTrigger = require('react-bootstrap').OverlayTrigger;
var Tooltip = require('react-bootstrap').Tooltip;
var React = require('react');
var assign = require('object-assign');
var FluxMixin = require('fluxxor').FluxMixin(React);
var StoreWatchMixin = require('fluxxor').StoreWatchMixin;

var Markdown = require('../Markdown');
import ProgramEditor from '../ProgramEditor'
var TrackBadge = require('../TrackBadge');
var LoadingBlock = require('../LoadingBlock');

var WorldModel = require('../../models/WorldModel');
var TrackModel = require('../../models/TrackModel');
var ProgramModel = require('../../models/ProgramModel');
var TrackStore = require('../../stores/TrackStore');
var WorldStore = require('../../stores/WorldStore');
var ProgramStore = require('../../stores/ProgramStore');

require('./TrackPage.css');
var TrackPage = React.createClass({

  mixins: [State, FluxMixin, StoreWatchMixin("WorldStore", "TrackStore")],

  getStateFromFlux: function() {
    var trackStore = this.getFlux().store("TrackStore");
    var worldStore = this.getFlux().store("WorldStore");
    var programStore = this.getFlux().store("ProgramStore");
    return {
      trackModel: trackStore.getTrack(this.props.params.trackId),
      worldModels: worldStore.getWorldsForTrack(this.props.params.trackId),
      programModels: programStore.getAllPrograms(),
      isLoading: trackStore.isLoading() || worldStore.isLoading()
    }
  },

  getInitialState: function() {
    return {
      trackComplete: false
    };
  },

  getCurrentWorld: function() {
    var currentWorld = null;
    this.state.worldModels.every(function(world) {
      if (this.props.location.query.worldId == world.id) {
        currentWorld = world;
        return false;
      }
      return true;
    }.bind(this));
    return currentWorld;
  },

  componentDidMount: function() {
    this.getFlux().store("ProgramStore").on("change", this._onChange);
    this.getFlux().store("WorldStore").on("change", this._onChange);
    this.getFlux().actions.loadTracksAndWorlds();
    this.getFlux().actions.loadPrograms();
  },

  _onChange: function() {
    var state = this.getStateFromFlux();
    var transitionedToWorld = false;
    state.worldModels.every(function(world, worldIndex) {
      var worldIsFinished = false;
      state.programModels.every(function(program) {
        if (program.get('world').id == world.id && program.get('finished')) {
          worldIsFinished = true;
          return false;
        }
        return true;
      }.bind(this));
      if (!worldIsFinished && !this.props.location.query.worldId) {
        this.props.history.pushState(null, `/tracks/${this.props.params.trackId}`, {worldId:world.id})
        transitionedToWorld = true;
        return false;
      }
      return true;
    }.bind(this));
    if (!transitionedToWorld && !this.props.location.query.worldId && state.worldModels.length) {
      this.props.history.pushState(null, `/tracks/${this.props.params.trackId}`, {worldId:state.worldModels[0].id});
    }
  },

  componentWillReceiveProps: function(nextProps) {
    if (this.props.params.trackId != this.state.trackModel.id) {
      WorldModel.fetchWorldsForTrack(this.props.params.trackId);
      this.setState({trackComplete: false});
    }
  },

  handleContinue: function(programModel) {
    var currentWorldIndex = null;
    this.state.worldModels.every(function(world, index) {
      if (this.props.location.query.worldId == world.id) {
        currentWorldIndex = index;
        this.state.programModels.some(function(program, index) {
          if (program.id == programModel.id) {
            this.state.programModels[index] = program;
            this.setState({programModels:this.state.programModels});
            return true;
          }
        }.bind(this));
        return false;
      }
      return true;
    }.bind(this));
    var nextWorld = this.state.worldModels[currentWorldIndex + 1];
    if (nextWorld) {
      this.props.history.pushState(null, `/tracks/${this.props.params.trackId}`, {worldId:nextWorld.id});
    } else {
      this.setState({trackComplete: true});
    }
  },

  handleFinished: function(world, program) {
    var foundProgram = false;
    var programModels = this.state.programModels.map(function(programModel){
      // swap out the old program for the new program
      if (programModel.id == program.id) {
        foundProgram = true;
        return program;
      }
      return programModel;
    });
    if (!foundProgram) {
      programModels.push(program);
    }
    this.setState({programModels:programModels});
  },

  handleNextTrack: function() {
    this.props.history.pushState(null, `/tracks/${this.state.trackModel.get('nextTrack').id}`);
  },

  renderComplete: function() {
    if (this.state.trackModel.get('nextTrack')) {
      return (
        <Jumbotron>
          <h1>{this.state.trackModel.get('name')} Track Complete!</h1>
          <p>
            You are full of awesome sauce. Now it is time to keep going on your quest for awesomeness.<br />
            Check out the next track by clicking the button below.
          </p>
          <p>
            <Button bsStyle="primary" bsSize="large" onClick={this.handleNextTrack}>Next Track</Button>
          </p>
          <p>
            Or continue learning how to program by checking out these other sites:
          </p>
          <p>
            <a target="_blank" href="http://www.codecademy.com/">codecademy.com</a><br />
            <a target="_blank" href="http://code.org/">code.org</a><br />
            <a target="_blank" href="https://codecombat.com/">codecombat.com</a><br />
          </p>
        </Jumbotron>
      );
    } else {
      return (
        <Jumbotron>
          <h1>All Tracks Complete!</h1>
          <p>
            Wow, you just don{"'"}t quit!
          </p>
          <p>
            There are no more levels left for you to finish. Check back later for more.
          </p>
        </Jumbotron>
      );
    }
  },

  render: function() {
    if (this.state.isLoading || !this.getCurrentWorld()) {
      return <LoadingBlock/>;
    } else if (this.state.worldModels.length == 0) {
      return <div>There are no worlds here yet</div>;
    } else if (this.state.trackComplete) {
      return this.renderComplete();
    }
    var worldList = this.state.worldModels.map(function(world, index){
      var isActive = world.id == this.getCurrentWorld().id;
      var isFinished = false;
      this.state.programModels.forEach(function(program) {
        if (program.get('world') && program.get('world').id == world.id && program.get('finished')) {
          isFinished = true;
        }
      }.bind(this));
      return (
        <li
          key={world.id}
          className={(isActive ? "active":"") + (isFinished ? " finished" : "")}>
          <OverlayTrigger placement="bottom" overlay={<Tooltip id={`world-${world.id}`}>{world.getTitle()}</Tooltip>}>
            <Link to={`/tracks/${this.props.params.trackId}`} query={{worldId:world.id}}>
              {isFinished ? <Glyphicon glyph="star"/> : <Glyphicon glyph="star-empty"/>}
            </Link>
          </OverlayTrigger>
        </li>
      );
    }.bind(this));

    return (
      <div className="TrackPage">
        <nav>
          <ul className="pagination">
            {worldList}
          </ul>
        </nav>
        <div className="row">
          <div className="col-md-4">
            <h3 className="worldTitle">{this.getCurrentWorld().getTitle()}<br/><TrackBadge track={this.state.trackModel}/></h3>
            <Markdown>{this.getCurrentWorld().get('description')}</Markdown>
          </div>
          <div className="col-md-8">
            <ProgramEditor
              ref="programEditor"
              worldModel={this.getCurrentWorld()}
              onContinue={this.handleContinue}
              onFinished={this.handleFinished.bind(this, this.getCurrentWorld())}
            />
          </div>
        </div>
      </div>
    );
  }
});

module.exports = TrackPage;