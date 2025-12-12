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
    navMenu?.classList.toggle('active');
    hamburger.classList.toggle('active');
});

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu?.classList.remove('active');
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
    
    // Mobile performance: parallax can cause scroll jank on low-power devices
    const allowParallax = window.innerWidth > 968;
    if (hero && allowParallax && scrollY < window.innerHeight) {
        hero.style.transform = `translateY(${scrollY * 0.3}px)`;
    } else if (hero && !allowParallax) {
        hero.style.transform = '';
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

// If there's only one slide in markup, allow rotating its image via admin content
// Expected: window.__SITE_CONTENT.hero.images = ["images/a.jpg", "images/b.jpg", ...]
function getHeroImageListFromContent() {
    const list = window.__SITE_CONTENT?.hero?.images;
    if (!Array.isArray(list)) return [];

    // Normalize possible absolute/relative paths so comparisons work
    const normalize = (src) => {
        if (!src) return '';
        try {
            return new URL(src, window.location.href).href;
        } catch {
            return String(src);
        }
    };

    return list
        .filter(Boolean)
        .map(src => src.trim())
        .filter(Boolean)
        .map(src => ({ raw: src, abs: normalize(src) }));
}

function getHeroImageListFromDataAttr() {
    const img = document.querySelector('.hero-slider .slide img[data-hero-images]');
    const attr = img?.getAttribute('data-hero-images');
    if (!attr) return [];
    const parts = attr.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length <= 1) return [];
    try {
        return parts.map(src => ({ raw: src, abs: new URL(src, window.location.href).href }));
    } catch {
        return parts.map(src => ({ raw: src, abs: src }));
    }
}

function setupSingleHeroImageRotation() {
    if (slides.length !== 1) return;
    const img = slides[0]?.querySelector('img');
    if (!img) return;

    const images = getHeroImageListFromContent();
    const fallbackImages = images.length ? images : getHeroImageListFromDataAttr();
    if (fallbackImages.length <= 1) return;

    let idx = 0;

    // Preload next to avoid flicker
    function preload(src) {
        const p = new Image();
        p.decoding = 'async';
        p.src = src;
    }

    function setImage(next) {
        if (!next) return;
        const currentAbs = new URL(img.getAttribute('src') || '', window.location.href).href;
        if (currentAbs === next.abs) return;
        // quick fade using existing slide element
        slides[0].classList.remove('active');
        window.requestAnimationFrame(() => {
            img.src = next.raw;
            slides[0].classList.add('active');
        });
    }

    // Start with the first image in list (keep current if it matches)
    const currentAbs = new URL(img.getAttribute('src') || '', window.location.href).href;
    const initialIndex = fallbackImages.findIndex(x => x.abs === currentAbs);
    if (initialIndex >= 0) {
        idx = initialIndex;
    } else {
        setImage(fallbackImages[0]);
        idx = 0;
    }

    preload(fallbackImages[(idx + 1) % fallbackImages.length].raw);

    setInterval(() => {
        idx = (idx + 1) % fallbackImages.length;
        setImage(fallbackImages[idx]);
        preload(fallbackImages[(idx + 1) % fallbackImages.length].raw);
    }, 3000);
}

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

    let slideInterval = setInterval(nextSlide, 3000);

    function resetSlideInterval() {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 3000);
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
    setupSingleHeroImageRotation();
}

// In some cache/ordering edge cases on mobile, try once again after a short delay.
window.setTimeout(() => {
    try {
        setupSingleHeroImageRotation();
    } catch (_) {
        // ignore
    }
}, 600);

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

// One-time menu entrance animation (adds a class to the section)
const menuSection = document.getElementById('menu');
if (menuSection && 'IntersectionObserver' in window) {
    const menuObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                menuSection.classList.add('is-visible');
                obs.disconnect();
            }
        });
    }, { threshold: 0.2 });
    menuObserver.observe(menuSection);
} else if (menuSection) {
    // Fallback
    menuSection.classList.add('is-visible');
}

// Apply animation to elements (skip menu cards on mobile for better performance)
const skipMenuReveal = true;
document.querySelectorAll('.menu-card, .gallery-item, .info-item, .feature').forEach(el => {
    if (skipMenuReveal && el.classList.contains('menu-card')) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
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

function isMobileMenuCards() {
    return window.innerWidth <= 968;
}

function openMenuCard(card) {
    if (!isMobileMenuCards()) return;
    const isActive = card.classList.contains('show-info');
    clearMenuCardStates();
    if (!isActive) {
        card.classList.add('show-info');
    }
}

menuCards.forEach(card => {
    // Pointer/touch gives faster reaction than click on some mobile browsers
    const onPress = (e) => {
        if (!isMobileMenuCards()) return;
        // Only prevent default for direct taps (not while scrolling)
        if (e.cancelable && e.pointerType !== 'mouse') {
            e.preventDefault();
        }
        openMenuCard(card);
    };

    if (window.PointerEvent) {
        card.addEventListener('pointerdown', onPress, { passive: false });
    } else {
        card.addEventListener('touchstart', onPress, { passive: false });
    }

    // Keep click as a fallback
    card.addEventListener('click', () => openMenuCard(card));
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

// Menu & Gallery - Show More / Show Less
function setupShowMore({
    itemSelector,
    btnId,
    textId,
    iconId,
    visibleCount,
    desktopAlwaysExpanded = false,
    desktopQuery = '(min-width: 969px)',
    collapsedBodyClass = null
}) {
    const items = Array.from(document.querySelectorAll(itemSelector));
    const btn = document.getElementById(btnId);
    const text = document.getElementById(textId);
    const icon = document.getElementById(iconId);

    if (!btn || !items.length) return;

    let expanded = false;

    const mq = window.matchMedia ? window.matchMedia(desktopQuery) : null;

    // Ensure smooth animation
    items.forEach(item => {
        item.style.transition = 'transform .5s cubic-bezier(.4,2,.6,1), opacity .5s cubic-bezier(.4,2,.6,1)';
        item.style.willChange = 'transform, opacity';
    });

    function applyState() {
        const isDesktop = mq ? mq.matches : false;
        const effectiveExpanded = desktopAlwaysExpanded && isDesktop ? true : expanded;

        // If a CSS-based collapse class is provided, prefer it (more reliable than inline display)
        if (collapsedBodyClass) {
            const shouldCollapse = !effectiveExpanded && !isDesktop;
            document.body.classList.toggle(collapsedBodyClass, shouldCollapse);
        } else {
            items.forEach((item, i) => {
                const shouldShow = effectiveExpanded || i < visibleCount;
                item.style.display = shouldShow ? '' : 'none';
                if (shouldShow) {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }
            });
        }

        // Desktop'ta her şey açık kalsın isteniyorsa butonu gizle
        if (desktopAlwaysExpanded && isDesktop) {
            btn.style.display = 'none';
        } else {
            btn.style.display = '';
            if (text) text.textContent = expanded ? 'Daha Az Göster' : 'Tümünü Gör';
            if (icon) {
                icon.className = expanded ? 'fas fa-chevron-up' : 'fas fa-chevron-down';
                icon.style.transform = expanded ? 'rotate(180deg)' : 'rotate(0)';
            }
        }
    }

    btn.addEventListener('click', () => {
        expanded = !expanded;
        applyState();
    });

    // Desktop/Mobile geçişlerinde state’i tekrar uygula
    if (mq && typeof mq.addEventListener === 'function') {
        mq.addEventListener('change', applyState);
    } else if (mq && typeof mq.addListener === 'function') {
        mq.addListener(applyState);
    }

    applyState();
}

window.addEventListener('DOMContentLoaded', () => {
    setupShowMore({
        itemSelector: '[data-gallery-anim]',
        btnId: 'gallery-show-more',
        textId: 'gallery-show-more-text',
        iconId: 'gallery-show-more-icon',
        visibleCount: 4
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
