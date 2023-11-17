"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 * - Input a story, if it is in user's favorites then show solid fav icon
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {

  let favIconClass = "";

  if (currentUser instanceof User) {
    const currentUserFavorites = currentUser.favorites.map(
      story => story.storyId);

    if (currentUserFavorites.includes(story.storyId)) {
      favIconClass = "bi bi-star-fill";
    }
    else {
      favIconClass = "bi bi-star";
    }

  }

  const hostName = story.getHostName();

  return $(`
      <li id="${story.storyId}">
        <i class="bi ${favIconClass}"></i>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/** Generates HTML for story favorites, and puts on page. */

function putFavoritesOnPage() {
  console.debug("putFavoritesOnPage");

  $favStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of currentUser.favorites) {
    const $story = generateStoryMarkup(story);
    $favStoriesList.append($story);
  }

  $favStoriesList.show();
}

/** Generates HTML for current user stories, and puts on page. */

function putMyStoriesOnPage() {
  console.debug("putMyStoriesOnPage");
  console.log('current user:', currentUser);
  console.log('user stories:', currentUser.stories);
  $myStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of currentUser.ownStories) {
    const $story = generateStoryMarkup(story);
    $myStoriesList.append($story);
  }

  $myStoriesList.show();
}

/** Uses input data from form to add a story instance to the list
 * and show story on page
 * Input event, use data from form.
 * No return, add new story instance to page */

async function addAndShowStory(evt) {
  console.log('starting submit form');
  evt.preventDefault();

  const author = $submitAuthor.val();
  const title = $submitTitle.val();
  const url = $submitUrl.val();
  console.log('input author:', author);
  console.log('input title:', title);
  console.log('input url:', url);

  const story = await storyList.addStory(currentUser, { author, title, url });

  console.log('story added:', story);
  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);
}

$submitButton.on("click", addAndShowStory);

/** Get story id for favorite icon. Input a jquery object for a favorite
 * icon, return the story id for the icon */

function getFavoriteIconStoryId($favoriteIcon) {

  const $story = $favoriteIcon.closest('li');
  console.log("$story", $story);

  const storyId = $story.attr("id");
  console.log("story id: ", storyId);

  return storyId;
}

/** When user clicks on unfilled fav icon, favorite the story
 * No inputs, use id from story. No returns, add fav
 * Change fav icon to be filled once favorited */

async function addFavoriteClick(evt) {
  console.log('handling add favorite click');
  const $favoriteIcon = $(evt.target);
  console.log("$favoriteIcon: ", $favoriteIcon);

  const storyId = getFavoriteIconStoryId($favoriteIcon);

  const story = await Story.retrieveStoryFromId(storyId);

  console.log("story from db: ", story);
  await currentUser.addFavorite(story);

  $favoriteIcon.removeClass("bi-star").addClass("bi-star-fill");
}

/** When user clicks on filled fav icon, unfavorite the story
 * No inputs, use id from story. No returns, add fav
 * Change fav icon to be unfilled once favorite is removed
 */

async function removeFavoriteClick(evt) {
  console.log('handling remove favorite click');
  const $favoriteIcon = $(evt.target);
  console.log("$favoriteIcon: ", $favoriteIcon);

  const storyId = getFavoriteIconStoryId($favoriteIcon);

  const story = await Story.retrieveStoryFromId(storyId);

  console.log("story from db: ", story);
  await currentUser.removeFavorite(story);

  $favoriteIcon.removeClass("bi-star-fill").addClass("bi-star");
}

$body.on("click", ".bi-star", addFavoriteClick);
$body.on("click", ".bi-star-fill", removeFavoriteClick);
