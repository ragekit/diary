var yaml = require('yamljs');
var yamlPath = "C:/Users/Benjamin/Documents/Dropbox/datadiary.yaml";
var data  = yaml.load(yamlPath);
var Datastore = require('nedb')
  , db = new Datastore({ filename: './db', autoload: true })

var moment = require("moment");

var projects = [];
for (var i = 0; i < data.length; i++) {
	var date = data[i];
	for(var key in date)
	{
		var projectLog = date[key];
		for (var j = 0; j < projectLog.length; j++) {
			var log = projectLog[j];
			for(var key2 in log)
			{
				if(projects[key2.toString().toLowerCase()] == undefined)
				{
					projects[key2.toString().toLowerCase()] = [];
				}
			
				var l = log[key2];
				l.start = l.start.split("h").join(" ");
				l.end = l.end.split("h").join(" ");
				console.log(key + " " + l.start);
				console.log(key + " " + l.end);
				l.start = moment(key + " " + l.start, "DD/MM/YYYY HH mm ");
				l.end  = moment(key + " " + l.end, "DD/MM/YYYY HH mm ");
				console.log(l.start.format("D MMMM YYYY, H:mm:ss"));
				console.log(l.end.format("D MMMM YYYY, H:mm:ss"));
				projects[key2.toString().toLowerCase()].push(l);
			}
		}
	}	
}

var projectSchema = function(){
	this.name = "";
	this.logs = [];
	this._started = false;
}

var dbproject = []

for(var key in projects)
{
	var p = new projectSchema();
	p.name = key.toString();
	dbproject.push(p);
	var project = projects[key];
	project = project.sort(function(a,b){
		return a.start.valueOf() - b.start.valueOf();
	})
	for (var i = 0; i < project.length; i++) {
		p.logs.push(project[i]);
	}
}


for (var i = 0; i < dbproject.length; i++) {
	db.insert(dbproject[i]);
};