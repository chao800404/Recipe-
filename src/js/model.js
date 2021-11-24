import { async } from 'regenerator-runtime';
import { API_URL, RES_PER_PAGE, KEY } from './config.js';
import { CLIENT_ID, API_KEY, DISCOVERY_DOCS, SCOPES } from './calendarAPI.js';
// import { getJSON, sendJSON } from './helpers.js';
import { AJAX } from './helpers.js';

export const state = {
  recipe: {},
  search: {
    query: '',
    result: [],
    page: 1,
    allPage: '',
    resultPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
};

const createRecipeObject = function (data) {
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
  };
};

export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);
    state.recipe = createRecipeObject(data);
    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;
  } catch (err) {
    console.error(`${err} ☠️☠️☠️`);
    throw err;
  }
};

export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    const { data } = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
    //Reset result page to 1
    state.search.page = 1;
    state.search.result = data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });
  } catch (err) {
    console.error(`${err} ☠️☠️☠️`);
    throw err;
  }
};

export const getSearchResultPage = function (page = state.search.page) {
  state.search.page = page;
  state.search.allPage = Math.ceil(
    state.search.result.length / state.search.resultPerPage
  );
  const start = (page - 1) * state.search.resultPerPage; //0;
  const end = page * state.search.resultPerPage; //9;
  return state.search.result.slice(start, end);
};

export const updateServing = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity / state.recipe.servings) * newServings;
  });
  state.recipe.servings = newServings;
};

const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const addBookmark = function (recipe) {
  //Add bookmark
  state.bookmarks.push(recipe);
  //Mark current recipe as bookmark
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;
  console.log(state.bookmarks);
  persistBookmarks();
};

export const deletBookmark = function (id) {
  const index = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.splice(index, 1);

  //Mark current recipe as not bookmark
  if (id === state.recipe.id) state.recipe.bookmarked = false;
  persistBookmarks();
};

const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};
init();

const clearBookmark = function () {
  localStorage.clear();
};
// clearBookmark();

export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].split(',').map(el => el.trim());
        // const ingArr = ing[1].replaceAll(' ', '').split(',');
        if (ingArr.length !== 3)
          throw new Error(
            'Wrong ingredient format !Please use the correct format!'
          );
        const [quantity, unit, description] = ingArr;
        return { quantity: quantity ? +quantity : null, unit, description };
      });
    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };
    console.log(recipe);
    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};

export function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

const initClient = async function () {
  try {
    await gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES,
    });
    console.log(gapi.auth2.getAuthInstance().isSignedIn.get());
  } catch (err) {
    console.log(err);
  }
};

export const loadCalendarAPI = async function (calendarData) {
  try {
    const dataArr = Object.entries(calendarData);
    const { content, date, endTime, startTime, title } =
      Object.fromEntries(dataArr);
    const [year, mounth, day] = date.split('-');
    const [startHour, startMin] = startTime.split(':');
    const [endHour, endMin] = endTime.split(':');
    const ingredient = state.recipe.ingredients.map(ing => {
      const { quantity, unit, description } = ing;
      return `${quantity}-${unit}${description}\n`;
    });

    const event = {
      summary: title,
      description: `${content}\n${ingredient.join().replaceAll(',', '')}`,
      start: {
        dateTime: new Date(year, mounth - 1, day, startHour, startMin),
        timeZone: '',
      },
      end: {
        dateTime: new Date(year, mounth - 1, day, endHour, endMin),
        timeZone: '',
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 10 },
        ],
      },
      colorId: 3,
    };
    const request = gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });
    request.execute();
  } catch (err) {
    console.log(err);
  }
  // console.log(dataArr);
  // gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
};
