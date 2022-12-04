import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signInWithRedirect,
} from 'firebase/auth';
import {
  getDatabase,
  ref,
  set,
  get,
  child,
  remove,
  onValue,
} from 'firebase/database';
import { refs } from './refs';
import { save, get, removeLocal, clearLocal } from './localStorageUse';
import { ThemoviedbAPI } from './themoviedbAPI';
import storageAPI from './storageAPI';

const themoviedbAPI = new ThemoviedbAPI();

// Your web app's Firebase configuration
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyBglmuNVewy1l7IUbE5KW2_O5fvpVxdZxg',
  authDomain: 'filmoteka-e29b5.firebaseapp.com',
  databaseURL:
    'https://filmoteka-e29b5-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'filmoteka-e29b5',
  storageBucket: 'filmoteka-e29b5.appspot.com',
  messagingSenderId: '444486444061',
  appId: '1:444486444061:web:04353f02de3f72763252f4',
};

class firebaseAPI {
  constructor(signInBtnEl, logOutBtnEl) {
    this.firebaseConfig = FIREBASE_CONFIG;
    this.firebaseApp = initializeApp(this.firebaseConfig);
    this.firebaseAuth = getAuth(this.firebaseApp);
    this.providerGoogle = new GoogleAuthProvider();
    this.database = getDatabase(this.firebaseApp);
    this.userStatus = refs.userStatusEl;
    this.apiKey = this.firebaseConfig.apiKey;
    this.dbRef = ref(this.database);
    this.monitorAuthState();
    signInBtnEl.addEventListener(
      'click',
      this.signInWithRedirectFirebase.bind(this)
    );
    logOutBtnEl.addEventListener('click', this.logout.bind(this));
  }

  //   async signInWithEmailLink() {
  //     const actionCodeSettings = {
  //       // URL you want to redirect back to. The domain (www.example.com) for this
  //       // URL must be in the authorized domains list in the Firebase Console.
  //       url: 'http://localhost:1234',
  //       // This must be true.
  //       handleCodeInApp: true,
  //     };
  //     const userEmail = refs.emailInputEl.value.trim();
  //     console.log(userEmail);
  //     sendSignInLinkToEmail(this.firebaseAuth, userEmail, actionCodeSettings)
  //       .then(() => {
  //         // The link was successfully sent. Inform the user.
  //         // Save the email locally so you don't need to ask the user for it again
  //         // if they open the link on the same device.
  //         window.localStorage.setItem('emailForSignIn', userEmail);
  //         // ...
  //       })
  //       .catch(error => {
  //         console.log(error);
  //         const errorCode = error.code;
  //         const errorMessage = error.message;
  //         // ...
  //       });
  //   }

  async signInWithPopupGoogle() {
    try {
      const signInResult = await signInWithPopup(
        this.firebaseAuth,
        this.providerGoogle
      );
      const user = signInResult.user;
      this.userId = user.uid;
      this.userStatus.textContent = `Hello, ${user.displayName}`;
      //   console.log(user);
    } catch (error) {
      const credential = GoogleAuthProvider.credentialFromError(error);
      console.log(error);
      console.log(credential);
      console.log('error');
    }
  }

  async signInWithRedirectFirebase() {
    signInWithRedirect(this.firebaseAuth, this.providerGoogle);
  }

  async writeDataToStorage(key, data) {
    storageAPI.save(key, data);
  }

  // Monitor auth state
  async monitorAuthState() {
    if (isSignInWithEmailLink(this.firebaseAuth, window.location.href)) {
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        email = window.prompt('Please provide your email for confirmation');
      }

      await signInWithEmailLink(this.firebaseAuth, email, window.location.href)
        .then(result => {
          // Clear email from storage.
          window.localStorage.removeItem('emailForSignIn');
          window.location.replace(window.location.origin);
        })
        .catch(error => {
          console.log(error);
        });
    }
    onAuthStateChanged(this.firebaseAuth, user => {
      if (user) {
        // uiAPI.hideRegistrationInfo();
        this.userId = user.uid;
        refs.signOutBtnEl.classList.remove('visually-hidden');
        refs.signInBtnEl.classList.add('visually-hidden');
        refs.userStatusEl.textContent = `Hello, ${user.displayName}`;
        console.log('User info from monitor', user);
        this.accessToken = user.accessToken;
        const watched = storageAPI.load('watched');

        if (watched) {
          watched.forEach(movie => {
            this.addToLyb(movie.id, 'watched', movie);
          });
        }

        const queue = storageAPI.load('queue');
        if (queue) {
          queue.forEach(movie => {
            this.addToLyb(movie.id, 'queue', movie);
          });
        }

        const userLybraryWatched = ref(
          this.database,
          `users/${this.userId}/lybrary/watched/`
        );
        onValue(userLybraryWatched, watched => {
          //   uiAPI.hideLoadingInfo();
          const data = watched.val();
          if (data) {
            const keys = Object.keys(data);
            const watchedStorage = keys.map(key => data[key]);
            this.writeDataToStorage('watched', watchedStorage);
          } else {
            this.writeDataToStorage('watched', []);
          }
          //   modalMovieCardAPI.showLybrary('watched');
        });
        const userLybraryQueue = ref(
          this.database,
          `users/${this.userId}/lybrary/queue/`
        );
        onValue(userLybraryQueue, queue => {
          //   uiAPI.hideLoadingInfo();
          const data = queue.val();
          if (data) {
            const keys = Object.keys(data);
            const queueStorage = keys.map(key => data[key]);
            this.writeDataToStorage('queue', queueStorage);
          } else {
            this.writeDataToStorage('queue', []);
          }

          //   modalMovieCardAPI.showLybrary('queue');
        });
      } else {
        refs.signOutBtnEl.classList.add('visually-hidden');
        refs.signInBtnEl.classList.remove('visually-hidden');
        this.userStatus.textContent = 'You are not logged in';
        console.log(`You're not logged in.`);
      }
    });
  }

  // Log out
  async logout() {
    try {
      await signOut(this.firebaseAuth);
      sessionStorage.clear();
      window.location.reload();
      this.userStatus.textContent = 'Logged Out';
      this.userId = null;
      window.localStorage.removeItem('watched');
      window.localStorage.removeItem('queue');
      window.localStorage.removeItem('modalInfo');
    } catch (error) {
      console.log(error);
    }
  }

  async isInLyb(id, type) {
    try {
      const snapshot = await get(
        child(this.dbRef, `users/${this.userId}/lybrary/${type}/${id}`)
      );
      if (snapshot.exists()) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  async addToLyb(id, type, movieInfo) {
    set(ref(this.database, `users/${this.userId}/lybrary/${type}/${id}`), {
      id: movieInfo.id || null,
      title: movieInfo.title || null,
      posterUrl: movieInfo.posterUrl || null,
      genres: movieInfo.genres || null,
      year: movieInfo.year || null,
    });
  }

  async removeFromLyb(id, type) {
    try {
      remove(ref(this.database, `users/${this.userId}/lybrary/${type}/${id}`));
    } catch (error) {
      console.log(`Fail to remove from DB ---> ${error}`);
    }
  }
  async setYouTubeStatus(timeStamp, status) {
    set(ref(this.database, 'appSettings/status'), {
      status,
      timeStamp,
    });
  }
  async getYouTubeStatus() {
    const snapshot = await get(child(this.dbRef, `appSettings/status`));
    return snapshot.val();
  }
}

export const instance = new firebaseAPI(refs.signInBtnEl, refs.signOutBtnEl);
