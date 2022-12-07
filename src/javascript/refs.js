export const refs = {
  gallery: document.querySelector('.gallery'),
  gallerySection: document.querySelector('.gallery-section'),
  footerLink: document.querySelector('.footer__link'),
  footerBackDrop: document.querySelector('.footer__backdrop'),
  footerCloseBtn: document.querySelector('[data-modal-close]'),
  formEl: document.querySelector('.header-search-form'),
  paginationContainer: document.querySelector('#tui-pagination-container'),
  btnUp: document.getElementById('to-top-btn'),
  btnUpWrapper: document.querySelector('.btn-up'),
  noResultsTitle: document.querySelector('.no-result-title'),
  noResultsImg: document.querySelector('.no-result-image'),

  signInBtnEl: document.querySelector('.js-signIn-btn'),
  signOutBtnEl: document.querySelector('.js-signOut-btn'),
  userStatusEl: document.querySelector('.js-userStatus'),
};

// emailInputEl.addEventListener('input', () => {
//   const userEmail = emailInputEl.value.trim();
//   const userPassword = passwordInputEl.value.trim();
//   // console.log(userEmail);
//   // console.log(userPassword);
//   if (userEmail !== '' && userPassword !== '') {
//     signInWithEmailBtnEl.classList.remove('lightbox-modal__button--disabled');
//   }
// });

// passwordInputEl.addEventListener('input', () => {
//   const userEmail = emailInputEl.value.trim();
//   const userPassword = passwordInputEl.value.trim();
//   // console.log(userEmail);
//   // console.log(userPassword);
//   if (userEmail !== '' && userPassword !== '') {
//     signInWithEmailBtnEl.classList.remove('lightbox-modal__button--disabled');
//   }
// });
