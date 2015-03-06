var fs = require('fs');
var Datastore = require('nedb');
var moment = require('moment');
var path = require('path');

db = new Datastore({ filename: "./db", autoload: true });
//console.log(moment);
db.find({},function(err,found){

	for (var i = 0; i < found.length; i++) {
		var f = found[i];

		for (var j = 0; j < f.logs.length; j++) {
			var log = f.logs[j];

			log.start = moment(log.start).toISOString();
			log.end = moment(log.end).toISOString();

			
		};

		db.update({_id: f._id},f);
	};
})