import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signInWithRedirect,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
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
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { refs } from './refs';
import { save, load } from './localStorageUse';
import { spinnerPlay, spinnerStop } from './spiner';
import { ThemoviedbAPI } from './themoviedbAPI';
import { onSignInBtnClick } from './authModal';
// import { renderWatchedMovies, renderQueueMovies } from './library';

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
    signInBtnEl.addEventListener('click', onSignInBtnClick);
    logOutBtnEl.addEventListener('click', this.logout.bind(this));
  }

  // async signInWithEmailLink() {
  //   const actionCodeSettings = {
  //     // URL you want to redirect back to. The domain (www.example.com) for this
  //     // URL must be in the authorized domains list in the Firebase Console.
  //     url: 'http://localhost:1234',
  //     // This must be true.
  //     handleCodeInApp: true,
  //   };
  //   const userEmail = refs.emailInputEl.value.trim();
  //   console.log(userEmail);
  //   sendSignInLinkToEmail(this.firebaseAuth, userEmail, actionCodeSettings)
  //     .then(() => {
  //       // The link was successfully sent. Inform the user.
  //       // Save the email locally so you don't need to ask the user for it again
  //       // if they open the link on the same device.
  //       window.localStorage.setItem('emailForSignIn', userEmail);
  //       // ...
  //     })
  //     .catch(error => {
  //       console.log(error);
  //       const errorCode = error.code;
  //       const errorMessage = error.message;
  //       // ...
  //     });
  // }

  async createUserWithEmailAndPassword(email, password) {
    try {
      spinnerPlay();
      const userCredential = await createUserWithEmailAndPassword(
        this.firebaseAuth,
        email,
        password
      );
      const user = userCredential.user;
      console.log(user);
      Notify.success('New user created');
      user.displayName
        ? (refs.userStatusEl.textContent = `Hello, ${user.displayName}`)
        : (refs.userStatusEl.textContent = `Hello, ${user.email}`);
    } catch (error) {
      const errorCode = error.code;
      if (errorCode === 'auth/weak-password') {
        Notify.warning(`Password should contain at least 6 characters`);
      }
      if (errorCode === 'auth/email-already-in-use') {
        Notify.warning(
          `This email is already registered. Please log in or select another email`
        );
      }
      if (errorCode === 'auth/invalid-email') {
        Notify.warning(`Please enter valid email`);
      }

      const errorMessage = error.message;
      console.log(errorMessage);
    } finally {
      spinnerStop();
    }
  }

  async signInWithEmailAndPassword(email, password) {
    try {
      spinnerPlay();
      const userCredential = await signInWithEmailAndPassword(
        this.firebaseAuth,
        email,
        password
      );
      const user = userCredential.user;
      console.log(user);
      user.displayName
        ? (refs.userStatusEl.textContent = `Hello, ${user.displayName}`)
        : (refs.userStatusEl.textContent = `Hello, ${user.email}`);
    } catch (error) {
      const errorCode = error.code;
      if (errorCode === 'auth/wrong-password') {
        Notify.failure(`Oops, wrong password!`);
      }
      if (errorCode === 'auth/user-not-found') {
        Notify.failure(`Hmm.. This user does not exist`);
      }
      if (errorCode === 'auth/invalid-email') {
        Notify.failure(`Please enter valid email`);
      }
      if (errorCode === 'auth/too-many-requests') {
        Notify.failure(
          'Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.'
        );
      }
      const errorMessage = error.message;
      console.log(errorMessage);
    } finally {
      spinnerStop();
    }
  }

  async sendPasswordResetEmail(email) {
    try {
      spinnerPlay();
      sendPasswordResetEmail(this.firebaseAuth, email).then(() => {
        Notify.info('Password reset email sent! Please check your mailbox');
      });
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      Notify.failure('Something went wrong, please try again');
      console.log(errorMessage);
    } finally {
      spinnerStop();
    }
  }

  async signInWithPopupGoogle() {
    try {
      spinnerPlay();
      const signInResult = await signInWithPopup(
        this.firebaseAuth,
        this.providerGoogle
      );
      const user = signInResult.user;
      this.userId = user.uid;
      user.displayName
        ? (refs.userStatusEl.textContent = `Hello, ${user.displayName}`)
        : (refs.userStatusEl.textContent = `Hello, ${user.email}`);

      //   console.log(user);
    } catch (error) {
      const credential = GoogleAuthProvider.credentialFromError(error);
      console.log(error);
      console.log(credential);
    } finally {
      spinnerStop();
    }
  }

  async signInWithRedirectFirebase() {
    signInWithRedirect(this.firebaseAuth, this.providerGoogle);
  }

  async writeDataToStorage(key, data) {
    save(key, data);
  }

  async monitorAuthState() {
    if (isSignInWithEmailLink(this.firebaseAuth, window.location.href)) {
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        email = window.prompt('Please provide your email for confirmation');
      }

      await signInWithEmailLink(this.firebaseAuth, email, window.location.href)
        .then(result => {
          window.localStorage.removeItem('emailForSignIn');
          window.location.replace(window.location.origin);
        })
        .catch(error => {
          console.log(error);
        });
    }
    onAuthStateChanged(this.firebaseAuth, user => {
      if (user) {
        const myTimeout = setTimeout(
          user.displayName
            ? Notify.info(`Welcome back, ${user.displayName}`)
            : Notify.info(`Welcome back, ${user.email}`),
          5000
        );
        this.userId = user.uid;
        refs.signOutBtnEl.classList.remove('visually-hidden');
        refs.signInBtnEl.classList.add('visually-hidden');
        user.displayName
          ? (refs.userStatusEl.textContent = `Hello, ${user.displayName}`)
          : (refs.userStatusEl.textContent = `Hello, ${user.email}`);
        this.accessToken = user.accessToken;
        const watched = load('watched');

        if (watched) {
          watched.forEach(movie => {
            this.addToLyb(movie.id, 'watched', movie);
            //    renderWatchedMovies();
          });
        }

        const queue = load('queue');
        if (queue) {
          queue.forEach(movie => {
            this.addToLyb(movie.id, 'queue', movie);
            //   renderQueueMovies();
          });
        }

        const userLybraryWatched = ref(
          this.database,
          `users/${this.userId}/lybrary/watched/`
        );
        onValue(userLybraryWatched, watched => {
          const data = watched.val();
          if (data) {
            const keys = Object.keys(data);
            const watchedStorage = keys.map(key => data[key]);
            this.writeDataToStorage('watched', watchedStorage);
          } else {
            this.writeDataToStorage('watched', []);
          }
        });

        const userLybraryQueue = ref(
          this.database,
          `users/${this.userId}/lybrary/queue/`
        );
        onValue(userLybraryQueue, queue => {
          const data = queue.val();
          if (data) {
            const keys = Object.keys(data);
            const queueStorage = keys.map(key => data[key]);
            this.writeDataToStorage('queue', queueStorage);
          } else {
            this.writeDataToStorage('queue', []);
          }
        });
      } else {
        refs.signOutBtnEl.classList.add('visually-hidden');
        refs.signInBtnEl.classList.remove('visually-hidden');
        this.userStatus.textContent = 'You are not logged in';
        console.log(`You're not logged in.`);
      }
    });
  }

  async logout() {
    try {
      spinnerPlay();
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
    } finally {
      spinnerStop();
    }
  }

  async isInLyb(id, type) {
    try {
      spinnerPlay();
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
    } finally {
      spinnerStop();
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
      spinnerPlay();
      remove(ref(this.database, `users/${this.userId}/lybrary/${type}/${id}`));
    } catch (error) {
      console.log(`Fail to remove from DB ---> ${error}`);
    } finally {
      spinnerStop();
    }
  }
}

export const instance = new firebaseAPI(refs.signInBtnEl, refs.signOutBtnEl);
