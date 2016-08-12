'use strict';

module.exports = function (grunt) {
  // show elapsed time at the end
  require('time-grunt')(grunt);
  // load all grunt tasks
  require('load-grunt-tasks')(grunt);

  var reloadPort = 35729;

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		//starts server
		develop: {
			server: {
				file: 'app.js'
			}
		},
		// javascript lint
		jshint: {
			options: {
				// more options here if you want to override JSHint defaults
				// JSHint will always fail if there is an error. By setting force to true we prevent this.
				force: true,
				reporter: require('jshint-stylish')
			},
			// define the files to lint
			files: ['public/client/**/*.js', '!public/client/scripts/vendor/**/*.js']
			// configure JSHint (documented at http://www.jshint.com/docs/)
		},
		// creates one javascript and one css file
		concat: {
			options: {
				// define a string to put between each file in the concatenated output
				separator: '\r\n' 
			},
			css: {
				src: ['public/client/**/*.css'],
				dest: 'public/stylesheets/main.css'
			},
			js: {
				src: ['public/client/**/*.js', '!public/client/scripts/vendor/**/*.js'],
				dest: 'public/js/app.js'
			},
			vendorJS: {
				src:[
					'node_modules/angular/angular.js',
					'node_modules/angular-ui-router/release/angular-ui-router.js',
					'node_modules/angular-aria/angular-aria.js',
					'node_modules/angular-material/angular-material.js',
					'node_modules/angular-animate/angular-animate.js',
					'node_modules/postal/lib/postal.js'
				],
				dest: 'public/js/vendor.js'
			}
		},
		// minification of css
		cssmin: {
			target: {
				files: {
					'public/stylesheets/main.css': 'public/stylesheets/main.css'
				}
			}
		},
		// annotation of Angular JS files before uglification
		ngAnnotate: {
			target: {
				files: {
					'public/js/app.js': ['public/js/app.js']
				}
			}
		},
		// javascript uglification
		uglify: {
			js: {
				src: ['public/js/app.js'],
				dest: 'public/js/app.js'
			},
			vendorJS: {
				src: ['public/js/vendor.js'],
				dest: 'public/js/vendor.js'
			}
		},
		// cleaning of css and js file
		clean: {
			css: ['public/stylesheets/main.css'],
			js: ['public/js/app.js'],
		},
		// reloads page on changes to html, css, or js files
		watch: {
			options: {
				nospawn: true,
				livereload: reloadPort
			},
			css: {
				options: { livereload: true },
				files: ['public/client/**/*.css'],
				tasks: ['clean:css', 'concat:css']
			},
			html: {
				options: { livereload: true },
				files: ['public/client/**/*.html']
			},
			script: {
				options: { livereload: true },
				files: ['public/client/**/*.js'],
				tasks: ['clean:js', 'concat:js']
			}
		}
	});
	grunt.registerTask('default', [
		'npm-install',
		'develop',
		'jshint',
		'clean',
		'concat',
		'watch'
	]);
	grunt.registerTask('build', [
		'npm-install',
		'jshint',
		'clean',
		'concat',
		'cssmin',
		'ngAnnotate',
		'uglify'
	]);
}