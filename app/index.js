var app = {};
var gui = require('nw.gui');
var low = require('lowdb');
var moment = require('moment');

app.start = function(){
	var db = low("../db.json");
	var found = db.object.projects;	
	var startTime = moment.max();
	var totalworkingtime = 0;
	for (var i = 0; i < found.length; i++) {
			document.write("<br/>"+found[i].name);
			document.write("<br/>");


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
				document.write("<br/>" + s.format("D MMMM YYYY, H:mm:ss") + " // " +e.format("D MMMM YYYY, H:mm:ss") +" == " + moment.duration(diff).humanize());
			};
			totalworkingtime += totaldiff;
			document.write("<br/>total time : " + moment.duration(totaldiff).humanize());

		};

		totalworkingtime = moment.duration(totalworkingtime);

		document.write("<br/><br/> TOTAL WORKING TIME : " + totalworkingtime.humanize());
		document.write("<br/> Since : "+  startTime.format("D MMMM YYYY, H:mm:ss"));

		var dayWorked = moment.duration(moment().diff(startTime)).days();
		
		document.write(" Average : " + moment.duration(totalworkingtime/dayWorked).humanize() + " by day (including non working days)");
}




app.start();