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
import { set, get, removeLocal } from './localStorageUse';
import storageAPI from './storageAPI';

// Your web app's Firebase configuration
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyDirVSk2C0xEc8PdJg7baqOMmHMSdYv4e8',
  authDomain: 'filmotekaproject-744dd.firebaseapp.com',
  databaseURL:
    'https://filmotekaproject-744dd-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'filmotekaproject-744dd',
  storageBucket: 'filmotekaproject-744dd.appspot.com',
  messagingSenderId: '331180036974',
  appId: '1:331180036974:web:cccd88ef68088de38ae77f',
};

// Initialize Firebase
// const app = initializeApp(FIREBASE_CONFIG);
// const auth = getAuth(app);

class firebaseAPI {
  constructor(signInBtnEl, logOutBtnEl) {
    this.firebaseConfig = FIREBASE_CONFIG;
    this.firebaseApp = initializeApp(this.firebaseConfig);
    this.firebaseAuth = getAuth(this.firebaseApp);
    this.providerGoogle = new GoogleAuthProvider();
    //   this.database = getDatabase(this.firebaseApp);
    this.database = getDatabase(this.firebaseApp);
    this.userStatus = refs.userStatusEl;
    this.apiKey = this.firebaseConfig.apiKey;
    this.monitorAuthState();
    signInBtnEl.addEventListener(
      'click',
      this.signInWithRedirectFirebase.bind(this)
    );
    logOutBtnEl.addEventListener('click', this.logout.bind(this));
  }

  async signInWithEmailLink() {
    const actionCodeSettings = {
      url: 'http://localhost:1234',
      handleCodeInApp: true,
    };
    const userEmail = refs.emailInputEl.value.trim();
    console.log(userEmail);
    sendSignInLinkToEmail(this.firebaseAuth, userEmail, actionCodeSettings)
      .then(() => {
        // The link was successfully sent. Inform the user.
        // Save the email locally so you don't need to ask the user for it again
        // if they open the link on the same device.
        window.localStorage.setItem('emailForSignIn', userEmail);
        // ...
      })
      .catch(error => {
        console.log(error.message);
      });
  }
  async signInWithPopupGoogle() {
    try {
      const signInResult = await signInWithPopup(
        this.firebaseAuth,
        this.providerGoogle
      );
      // const credential = GoogleAuthProvider.credentialFromResult(signInResult);
      // const token = credential.accessToken;
      const user = signInResult.user;
      this.userId = user.uid;
      this.userStatus.textContent = `Hello, ${user.displayName}`;
      //   console.log(user);
    } catch (error) {
      // const errorCode = error.code;
      // const errorMessage = error.message;
      // The email of the user's account used.
      // const email = error.customData.email;
      // The AuthCredential type that was used.
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
      // Additional state parameters can also be passed via URL.
      // This can be used to continue the user's intended action before triggering
      // the sign-in operation.
      // Get the email if available. This should be available if the user completes
      // the flow on the same device where they started it.
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        // User opened the link on a different device. To prevent session fixation
        // attacks, ask the user to provide the associated email again. For example:
        email = window.prompt('Please provide your email for confirmation');
      }
      // The client SDK will parse the code from the link for you.
      await signInWithEmailLink(this.firebaseAuth, email, window.location.href)
        .then(result => {
          // Clear email from storage.
          window.localStorage.removeItem('emailForSignIn');
          window.location.replace(window.location.origin);
          // You can access the new user via result.user
          // Additional user info profile not available via:
          // result.additionalUserInfo.profile == null
          // You can check if the user is new or existing:
          // result.additionalUserInfo.isNewUser
        })
        .catch(error => {
          // Some error occurred, you can inspect the code: error.code
          // Common errors could be invalid email and invalid or expired OTPs.
        });
    }

    onAuthStateChanged(this.firebaseAuth, user => {
      if (user) {
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

        // showApp();
        // showLoginState(user);
        // userId = user.uid;
        // hideLoginError();
        // hideLinkError();
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
          console.log(
            'Data Monitor ---> Data from watched DB have changed',
            data
          );
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
          //   console.log(
          //     'Data Monitor ---> Data from queue DB have changed',
          //     data
          //   );
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
    } catch (error) {
      console.log(error);
    }
  }
  async isInLyb(id, type) {
    try {
      const dbRef = ref(this.database);
      console.log(dbRef);
      const snapshot = await get(
        child(dbRef, `users/${this.userId}/lybrary/${type}/${id}`)
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

  async isInQueue(id) {
    return ref((this.database, `users/${this.userId}/lybrary/queue/${id}`));
  }

  async addToLib(id, type, movieInfo) {
    // console.log(`Movie is added to ${type}`);
    // console.dir(movieInfo);
    console.log(this.database);

    set(ref(this.database, `users/${this.userId}/lybrary/${type}/${id}`), {
      id: movieInfo.id || null,
      title: movieInfo.title || null,
      poster: movieInfo.poster || null,
      genres: movieInfo.genres || null,
      year: movieInfo.release_date || null,
      popularity: movieInfo.popularity || null,
    });
  }

  async addToFirebase(id, type, data) {
    const isInLyb = await this.isInLyb(id, type);
    // console.log(`Is movie in DB? `, isInLyb);
    if (isInLyb) return;
    // const movieInfo = storageAPI.load('modalInfo');
    // console.log(data);
    this.addToLib(id, type, data);
  }

  async removeFromLyb(id, type) {
    try {
      remove(ref(this.database, `users/${this.userId}/lybrary/${type}/${id}`));
    } catch (error) {
      console.log(`Fail to remove from DB ---> ${error}`);
    }
  }

  async addToWatched(movieInfo) {
    set(
      ref(
        this.database,
        `users/${this.userId}/lybrary/watched/${movieInfo.id}`
      ),
      {
        id: movieInfo.id || null,
        title: movieInfo.title || null,
        poster: movieInfo.poster || null,
        genres: movieInfo.genres || null,
        year: movieInfo.release_date || null,
        popularity: movieInfo.popularity || null,
      }
    );
  }

  async addToQueued(movieInfo) {
    set(
      ref(this.database, `users/${this.userId}/lybrary/queued/${movieInfo.id}`),
      {
        id: movieInfo.id || null,
        title: movieInfo.title || null,
        poster: movieInfo.poster || null,
        genres: movieInfo.genres || null,
        year: movieInfo.release_date || null,
        popularity: movieInfo.popularity || null,
      }
    );
  }

  async removeFromWatched(movieId) {
    remove(ref(this.database, `users/${this.userId}/watched/${movieId}`));
  }
}

const instance = new firebaseAPI(refs.signInBtnEl, refs.signOutBtnEl);

export default {
  instance,
};

console.log(ref(instance.database));
