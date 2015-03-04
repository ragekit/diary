var Datastore = require('nedb')
  , db = new Datastore({ filename: './db', autoload: true })
  , moment = require('moment');

var projectSchema = function(){
	this.name = "";
	this.logs = [];
	this._started = false;
}
var Diary = {};

Diary.add = function(projectName,cb)
{

	db.find({name:projectName},function(err,found){
		if(found.length ==0)
		{
			var p = new projectSchema();
			p.name = projectName
			db.insert(p,function(err)
			{
				if(err) return console.error(err);
				else{
					console.log(projectName + " added");
				}
			})
		}else
		{
			console.error(projectName + " allready exist");
		}

	})
}

Diary.start = function(projectName)
{
	db.findOne({name:projectName},function(err,found){
		if(found == null)
		{
			console.log("no project named" + projectName + " found");
			return
		}else
		{
			if(!found._started)
			{
				db.update({_id : found._id},{
					$addToSet:{
						logs:{start: new Date(),end:null}
					},
					$set:{
						_started:true
					}
				})
			}else
			{
				console.log("project allready started !");
			}	
		}
	})
}

Diary.end = function(projectName)
{
	if(projectName == undefined)
	{
		db.find({ $where: function () { 
			for (var i = 0; i < this.logs.length; i++) {
				var item = this.logs[i];
				if(item.end == null) return true
			};
			return false;
		} }, function (err, docs) {
		  for (var i = 0; i < docs.length; i++) {
		  	docs[i]._started = false;
		  	docs[i].logs[docs[i].logs.length-1].end = new Date();

		  	db.update({_id: docs[i]._id},docs[i]);
		  };
		});

		console.log("all project ended");
		return;
	}

	db.findOne({name:projectName},function(err,found){
		if(found == null)
		{
			console.log("no project named" + projectName + " found");
			return
		}else
		{
			if(found._started)
			{
				found.logs[found.logs.length-1].end = new Date();
				found._started = false;
				db.update({_id : found._id},found);
			}else
			{
				console.log("project not started !");
			}
		}
	})
}

Diary.list = function(){
	db.find({},function(err,found){
		for (var i = 0; i < found.length; i++) {
			console.log();
			console.log(found[i].name);
			console.log("  │");
			var totaldiff = 0;
			for (var j = 0; j < found[i].logs.length; j++) {
				var s = moment(found[i].logs[j].start);
				var e = moment(found[i].logs[j].end);
				var diff = e.diff(s);
				totaldiff += diff;
				console.log("  ├───" + s.format("D MMMM YYYY, H:mm:ss") + " // " +e.format("D MMMM YYYY, H:mm:ss") +" == " + moment.duration(diff).humanize());
			};
			console.log("  ╚══  total time : " + moment.duration(totaldiff).humanize());

		};
	})
}

var args = process.argv.slice(2);
	arguments = args.slice(1);
	if(Diary[args[0]] != null)
	{
		Diary[args[0]].apply(this,arguments);
	}
	else
	{
		console.log(args[0] + " param doesn't exist");
	}