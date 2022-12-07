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

<input type="email" id="auth-email" class="lightbox-modal__auth-input js-email-input">
<label class="lightbox-modal__auth-label" for="auth-email">Email</label>

<input type="password" id="auth-password" class="lightbox-modal__auth-input js-password-input">
<label class="lightbox-modal__auth-label" for="auth-password">Password</label>

<div class="lightbox-modal__buttons lightbox-modal__auth-buttons">
<button type="button" id="js-signInWithEmailBtn" class="lightbox-modal__button js-signInWithEmailBtn">Log in</button>
<button type="button" id="js-createUserBtn" class="lightbox-modal__button">Register</button>
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
