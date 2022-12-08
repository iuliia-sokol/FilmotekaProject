export function renderMarkup(data, genres) {
  const { id, poster_path, title, release_date, vote_average } = data;
  const posterPath = data.poster_path
    ? `https://image.tmdb.org/t/p/w300${poster_path}`
    : `https://m.media-amazon.com/images/M/MV5BMTRkZGE0YWYtMDFhOS00N2I4LTljMTMtYjk0MTI2YmVhOTU4XkEyXkFqcGdeQXVyNjgxNzM0NDI@._V1_.jpg`;
  const releaseYear = new Date(Date.parse(release_date)).getFullYear() || '';

  return `<li class="gallery__item movie-card" data-id="${id}">
                  <div class="movie-card__poster-thumb">
                    <img src="${posterPath}"
                        class="movie-card__poster"
                        alt="${title}"
                                            />
                  </div>
                  <div class="movie-card__wrap">
                      <h2 class="movie-info-title"> ${title}</h2>
                      <div class="movie-info-list">
                      <p class="info-item-genre">${genres}</p>
                        <span class="info-item-slash"> | </span>
                        <p class="info-item-year">${releaseYear}</p>
                      </div>
                  </div>
            </li>`;
}
