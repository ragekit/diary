#!/usr/bin/env node

var mongoose = require('mongoose');
var spawn = require('child_process').spawn;
    
var projectSchema = new mongoose.Schema({
	name: String,
	logs: [{
		start: Date,
		end: Date
	}]
})

var dbpath = "db";

var Project = mongoose.model('Project', projectSchema);

var Diary = {};

Diary.add = function(projectName,cb)
{

	Project.find({name:projectName},function(err,found){
		if(found.length ==0)
		{
			var p = new Project({name:projectName});
			p.save(function(err)
			{
				if(err) return console.error(err);
				else{
					console.log(projectName + " added");
				}
				Diary.close();
			})
		}else
		{
			console.error(projectName + " allready exist");
			Diary.close();
		}

	})
}

Diary.start = function(projectName,cb)
{
	Project.findOne({name:projectName},function(err,found){
		if(found == null)
		{
			console.log("no project named" + projectName + " found");
			Diary.close();
		}else
		{
			Project.findOne().where('logs').elemMatch({end:null}).exec(function(err,started){
				console.log(started);
				if(started != null)
				{
					if(started.name != found.name)
					{
						console.log("project " + started.name + " allready started, ending");
						Diary.end(function(){
							startlog(started,cb)
						})
					}else
					{
						console.log("project allready started");
						Diary.close();
					}
				}else
				{
					startlog(found,cb);
				}
			})		
		}
	})
}

Diary.list = function(cb){
	Project.find({},function(err,found){
		for (var i = 0; i < found.length; i++) {
			console.log(found[i].name);
		};
		Diary.close();
	})
}

startlog = function(project,cb){
	var l = {start:Date.now(),end:null};
	project.logs.push(l);
	console.log("starting project "  + project.name);
	project.save(function(){
		Diary.close();
	});
}

Diary.end = function(cb){
	Project.findOne().where('logs').elemMatch({end:null}).exec(function(err,found){
		if(found == null)
		{
			console.log("no project have been started");
			Diary.close();
			return;
		}
		found.logs[found.logs.length-1].end = Date.now();
		found.save(function(){
			Diary.close();
		});
	})
}

Diary.close = function(){
	mongoose.connection.close();	
}


var mongo = spawn('mongod', ['--dbpath', 'db']);

mongo.stdout.on('data', function (data) {
  if(data.toString().indexOf("waiting for connections") >0)
  {
  	console.log("mongo started");
  	mongoose.connect('mongodb://localhost/test');
    var args = process.argv.slice(2);
	arguments = args.slice(1);
	if(diary[args[0]] != null)
	{
		Diary[args[0]].apply(this,arguments);
	}
	else
	{
		console.log(args[0] + " param doesn't exist");
		Diary.close();
	}
  }
});

mongo.stderr.on('data', function (data) {
  
});

mongo.on('close', function (code) {
  console.log('child process exited with code ' + code);
});