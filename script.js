// ============================================
// BeautyBot — Общий JavaScript (для всех страниц)
// ============================================

// --- Header scroll effect ---
const header = document.getElementById('header');
if (header) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// --- Mobile menu toggle ---
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');

if (burger && nav) {
    burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        nav.classList.toggle('open');
        document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
    });

    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            burger.classList.remove('active');
            nav.classList.remove('open');
            document.body.style.overflow = '';
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('open')) {
            burger.classList.remove('active');
            nav.classList.remove('open');
            document.body.style.overflow = '';
        }
    });
}

// --- Intersection Observer для fade-up анимаций ---
const fadeElements = document.querySelectorAll('.fade-up');

if (fadeElements.length > 0) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
    });

    fadeElements.forEach(el => observer.observe(el));
}

// --- Активная ссылка в навигации ---
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav__link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

setActiveNavLink();

// --- Плавный скролл для якорных ссылок ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 80;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ============================================
// Telegram Bot — Отправка заявок
// ============================================

const TELEGRAM_BOT_TOKEN = '8859843095:AAFeUNOlTr9XsVT4Y7gQw3L3qxJbzVwS8y4';
const TELEGRAM_CHAT_ID = '7792838501';

const contactForm = document.getElementById('contactForm');

if (contactForm) {
    const submitBtn = document.getElementById('submitBtn');
    const formStatus = document.getElementById('formStatus');

    async function sendToTelegram(name, phone, message) {
        const text = `Новая заявка с сайта BeautyBot!\n\nИмя: ${name}\nТелефон: ${phone}\nСообщение: ${message || 'Не указано'}\n\n${new Date().toLocaleString('ru-RU')}`;

        const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

        // Способ 1: Пробуем через corsproxy.io
        try {
            const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(telegramUrl);
            const response = await fetch(proxyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: text,
                    parse_mode: 'HTML'
                })
            });

            const data = await response.json();

            if (data.ok) {
                console.log('Заявка отправлена через corsproxy.io');
                return true;
            }
        } catch (error) {
            console.log('corsproxy.io не сработал, пробуем другой способ...');
        }

        // Способ 2: Пробуем через allorigins
        try {
            const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(
                telegramUrl + '?chat_id=' + TELEGRAM_CHAT_ID + '&text=' + encodeURIComponent(text) + '&parse_mode=HTML'
            );
            const response = await fetch(proxyUrl);
            const data = await response.json();

            if (data.ok) {
                console.log('Заявка отправлена через allorigins');
                return true;
            }
        } catch (error) {
            console.log('allorigins не сработал...');
        }

        // Способ 3: Прямой запрос (может сработать на некоторых хостингах)
        try {
            const response = await fetch(telegramUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: text,
                    parse_mode: 'HTML'
                })
            });

            const data = await response.json();

            if (data.ok) {
                console.log('Заявка отправлена напрямую');
                return true;
            }
        } catch (error) {
            console.log('Прямой запрос не сработал');
        }

        return false;
    }

    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const message = document.getElementById('message').value.trim();

        if (!name || !phone) {
            formStatus.className = 'form__status error';
            formStatus.textContent = 'Пожалуйста, заполните имя и телефон.';
            formStatus.style.display = 'block';
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';
        formStatus.style.display = 'none';

        const success = await sendToTelegram(name, phone, message);

        if (success) {
            formStatus.className = 'form__status success';
            formStatus.textContent = 'Спасибо! Заявка отправлена. Мы свяжемся с вами в ближайшее время.';
            formStatus.style.display = 'block';
            contactForm.reset();
        } else {
            formStatus.className = 'form__status error';
            formStatus.textContent = 'Ошибка отправки. Пожалуйста, позвоните нам или напишите в Telegram @BotProk.';
            formStatus.style.display = 'block';
        }

        submitBtn.disabled = false;
        submitBtn.textContent = 'Отправить заявку';

        setTimeout(() => {
            formStatus.style.display = 'none';
        }, 8000);
    });
}
