import Pagination from 'tui-pagination';
import 'tui-pagination/dist/tui-pagination.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import customSelect from 'custom-select';
import 'custom-select/build/custom-select.css';

import { refs } from './javascript/refs';
import { renderMarkup } from './javascript/renderMarkup';
import { ThemoviedbAPI } from './javascript/themoviedbAPI';
import { getItems } from './javascript/movie-modal';
import { spinnerPlay, spinnerStop } from './javascript/spinner';
import { callfooterModal } from './javascript/footerModal';
import { scrollFunction } from './javascript/scroll';
import { renderGenres } from './javascript/renderGenres';
import { paginOptions, paginOptionsLess } from './javascript/paginOptions';
import firebaseAPI from './javascript/firebase';
import { save, load } from './javascript/localStorageUse';

const themoviedbAPI = new ThemoviedbAPI();
export let allFilms = null;

let options = null;
if (window.screen.width <= 480) {
  options = paginOptionsLess;
} else {
  options = paginOptions;
}
const pagination = new Pagination(refs.paginationContainer, options);
const page = pagination.getCurrentPage();

try {
  spinnerPlay();
  startPage();
  refs.footerLink.addEventListener('click', callfooterModal);
  window.addEventListener('scroll', scrollFunction);
} catch (error) {
  Notify.failure('Ооps, something went wrong, please try again');
} finally {
  spinnerStop();
}

refs.filterForm.addEventListener('submit', onFilterFormSubmit);
refs.formEl.addEventListener('submit', onSearchFormSubmit);
refs.filterGenres.addEventListener('change', onFilterChange);
refs.filterLanguage.addEventListener('change', onFilterChange);
refs.filterYears.addEventListener('change', onFilterChange);
refs.filtersSort.addEventListener('change', onFilterChange);
refs.filterShowBtn.addEventListener('click', onFilterShowBtnClick);

pagination.on('beforeMove', loadMoreFavouritesMovies);

pagination.on('afterMove', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

async function startPage() {
  const genresIds = await themoviedbAPI.fetchGenres();
  const trendMovies = await themoviedbAPI.fetchFavouritesMovies(page);
  save('filters', []);

  pagination.reset(trendMovies.total_results);

  const markup = trendMovies.results
    .map(movie => {
      const genres = renderGenres(movie, [...themoviedbAPI.genres]);
      return renderMarkup(movie, genres);
    })
    .join('');
  refs.gallery.innerHTML = markup;
  allFilms = [...getItems(refs.gallery)];
}

async function onSearchFormSubmit(event) {
  event.preventDefault();
  themoviedbAPI.query = event.target.elements.search.value;
  if (!themoviedbAPI.query) {
    return '';
  }
  try {
    spinnerPlay();
    const searchMovies = await themoviedbAPI.fetchMoviesByQuery(page);
    const markup = searchMovies.results
      .map(movie => {
        const genres = renderGenres(movie, [...themoviedbAPI.genres]);
        return renderMarkup(movie, genres);
      })
      .join('');

    pagination.off('beforeMove', loadMoreFavouritesMovies);
    pagination.off('beforeMove', loadMoreMoviesByQuery);
    pagination.on('beforeMove', loadMoreMoviesByQuery);
    pagination.reset(searchMovies.total_results);

    refs.gallery.innerHTML = markup;
    allFilms = [...getItems(refs.gallery)];
    refs.noResultsTitle.classList.add('visually-hidden');
    refs.noResultsImg.classList.add('visually-hidden');
    refs.gallerySection.classList.remove('gallery-section--hidden');
    refs.btnUpWrapper.classList.remove('visually-hidden');

    if (searchMovies.total_results === 0) {
      refs.searchFailureText.classList.remove('visually-hidden');
      refs.noResultsTitle.classList.remove('visually-hidden');
      refs.noResultsImg.classList.remove('visually-hidden');
      refs.gallerySection.classList.add('gallery-section--hidden');
      refs.btnUpWrapper.classList.add('visually-hidden');
      refs.paginationContainer.style.display = 'none';
      refs.filterShowBtn.style.display = 'none';
      refs.filterBar.style.display = 'none';
    } else {
      refs.searchFailureText.classList.add('visually-hidden');
      refs.paginationContainer.style.display = 'block';
      refs.filterShowBtn.style.display = 'block';
      refs.filterBar.style.display = 'block';
    }
  } catch (err) {
    console.log(err);
    Notify.failure('Ооps, something went wrong, please try again');
  } finally {
    spinnerStop();
  }
  event.target.reset();
}

async function loadMoreFavouritesMovies(event) {
  const currentPage = event.page;
  try {
    spinnerPlay();
    const genresIds = await themoviedbAPI.fetchGenres();
    const trendMovies = await themoviedbAPI.fetchFavouritesMovies(currentPage);

    const markup = trendMovies.results
      .map(movie => {
        const genres = renderGenres(movie, [...themoviedbAPI.genres]);
        return renderMarkup(movie, genres);
      })
      .join('');
    refs.gallery.innerHTML = markup;
    allFilms = [...getItems(refs.gallery)];
  } catch (error) {
    Notify.failure('Ооps, something went wrong, please try again');
  } finally {
    spinnerStop();
  }
}

async function loadMoreMoviesByQuery(event) {
  const currentPage = event.page;
  try {
    spinnerPlay();
    const searchMovies = await themoviedbAPI.fetchMoviesByQuery(currentPage);
    const markup = searchMovies.results
      .map(movie => {
        const genres = renderGenres(movie, [...themoviedbAPI.genres]);
        return renderMarkup(movie, genres);
      })
      .join('');
    refs.gallery.innerHTML = markup;
    allFilms = [...getItems(refs.gallery)];
  } catch (error) {
    Notify.failure('Ооps, something went wrong, please try again');
  } finally {
    spinnerStop();
  }
}

const Theme = {
  LIGHT: 'light-theme',
  DARK: 'dark-theme',
};

const STORAGE_KEY = 'themeKey';

const checkBox = document.querySelector('.theme-switch__toggle');
const body = document.querySelector('body');

checkBox.addEventListener('change', onThemeChange);

isTheme();

function onThemeChange(e) {
  if (e.target.checked) {
    body.classList.remove('ligth-theme');
    body.classList.add('dark-theme');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Theme.DARK));
  } else {
    body.classList.remove('dark-theme');
    body.classList.add('ligth-theme');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Theme.LIGHT));
  }
}

function isTheme() {
  const saveTheme = localStorage.getItem(STORAGE_KEY);
  if (!saveTheme) {
    body.classList.add('ligth-theme');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Theme.LIGHT));
  } else {
    const parseTheme = JSON.parse(saveTheme);
    if (parseTheme === 'dark-theme') {
      body.classList.add('dark-theme');
      checkBox.checked = true;
    }
  }
}

function onFilterChange(e) {
  // console.log(e);
  const form = e.target.closest('.js-filters-form');
  let filters = [];
  for (let i = 0; i < form.elements.length; i += 1) {
    if (form[i].name && form[i].value) {
      filters.push({ [form[i].name]: form[i].value });
    }
  }
  // console.log('filters to save', filters);
  save('filters', filters);
}

async function onFilterFormSubmit(e) {
  e.preventDefault();
  refs.gallery.innerHTML = '';
  try {
    spinnerPlay();
    const searchMovies = await themoviedbAPI.fetchFiltered(page);
    const markup = searchMovies.results
      .map(movie => {
        const genres = renderGenres(movie, [...themoviedbAPI.genres]);
        return renderMarkup(movie, genres);
      })
      .join('');
    refs.gallery.innerHTML = markup;
    allFilms = [...getItems(refs.gallery)];

    pagination.off('beforeMove', loadMoreFavouritesMovies);
    pagination.off('beforeMove', loadMoreMoviesByQuery);
    pagination.on('beforeMove', loadMoreFilteredMovies);
    pagination.reset(searchMovies.total_results);

    refs.noResultsTitle.classList.add('visually-hidden');
    refs.noResultsImg.classList.add('visually-hidden');
    refs.gallerySection.classList.remove('gallery-section--hidden');
    refs.btnUpWrapper.classList.remove('visually-hidden');

    if (searchMovies.results.length === 0) {
      Notify.failure('Oops, no movies found');
      refs.noResultsTitle.classList.remove('visually-hidden');
      refs.noResultsImg.classList.remove('visually-hidden');
      refs.gallerySection.classList.add('gallery-section--hidden');
      refs.btnUpWrapper.classList.add('visually-hidden');
      refs.paginationContainer.style.display = 'none';
    } else {
      refs.paginationContainer.style.display = 'block';
    }

    refs.filterBar.classList.add('is-hidden');
    document.querySelector('main').classList.remove('blur');
    // save('filters', []);
    // e.target.reset();
  } catch (error) {
    Notify.failure('Oops, something went wrong');
    console.log(error);
  } finally {
    spinnerStop();
  }
}

async function loadMoreFilteredMovies(event) {
  const currentPage = event.page;
  try {
    spinnerPlay();
    const searchMovies = await themoviedbAPI.fetchFiltered(currentPage);
    const markup = searchMovies.results
      .map(movie => {
        const genres = renderGenres(movie, [...themoviedbAPI.genres]);
        return renderMarkup(movie, genres);
      })
      .join('');

    refs.gallery.innerHTML = markup;
    allFilms = [...getItems(refs.gallery)];
  } catch (error) {
    Notify.failure('Ооps, something went wrong, please try again');
  } finally {
    spinnerStop();
  }
}

function onFilterShowBtnClick(e) {
  refs.filterBar.classList.toggle('is-hidden');
  document.querySelector('main').classList.toggle('blur');
}

customSelect(
  document.querySelectorAll('.mySelect', {
    containerClass: 'custom-select-container',
    openerClass: 'custom-select-opener',
    panelClass: 'custom-select-panel',
    optionClass: 'custom-select-option',
    optgroupClass: 'custom-select-optgroup',
    isSelectedClass: 'is-selected',
    hasFocusClass: 'has-focus',
    isDisabledClass: 'is-disabled',
    isOpenClass: 'is-open',
  })
);
