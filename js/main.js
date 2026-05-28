/* =====================================================
   main.js — Drupal Coder Landing
   ===================================================== */

'use strict';

// ── Утилиты ──────────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ── Текущий год в футере ──────────────────────────────
const yearEl = $('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ── Бургер / мобильное меню ───────────────────────────
const burger        = $('#burger');
const mobileMenu    = $('#mobileMenu');
const mobileClose   = $('#mobileClose');
const mobileBackdrop = $('#mobileBackdrop');

function openMobileMenu() {
  if (!mobileMenu) return;
  mobileMenu.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  if (!mobileMenu) return;
  mobileMenu.classList.remove('open');
  document.body.style.overflow = '';
}

burger?.addEventListener('click', openMobileMenu);
mobileClose?.addEventListener('click', closeMobileMenu);
mobileBackdrop?.addEventListener('click', closeMobileMenu);

// закрыть по клику на ссылку внутри меню
$$('a', mobileMenu).forEach(link => {
  link.addEventListener('click', closeMobileMenu);
});

// ── Десктопный dropdown ───────────────────────────────
const dropdownBtn = $('.menu__dropdownBtn');
const dropdown    = $('.dropdown');

if (dropdownBtn && dropdown) {
  dropdownBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.toggle('open');
    dropdownBtn.setAttribute('aria-expanded', isOpen);
  });

  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && !dropdownBtn.contains(e.target)) {
      dropdown.classList.remove('open');
      dropdownBtn.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dropdown.classList.remove('open');
      dropdownBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

// ── Swiper — секция «Кейсы» ───────────────────────────
if (typeof Swiper !== 'undefined') {
  const casesSwiper = new Swiper('#casesSwiper', {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: true,
    grabCursor: true,
    navigation: {
      prevEl: '#casesPrev',
      nextEl: '#casesNext',
    },
    breakpoints: {
      640: { slidesPerView: 1.4 },
      900: { slidesPerView: 2   },
      1200: { slidesPerView: 2.5 },
    },
  });
}

// ── Модалка ───────────────────────────────────────────
const modal = $('#contactModal');

function openModal() {
  if (!modal) return;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  const firstInput = modal.querySelector('input, textarea');
  setTimeout(() => firstInput?.focus(), 100);
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

// кнопки-триггеры
$('#openContact')?.addEventListener('click', openModal);
$('#openContactMobile')?.addEventListener('click', () => {
  closeMobileMenu();
  setTimeout(openModal, 200);
});
$$('[data-open-contact]').forEach(el => el.addEventListener('click', openModal));

// кнопки закрытия
$$('[data-close-modal]').forEach(el => el.addEventListener('click', closeModal));

// закрыть по клику на overlay
modal?.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

// закрыть по Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal?.classList.contains('open')) closeModal();
});

// ── Валидация форм ────────────────────────────────────
function validateForm(form) {
  let valid = true;

  // убираем старые ошибки
  $$('.field-error', form).forEach(el => el.remove());
  $$('.input-error', form).forEach(el => el.classList.remove('input-error'));

  const showError = (input, msg) => {
    input.classList.add('input-error');
    const err = document.createElement('span');
    err.className = 'field-error';
    err.textContent = msg;
    input.insertAdjacentElement('afterend', err);
    valid = false;
  };

  // Имя
  const nameInput = form.querySelector('[name="name"]');
  if (nameInput) {
    const val = nameInput.value.trim();
    if (!val) showError(nameInput, 'Введите ваше имя');
    else if (val.length < 2) showError(nameInput, 'Имя слишком короткое');
  }

  // Email
  const emailInput = form.querySelector('[name="email"]');
  if (emailInput) {
    const val = emailInput.value.trim();
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!val) showError(emailInput, 'Введите email');
    else if (!emailRe.test(val)) showError(emailInput, 'Некорректный email');
  }

  // Телефон (если есть)
  const phoneInput = form.querySelector('[name="phone"]');
  if (phoneInput && phoneInput.value.trim()) {
    const phoneRe = /^[+\d\s\-()]{7,20}$/;
    if (!phoneRe.test(phoneInput.value.trim())) {
      showError(phoneInput, 'Некорректный номер телефона');
    }
  }

  // Сообщение / textarea
  const msgInput = form.querySelector('textarea');
  if (msgInput) {
    const val = msgInput.value.trim();
    if (!val) showError(msgInput, 'Введите сообщение');
    else if (val.length < 10) showError(msgInput, 'Сообщение слишком короткое');
  }

  return valid;
}

function handleFormSubmit(form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm(form)) return;

    const btn = form.querySelector('[type="submit"]');
    const original = btn?.textContent;

    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Отправка...';
    }

    // имитация отправки (replace with real fetch/ajax)
    setTimeout(() => {
      form.reset();
      $$('.field-error', form).forEach(el => el.remove());
      $$('.input-error', form).forEach(el => el.classList.remove('input-error'));

      showSuccess(form);

      if (btn) {
        btn.disabled = false;
        btn.textContent = original;
      }
    }, 1000);
  });
}

function showSuccess(form) {
  // если уже есть — удалим
  form.parentElement.querySelector('.form-success')?.remove();

  const msg = document.createElement('div');
  msg.className = 'form-success';
  msg.textContent = '✓ Заявка отправлена! Мы свяжемся с вами в ближайшее время.';
  form.insertAdjacentElement('afterend', msg);

  setTimeout(() => msg.remove(), 4000);
}

const contactForm = $('#contactForm');
const modalForm   = $('#modalForm');
if (contactForm) handleFormSubmit(contactForm);
if (modalForm)   handleFormSubmit(modalForm);

// ── Плавная прокрутка для якорных ссылок ─────────────
$$('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href');
    if (id === '#') return;
    const target = $(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ── Sticky-навигация: тень при прокрутке ─────────────
const nav = $('nav') || $('header');
if (nav) {
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
}

// ── FAQ — аккордеон ───────────────────────────────────
$$('.faq__item').forEach(item => {
  const question = item.querySelector('.faq__question');
  const answer   = item.querySelector('.faq__answer');
  if (!question || !answer) return;

  question.setAttribute('role', 'button');
  question.setAttribute('tabindex', '0');
  question.setAttribute('aria-expanded', 'false');

  const toggle = () => {
    const isOpen = item.classList.toggle('open');
    question.setAttribute('aria-expanded', isOpen);
  };

  question.addEventListener('click', toggle);
  question.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  });
});

// ── Intersection Observer — fade-in анимация ──────────
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

$$('.card, .pricing__card, .stack__chip, .faq__item').forEach(el => {
  el.classList.add('fade-in');
  io.observe(el);
});
