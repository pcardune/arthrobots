var Class = require('./Class');
var lang = require('./lang');
var Runner = Class.extend(
  /** @lends gvr.runner.Runner# */
  {
    /**
     * @class Object for running a program.
     * @constructs
     * @param program See {@link gvr.runner.Runner#program}
     * @param renderer See {@link gvr.runner.Runner#renderer}
     */
    init: function(program, renderer, notify){
      /**
       * The program to run.
       * @type {gvr.lang.Block}
       */
      this.program = program;

      /**
       * The execution stack
       * @type {Array}
       */
      this.stack = [this.program];

      /**
       * The renderer, which gets called after every execution step.
       * @type {gvr.renderer.Renderer}
       */
      this.renderer = renderer;

      /**
       * @private
       */
      this.globals = {};
      this.globals[lang.RUNNER_GLOBAL_KEY] = this;

      /**
       * keeps track of the timeout which pauses program execution.
       * @private
       */
      this.timeout = null;

      /**
       * Keeps track of whether or not the runner is currently running.
       * @type {boolean}
       */
      this.running = false;

      this.notify = notify || function() {};
    },

    /**
     * Print out a human readable representation of the current
     * execution stack
     * @returns Array
     */
    printStackTrace: function(){
      var trace = [];
      for (var i = 0; i < this.stack.length; i++){
        trace.push(this.stack[i].name);
      }
      return trace;
    },

    /**
     * Perform the next execution step.
     * @param Same as the callback parameter for {@link gvr.runner.Runner#run}
     */
    step: function(callback, notify, onError){
      this.run(0, callback, notify, onError, true);
    },

    /**
     * Stop all execution.
     */
    stop: function(){
      window.clearTimeout(this.timeout);
      this.running = false;
    },

    /**
     * Run the program.
     * @param speed The number of milliseconds to wait
     *        before performing the next execution step.
     *        Use 0 for instant execution.
     * @param callback function to call when there is nothing left to run.
     * @param step If true, only one execution step will occur.
     *       If false, execution will continue to happen
     *       until there is an error or the program finishes.
     */
    run: function(speed, callback, notify, onError, step){
      this.running = true;
      var instant = speed === -1;
      speed = speed || 200;

      if (this.stack.length > 0){
        // stepping
        var last = this.stack.pop();
        try {
          var next = last.step(this.globals);
        } catch (e){
          onError && onError(e);
          return;
        }
        this.stack = this.stack.concat(next);
        // rendering and loopback
        if (!instant){
          this.renderer.render();
        }
        notify && notify(this);

        if (next.length > 0){
          if (instant){
            this.run(speed, callback, notify, onError, step);
          } else if (!step){
            this.timeout = window.setTimeout(
              function(){
                this.run(speed, callback, notify, onError, step);
              }.bind(this),
              speed
            );
          }
        } else {
          this.run(speed, callback, notify, onError, step);
        }

      } else {
        this.stop();
        if (this.renderer.world.robot.on){
          console.error("Robot ran out of instructions.");
        }
        if (typeof callback === "function"){
          callback();
        }
        if (instant){
          this.renderer.render();
        }
      }
    }
  });

module.exports = Runner;