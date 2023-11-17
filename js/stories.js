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

/** Uses input data from form to add a story to the list and show on page
 * No inputs, use data from form. No returns, add new story to page
 */


async function addAndShowStory(evt) {
  console.log('starting submit form');
  evt.preventDefault();

  const inputAuthor = $submitAuthor.val();
  const inputTitle = $submitTitle.val();
  const inputUrl = $submitUrl.val();
  console.log('input author:', inputAuthor);
  console.log('input title:', inputTitle);
  console.log('input url:', inputUrl);

  // TODO: rename to just author, title, url - simplify object
  const newStory = await storyList.addStory(currentUser,
    {author: inputAuthor,
    title: inputTitle,
    url: inputUrl});

  console.log('story added:', newStory);
  const $newStory = generateStoryMarkup(newStory);
  // TODO: prepend instead of append to put at top
  $allStoriesList.append($newStory);
}

$submitButton.on("click", addAndShowStory);
