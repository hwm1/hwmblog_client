/*jshint esversion: 6 */
/* global angular */
/* global console */


'use strict';

angular.module('blogProg', ['ui.router', 'ngResource'])

    .config(function ($stateProvider, $urlRouterProvider, $locationProvider, $resourceProvider) {
   //     $resourceProvider.defaults.stripTrailingSlashes = false;
        $locationProvider.html5Mode(true);

        $stateProvider
            // route for the home page
            .state('app', {
                url: '/',
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        controller: 'HeaderController'
                    },
                    'content': {
                        templateUrl: 'views/blog.html',
                        controller: 'BlogController'
                    },
                    'footer': {
                        templateUrl: 'views/footer.html',
                        //        controller: 'BlogController'
                    }
                }

            })


            // route for the selected page
            .state('app.selected', {
                url: 'post/:selected',
                views: {
                    'content@': {
                        templateUrl: 'views/selected.html',
                        controller: 'SelectedController'

                    }
                }
            });

        $urlRouterProvider.otherwise('/');

    });