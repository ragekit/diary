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
				cb.call(this);
			})
		}else
		{
			console.error(projectName + " allready exist");
			cb.call(this);
		}

	})
}

Diary.start = function(projectName,cb)
{
	Project.findOne({name:projectName},function(err,found){
		if(found == null)
		{
			console.log("no project named" + projectName + " found");
			cb.call(this);
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
						cb();
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
		cb();
	})
}

startlog = function(project,cb){
	var l = {start:Date.now(),end:null};
	project.logs.push(l);
	console.log("starting project "  + project.name);
	project.save(function(){
		cb.call(this);
	});
}

Diary.end = function(cb){
	Project.findOne().where('logs').elemMatch({end:null}).exec(function(err,found){
		if(found == null)
		{
			console.log("no project have been started");
			cb.call(this);
			return;
		}
		found.logs[found.logs.length-1].end = Date.now();
		found.save(function(){
			cb.call(this);
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
	arguments.push(Diary.close);
	Diary[args[0]].apply(this,arguments);
  }
});

mongo.stderr.on('data', function (data) {
  
});

mongo.on('close', function (code) {
  console.log('child process exited with code ' + code);
});