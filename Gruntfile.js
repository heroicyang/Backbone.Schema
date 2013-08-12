module.exports = function (grunt) {
    'use strict';

    ///////////////////////////
    // PROJECT CONFIGURATION //
    ///////////////////////////

    grunt.initConfig({

        //////////////
        // METADATA //
        //////////////

        pkg: grunt.file.readJSON('package.json'),
        banner: grunt.file.read('BANNER'),

        ////////////////////////
        // TASK CONFIGURATION //
        ////////////////////////

        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },

            src: 'src/**/*.js'
        },

        concat: {
            options: {
                banner: '<%= banner %>'
            },

            dist: {
                src: [
                    'src/backbone/schema.js'
                ],

                dest: 'dist/<%= pkg.name %>.js'
            }
        },

        uglify: {
            options: {
                banner: '<%= banner %>'
            },

            dist: {
                src: '<%= concat.dist.dest %>',
                dest: 'dist/<%= pkg.name %>.min.js'
            }
        },

        karma: {
            test: {
                configFile: 'karma.conf.js',
                singleRun: true
            }
        }
    });

    /////////////
    // PLUGINS //
    /////////////

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-karma');

    ///////////
    // TASKS //
    ///////////

    grunt.registerTask('default', ['jshint', 'karma', 'concat', 'uglify']);
};
