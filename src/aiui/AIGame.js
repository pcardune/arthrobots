/** @jsx React.DOM */
var Button = require('react-bootstrap').Button
var React = require('react');
var CodeEditor = require('../ui/CodeEditor');
var AIWorldCanvas = require('./AIWorldCanvas');

var AIWorld = require('../aicore/AIWorld');
var AIRobot = require('../aicore/AIRobot');
var AISimulator = require('../aicore/AISimulator');
var AICanvasRenderer = require('../aicore/AICanvasRenderer');

var AIGame = React.createClass({

  preloadGame: function() {
    this.game.load.image('metal', '/assets/metal-background.jpg');
    this.game.load.image('robot', '/assets/robot.png');
  },

  createGame: function() {
    this.game.physics.startSystem(Phaser.Physics.ARCADE)
    this.game.world.setBounds(0,0,500,500);
    var background = this.game.add.sprite(-200, -100, 'metal');


    this.world = new AIWorld();

    var robotSprite = this.game.add.sprite(50, this.game.world.height - 150, 'robot');
    robotSprite.anchor.x = robotSprite.anchor.y = .5;
    this.game.physics.arcade.enable(robotSprite);
    this.robot = new AIRobot({x:250, y:250, angle:0, world:this.world, sprite:robotSprite, game:this.game});
    this.world.addRobot(this.robot);
    this.augmentBot(this.props.code);

    this.simulator = new AISimulator(this.world, this.game);
  },

  updateGame: function() {
    this.simulator.tick();
  },

  augmentBot: function(code) {
    js = 'var extendWith = '+code+';'
    try {
      eval(js);
    } catch (e) {
      console.warn(e);
      return;
    }
    for (var key in extendWith) {
      this.robot[key] = extendWith[key];
    }
  },

  componentDidMount: function() {
    this.game = new Phaser.Game(
      500, 500, Phaser.AUTO, this.refs.canvas.getDOMNode(),
      {
        create: this.createGame,
        preload: this.preloadGame,
        update: this.updateGame
      });
  },

  componentWillReceiveProps: function (newProps){
    if (newProps.code != this.props.code) {
      this.augmentBot(newProps.code);
    }
  },

  render: function() {
    return (
      <div ref="canvas" />
    );
  }
});

module.exports = AIGame;