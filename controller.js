import * as model from './model.js';
import { MODEL_CLOSE_SEC } from './config.js';
import recipeview from './recipeview.js';
import searchView from './searchView.js';
import resultsView from './resultsView.js';
import bookmarksView from './bookmarksView.js';
import paginationView from './paginationView.js';
import AddRecipeView from './addRecipeView.js';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import addRecipeView from './addRecipeView.js';

// https://forkify-api.herokuapp.com/v2 API

//if (module.hot) {
//module.hot.accept();
//}

//API
const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1); //id of recipe

    if (!id) return;
    recipeview.renderSpinner(); //if not id webiste spins

    //0) Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    //updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    //Loadding Recipe
    await model.loadRecipe(id);

    //Rendering recipe
    recipeview.render(model.state.recipe); //rendering the recipe to the ui
  } catch (err) {
    recipeview.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    ///Get search query
    const query = searchView.getQuery();
    if (!query) return;

    //Load search results
    await model.loadSearchResults(query);
    //Render results
    resultsView.render(model.getSearchResultsPage());
    //Render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (gotoPage) {
  //Render new results
  resultsView.render(model.getSearchResultsPage(gotoPage));

  //Render initial pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  //Update the recipe servings (in state)
  model.updateServings(newServings);
  //Update the recipe view
  recipeview.update(model.state.recipe);
};

const controlAddBookmark = function () {
  //Add or remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookMark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  //update recipe view
  recipeview.update(model.state.recipe);
  //render bookmakrs
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    //show loading spinner
    addRecipeView.renderSpinner();

    //Upload the new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    //render recipe
    recipeview.render(model.state.recipe);

    //Success Message
    addRecipeView.renderMessage();

    //render bookmarkview
    bookmarksView.render(model.state.bookmarks);

    //change id in url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    //Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODEL_CLOSE_SEC * 1000);
  } catch (err) {
    console.log('💥', err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeview.addHandlerRender(controlRecipes);
  recipeview.addHandlerUpdateServings(controlServings);
  recipeview.addhandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView._addHandlerUpload(controlAddRecipe);
};

init();
