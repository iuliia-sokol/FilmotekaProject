import axios from 'axios';

import { API_KEY } from './consts';
import { save, load } from './localStorageUse';

axios.defaults.baseURL = 'https://api.themoviedb.org/3';

export class ThemoviedbAPI {
  #API_KEY = API_KEY;
  totalMovies = 0;
  query = '';
  genres = [];

  constructor() {
    this.WATCH_KEY = 'watched';
    this.QUEUE_KEY = 'queue';

    this.filterParams = {
      // sort_by: 'vote_average.desc',
      // ['vote_count.gte']: 10,
    };
  }

  async fetchFavouritesMovies(page) {
    const params = new URLSearchParams({
      api_key: this.#API_KEY,
      page: page,
    });

    const { data } = await axios.get('/trending/movie/week', { params });
    return data;
  }

  async fetchMoviesByQuery(page) {
    const params = new URLSearchParams({
      api_key: this.#API_KEY,
      query: this.query,
      page: page,
      // language: '',
      // primary_release_year: ''
    });

    const { data } = await axios.get('/search/movie', { params });
    return data;
  }

  async fetchMovieById(id) {
    const params = new URLSearchParams({
      api_key: this.#API_KEY,
    });
    return await fetch(
      `https://api.themoviedb.org/3/movie/${id}?${params}`
    ).then(response => {
      if (!response.ok) {
        throw new Error('Oops, there is no movie with that name');
      }
      return response.json();
    });
  }

  // async turnKeywordToId() {
  //   const filters = load('filters');
  //   const keywordFilter = filters.find(el => el['with_keywords']);
  //   const keywordToDFind = Object.values(keywordFilter).toString();
  //   console.log(keywordToDFind);

  //   const params = new URLSearchParams({
  //     api_key: this.#API_KEY,
  //     query: keywordToDFind,
  //   });

  //   const data = await axios.get('/search/keyword', { params });
  //   console.log(data);
  // }

  async fetchFiltered(page) {
    const filters = load('filters');
    let filtersForFetch = {};
    // console.dir(filters);

    filters.forEach(filter => {
      const [filterName, filterValue] = Object.entries(filter)[0];
      filtersForFetch[filterName] = filterValue;
    });
    this.filterParams = filtersForFetch;

    const params = new URLSearchParams({
      api_key: this.#API_KEY,
      page: page,
      ...this.filterParams,
    });
    const { data } = await axios.get('discover/movie', { params });
    return data;
  }

  async fetchTrailerById(id) {
    const params = new URLSearchParams({
      api_key: this.#API_KEY,
    });
    return await fetch(
      `https://api.themoviedb.org/3/movie/${id}/videos?${params}`
    ).then(response => {
      if (!response.ok) {
        throw new Error('Oops, there is no movie with that name');
      }
      return response.json();
    });
  }

  async fetchGenres() {
    const params = new URLSearchParams({
      api_key: this.#API_KEY,
    });
    const allGenres = await axios.get('/genre/movie/list', { params });
    this.genres = allGenres.data.genres;
    return allGenres;
  }
}
