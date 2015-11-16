import Parse from 'parse'
var React = require('react')
var FluxMixin = require('fluxxor').FluxMixin(React)
var StoreWatchMixin = require('fluxxor').StoreWatchMixin

import CodeRunner from './CodeRunner'
var ProgramModel = require('../models/ProgramModel')

require('./ProgramEditor.css')
var ProgramEditor = React.createClass({

  mixins: [FluxMixin, StoreWatchMixin("ProgramStore")],

  getDefaultProps: function() {
    return {
      worldModel: null,
      onFinished: function(){},
      onContinue: function(programModel){}
    }
  },

  getStateFromFlux: function() {
    var programStore = this.getFlux().store("ProgramStore")
    var programModel = programStore.getProgramForWorld(this.props.worldModel.id)
    return {
      programModel: programModel,
      isSaving: programStore.isLoading()
    }
  },

  componentDidMount: function() {
    window.setTimeout(function() {
      this.getFlux().actions.loadPrograms()
    }.bind(this))
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.worldModel != this.props.worldModel) {
      window.setTimeout(function() {
        this.setState(this.getStateFromFlux())
      }.bind(this))
    }
  },

  handleSaveAndRun: function(callback) {
    var program = this.state.programModel
    if (!program) {
      program = new ProgramModel()
      program.set('owner', Parse.User.current())
      program.set('world', this.props.worldModel)
      var acl = new Parse.ACL()
      acl.setPublicReadAccess(true)
      acl.setWriteAccess(Parse.User.current().id, true)
      program.setACL(acl)
    }
    var code = this.refs.codeRunner.state.programCode
    if (program.get('code') == code) {
      callback(program)
      return
    }
    this.getFlux().actions.saveProgram(
      {code:code},
      program,
      callback
    )
  },

  handleFinished: function() {
    if (this.state.programModel.get('finished')) {
      // already finished
      this.props.onFinished(this.state.programModel)
    } else {
      this.state.programModel.set('finished', true)
      this.state.programModel.save({
        success: function(program) {
          Parse.Analytics.track('finishedWorld', {world:this.props.worldModel.id})
          this.setState({programModel:program})
          this.props.onFinished(program)
        }.bind(this)
      })
    }
  },

  handleContinue: function() {
    this.props.onContinue(this.state.programModel)
  },

  render: function() {
    return (
      <CodeRunner
        ref="codeRunner"
        world={this.props.worldModel}
        isSaving={this.state.isSaving}
        initialCode={this.state.programModel ? this.state.programModel.get('code') : ''}
        onFinished={this.handleFinished}
        onSaveAndRun={this.handleSaveAndRun}
        onContinue={this.handleContinue}/>
    )
  }
})

export default ProgramEditor