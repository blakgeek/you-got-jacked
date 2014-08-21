module.exports = function(grunt) {

	require('load-grunt-tasks')(grunt);

	// Project configuration.
	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),
		// these are here as a marker to IntelliJ's grunt plugin
		mobile: {
			release: {}
		},
		site: {
			release: {}
		},
		source_files: [
			'src/js/BG.js',
			'src/js/ui.js',
			'src/js/game.js',
			'src/js/brains/hal.js',
			'src/js/boards.js',
			'src/js/help.js'
		],
		clean: {
			target_dir: '<%= target_dir %>'
		},
		jshint: {
			source_files: '<%= source_files %>'
		},
		preprocess: {
			index_html: {
				src: 'src/index.html',
				dest: '<%= target_dir %>/index.html'
			}
		},
		sass: {
			options: {
				sourcemap: 'auto',
				style: 'compressed'
			},
			files: {
				expand: true,
				cwd: 'src/sass',
				src: '**/*.scss',
				dest: '<%= target_dir %>/css',
				ext: '.css'
			}
		},
		copy: {
			everything: {
				expand: true,
				cwd: 'src',
				src: ['**', '!index.html', '!js/**', '!sass/**'],
				dest: '<%= target_dir %>'
			},
			development: {
				expand: true,
				cwd: 'src',
				src: ['js/**'],
				dest: '<%= target_dir %>'
			}
		},
		uglify: {
			release: {
				files: {
					"<%= target_dir %>/js/app.min.js": '<%= source_files %>',
					"<%= target_dir %>/js/dependencies.min.js": '<%= target_dir %>/js/dependencies.js'
				}
			}
		},
		bower_concat: {
			all: {
				dest: '<%= target_dir %>/js/dependencies.js'
			}
		}
	});

	function buildForTarget(target, includeCordova) {

		return function() {
			grunt.log.writeln('Building ' + this.name + ' for ' + buildType);

			var isRelease = this.flags.release,
				buildType = isRelease ? 'release' : 'development',
				tasks = isRelease ? ['clean', 'preprocess', 'bower_concat', 'uglify', 'sass', 'copy:everything'] :
					['clean', 'preprocess', 'bower_concat', 'sass', 'copy'];

			grunt.config('target_dir', target);
			process.env.DEBUG = !isRelease;
			process.env.INCLUDE_CORDOVA = includeCordova;
			grunt.task.run(tasks);
		}
	}

	grunt.registerTask('site', buildForTarget('site', false));
	grunt.registerTask('mobile', buildForTarget('mobile/www', true));

};