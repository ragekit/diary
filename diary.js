#!/usr/bin/env node

var fs = require('fs');
var moment = require('moment');
var low = require('lowdb');
var path = require('path')


var projectSchema = function(){
	this.name = "";
	this.logs = [];
	this._started = false;
}
var Diary = {};

Diary.add = function(projectName)
{
	var found = db('projects').find({name:projectName});
	if(found == undefined)
	{
		var p = new projectSchema();
		p.name = projectName;

		db("projects").push(p);
		console.log("added");
	}else
	{
		console.error(projectName + " allready exist");
	}
}

Diary.start = function(projectName)
{
	var found = db('projects').find({name:projectName});
	if(found == null)
	{
		console.log("no project named " + projectName + " found");
		return
	}else
	{
		if(!found._started)
		{
			found.logs.push({start : moment(),end:null})
			found._started = true;
			db.save();
		}else
		{
			console.log("project allready started !");
		}	
	}
}

Diary.end = function(projectName)
{
	if(projectName == undefined)
	{
		var docs = db('projects').filter(function (project) {
			for (var i = 0; i < project.logs.length; i++) {
				var item = project.logs[i];
				if(item.end == null) return true
			}
			return false;
		});

		console.log(docs);
		 for (var i = 0; i < docs.length; i++) {
		  	docs[i]._started = false;
		  	console.log("saving");
		  	docs[i].logs[docs[i].logs.length-1].end = moment().toISOString();
		  }
		db.save();
		console.log("all project ended");
		return;
	}

	var found = db('projects').first({name:projectName});

		if(found == undefined)
		{
			console.log("no project named" + projectName + " found");
			return
		}else
		{
			if(found._started)
			{
				found.logs[found.logs.length-1].end = moment().toISOString();
				found._started = false;
				db.save();
			}else
			{
				console.log("project not started !");
			}
		}
}

Diary.list = function(){

	var startTime = moment.max();
	var totalworkingtime = 0;
	var found = db.object.projects;

		for (var i = 0; i < found.length; i++) {
			console.log("\n"+found[i].name);
			console.log("  │");


			var totaldiff = 0;
			for (var j = 0; j < found[i].logs.length; j++) {
				var s = moment(found[i].logs[j].start);
				var e = moment(found[i].logs[j].end);

				if(s.isBefore(startTime))
				{
					startTime = s;
				}

				var diff = e.diff(s);
				totaldiff += diff;
				console.log("  ├───" + s.format("D MMMM YYYY, H:mm:ss") + " // " +e.format("D MMMM YYYY, H:mm:ss") +" == " + moment.duration(diff).humanize());
			};
			totalworkingtime += totaldiff;
			console.log("  ╚══  total time : " + moment.duration(totaldiff).humanize());

		};

		totalworkingtime = moment.duration(totalworkingtime);

		console.log("\n TOTAL WORKING TIME : " + totalworkingtime.humanize());
		console.log(" Since : "+  startTime.format("D MMMM YYYY, H:mm:ss"));

		var dayWorked = moment.duration(moment().diff(startTime)).days();
		
		console.log(" Average : " + moment.duration(totalworkingtime/dayWorked).humanize() + " by day (including non working days)");
}

Diary.setDatabase = function(p){
	fs.writeFileSync(configPath, JSON.stringify({dbpath:path.resolve(p)}));
}

var args = process.argv.slice(2);
//process.exit();

var configPath = path.resolve(path.dirname(process.argv[1]) + "/config.json");
console.log(configPath);


var optionExist = fs.existsSync(configPath);

if(args[0] == "database")
{
	Diary.setDatabase(args[1]);
	process.exit();
}else
{
	if(!optionExist){
			console.log("no Database path set ! call diary database 'path'");
			process.exit();
	}
}


var optionfile = fs.readFileSync(configPath);
var option = JSON.parse(optionfile);

//console.log(option.dbpath);

db = low(option.dbpath);





arguments = args.slice(1);
if(Diary[args[0]] != null)
{
	Diary[args[0]].apply(this,arguments);
}
else
{
	console.log(args[0] + " param doesn't exist");
}