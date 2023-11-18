"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {

  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    console.log('making story class');
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */

  getHostName() {
    console.log('getting hostname');

    const url = new URL(this.url);
    return url.hostname;
  }

  /** Creates a story instance from retrieving API story data with story Id
   * Input - story id, Output - new instance of Story class
  */
  static async getStoryFromId(storyId) {
    //return entire story object from id
    //make get request from API
    // {{ _.base_url }}/stories/{{ _.storyId }}
    console.log('retrieving story from DB with id');
    const response = await fetch(
      `${BASE_URL}/stories/${storyId}`
    );

    const storyData = await response.json();
    console.log('storyObj: ', storyData);
    return new Story(storyData.story);
  }
}


/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    // query the /stories endpoint (no auth required)
    const response = await fetch(`${BASE_URL}/stories`, {
      method: "GET",
    });
    const storiesData = await response.json();

    // turn plain old story objects from API into instances of Story class
    const stories = storiesData.stories.map(story => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /** Adds story data to API, makes a Story instance, adds it to story list,
   * and user's 'my stories' list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */

  async addStory(user, { title, author, url }) {
    console.log('starting add story');
    console.log('user: ', user, 'newStory: ', { title, author, url });
    const token = user.loginToken;

    // make json string for body
    const body = JSON.stringify({
      token,
      "story": {
        author,
        title,
        url
      }
    });

    // send a post request to API --
    const response = await fetch(
      `${BASE_URL}/stories`,
      {
        method: "POST",
        body: body,
        headers: {
          "Content-Type": "application/json",
        }
      }
    );

    const storyObject = (await response.json());
    console.log('response story: ', storyObject);
    // create new Story instance using spread of response object
    const story = new Story(storyObject.story);
    // // add new class Story instance to story list
    this.stories.unshift(story);
    //add new story instance to user's myStories
    user.ownStories.unshift(story);


    console.log('added story:', story);
    return story;
  }

}


/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor({
    username,
    name,
    createdAt,
    favorites = [],
    ownStories = []
  },
    token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Send post to API and add a story class instance to user's favorites
   * Input story instance, no return */

  async addFavorite(story) {
    //make a POST request to API
    //{{ _.base_url }}/users/{{ _.username }}/favorites/{{ _.storyId }}
    const response = await fetch(
      `${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
      {
        method: "POST",
        body: JSON.stringify({ "token": this.loginToken })
      });
    //NOTE: rename favorite add response OR remove, since we are not accessing it
    // const favoriteAddedData = await response.json();
    // console.log('favoriteAddResp: ', favoriteAddedData);
    //update the user isntance's favorites with the story input
    this.favorites.push(story);
    console.log('currentUserFavs: ', this.favorites);
  }
  
  /** Delete story from API, and remove story instance from user's favorites
   * Input a story instance */
  
  //TODO: Look into consilidating into toggleFavorite function
  async removeFavorite(story) {
    //make a DELETE request to API
    //{{ _.base_url }}/users/{{ _.username }}/favorites/{{ _.storyId }}
    const response = await fetch(
      `${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
      {
        method: "DELETE",
        body: JSON.stringify({ "token": this.loginToken })
      });
    const favoriteRemoveResponse = await response.json();
    console.log('fav remove response: ', favoriteRemoveResponse);
    // update the user instance's favorites to remove the story deleted
    this.favorites = this.favorites.filter(
      favStory =>
        favStory.storyId !== story.storyId
    );
    console.log('currentUserFavs: ', this.favorites);
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    const response = await fetch(`${BASE_URL}/signup`, {
      method: "POST",
      body: JSON.stringify({ user: { username, password, name } }),
      headers: {
        "content-type": "application/json",
      }
    });
    const userData = await response.json();
    const { user } = userData;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      userData.token
    );
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      body: JSON.stringify({ user: { username, password } }),
      headers: {
        "content-type": "application/json",
      }
    });
    const userData = await response.json();
    const { user } = userData;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      userData.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const tokenParams = new URLSearchParams({ token });

      const response = await fetch(
        `${BASE_URL}/users/${username}?${tokenParams}`,
        {
          method: "GET"
        }
      );
      const userData = await response.json();
      const { user } = userData;

      console.log('user data (from api): ', user);

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }
}
