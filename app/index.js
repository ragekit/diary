var Diary = require("./diary");

App = {};
var data = [4, 8, 15, 16, 23, 42];

App.start = function(){
	var body = d3.select("body");
	var div = body.append("div");
    div.selectAll("div").data(data).enter().append("div").style("width", function(d) { return d * 10 + "px"; }).text(function(d) { return d; });

	Diary.getData(function(data){
		console.log(data);
	})
}

module.exports = App;