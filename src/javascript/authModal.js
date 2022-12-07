import * as basicLightbox from 'basiclightbox';
import { refs } from './refs';
import { instance } from './firebase';

refs.signInBtnEl.addEventListener('click', onSignInBtnClick);

export function onSignInBtnClick(event) {
  const modal = basicLightbox.create(
    `
   <div class="lightbox-modal lightbox-auth-modal">
       <div class="logo-container logo-auth-container">
        <a href="./index.html" class="logo-site">
          <svg class="auth-logo" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.82 2.704H4.18C2.976 2.704 2 3.634 2 4.78v14.892c0 1.146.976 2.076 2.18 2.076h15.64c1.204 0 2.18-.93 2.18-2.076V4.78c0-1.146-.976-2.076-2.18-2.076ZM7 2.704v19.044M17 2.704v19.044M2 12.226h20M2 7.465h5M2 16.987h5M17 16.987h5M17 7.465h5"/></svg>
          <span class="auth-logo-text">Filmoteka</span>
        </a>
      </div>

   <button
      data-map-close
      class="lightbox-modal__close-btn"
      aria-label="close modal window"
    >&#10005;
    </button>

<div class="lightbox-modal__data lightbox-modal__auth-data">

<div class="lightbox-modal__form-wrapper">
<form class="lightbox-modal__auth-form">
<div class="auth-inputs-wrapper">
<input type="email" id="auth-email" class="lightbox-modal__auth-input js-email-input">
<label class="lightbox-modal__auth-label" for="auth-email">Email</label>

<input type="password" id="auth-password" class="lightbox-modal__auth-input js-password-input">
<label class="lightbox-modal__auth-label" for="auth-password">Password</label>
</div>
<div class="lightbox-modal__buttons lightbox-modal__auth-buttons">

<div class="auth-login-btn-wrapper">
<button type="button" id="js-signInWithEmailBtn" class="lightbox-modal__button js-signInWithEmailBtn">Log in</button>
<div class="auth-login-notify">
<p class="auth-notify">Already registered? Log in!</p>
</div>
</div>

<div class="auth-create-btn-wrapper">
<button type="button" id="js-createUserBtn" class="lightbox-modal__button">Create account</button>
<div class="auth-create-notify">
<p class="auth-notify">Newcomer? Create an account!</p>
</div>
</div>

</div>

<div class="auth-google-btn-wrapper">
<button type="button" id="js-signInWithGoogleBtn" class="lightbox-modal__button js-signInWithGoogleBtn">
<svg class="lightbox-modal__button-img" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 48 48"><defs><path id="a" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/></defs><clipPath id="b"><use xlink:href="#a" overflow="visible"/></clipPath><path fill="#FBBC05" d="M0 37V11l17 13z" clip-path="url(#b)"/><path fill="#EA4335" d="m0 11 17 13 7-6.1L48 14V0H0z" clip-path="url(#b)"/><path fill="#34A853" d="m0 37 30-23 7.9 1L48 0v48H0z" clip-path="url(#b)"/><path fill="#4285F4" d="M48 48 17 24l-4-3 35-10z" clip-path="url(#b)"/></svg>
</button>
<div class="auth-google-notify">
<p class="auth-notify">Log in with Google!</p>
</div>
</form>
</div>


</div>
</div>`,
    {
      onShow: modal => {
        document.querySelector('body').classList.add('noScroll');
        document.querySelector('.btn-up').classList.add('visually-hidden');

        modal.element().querySelector('.lightbox-modal__close-btn').onclick =
          modal.close;

        function onEscClick(event) {
          if (event.code === 'Escape' || event.code === 'Space') {
            window.removeEventListener('keydown', onEscClick);
            modal.close();
          }
        }

        window.addEventListener('keydown', onEscClick);

        // onLogInBtnClick();
      },
      onClose: modal => {
        document.querySelector('.btn-up').classList.remove('visually-hidden');
        document.querySelector('body').classList.remove('noScroll');
      },
    }
  );
  modal.show();
  const signInWithEmailBtnEl = document.getElementById('js-signInWithEmailBtn');
  signInWithEmailBtnEl.addEventListener('click', onSingInBtnClick);
  const createUserBtnEl = document.getElementById('js-createUserBtn');
  createUserBtnEl.addEventListener('click', onCreateUserBtnClick);
  const singInWithGoogleBtnEl = document.getElementById(
    'js-signInWithGoogleBtn'
  );
  singInWithGoogleBtnEl.addEventListener('click', onSignInWithGoogleBtnClick);
}

function onCreateUserBtnClick(event) {
  event.preventDefault();
  const emailInputEl = document.querySelector('.js-email-input');
  const passwordInputEl = document.querySelector('.js-password-input');
  const userEmail = emailInputEl.value.trim();
  const userPassword = passwordInputEl.value.trim();
  instance.createUserWithEmailAndPassword(userEmail, userPassword);
}

function onSingInBtnClick(event) {
  event.preventDefault();
  const emailInputEl = document.querySelector('.js-email-input');
  const passwordInputEl = document.querySelector('.js-password-input');
  const userEmail = emailInputEl.value.trim();
  const userPassword = passwordInputEl.value.trim();
  instance.signInWithEmailAndPassword(userEmail, userPassword);
}

function onSignInWithGoogleBtnClick(event) {
  event.preventDefault();
  instance.signInWithPopupGoogle();
}
