/*jshint esversion: 6 */
/* global angular */
/* global console */

'use strict';

angular.module('blogProg')
 //  .constant('baseURL', 'http://localhost:3000/')
  .constant('baseURL', 'https://hwmblog.herokuapp.com/')

  .factory('blogFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
    return $resource(baseURL + 'users/posts', {}, {
      'get': { method: 'GET', params: {}, isArray: true }, //read posts
   //   'get': { method: 'GET', params: {}, isArray: false }, //read posts
  //    'save': { method: 'POST', url: baseURL + 'users/posts' },       //add posts

    });
  }])


  .factory('commentFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
    return $resource(baseURL + 'users/:postID', null, {
      'update': {
        method: 'PUT'
      }
    });
  }])


  .factory('selectedPostFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
    return $resource(baseURL + 'users/posts/:postID', null, {
      'get': { method: 'GET' }
    });
  }])



  .factory('captchaFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
    return $resource(baseURL + 'users/captcha', {}, {
      //     'save': { method: 'POST',url: baseURL + 'users/captcha' },      //for add comments captcha
      //    'update': { method: 'PUT', url: baseURL + 'users/invisible/captcha' },
      'save': { method: 'POST', url: baseURL + 'users/posts/invisible/captcha/:postID' }      //save likes
    });
  }]);


  // .service('metadataService', ['$window', function ($window) {
  //   var self = this;
  //   self.setMetaTags = function (tagData) {
  //     $window.document.getElementsByName('url')[0].content = tagData.url;
  //     $window.document.getElementsByName('image')[0].content = tagData.image;
  //     $window.document.getElementsByName('description')[0].content = tagData.description;
  //   };
  // }]);








