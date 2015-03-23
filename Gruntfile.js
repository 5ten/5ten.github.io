

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    bower_concat: {
      all: {
        dest: 'scripts/bower.js',
        cssDest: '_bower.css',
        exclude: [
            'jquery',
            'modernizr'
        ],
        dependencies: {
          'underscore': 'jquery',
          'backbone': 'underscore',
          'jquery-mousewheel': 'jquery'
        },
        mainFiles: {
          'skrollr-stylesheets': 'dist/skrollr.stylesheets.min.js',
          'jquery-smooth-scroll': 'jquery.smooth-scroll.min.js',
          'waypoints': 'lib/jquery.waypoints.min.js'
        },
        bowerOptions: {
          relative: false
        }
      }
    },



    wiredep: {
      task: {
        src: [
          '*.html',   // .html support...
        ]
      }
    },
    sass: {                              // Task
      dist: {                            // Target
        options: {                       // Target options
          style: 'expanded'
        },
        files: {                         // Dictionary of files
          'css/style.css': 'sass/style.scss'
        }
      }
    },
    watch: {
      options: {
        livereload: true
      },
      sass: {
        files: ['sass/**'],
        tasks: ['sass']
      }
    }
  });
  grunt.loadNpmTasks('grunt-bower-concat');
  grunt.loadNpmTasks('grunt-wiredep');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['sass', 'watch']);
  grunt.registerTask('bower', ['bower_concat', 'wiredep']);
};

