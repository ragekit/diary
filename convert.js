var yaml = require('yamljs');
var yamlPath = "C:/Users/Benjamin/Documents/Dropbox/datadiary.yaml";
var mongoose = require('mongoose');
var data  = yaml.load(yamlPath);



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
				var key = key.toString().split("/");
				key.reverse();
				key = key.join("-");
				var l = log[key2];

				l.start = l.start.split("h");
				l.start = l.start.join(":");

				l.start += "+01:00";

				l.end = l.end.split("h");
				l.end = l.end.join(":");
				l.end += "+01:00";

				l.start = new Date(key +"T"+ l.start);
				l.end = new Date(key +"T"+ l.end);
				projects[key2.toString().toLowerCase()].push(l);
			}
		}
	}	
}
//console.log(new Date(Date.now()));

var toRemove = [];

for(var key in projects)
{
	var p = projects[key];
	for(var log in p)
	{
		var l = p[log];
		if(l.end == "Invalid Date")
		{

			var projectLogs = p;

			var corrected = {start:0,end:0};

			var nextDay = new Date(l.start);
			nextDay.setDate(nextDay.getDate()+1);
			//console.log(nextDay);

			for(var plog in projectLogs)
			{
				ll = projectLogs[plog];
				//console.log(ll.start.getHours() +" // "+ nextDay.getDate())

				if(ll.start.getHours() == 0)
				{
					var sdate = new Date(ll.start).setHours(0, 0, 0, 0);
					var edate = new Date(nextDay).setHours(0, 0, 0, 0);
					//console.log(sdate);
					if(sdate == edate)
					{
						toRemove.push(ll);
						toRemove.push(l);

						corrected.start = l.start;
						corrected.end = ll.end;
						p.push(corrected);
						//console.log(corrected);
					}
				}
				
			}

			corrected.start = l.start;

		}
		//console.log(l);
	}
}

for (var i = 0; i < toRemove.length; i++) {
	for(var key in projects)
	{
		project = projects[key];
		if(project.indexOf(toRemove[i])>-1)
		{
			projects.splice(project.indexOf(toRemove[i]));
		}
	}
}


var projectSchema = new mongoose.Schema({
	name: String,
	logs: [{
		start: Date,
		end: Date
	}]
})

var dbpath = "db";

var Project = mongoose.model('Project', projectSchema);


var mongooseProjects = []

for(var key in projects)
{
	var p = new Project({name:key.toString()})
	mongooseProjects.push(p);
	var project = projects[key];
	for(var log in project)
	{
		//console.log(project[log]);
		p.logs.push(project[log]);
	}
}

mongoose.connect('mongodb://localhost/test');

for (var i = 0; i < mongooseProjects.length; i++) {
	mongooseProjects[i].save();
};