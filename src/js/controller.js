'strict mode';

import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './view/recipeView.js';
import SearchView from './view/searchView.js';
import resultsView from './view/resultsView.js';
import paginationView from './view/paginationView.js';
import bookmarksView from './view/bookmarksView.js';
import addRecipeView from './view/addRecipeView.js';
import calendarView from './view/calendarView.js';
import 'core-js/stable';
import 'regenerator-runtime';
import { async } from 'regenerator-runtime';

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////
// if (module.hot) {
//   module.hot.accept();
// }

const controRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    // renderSpinner(recipeContainer);
    recipeView.renderSpinner();
    // 0 Update results view to mark selected search result
    resultsView.update(model.getSearchResultPage());
    bookmarksView.update(model.state.bookmarks);
    //1:Loading recipe
    await model.loadRecipe(id);
    //2: Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlSearchResult = async function () {
  try {
    resultsView.renderSpinner();
    // 1) Get search query
    const qurey = SearchView.getQuery();
    if (!qurey) return;
    // 2) Load search result
    await model.loadSearchResults(qurey);
    // 3) Render results
    resultsView.render(model.getSearchResultPage());
    console.log(model.state.search.result);
    // 4) Render initial pagination buttons
    paginationView.render(model.state.search);
    console.log(model.state.recipe);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  // 1)Render New Result page
  resultsView.render(model.getSearchResultPage(goToPage));
  // 2)Render New Pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  //Update the recipe servings (ins state)
  model.updateServing(newServings);
  //Update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  //1 ) Add or remove bookmart
  !model.state.recipe.bookmarked
    ? model.addBookmark(model.state.recipe)
    : model.deletBookmark(model.state.recipe.id);
  //2 ) Update recipe view
  recipeView.update(model.state.recipe);
  //3 ) Render bookmark
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (recipe) {
  try {
    await model.uploadRecipe(recipe);
    // Show loading spinner
    recipeView.renderSpinner();
    //Render recipe
    recipeView.render(model.state.recipe);
    //Render bookmark
    bookmarksView.render(model.state.bookmarks);
    //Success message
    addRecipeView.renderMessage();

    //Change ID in URL
    window.history.pushState('', '', `#${model.state.recipe.id}`);
    //Close form window
    setTimeout(function () {
      // addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error(err);
    addRecipeView.renderError(err);
  }
};
const controlRenderAddRecipeForm = function () {
  addRecipeView.render();
  // model.uploadRecipe(recipe);
  addRecipeView.toggleWindow();
};

const controlCalendarResponse = function (calendarData) {
  model.loadCalendarAPI(calendarData);
  calendarView.renderMessage();
};
const controlCalendar = function () {
  calendarView.render();
  calendarView.toggleWindow();
};

const init = function () {
  calendarView.addHandlerRenderCalendar(controlCalendar);
  addRecipeView.addHandlerShowWindow(controlRenderAddRecipeForm);
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerBookmark(controlAddBookmark);
  SearchView.addHandlerSearch(controlSearchResult);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandleUpload(controlAddRecipe);
  calendarView.addUploadCalendar(controlCalendarResponse);
  window.addEventListener('load', model.handleClientLoad);
};
init();
