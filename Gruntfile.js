module.exports = function(grunt) {

var NwBuilder = require('node-webkit-builder');

grunt.initConfig({
  watch: {
    files: ['./app/**/*'],
    options: {
      livereload: true,
      spawn:false
    }
  }
});

grunt.registerTask('run',function(){
  var nw = new NwBuilder(
            {
                files: './app/*'
            });
  nw.run();
})

grunt.loadNpmTasks('grunt-contrib-watch');
grunt.registerTask('default',['run','watch']);

};