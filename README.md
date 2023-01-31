
# Filmoteka Project

The movie search app Filmoteka is a real pocket encyclopedia for every movie lover.
Choose films from the most popular and highly rated ones, filter films by release year, genre, rating, language, watch trailers, read descriptions, save already watched or selected for watching later movies to your personal filmoteka.



## Authors

The project was initially created as a team project of the group of GoIT school Bootcamp 34 collaborators (list of all collaborators can be found in repository information, download presentation (Ukrainian): [https://github.com/iuliia-sokol/FilmotekaProject/raw/main/FilmotekaProject.pptx]) and later refactored and improved by me.



## Optimizations

Features initially developed by me: modal windows, work with local storage, no movie found page.

Some additional features and design solutions were added by me later: user registration & authentication (via Firebase), saving user's library to DB, movie filtering logic and it's visual implementation, secret API keys (using Dotenv (https://www.npmjs.com/package/dotenv)), light theme gradients, custom pagination for light mode.


## Features

- 100% responsive
- Clean and creative design
- Cross platform
- Light/dark mode toggle






## Tech Stack

**Client:** The project was created using Parcel (https://parceljs.org/) and written on vanilla JS with some extra libs added.

**Back** The project is based on The Movie Database (TMDB) API (https://developers.themoviedb.org/3/getting-started/introduction).

**Libs:** Swiper (https://swiperjs.com/), TUI pagination (https://www.npmjs.com/package/tui-pagination), Axios (https://axios-http.com/docs/intro), Basiclightbox (https://basiclightbox.electerious.com/), Notiflix (https://notiflix.github.io/), Bigpicture (https://www.npmjs.com/package/bigpicture), Lodash . (https://lodash.com/).


## Run Locally

To check it out locally, clone the repository to your machine, open it in CLI (VScode etc) and install it with npm:

```bash
  git clone https://github.com/iuliia-sokol/FilmotekaProject
```

Go to the project directory

```bash
  cd FilmotekaProject (name of your local folder)
```

Install dependencies

```bash
  npm install 
```

Start the server

```bash
  npm start
```


## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

**THE MOVIE DB ACCESS KEY** 

API_KEY = ""

**FIREBASE_CONFIG** 

apiKey= ''

authDomain=''

databaseURL=''

projectId=''

storageBucket=''

messagingSenderId=''

appId=''



**Access keys can be got here:** 
https://developers.themoviedb.org/3/getting-started/introduction

https://firebase.google.com/?hl=en
