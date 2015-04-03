var gulp = require('gulp');
var NwBuilder = require('node-webkit-builder');
var nw = new NwBuilder({
	files: "./app/*",
});


gulp.task('default', function () {
	nw.run();
});

gulp.task('noreload',function(){
	nw.run();
})
  