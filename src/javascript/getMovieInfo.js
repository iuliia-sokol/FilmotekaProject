export const getOneMovieInfo = movieInfo => {
  const id = movieInfo?.id;
  const title = movieInfo?.title;
  let posterUrl = movieInfo?.poster_path
    ? `https://image.tmdb.org/t/p/w500${movieInfo.poster_path}`
    : `https://m.media-amazon.com/images/M/MV5BMTRkZGE0YWYtMDFhOS00N2I4LTljMTMtYjk0MTI2YmVhOTU4XkEyXkFqcGdeQXVyNjgxNzM0NDI@._V1_.jpg`;

  let genres = [];

  movieInfo.genres.forEach(genre => {
    genres.push(genre.name);
  });
  genres = genres.join(', ');

  let year = '';
  if (movieInfo?.release_date) {
    year = movieInfo.release_date?.length
      ? movieInfo?.release_date.slice(0, 4)
      : '';
  }
  let vote_average = 0;
  if (movieInfo?.vote_average) {
    vote_average = movieInfo.vote_average.toFixed(2);
  }
  const noImage = `https://m.media-amazon.com/images/M/MV5BMTRkZGE0YWYtMDFhOS00N2I4LTljMTMtYjk0MTI2YmVhOTU4XkEyXkFqcGdeQXVyNjgxNzM0NDI@._V1_.jpg`;
  return { title, posterUrl, genres, year, id, noImage, vote_average };
};
