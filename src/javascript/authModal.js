import * as basicLightbox from 'basiclightbox';
import { refs } from './refs';
import { instance } from './firebase';

refs.signInBtnEl.addEventListener('click', onSignInBtnClick);

export function onSignInBtnClick(event) {
  const modal = basicLightbox.create(
    `
   <div class="lightbox-modal">
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

<div class="lightbox-modal__buttons">
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
