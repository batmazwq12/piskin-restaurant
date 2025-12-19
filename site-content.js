(function () {
    const API_URL = '/api/content';
    const PLACEHOLDERS = {
        menuImage: 'images/menu1.jpg',
        galleryImage: 'images/gallery1.jpg'
    };

    const revealObserver = 'IntersectionObserver' in window
        ? new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        })
        : null;

    document.addEventListener('DOMContentLoaded', () => {
        fetchContent();
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 968) {
            document.querySelectorAll('.menu-card').forEach(card => card.classList.remove('show-info'));
        }
    });

    async function fetchContent() {
        try {
            const response = await fetch(`${API_URL}?t=${Date.now()}`, {
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });
            if (!response.ok) {
                throw new Error(await response.text());
            }
            const data = await response.json();
            window.siteContent = data;
            applyContent(data);
        } catch (error) {
            console.error('İçerik yüklenemedi:', error);
        }
    }

    function applyContent(data) {
        if (!data) return;
        updateHero(data.hero);
        updateAbout(data.about);
        updateMenu(data.menu);
        updateGallery(data.gallery);
        updateCta(data.cta, data.contact);
        updateContact(data.contact);
        updateSocial(data.social);
        updateMap(data.map);
    }

    function updateHero(hero = {}) {
        setText('.hero-subtitle', hero.subtitle);
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) {
            const combined = [hero.titleLine1, hero.titleLine2]
                .filter(Boolean)
                .join(' · ');
            if (combined) {
                heroTitle.textContent = combined;
            }
        }
        const descriptionEl = document.querySelector('.hero-description');
        if (descriptionEl) {
            setMultilineText(descriptionEl, hero.description);
        }
    }

    function updateAbout(about = {}) {
        const section = document.getElementById('about');
        if (!section) return;
        setText('#about .section-label', about.label);
        setText('#about .section-title .line-1', about.titleLine1);
        setText('#about .section-title .title-highlight', about.titleHighlight);
        setText('#about .about-lead', about.lead);
        setText('#about .about-text', about.text);

        if (about.experienceYears) {
            const badge = section.querySelector('.experience-badge .badge-number');
            if (badge) {
                badge.textContent = `${about.experienceYears}`;
            }
        }

        renderFeatures(about.features || []);
    }

    function renderFeatures(features) {
        const container = document.querySelector('#about .about-features');
        if (!container) return;
        container.innerHTML = '';
        features.forEach(feature => {
            const featureEl = document.createElement('div');
            featureEl.className = 'feature';

            const iconWrap = document.createElement('div');
            iconWrap.className = 'feature-icon';
            const icon = document.createElement('i');
            icon.className = feature.icon || 'fas fa-star';
            iconWrap.appendChild(icon);

            const title = document.createElement('h4');
            title.textContent = feature.title || '';

            const description = document.createElement('p');
            description.textContent = feature.description || '';

            featureEl.append(iconWrap, title, description);
            container.appendChild(featureEl);
        });
        observeElements(container.querySelectorAll('.feature'));
    }

    function updateMenu(menuItems = []) {
        const grid = document.querySelector('.menu-grid');
        if (!grid) return;
        grid.innerHTML = '';
        menuItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'menu-card';

            const imageWrapper = document.createElement('div');
            imageWrapper.className = 'menu-image';

            const img = document.createElement('img');
            img.src = item.image || PLACEHOLDERS.menuImage;
            img.alt = item.title || 'Pişkin lezzeti';
            imageWrapper.appendChild(img);

            const hover = document.createElement('div');
            hover.className = 'menu-hover';

            const meta = document.createElement('div');
            meta.className = 'menu-meta';

            if (item.label) {
                const label = document.createElement('span');
                label.className = 'menu-label';
                label.textContent = item.label;
                meta.appendChild(label);
            }

            const title = document.createElement('h3');
            title.textContent = item.title || '';
            meta.appendChild(title);

            const description = document.createElement('p');
            description.textContent = item.description || '';
            meta.appendChild(description);

            if (item.price) {
                const price = document.createElement('div');
                price.className = 'menu-price';
                price.textContent = item.price;
                meta.appendChild(price);
            }

            hover.appendChild(meta);

            const hoverIcon = document.createElement('div');
            hoverIcon.className = 'menu-hover-icon';
            hoverIcon.innerHTML = '<i class="fas fa-plus"></i>';
            hover.appendChild(hoverIcon);

            imageWrapper.appendChild(hover);
            card.appendChild(imageWrapper);
            attachMenuCardInteractions(card);
            grid.appendChild(card);
        });
        observeElements(grid.querySelectorAll('.menu-card'));
    }

    function attachMenuCardInteractions(card) {
        card.addEventListener('click', () => {
            if (window.innerWidth > 968) return;
            const isActive = card.classList.contains('show-info');
            document.querySelectorAll('.menu-card').forEach(c => c.classList.remove('show-info'));
            if (!isActive) {
                card.classList.add('show-info');
            }
        });
    }

    function updateGallery(items = []) {
        const gallery = document.querySelector('.gallery-masonry');
        if (!gallery) return;
        gallery.innerHTML = '';
        items.forEach(item => {
            const tile = document.createElement('div');
            tile.className = 'gallery-item';
            if (item.tall) {
                tile.classList.add('tall');
            }

            const img = document.createElement('img');
            img.src = item.image || PLACEHOLDERS.galleryImage;
            img.alt = item.alt || 'Galeri görseli';
            tile.appendChild(img);

            const overlay = document.createElement('div');
            overlay.className = 'gallery-overlay';
            overlay.innerHTML = '<i class="fas fa-search-plus"></i>';
            tile.appendChild(overlay);

            tile.addEventListener('click', () => {
                if (typeof window.openLightbox === 'function') {
                    window.openLightbox(img.src, img.alt);
                }
            });

            gallery.appendChild(tile);
        });
        observeElements(gallery.querySelectorAll('.gallery-item'));
    }

    function updateCta(cta = {}, contact = {}) {
        const section = document.querySelector('.cta-banner');
        if (!section) return;
        setText('.cta-banner .section-title', cta.headline);
        setText('.cta-banner .section-description', cta.description);

        const primaryBtn = section.querySelector('.btn-primary');
        if (primaryBtn) {
            const span = primaryBtn.querySelector('span');
            setText(span, cta.primary);
            if (contact?.phone) {
                primaryBtn.href = formatTel(contact.phone);
            }
        }

        const secondaryBtn = section.querySelector('.btn-outline');
        if (secondaryBtn) {
            const span = secondaryBtn.querySelector('span');
            setText(span, cta.secondary);
        }
    }

    function updateContact(contact = {}) {
        const addressLink = document.querySelector('.address-link');
        if (addressLink && contact.address) {
            const paragraph = addressLink.querySelector('.info-content p');
            setMultilineText(paragraph, contact.address);
            addressLink.href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(contact.address)}`;
        }

        if (contact.phone) {
            const telHref = formatTel(contact.phone);
            const contactPhoneLink = document.querySelector('#contact a[href^="tel"]');
            if (contactPhoneLink) {
                contactPhoneLink.href = telHref;
                contactPhoneLink.textContent = contact.phone;
            }
            updateNavCTA(contact.phone);
        }

        if (contact.email) {
            const contactEmailLink = document.querySelector('#contact a[href^="mailto"]');
            if (contactEmailLink) {
                contactEmailLink.href = `mailto:${contact.email}`;
                contactEmailLink.textContent = contact.email;
            }
        }

        if (contact.hours) {
            const hoursParagraph = document.querySelector('.info-icon .fa-clock')?.closest('.info-item')?.querySelector('.info-content p');
            setMultilineText(hoursParagraph, contact.hours);
        }
    }

    function updateNavCTA(phone) {
        const reserveBtn = document.querySelector('.btn-reserve');
        if (reserveBtn && phone) {
            reserveBtn.href = formatTel(phone);
        }
    }

    function updateSocial(social = []) {
        const container = document.querySelector('.social-icons');
        if (!container) return;
        const iconMap = {
            facebook: 'fab fa-facebook-f',
            instagram: 'fab fa-instagram',
            youtube: 'fab fa-youtube',
            linkedin: 'fab fa-linkedin-in',
            tiktok: 'fab fa-tiktok'
        };
        container.innerHTML = '';
        social.forEach(item => {
            const link = document.createElement('a');
            link.className = 'social-icon';
            link.href = item.url || '#';
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.setAttribute('aria-label', item.platform || 'sosyal bağlantı');

            const icon = document.createElement('i');
            icon.className = iconMap[item.platform?.toLowerCase()] || 'fas fa-link';
            link.appendChild(icon);
            container.appendChild(link);
        });
    }

    function updateMap(map = {}) {
        if (!map.description) return;
        const paragraph = document.querySelector('.map-section .section-description');
        setMultilineText(paragraph, map.description);
    }

    function observeElements(elements) {
        if (!revealObserver || !elements) return;
        elements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.6s ease';
            revealObserver.observe(el);
        });
    }

    function setText(selectorOrElement, value) {
        if (value === undefined || value === null) return;
        const el = typeof selectorOrElement === 'string'
            ? document.querySelector(selectorOrElement)
            : selectorOrElement;
        if (el) {
            el.textContent = value;
        }
    }

    function setMultilineText(element, value) {
        if (!element || value === undefined || value === null) return;
        element.innerHTML = '';
        const parts = String(value).split('\n');
        parts.forEach((part, idx) => {
            element.appendChild(document.createTextNode(part));
            if (idx < parts.length - 1) {
                element.appendChild(document.createElement('br'));
            }
        });
    }

    function formatTel(value) {
        const digits = String(value).replace(/[^0-9+]/g, '');
        return `tel:${digits}`;
    }
})();
