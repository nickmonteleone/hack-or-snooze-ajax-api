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
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <i class="bi bi-star"></i>
        <i class="bi bi-star-fill"></i>
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


/** Uses input data from form to add a story to the list and show on page
 * No inputs, use data from form. No returns, add new story to page
 */

async function addAndShowStory(evt) {
  console.log('starting submit form');
  evt.preventDefault();

  const author = $submitAuthor.val();
  const title = $submitTitle.val();
  const url = $submitUrl.val();
  console.log('input author:', author);
  console.log('input title:', title);
  console.log('input url:', url);

  const newStory = await storyList.addStory(currentUser, { author, title, url });

  console.log('story added:', newStory);
  const $newStory = generateStoryMarkup(newStory);
  $allStoriesList.prepend($newStory);
}

$submitButton.on("click", addAndShowStory);


/** When user clicks on unfilled fav icon, favorite
 * No inputs, use id from story. No returns, add fav
 */

async function addFavoriteClick(evt){
  console.log('handling add favorite click');
}

/** When user clicks on filled fav icon, favorite
 * No inputs, use id from story. No returns, add fav
 */

async function removeFavoriteClick(evt){
  console.log('handling remove favorite click');
}

$body.on("click", ".bi-star", addFavoriteClick);
$body.on("click", ".bi-star-fill", removeFavoriteClick);
