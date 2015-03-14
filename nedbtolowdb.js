var low = require('lowdb');
var Datastore = require('nedb');

db = new Datastore({ filename: "db", autoload: true});


var projectSchema = function(){
	this.name = "";
	this.logs = [];
	this._started = false;
}

lowdb = low('./test.json');


db.find({},function(err,found){
	for (var i = 0; i < found.length; i++) {
		var f = found[i];
		var p = new projectSchema();
		p.name = f.name;
		p.logs = f.logs;
		p._started = f._started;

		lowdb("projects").push(p);
	};

	})