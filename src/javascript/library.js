import { Notify } from 'notiflix/build/notiflix-notify-aio';

import { libRefs } from './libRefs';
import { renderLibraryMarkup } from './renderLibraryMarkUp';
import { ThemoviedbAPI } from './themoviedbAPI';
import { scrollFunction } from './scroll';
import { createModalMarkUp } from './renderModalMarkUp';
import { spinnerPlay, spinnerStop } from './spinner';
import { load, removeLocal } from './localStorageUse';
import { getTrailer } from './getTrailer';
import { libraryFooterModalOpen } from './libraryFooterModalOpen';
import { instance } from './firebase';

const themoviedbAPI = new ThemoviedbAPI();

libRefs.watchBtn.classList.add('is-active-library');

try {
  spinnerPlay();
  renderWatchedMovies();
  window.addEventListener('scroll', scrollFunction);
  libRefs.footerLink.addEventListener('click', libraryFooterModalOpen);
} catch (error) {
  Notify.failure('Ооps, something went wrong, please try again');
} finally {
  spinnerStop();
}

libRefs.watchBtn.addEventListener('click', () => {
  libRefs.queueBtn.classList.remove('is-active-library');
  libRefs.watchBtn.classList.add('is-active-library');
  renderWatchedMovies();
});
libRefs.queueBtn.addEventListener('click', () => {
  libRefs.watchBtn.classList.remove('is-active-library');
  libRefs.queueBtn.classList.add('is-active-library');
  renderQueueMovies();
});
libRefs.library.addEventListener('click', onMovieCardClick);

export function displayBg(array) {
  const emptyTitle = document.querySelector('.js-title-queue');
  const emptyImg = document.querySelector('.js-library-bg-image');
  const mainEl = document.querySelector('main');
  if (array.length > 0) {
    emptyTitle.classList.add('visually-hidden');
    emptyImg.classList.add('visually-hidden');
    mainEl.classList.remove('perspective');
  }
  if (array.length === 0) {
    emptyTitle.classList.remove('visually-hidden');
    emptyImg.classList.remove('visually-hidden');
    mainEl.classList.add('perspective');
  }
}

export async function renderWatchedMovies() {
  libRefs.library.innerHTML = '';
  const watchedMovies = load(themoviedbAPI.WATCH_KEY);
  displayBg(watchedMovies);
  try {
    const watchedMoviesIds = watchedMovies.map(movie => movie.id);
    watchedMoviesIds.forEach(async id => {
      const movie = await themoviedbAPI.fetchMovieById(id);
      const genre = movie.genres.map(genre => genre.name);
      if (genre.length > 2) {
        genre.splice(2, genre.length - 1, 'Other');
      }
      if (genre.length === 0) {
        genre.push('Other');
      }
      libRefs.library.insertAdjacentHTML(
        'beforeend',
        renderLibraryMarkup(movie, genre.join(', '))
      );
      libRefs.library.lastElementChild.setAttribute('data-status', 'watched');
    });
  } catch (error) {
    Notify.failure('Ооps, something went wrong, please try again');
  }
}

export async function renderQueueMovies() {
  spinnerPlay();
  libRefs.library.innerHTML = '';
  const queueMovies = load(themoviedbAPI.QUEUE_KEY);
  displayBg(queueMovies);
  const queueMoviesIDes = queueMovies.map(movie => movie.id);
  try {
    queueMoviesIDes.forEach(async id => {
      const movie = await themoviedbAPI.fetchMovieById(id);
      const genre = movie.genres.map(genre => genre.name);
      if (genre.length > 2) {
        genre.splice(2, genre.length - 1, 'Other');
      }
      if (genre.length === 0) {
        genre.push('Other');
      }
      libRefs.library.insertAdjacentHTML(
        'beforeend',
        renderLibraryMarkup(movie, genre.join(', '))
      );
      libRefs.library.lastElementChild.setAttribute('data-status', 'queue');
    });
  } catch (error) {
    console.log(error);
    Notify.failure('Ооps, something went wrong, please try again');
  } finally {
    spinnerStop();
  }
}

async function onMovieCardClick(event) {
  const movieCard = event.target.closest('.gallery__item');
  try {
    spinnerPlay();
    const movieId = movieCard.dataset.id;

    const movieStatus = movieCard.dataset.status;

    await themoviedbAPI.fetchMovieById(movieId).then(data => {
      const posterPath = data.poster_path
        ? `https://image.tmdb.org/t/p/w300${data.poster_path}`
        : `https://m.media-amazon.com/images/M/MV5BMTRkZGE0YWYtMDFhOS00N2I4LTljMTMtYjk0MTI2YmVhOTU4XkEyXkFqcGdeQXVyNjgxNzM0NDI@._V1_.jpg`;
      const releaseYear = new Date(Date.parse(data.release_date)).getFullYear();
      const filmData = {
        id: data.id,
        poster: posterPath,
        title: data.title,
        originalTitle: data.original_title,
        genres: [],
        popularity: data.popularity.toFixed(1),
        overview: data.overview,
        vote_average: data.vote_average.toFixed(1),
        vote_count: data.vote_count,
        release_date: releaseYear,
      };

      data.genres.forEach(genre => {
        filmData.genres.push(genre.name);
      });
      filmData.genres = filmData.genres.join(', ');

      getTrailer(movieId, themoviedbAPI);
      createModalMarkUp(filmData);

      const removeFromWatchedBtn = document.querySelector(
        '.lightbox-modal__watched-button'
      );
      const removeFromQuequeBtn = document.querySelector(
        '.lightbox-modal__queque-button'
      );

      removeFromWatchedBtn.addEventListener('click', onRemoveFromWatchedClick);
      removeFromQuequeBtn.addEventListener('click', onRemoveFromQuequeClick);

      checkLocalStorageLibrary(
        themoviedbAPI.WATCH_KEY,
        filmData,
        removeFromWatchedBtn,
        'Remove from Watched',
        'watched'
      );

      checkLocalStorageLibrary(
        themoviedbAPI.QUEUE_KEY,
        filmData,
        removeFromQuequeBtn,
        'Remove from Queque',
        'queue'
      );

      function onRemoveFromWatchedClick(e) {
        const movieId = e.target.dataset.btn;

        removeLocal(themoviedbAPI.WATCH_KEY, movieId);
        e.target.textContent = 'Removed from Watched';
        e.target.disabled = true;
        if (e.target.dataset.list === movieStatus) {
          movieCard.remove();
        }
        if (libRefs.watchBtn.classList.contains('is-active-library')) {
          displayBg(load(themoviedbAPI.WATCH_KEY));
        } else {
          displayBg(load(themoviedbAPI.QUEUE_KEY));
        }

        if (instance.userId) {
          instance.removeFromLyb(+movieId, e.target.dataset.type);
          Notify.info('The movie removed from Watched');
        }
      }

      function onRemoveFromQuequeClick(e) {
        const movieId = e.target.dataset.btn;
        removeLocal(themoviedbAPI.QUEUE_KEY, movieId);
        e.target.textContent = 'Removed from Queque';
        e.target.disabled = true;
        if (e.target.dataset.list === movieStatus) {
          movieCard.remove();
        }
        if (libRefs.watchBtn.classList.contains('is-active-library')) {
          displayBg(load(themoviedbAPI.WATCH_KEY));
        } else {
          displayBg(load(themoviedbAPI.QUEUE_KEY));
        }
        if (instance.userId) {
          instance.removeFromLyb(+movieId, e.target.dataset.type);
          Notify.info('The movie removed from Queue');
        }
      }
    });
  } catch (error) {
    console.log(error);
    Notify.failure('Ооps, something went wrong, please try again');
  } finally {
    spinnerStop();
  }
}

function checkLocalStorageLibrary(key, filmData, btn, btnText, status) {
  const locStorage = load(key);
  const currentFilm = filmData;
  const includesFilm = locStorage.find(film => film.id === currentFilm.id);

  if (includesFilm) {
    btn.dataset.list = `${status}`;
    btn.textContent = `${btnText}`;
  }
  if (!includesFilm) {
    btn.classList.add('visually-hidden');
  }
}

const Theme = {
  LIGHT: 'light-theme',
  DARK: 'dark-theme',
};

const STORAGE_KEY = 'themeKeyLibrary';

const libraryCheckBox = document.querySelector('.theme-switch__toggle');
const bgEl = document.querySelector('.cloak');

libraryCheckBox.addEventListener('change', onChange);
isTheme();

function onChange(e) {
  if (e.target.checked) {
    bgEl.classList.add('cloak--dark');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Theme.DARK));
  } else {
    bgEl.classList.remove('cloak--dark');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Theme.LIGHT));
  }
}

function isTheme() {
  const saveTheme = localStorage.getItem(STORAGE_KEY);

  if (!saveTheme) {
    bgEl.classList.remove('cloak--dark');

    localStorage.setItem(STORAGE_KEY, JSON.stringify(Theme.LIGHT));
    libraryCheckBox.checked = false;
  } else {
    const parseTheme = JSON.parse(saveTheme);
    if (parseTheme === 'dark-theme') {
      bgEl.classList.add('cloak--dark');
      libraryCheckBox.checked = true;
    }
    if (parseTheme === 'light-theme') {
      bgEl.classList.remove('cloak--dark');
      libraryCheckBox.checked = false;
    }
  }
}
