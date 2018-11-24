/* jshint esversion: 6 */
/* global angular */
/* global console */
/* global window */
/* global document */
/* global grecaptcha */
/* global shareOverrideOGMeta */
/* global FB */



'use strict';
angular.module('blogProg')


  .filter('isApproved', function () {
    // only approved comments in ng-repeat
    return function (items) {
      var filtered = [];
      angular.forEach(items, function (item) {
        if (item.approved === true)
          filtered.push(item);
      });
      // return the array after iterations complete
      return filtered;
    };
  })

  .filter('removeHTMLTags', function () {
    return function (text) {
      return text ? String(text).replace(/<[^>]+>/gm, '') : '';
    };
  })

  .controller('HeaderController', ['$scope', '$state', function ($scope, $state) {
    $scope.title = 'HWM The Blog';
  }])

  .controller('BlogController', ['$window', '$scope', '$state', '$stateParams',
    'blogFactory', function ($window, $scope, $state, $stateParams, blogFactory) {


      $scope.comment = {};
      $scope.post = {};
      $scope.posts = {};
      $scope.post.likes = 0;
      $scope.dataArray = [];
      $scope.loaded = false;
      $scope.loadingMessage = "Loading ...";

      $scope.posts = blogFactory.get({

      })


        .$promise.then(
          function (response) {

            $scope.posts = response;


            //convert to array for ng-repeat
            var a = [];
            angular.forEach($scope.posts, function (item) {
              a.push(item);
            });
            //dataArray is passed to view
            $scope.dataArray = a;
            $scope.loaded = true;
          },
          function (response) {
            $scope.message = 'Error: ' + response.status + ' ' + response.statusText;
          }

        );

      //   function htmlEntities(str) {
      //     return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      // }

      $scope.selectTab = function (setTab) {
        $scope.post = $scope.posts[setTab];
        console.log("selected post = " + angular.toJson($scope.post));
        $state.go('app.selected');
        $scope.scrollToTop('html , body');
      };

      $scope.isSelected = function (checkTab) {
        return $scope.tab === checkTab;
      };

      // $scope.scrollToTop = function (scrollTo) {
      //   // 'html, body' denotes the html element, to go to any other custom element, use '#elementID'
      //   $(scrollTo).animate({
      //     scrollTop: 0
      //   }, 'fast'); // 'fast' is for fast animation
      // };

      $scope.addPost = function () {
        $scope.post.images = [];
        $scope.post.createdOn = Date.now();
        $scope.post.comments = [];
        $scope.post.likes = 0;

        $scope.post.images.push($scope.post.image);
        //    $scope.posts.unshift(this.post);
        blogFactory.save({}, $scope.post)
          .$promise.then(
            function () {
              //SUCCESS
              $scope.tab = 0;
              $scope.post = {};
              $state.go($state.current, {}, {
                reload: true
              });
            },
            //FAILED
            function (response) {
              console.log(response.status);
            }
          );
      };
    }])

  .controller('SelectedController', ['$http', '$rootScope', '$window', '$scope', '$state', '$stateParams',
    '$sce', 'commentFactory', 'captchaFactory', 'selectedPostFactory',
    function ($http, $rootScope, $window, $scope, $state,
      $stateParams, $sce, commentFactory, captchaFactory, selectedPostFactory) {

      var likesSiteKey = '6Lcfx1AUAAAAAKbhe5wBb45UP_E__kOmIQUGqSsw';
      var commentsSiteKey = '6Lf_PkwUAAAAANGSbb7xPTozgUYNjUyTBUu_5hEl';
      var saveCaptchaResponse = null;

      $scope.urlError = true;//prevent screen flash of new state if url bad and revert to state app
      $scope.temp = null;
      $scope.FBError = false;
      //  var selected = null;
      $scope.post = {};
      $scope.posts = {};
      $scope.post.likes = 0;
      var likesWidgetID = null;
      var commentsWidgetID = null;
      document.getElementById("commentSubmit").disabled = true;
      var selected = $stateParams.selected;


      //get single post by ID
      $scope.posts = selectedPostFactory.get({
        postID: selected

      })
        .$promise.then(
          function (response) {

            if (!response._id)//if no matching post, bad url
              $state.go('app');  //just go home
            $scope.urlError = false;

            $scope.post = response;

            $scope.htmlBlogText = $sce.trustAsHtml($scope.post.body);

          },
          function (response) {
            //error here
            $state.go('app');
          }
        );



      // function shareOverrideOGMeta(overrideLink, overrideTitle, overrideDescription, overrideImage) {
      $scope.shareOverrideOGMeta = function () {

        try {
          FB.ui({
            method: 'share_open_graph',
            action_type: 'og.likes',
            action_properties: JSON.stringify({
              object: {
                'og:url': "https://hwmblog.herokuapp.com/post/" + selected,
                'og:title': $scope.post.title,
                'og:description': "Le description",
                'og:image': $scope.post.images[0]
              }
            })
          },
            function (response) {
              // Action after response
              console.log("ran override 1");
              console.log($scope.post.images[0]);
            });

        }
        catch (err) {  //notify of Firefox tracking disabled
          console.log("BROWSER WARNING");
          $scope.FBError = true;

        }

      };


      $scope.resetForm = function (form) {
        form.$setPristine();
        form.$setUntouched();
        $scope.comment = {};
        grecaptcha.reset(commentsWidgetID);  //reset captcha
        grecaptcha.reset(likesWidgetID);
        $scope.response = null;
        document.getElementById("commentSubmit").disabled = true;
      };


      //called by clicking on Like button
      $scope.likeButtonClicked = function (post) {
        $scope.temp = post;
        // runs captcha (like button)
        grecaptcha.execute(likesWidgetID);
      };



      // this is the callback from captcha widget -- response string g-recaptcha-response 
      // from widget is automatically passed into it in 'response'
      function updateLikes(response) {
        //    test bad response
        // response = '0123456789abcdef';

        // send post ID and widget response to server for validation and write
        captchaFactory.save({ postID: selected }, { 'response': response })

          .$promise.then(
            function () {
              //SUCCESS
              console.log('at update likes  ' + response);
              // post.likes = post.likes + 1;
              $scope.temp.likes = $scope.temp.likes + 1;
            },
            //FAILED
            function (response) {
              console.log(response.status);
            }
          );
        response = null;
        grecaptcha.reset(likesWidgetID);
      };


      //captcha for likes button
      function onLoad1() {
        likesWidgetID = grecaptcha.render('likesCaptID', {
          'sitekey': likesSiteKey,
          'callback': updateLikes,
          'isolated': true
        });
        //       console.log("likes widget id = " + likesWidgetID);
      }


      //captcha for add comment
      function onLoad2() {
        commentsWidgetID = grecaptcha.render('commentsCaptID', {
          'sitekey': commentsSiteKey,
          'callback': setResponse,
          'expired-callback': commentsCaptExpired,
          'isolated': true
        });
        //      console.log("comments widget id = " + commentsWidgetID);
      }

      //captcha init called by captcha api
      function onApiLoad() {
        onLoad1();
        onLoad2();
      }
      window.onApiLoad = onApiLoad;



      function commentsCaptExpired() {
        document.getElementById("commentSubmit").disabled = true;

      }

      //comments captcha is solved here and response is in "response"
      var setResponse = function (response) {
        saveCaptchaResponse = response;
        document.getElementById("commentSubmit").disabled = false;
      };


      //close any captcha if back button
      $window.onpopstate = function (event) {
        //  console.log("unload");
        grecaptcha.reset(commentsWidgetID);  //reset captcha
        grecaptcha.reset(likesWidgetID);
      };



      //called by form
      $scope.addComment = function (post, form) {
        $scope.comment.createdOn = Date.now();

        commentFactory.update({ postID: selected }, { comment: $scope.comment, response: saveCaptchaResponse })
          .$promise.then(
            function () {
              //SUCCESS
              $scope.resetForm(form);
            },
            //FAILED
            function (response) {
              console.log(response.status);
              $scope.resetForm(form);
            }
          );
      };
    }]);