// Premium Restaurant Website JavaScript

// Loading Screen
window.addEventListener('load', () => {
    setTimeout(() => {
        document.querySelector('.loader-wrapper').classList.add('hidden');
    }, 1500);
});

// Normalize hero title lines if legacy markup is still cached
(function collapseHeroTitle() {
    const heroTitle = document.querySelector('.hero-title');
    if (!heroTitle) return;
    const fragments = heroTitle.querySelectorAll('.line-1, .line-2');
    if (!fragments.length) return;
    const combined = Array.from(fragments)
        .map(span => span.textContent.trim())
        .filter(Boolean)
        .join(' · ');
    heroTitle.textContent = combined || heroTitle.textContent;
})();

// Mobile Menu
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger?.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger?.classList.remove('active');
    });
});

// Navbar Scroll Effect + Active Nav + Hero Parallax
const navbar = document.querySelector('.navbar');
const sections = document.querySelectorAll('section[id]');
const hero = document.querySelector('.hero');

function updateActiveNav(scrollY = window.pageYOffset) {
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 150;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href*="${sectionId}"]`);
        
        if (navLink) {
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                navLink.classList.add('active');
            }
        }
    });
}

function handleScroll() {
    const scrollY = window.pageYOffset;
    
    if (navbar) {
        if (scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
    
    updateActiveNav(scrollY);
    
    if (hero && scrollY < window.innerHeight) {
        hero.style.transform = `translateY(${scrollY * 0.3}px)`;
    }
}

let scrollTicking = false;

window.addEventListener('scroll', () => {
    if (!scrollTicking) {
        window.requestAnimationFrame(() => {
            handleScroll();
            scrollTicking = false;
        });
        scrollTicking = true;
    }
}, { passive: true });

handleScroll();

// Hero Slider (degrades gracefully to single image)
const slides = document.querySelectorAll('.slide');
const dots = Array.from(document.querySelectorAll('.pagination-dot'));
const prevBtn = document.querySelector('.slider-arrow.prev');
const nextBtn = document.querySelector('.slider-arrow.next');

if (slides.length > 1) {
    let currentSlide = 0;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        if (dots.length) {
            dots.forEach(dot => dot.classList.remove('active'));
        }

        if (index >= slides.length) {
            currentSlide = 0;
        } else if (index < 0) {
            currentSlide = slides.length - 1;
        } else {
            currentSlide = index;
        }

        slides[currentSlide].classList.add('active');
        if (dots.length && dots[currentSlide]) {
            dots[currentSlide].classList.add('active');
        }
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function prevSlide() {
        showSlide(currentSlide - 1);
    }

    let slideInterval = setInterval(nextSlide, 5000);

    function resetSlideInterval() {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 5000);
    }

    prevBtn?.addEventListener('click', () => {
        prevSlide();
        resetSlideInterval();
    });

    nextBtn?.addEventListener('click', () => {
        nextSlide();
        resetSlideInterval();
    });

    if (dots.length) {
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                showSlide(index);
                resetSlideInterval();
            });
        });
    }

    const heroSlider = document.querySelector('.hero-slider');
    heroSlider?.addEventListener('mouseenter', () => {
        clearInterval(slideInterval);
    });

    heroSlider?.addEventListener('mouseleave', () => {
        slideInterval = setInterval(nextSlide, 5000);
    });
} else {
    slides[0]?.classList.add('active');
}

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            const offsetTop = target.offsetTop - 90;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Scroll Reveal Animation
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Apply animation to elements
document.querySelectorAll('.menu-card, .gallery-item, .info-item, .feature').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
});

// Gallery Lightbox
const galleryItems = document.querySelectorAll('.gallery-item');
const lightbox = document.getElementById('gallery-lightbox');
const lightboxImg = lightbox?.querySelector('img');
const lightboxClose = lightbox?.querySelector('.lightbox-close');
const lightboxBackdrop = lightbox?.querySelector('.lightbox-backdrop');

function openLightbox(src, alt) {
    if (!lightbox || !lightboxImg || !src) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || 'Galeri görseli';
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

galleryItems.forEach(item => {
    item.addEventListener('click', () => {
        const img = item.querySelector('img');
        openLightbox(img?.getAttribute('src'), img?.getAttribute('alt'));
    });
});

lightboxClose?.addEventListener('click', closeLightbox);
lightboxBackdrop?.addEventListener('click', closeLightbox);

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeLightbox();
    }
});

// Menu cards - show overlay on tap for mobile
const menuCards = document.querySelectorAll('.menu-card');

function clearMenuCardStates() {
    menuCards.forEach(card => card.classList.remove('show-info'));
}

menuCards.forEach(card => {
    card.addEventListener('click', () => {
        if (window.innerWidth <= 968) {
            const isActive = card.classList.contains('show-info');
            clearMenuCardStates();
            if (!isActive) {
                card.classList.add('show-info');
            }
        }
    });
});

window.addEventListener('resize', () => {
    if (window.innerWidth > 968) {
        clearMenuCardStates();
    }
});

// Menu tabs
const menuTabs = document.querySelectorAll('.menu-tab');
const menuPanels = document.querySelectorAll('.menu-tab-panel');

menuTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        menuTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        menuPanels.forEach(panel => {
            panel.classList.toggle('active', panel.dataset.tab === target);
        });
    });
});

// Add cursor effect (desktop only)
if (window.matchMedia('(pointer: fine)').matches) {
    const cursor = document.createElement('div');
    cursor.style.cssText = `
        width: 20px;
        height: 20px;
        border: 2px solid #D4AF37;
        border-radius: 50%;
        position: fixed;
        pointer-events: none;
        z-index: 9999;
        transition: transform 0.2s ease;
        display: none;
    `;
    document.body.appendChild(cursor);

    document.addEventListener('mousemove', (e) => {
        cursor.style.display = 'block';
        cursor.style.left = e.clientX - 10 + 'px';
        cursor.style.top = e.clientY - 10 + 'px';
    }, { passive: true });

    document.querySelectorAll('a, button, .menu-card, .gallery-item').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'scale(1.5)';
            cursor.style.borderColor = '#FFD700';
        });
        
        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'scale(1)';
            cursor.style.borderColor = '#D4AF37';
        });
    });
}

console.log('✨ Premium Restaurant Website - Loaded Successfully!');
