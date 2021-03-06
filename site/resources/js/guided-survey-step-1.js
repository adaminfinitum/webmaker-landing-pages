/* global analytics */
(function ($, doc, win) {
  win.webmaker = win.webmaker || {};

  var
    baseUrl = win.location.protocol + '//' + win.location.host,
    previousStep = 'prevstep=webmaker_snippet_survey',
    mentorPath = '/for/mentors/?' + previousStep,
    learnerPath = '/for/learners/?' + previousStep,
    $formEmail = $('#guided-landing-2014'),
    $formNoEmail = $('#guided-landing-noemail'),
    formDestinationLearners = $('[name=destinationlearners]').val(),
    formDestinationMentors = $('[name=destinationmentors]').val(),
    surveyQuestions = $formEmail.length > 0 ? 'custom-2722' : $formNoEmail.length > 0 ? 'custom-2861' : '';

  function appendExistingURLParameters(s) {
    if (!window.location.search) {
      return s;
    }
    if (s.indexOf('?') === -1) {
      // the target URL does not have a ?
      // append existing params 'as is'
      return s + window.location.search;
    } else {
      // the target URL does have a ?
      return s + window.location.search.replace('?', '&');
    }
  }

  function getBaseURLLearner() {
    if (formDestinationLearners) {
      return appendExistingURLParameters(formDestinationLearners);
    }
    return baseUrl + learnerPath;
  }

  function getBaseURLMentor() {
    if (formDestinationMentors) {
      return appendExistingURLParameters(formDestinationMentors);
    }
    return baseUrl + mentorPath;
  }

  function recordSelected() {
    var
      response = $('[name="' + surveyQuestions + '"]:checked').val();
    analytics.event('Selected a welcome survey option', {
      label: response
    });
  }

  function setRedirectUrl() {
    var
      response = $('[name="' + surveyQuestions + '"]:checked').val();
    if (response === 'yeshelplearn' || response === 'yesproteacher') {
      $('[name="redirect_url"]').val(baseUrl + mentorPath);
    } else {
      $('[name="redirect_url"]').val(baseUrl + learnerPath);
    }
  }

  function getNextStepURL() {
    var
      response = $('[name="' + surveyQuestions + '"]:checked').val();
    if (response === 'yeshelplearn' || response === 'yesproteacher') {
      return getBaseURLMentor();
    } else {
      return getBaseURLLearner();
    }
  }

  function postEmailAddress() {
    var
      payload = {
        email: $('[name="email"]').val(),
        'custom-2722': $('[name="custom-2722"]:checked').val(),
        opt_in: 1,
        redirect_url: $('[name="redirect_url"]').val()
      },
      request = $.ajax({
        type: 'post',
        url: 'https://sendto.webmaker.org/page/signup/webmaker-firefox-snippet-survey',
        data: payload
      }),
      success = function () {
        win.location = getNextStepURL();
      },
      error = function () {
        $formEmail.off().submit();
      },
      complete = function () {
        sessionStorage.setItem('wmEmail', payload.email);
        recordSelected();
      };
    $('input[type="submit"]').prop('disabled', 'disabled').val(' Loading…');
    request.always(complete).then(success, error);
  }

  function goToNextPage() {
    recordSelected();
    win.location = getNextStepURL();
  }

  function initFormEmail() {
    win.postEmailAddress = postEmailAddress;
    $formEmail.on('change', '[name="custom-2722"]', setRedirectUrl);
    $formEmail.on('submit', function (e) {
      e.preventDefault();
      $('button[type="submit"]').prop('disabled', 'disabled').text('Loading…');
      win.postEmailAddress();
    });
  }

  function initFormNavigation() {
    win.goToNextPage = goToNextPage;
    $formNoEmail.on('submit', function (e) {
      e.preventDefault();
      $('button[type="submit"]').prop('disabled', 'disabled').text('Loading…');
      win.goToNextPage();
    });
  }

  if (doc.getElementById('guided-landing-2014') !== null) {
    initFormEmail();
  }

  if (doc.getElementById('guided-landing-noemail') !== null) {
    initFormNavigation();
  }

})(jQuery, document, window);
