"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  evt.preventDefault();
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  evt.preventDefault();
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();

  $navLogOut.show();
  $navSubmit.show()
  $navFavorites.show();
  $navMyStories.show();

  $navUserProfile.text(`${currentUser.username}`).show();
}

/** When a user clicks on 'submit' link, reveal the story submit form */

function navSubmitClick(evt) {
  evt.preventDefault();
  console.debug("navSubmitClick", evt);
  $submitForm.show();
}

$navSubmit.on("click", navSubmitClick);

/** When a user clicks on 'favorites' link, reveal the favorites */

function navFavoritesClick(evt) {
  evt.preventDefault();
  console.debug("navFavoritesClick", evt);

  hidePageComponents();
  putFavoritesOnPage();

  $favStoriesList.show();
}

$navFavorites.on("click", navFavoritesClick);

/** When a user clicks on 'my stories' link, reveal my stories list */

function navMyStoriesClick(evt) {
  evt.preventDefault();
  console.debug("navMyStoriesClick", evt);

  hidePageComponents();
  putMyStoriesOnPage();

  $myStoriesList.show();
}

$navMyStories.on("click", navMyStoriesClick);