import Parse from 'parse'
var Button = require('react-bootstrap').Button
var ButtonToolbar = require('react-bootstrap').ButtonToolbar
var DropdownButton = require('react-bootstrap').DropdownButton
var MenuItem = require('react-bootstrap').MenuItem
var React = require('react')
var OverlayTrigger = require('react-bootstrap').OverlayTrigger
var Tooltip = require('react-bootstrap').Tooltip

var WorldCanvas = require('./WorldCanvas')
var CodeEditor = require('./CodeEditor')
var LoadingBlock = require('./LoadingBlock')

import ProgramParser from '../core/ProgramParser'
import Runner from '../core/Runner'

require('./ProgramEditor.css')
var CodeRunner = React.createClass({

  getDefaultProps: function() {
    return {
      world: null,
      initialCode: '',
      onFinished: function(){},
      onSaveAndRun: function(callback){ callback() },
      onContinue: function(){},
      isSaving: false,
      showStep: 0
    }
  },

  getInitialState: function() {
    var code = this.props.initialCode
    return {
      runState: "",
      completedSteps: 0,
      isFinished: false,
      speed: localStorage.getItem('speed') || 'Medium',
      errors: [],
      lastExecutedLine: null,
      showCheckpointAtIndex: null,

      programCode: code,
      codeIsJS: code.indexOf("(") > 0,
      numTokens: new ProgramParser(code).getNumTokens()
    }
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.world != this.props.world) {
      this.setState({isFinished: false, completedSteps: 0, runState:''})
    }
    if (nextProps.initialCode != this.props.initialCode) {
      var code = nextProps.initialCode
      this.setState({
        programCode: code,
        codeIsJS: code.indexOf("(") > 0,
        numTokens: new ProgramParser(code).getNumTokens()
      })
    }
  },

  handleReset: function() {
    this.refs.worldCanvas.renderWorld()
    this.setState({runState:"", errors:[], completedSteps:0})
    this.refs.codeEditor.setState({editing:true})
  },

  handleDemo: function() {
    Parse.Analytics.track('runDemo', {world:this.props.world.id})
    this.handleReset()
    var demoSolution = this.props.world.get('solution')
    var program = new ProgramParser(demoSolution, this.refs.worldCanvas.world.robot).parse()
    this.runner = new Runner(program, this.refs.worldCanvas.renderer)
    this.setState({runState: "demo"})
    this.runner.run(
      this.getSpeed(),
      this.handleRunnerStopped,
      this.demoDidStep
    )
  },

  demoDidStep: function(runner, lastExpression) {
    var worldSteps = this.props.world.get('steps')
    if (worldSteps && worldSteps.length > this.state.completedSteps) {
      var nextStepWorld = this.props.world.getNewWorldAtStep(this.state.completedSteps)
      if (this.refs.worldCanvas.world.isEqualTo(nextStepWorld)) {
        this.setState({
          completedSteps: this.state.completedSteps + 1
        })
      }
    }
  },

  handleStopDemo: function() {
    this.handleStop()
    this.handleReset()
  },

  handleRun: function() {
    Parse.Analytics.track('runProgram', {world:this.props.world.id})
    this.props.onSaveAndRun(function(){
      this.handleReset()
      var parser = new ProgramParser(this.state.programCode, this.refs.worldCanvas.world.robot)
      if (this.state.programCode.indexOf('(') > 0) {
        //it's javascript
        var js = parser.wrapJSForEval()
        var robot = this.refs.worldCanvas.world.robot
        for (var key in robot) {
          if (typeof robot[key] == "function") {
            robot[key] = robot[key].bind(robot)
          }
        }
        (function(robot) {
          eval(js)
        })(robot)
        this.refs.worldCanvas.renderer.render(1)
        this.handleRunnerStopped()
        return
      }
      try {
        this.program = parser.parse()
      } catch (e) {
        this.setState({runState:"", errors:[e]})
        return
      }
      this.refs.codeEditor.setState({editing:false})
      this.runner = new Runner(this.program, this.refs.worldCanvas.renderer)
      this.handleContinue()
    }.bind(this))
  },

  getSpeed: function() {
    var ms = {"Slow":500,"Medium":200,"Fast":50, "Very Fast":1}
    return ms[this.state.speed]
  },

  handleStop: function() {
    this.runner && this.runner.stop()
    this.setState({runState: "stopped"})
  },

  handleContinue: function() {
    this.setState({runState: "running"})

    this.runner.run(
      this.getSpeed(),
      this.handleRunnerStopped,
      this.runnerDidStep,
      this.runnerDidError
    )
  },

  runnerDidError: function(error) {
    this.setState({
      errors:[error],
      runState:"error"
    })
    this.refs.codeEditor.setState({editing:true})
  },

  runnerDidStep: function(runner, lastExpression) {
    if (lastExpression.instruction.lastExecutedLine) {
      this.setState({lastExecutedLine: lastExpression.instruction.lastExecutedLine})
    }
    var worldSteps = this.props.world.get('steps')
    if (worldSteps && worldSteps.length > this.state.completedSteps) {
      var nextStepWorld = this.props.world.getNewWorldAtStep(this.state.completedSteps)
      if (this.refs.worldCanvas.world.isEqualTo(nextStepWorld)) {
        var isFinished = worldSteps.length <= this.state.completedSteps + 1
        this.setState({
          completedSteps: this.state.completedSteps + 1,
          isFinished: isFinished
        })
        if (isFinished) {
          this.props.onFinished()
        }
      }
    }
  },

  handleStep: function() {
    this.runner.step(
      this.handleRunnerStopped,
      this.runnerDidStep,
      this.runnerDidError
    )
  },

  handleRunnerStopped: function() {
    this.setState({runState: "finished"})
    this.refs.codeEditor.setState({editing:true})
  },

  handleProgramChange: function (event) {
    var numTokens = new ProgramParser(event.target.value).getNumTokens()
    this.setState(
      {
        programCode:event.target.value,
        numTokens: numTokens != null ? numTokens : this.state.numTokens,
        codeIsJS: event.target.value.indexOf("(") >= 0
      }
    )
    this.refs.codeEditor.setState({editing:true})
  },

  handleSpeedClick: function(speed) {
    this.setState({speed:speed})
    Parse.Analytics.track('setSpeed', {speed:speed, world:this.props.world.id})
    this.refs.speedDrowndown.setState({open:false})
    localStorage.setItem('speed', speed)
  },

  handleMouseoverStep: function(index) {
    if (this.state.runState == '') {
      this.setState({showCheckpointAtIndex:index})
    }
  },

  handleMouseoutStep: function(index) {
    this.setState({showCheckpointAtIndex:null})
  },

  render: function() {
    var buttons = []
    if (this.state.runState == "running") {
      buttons = [
        <Button key="1" onClick={this.handleStop} className="pull-right" bsStyle="danger">Stop</Button>
      ]
    } else if (this.state.runState == "stopped") {
      buttons = [
        <Button key="1" onClick={this.handleContinue} className="pull-right" bsStyle="primary">Continue</Button>,
        <Button key="2" onClick={this.handleStep} className="pull-right">Step</Button>,
        <Button key="3" onClick={this.handleReset} className="pull-right">Reset</Button>
      ]
    } else if (this.state.runState == "error" || this.state.runState == "finished") {
      buttons = [
        <Button key="4" onClick={this.handleReset} bsStyle="primary" className="pull-right">Reset</Button>
      ]
    } else if (this.state.runState == 'demo') {
      buttons = <Button onClick={this.handleStopDemo} bsStyle="danger" className="pull-right">Stop Demo</Button>
    } else if (this.state.runState == '') {
      buttons = [
        !this.state.codeIsJS ?
        <DropdownButton key="5" title={"Speed: "+this.state.speed} ref="speedDrowndown" id="speed-dropdown">
          <MenuItem key="1" onClick={this.handleSpeedClick.bind(this, 'Slow')}>Slow</MenuItem>
          <MenuItem key="2" onClick={this.handleSpeedClick.bind(this, 'Medium')}>Medium</MenuItem>
          <MenuItem key="3" onClick={this.handleSpeedClick.bind(this, 'Fast')}>Fast</MenuItem>
          <MenuItem key="4" onClick={this.handleSpeedClick.bind(this, 'Very Fast')}>Very Fast</MenuItem>
        </DropdownButton>
        : null,
        <Button key="6" onClick={this.props.isSaving ? null : this.handleRun} bsStyle="primary" className="pull-right">
          {this.props.isSaving ? "Saving..." : "Save + Run"}
        </Button>,
        this.props.world.get('solution') ?
        <Button key="7" onClick={this.handleDemo} className="pull-right">Demo</Button> : null
      ]
    }
    if (this.props.world && this.props.world.get('steps')) {
      var completedSteps = []
      for (var i = 0; i < this.props.world.get('steps').length; i++) {
        var active = i < this.state.completedSteps
        if (this.props.showStep > 0 && i == this.props.showStep - 1) {
          active = true
        }
        completedSteps.push(
          <div
            key={i}
            onMouseOver={this.handleMouseoverStep.bind(this, i)}
            onMouseOut={this.handleMouseoutStep.bind(this, i)}
            className={"badge "+(active ? "active" : "")}>
            {i+1}
          </div>
        )
      }
    }

    // var helpModal = (
    //   <Modal title="Quick Reference">
    //     <div className="modal-body">
    //       <h4>Instructions</h4>
    //       <pre>
    //         move{'\n'}
    //         turnleft{'\n'}
    //         pickbeeper{'\n'}
    //         putbeeper{'\n'}
    //         turnoff{'\n'}
    //       </pre>
    //       <h4>Conditions</h4>
    //       <pre>
    //         front_is_clear{'\n'}
    //         front_is_blocked{'\n'}
    //         left_is_clear{'\n'}
    //         left_is_blocked{'\n'}
    //         right_is_clear{'\n'}
    //         right_is_blocked{'\n'}
    //         {'\n'}
    //         next_to_a_beeper{'\n'}
    //         not_next_to_a_beeper{'\n'}
    //         any_beepers_in_beeper_bag{'\n'}
    //         no_beepers_in_beeper_bag{'\n'}
    //         {'\n'}
    //         facing_north{'\n'}
    //         not_facing_north{'\n'}
    //         facing_south{'\n'}
    //         not_facing_south{'\n'}
    //         facing_east{'\n'}
    //         not_facing_east{'\n'}
    //         facing_west{'\n'}
    //         not_facing_west{'\n'}
    //       </pre>
    //       <h4>Iteration</h4>
    //       <pre>
    //         {'do <positive_number>:\n'}
    //         {'    <block>'}
    //       </pre>
    //       <pre>
    //         {'while <test>:\n'}
    //         {'    <block>'}
    //       </pre>
    //       <h4>Defining new instructions</h4>
    //       <pre>
    //         {'define <new_name>:\n'}
    //         {'    <block>'}
    //       </pre>
    //     </div>
    //   </Modal>
    // )
    var definition = this.props.world.get('definition')
    if (this.props.showStep > 0) {
      definition = this.props.world.get('steps')[this.props.showStep - 1]
    }
    var worldCanvas = <WorldCanvas ref="worldCanvas" worldDefinition={definition} />
    if (this.state.showCheckpointAtIndex != null) {
      worldCanvas = <WorldCanvas ref="stepCanvas" worldDefinition={this.props.world.get('steps')[this.state.showCheckpointAtIndex]} />
    }

    var languageDetect = null
    if (this.state.codeIsJS) {
      var tooltip = (
        <Tooltip>
          When you have parentheses in your program, it will be executed instantly as straight javascript.
        </Tooltip>
      )
      languageDetect = (
        <OverlayTrigger placement="top" overlay={tooltip}>
          <p className="pull-right"><small>Interpreting as JavaScript</small></p>
        </OverlayTrigger>
      )
    }

    var numTokensTooltip = <Tooltip id="numTokensTooltip">A measure of how long your program is.</Tooltip>
    var numTokens = (
      <OverlayTrigger placement="top" overlay={numTokensTooltip}>
        <small>
          {this.state.numTokens} tokens {this.props.world.get('solution') ?
            <span>compared to {new ProgramParser(this.props.world.get('solution')).getNumTokens()} for the demo solution</span>
            : null}
        </small>
      </OverlayTrigger>
    )

    var codeEditor = null
    if (this.state.isLoading) {
      codeEditor = <LoadingBlock/>
    } else {
      codeEditor = (
        <div>
{
// XXX: upgrade to new modal system
//          <ModalTrigger modal={helpModal}>
//            <Glyphicon glyph="question-sign" className="helpButton"/>
//          </ModalTrigger>
}
          <ButtonToolbar className="buttons">
            {buttons}
          </ButtonToolbar>
          <CodeEditor
            ref="codeEditor"
            selectedLine={this.state.lastExecutedLine}
            onChange={this.handleProgramChange}
            value={this.state.programCode}/>
          {languageDetect}
          {numTokens}
        </div>
      )
    }

    return (
      <div className={"ProgramEditor row"}>
        <div className="col-md-6">
          {codeEditor}
        </div>
        <div className="col-md-6">
          <div className="worldOverlay error">
            {this.state.errors.map(function(e) {
              return <div>{e.message}</div>
            })}
          </div>
          {this.state.isFinished ?
            <div className="worldOverlay success">
              <div>
                Great Success!
                &nbsp
                <Button
                  onClick={function(){this.props.onContinue()}.bind(this)}
                  bsStyle="success">
                  Next Level
                </Button>
              </div>
            </div>
           : null}
          {worldCanvas}
          <div>checkpoints:{completedSteps}</div>
        </div>
      </div>
    )
  }
})

export default CodeRunner