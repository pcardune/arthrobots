
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});

Parse.Cloud.define("getLeaderboard", function(request, response) {
  var query = new Parse.Query("ProgramModel");
  query.equalTo('finished', true);
  query.find({
    success: function(programs) {
      programsByOwner = {};
      for (var i = 0; i < programs.length; i++) {
        var program = programs[i];
        if (!programsByOwner[program.get('owner').id]) {
          programsByOwner[program.get('owner').id] = {owner:program.get('owner'), programs:[program]};
        } else {
          programsByOwner[program.get('owner').id].programs.push(program);
        }
      }
      var toSort = [];
      for (var owner in programsByOwner) {
        var data = programsByOwner[owner]
        toSort.push({owner:data.owner.id, programCount:data.programs.length});
      }
      toSort.sort(function(a, b) { return b.programCount - a.programCount });
      var leaderboard = toSort.slice(0, request.params.num);
      response.success(leaderboard);
    }.bind(this),
    error: function() {
      response.error("failed to compute leaderboard");
    }
  });
});