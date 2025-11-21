// Premium Restaurant Website JavaScript

// Loading Screen
window.addEventListener('load', () => {
    setTimeout(() => {
        document.querySelector('.loader-wrapper').classList.add('hidden');
    }, 1500);
});

// Normalize hero title if legacy spans remain in cache
(function collapseHeroTitle() {
    const heroTitle = document.querySelector('.hero-title');
    if (!heroTitle) return;
    const fragments = heroTitle.querySelectorAll('.line-1, .line-2');
    if (!fragments.length) return;
    const combined = Array.from(fragments)
        .map(node => node.textContent.trim())
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

// Navbar Scroll Effect
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Active Nav Link on Scroll
const sections = document.querySelectorAll('section[id]');

function updateActiveNav() {
    const scrollY = window.pageYOffset;
    
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

window.addEventListener('scroll', updateActiveNav);

// Hero Slider
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const dots = Array.from(document.querySelectorAll('.pagination-dot'));
const prevBtn = document.querySelector('.slider-arrow.prev');
const nextBtn = document.querySelector('.slider-arrow.next');

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
    
    slides[currentSlide]?.classList.add('active');
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

// Auto Play Slider
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

// Pause slider on hover
const heroSlider = document.querySelector('.hero-slider');
heroSlider?.addEventListener('mouseenter', () => {
    clearInterval(slideInterval);
});

heroSlider?.addEventListener('mouseleave', () => {
    slideInterval = setInterval(nextSlide, 5000);
});

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

// Contact Form
const contactForm = document.querySelector('.contact-form');
contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Show success message
    const successMsg = document.createElement('div');
    successMsg.style.cssText = `
        position: fixed;
        top: 100px;
        right: 30px;
        background: linear-gradient(135deg, #D4AF37 0%, #FFD700 100%);
        color: #1a1a1a;
        padding: 20px 30px;
        border-radius: 10px;
        font-weight: 600;
        box-shadow: 0 10px 30px rgba(212,175,55,0.4);
        z-index: 10000;
        animation: slideInRight 0.5s ease;
    `;
    successMsg.innerHTML = `
        <i class="fas fa-check-circle" style="margin-right: 10px;"></i>
        Rezervasyon talebiniz alındı! En kısa sürede size dönüş yapacağız.
    `;
    
    document.body.appendChild(successMsg);
    
    setTimeout(() => {
        successMsg.style.animation = 'slideOutRight 0.5s ease';
        setTimeout(() => {
            successMsg.remove();
        }, 500);
    }, 4000);
    
    contactForm.reset();
});

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Parallax Effect for Hero
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    
    if (hero && scrolled < window.innerHeight) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Gallery Item Click (Future: Open Lightbox)
document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
        // Add lightbox functionality here
        console.log('Gallery item clicked');
    });
});

// Menu Item Click (Future: Show Details)
document.querySelectorAll('.menu-card').forEach(card => {
    card.addEventListener('click', () => {
        // Add menu details modal here
        console.log('Menu card clicked');
    });
});

// Add cursor effect
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
    if (window.innerWidth > 968) {
        cursor.style.display = 'block';
        cursor.style.left = e.clientX - 10 + 'px';
        cursor.style.top = e.clientY - 10 + 'px';
    }
});

// Scale cursor on hover
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

console.log('✨ Premium Restaurant Website - Loaded Successfully!');
