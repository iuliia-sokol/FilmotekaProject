import { getOneMovieInfo } from './getMovieInfo';
import { allProducts } from '/src/index';
import { createModalMarkUp } from './renderModalMarkUp';
import { ThemoviedbAPI } from './themoviedbAPI';
import BigPicture from 'bigpicture';
import { save, get, remove } from './localStorageUse';
import { spinnerPlay, spinnerStop } from './spiner';
import { instance } from './firebase';

const movieAPI = new ThemoviedbAPI();

export function getItems(parent) {
  const lightboxedCard = parent.childNodes;
  const allProducts = [...lightboxedCard];
  lightboxedCard.forEach(item => item.addEventListener('click', openLightbox));
  return allProducts;
}

function getSelectedItem(event, array) {
  const selectedProduct = array.find(
    item => item.dataset.id === event.currentTarget.dataset.id
  );
  return selectedProduct;
}

function openLightbox(event) {
  event.preventDefault();
  let innerElements = [];
  [...event.currentTarget.children].forEach(el =>
    innerElements.push([...el.children])
  );
  innerElements = innerElements.flatMap(el => el);
  if (
    event.target === event.currentTarget ||
    [...event.currentTarget.children].includes(event.target) ||
    innerElements.includes(event.target)
  ) {
    onFilmCardClick(event);
  }
  return;
}

async function onFilmCardClick(event) {
  const selectedProduct = await getSelectedItem(event, allProducts);

  const filmId = selectedProduct.dataset.id;
  try {
    spinnerPlay();
    movieAPI.fetchMovieById(filmId).then(result => {
      const data = result;

      const posterPath = data.poster_path
        ? `https://image.tmdb.org/t/p/w300${data.poster_path}`
        : `https://astoriamuseums.org/wp-content/uploads/2020/10/OFM-poster-not-available.png`;
      const releaseYear = new Date(Date.parse(data.release_date)).getFullYear();

      const filmData = {
        id: data.id,
        poster: posterPath,
        title: data.title.replaceAll("'", '`'),
        originalTitle: data.original_title.replaceAll("'", '`'),
        genres: [],
        popularity: data.popularity.toFixed(1),
        overview: data.overview.replaceAll("'", '`'),
        vote_average: data.vote_average.toFixed(1),
        vote_count: data.vote_count,
        release_date: releaseYear,
      };

      data.genres.forEach(genre => {
        filmData.genres.push(genre.name);
      });
      filmData.genres = filmData.genres.join(', ');

      const stringifiedJSONFilmData = JSON.stringify(filmData);
      const filmDataObj = getOneMovieInfo(data);
      save('modalInfo', filmDataObj);

      createModalMarkUp(filmData, filmDataObj);

      getTrailer(filmId);

      const addToWatchedBtn = document.querySelector(
        '.lightbox-modal__watched-button'
      );

      const addToQuequeBtn = document.querySelector(
        '.lightbox-modal__queque-button'
      );
      checkLocalStorage(
        'watched',
        filmDataObj,
        addToWatchedBtn,
        'Added to watched'
      );
      checkLocalStorage(
        'queue',
        filmDataObj,
        addToQuequeBtn,
        'Added to queque'
      );

      addToWatchedBtn.addEventListener('click', onAddToWatchedClick);
      addToQuequeBtn.addEventListener('click', onAddToQuequeClick);
    });
  } catch (error) {
    Notify.failure('Ооps, something went wrong, please try again');
  } finally {
    spinnerStop();
  }
}

function getTrailer(filmId) {
  try {
    movieAPI.fetchTrailerById(filmId).then(result => {
      const trailers = result.results;
      if (trailers.length > 0) {
        const trailerBtn = document.querySelector('.lightbox-modal__trailer');
        trailerBtn.classList.remove('is-hidden');
        const officialTrailer = trailers.find(
          el =>
            el.name === 'Official Trailer' ||
            el.name.includes('Official') ||
            el.name[0]
        );
        const trailerKey = officialTrailer.key;

        trailerBtn.addEventListener('click', ontrailerBtnClick);

        function ontrailerBtnClick(e) {
          BigPicture({
            el: e.target,
            ytSrc: `${trailerKey}`,
          });
        }
      }
    });
  } catch {
    er => {
      console.log(er);
    };
  }
}

function onAddToWatchedClick(event) {
  event.preventDefault();
  event.target.textContent = 'Added to watched';
  event.target.disabled = true;
  if (instance.userId) {
    addToFirebase(
      +event.target.dataset.btn,
      event.target.dataset.type,
      event.target.dataset.id
    );
  } else {
    addToLocalStorage(
      +event.target.dataset.btn,
      event.target.dataset.type,
      event.target.dataset.id
    );
  }
}

function onAddToQuequeClick(event) {
  event.preventDefault();
  event.target.textContent = 'Added to queque';
  event.target.disabled = true;
  if (instance.userId) {
    addToFirebase(
      +event.target.dataset.btn,
      event.target.dataset.type,
      event.target.dataset.id
    );
  } else {
    addToLocalStorage(
      +event.target.dataset.btn,
      event.target.dataset.type,
      event.target.dataset.id
    );
  }
}

function checkLocalStorage(key, filmData, btn, btnText) {
  const locStorage = get(key);
  const currentFilm = filmData;
  const includesFilm = locStorage.find(film => film.id === currentFilm.id);

  if (includesFilm) {
    btn.textContent = `${btnText}`;
    btn.disabled = true;
  }
}

function addToLocalStorage(id, type, data) {
  const localStorageItem = get(type) || [];
  if (localStorageItem.find(info => info?.id === id)) return;
  const movieInfo = get('modalInfo');
  localStorageItem.push(movieInfo);
  save(type, localStorageItem);
}

async function addToFirebase(id, type) {
  const isInLyb = await instance.isInLyb(id, type);
  console.log(`Is movie in DB? `, isInLyb);
  if (isInLyb) return;
  const movieInfo = get('modalInfo');
  instance.addToLyb(id, type, movieInfo);
  console.log('added');
}
