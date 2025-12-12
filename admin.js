const state = {
    content: null,
    token: localStorage.getItem('admin-token') || ''
};

const bindInputs = () => document.querySelectorAll('[data-bind]');

const getVal = (path) => path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), state.content || {});

const setVal = (path, value) => {
    const parts = path.split('.');
    let ctx = state.content;
    parts.forEach((key, idx) => {
        if (idx === parts.length - 1) {
            ctx[key] = value;
        } else {
            ctx[key] = ctx[key] || {};
            ctx = ctx[key];
        }
    });
};

const ensureContent = () => {
    if (!state.content) {
        state.content = {};
    }
    return state.content;
};

const ensureFeatureArray = () => {
    const content = ensureContent();
    content.about = content.about || {};
    if (!Array.isArray(content.about.features)) {
        content.about.features = [];
    }
    return content.about.features;
};

const ensureMenuArray = () => {
    const content = ensureContent();
    if (!Array.isArray(content.menu)) {
        content.menu = [];
    }
    return content.menu;
};

const ensureGalleryArray = () => {
    const content = ensureContent();
    if (!Array.isArray(content.gallery)) {
        content.gallery = [];
    }
    return content.gallery;
};

const ensureSocialArray = () => {
    const content = ensureContent();
    if (!Array.isArray(content.social)) {
        content.social = [];
    }
    return content.social;
};

const ensureHeroImagesArray = () => {
    const content = ensureContent();
    content.hero = content.hero || {};
    if (!Array.isArray(content.hero.images)) {
        content.hero.images = [];
    }
    return content.hero.images;
};

async function loadContent() {
    const res = await fetch('/api/content');
    state.content = await res.json();
    fillBindings();
    renderLists();
    document.getElementById('raw-json').value = JSON.stringify(state.content, null, 2);
}

function fillBindings() {
    bindInputs().forEach(input => {
        const path = input.dataset.bind;
        const value = getVal(path);
        if (value !== undefined) {
            input.value = value;
        }
        input.oninput = (e) => {
            const val = input.type === 'number' ? Number(e.target.value) : e.target.value;
            setVal(path, val);
        };
    });
}

function renderLists() {
    renderFeatureList();
    renderMenuList();
    renderGalleryList();
    renderSocialList();
    renderHeroImagesList();
}

function renderHeroImagesList() {
    const container = document.getElementById('hero-images-list');
    if (!container) return;
    container.innerHTML = '';
    const tpl = document.getElementById('hero-image-template');
    const images = ensureHeroImagesArray();

    images.forEach((src, index) => {
        const node = tpl.content.firstElementChild.cloneNode(true);
        const hidden = node.querySelector('input[type="hidden"][data-field="hero-image"]');
        const text = node.querySelector('input[data-field="hero-image-path"]');
        const preview = node.querySelector('img[data-field="hero-image-preview"]');

        hidden.value = src || '';
        text.value = src || '';

        if (src) {
            preview.style.display = 'block';
            preview.src = src;
        }

        text.addEventListener('input', (e) => {
            const value = e.target.value;
            state.content.hero.images[index] = value;
            hidden.value = value;
            if (value) {
                preview.style.display = 'block';
                preview.src = value;
            }
        });

        node.querySelector('[data-action="remove-item"]').addEventListener('click', () => {
            state.content.hero.images.splice(index, 1);
            renderHeroImagesList();
        });

        container.appendChild(node);
    });
}

function renderFeatureList() {
    const container = document.getElementById('features-list');
    container.innerHTML = '';
    const tpl = document.getElementById('feature-template');
    const features = ensureFeatureArray();
    features.forEach((item, index) => {
        const node = tpl.content.firstElementChild.cloneNode(true);
        node.querySelectorAll('[data-field]').forEach(input => {
            const field = input.dataset.field;
            input.value = item[field] || '';
            input.addEventListener('input', (e) => {
                state.content.about.features[index][field] = e.target.value;
            });
        });
        node.querySelector('[data-action="remove-item"]').addEventListener('click', () => {
            state.content.about.features.splice(index, 1);
            renderFeatureList();
        });
        container.appendChild(node);
    });
}

function renderMenuList() {
    const container = document.getElementById('menu-list');
    container.innerHTML = '';
    const tpl = document.getElementById('menu-template');
    const menuItems = ensureMenuArray();
    menuItems.forEach((item, index) => {
        const node = tpl.content.firstElementChild.cloneNode(true);
        node.querySelectorAll('[data-field]').forEach(input => {
            const field = input.dataset.field;
            input.value = item[field] || '';
            input.addEventListener('input', (e) => {
                state.content.menu[index][field] = field === 'price' ? e.target.value : e.target.value;
            });
        });
        node.querySelector('[data-action="remove-item"]').addEventListener('click', () => {
            state.content.menu.splice(index, 1);
            renderMenuList();
        });
        container.appendChild(node);
    });
}

function renderGalleryList() {
    const container = document.getElementById('gallery-list');
    container.innerHTML = '';
    const tpl = document.getElementById('gallery-template');
    const galleryItems = ensureGalleryArray();
    galleryItems.forEach((item, index) => {
        const node = tpl.content.firstElementChild.cloneNode(true);
        node.querySelectorAll('[data-field]').forEach(input => {
            const field = input.dataset.field;
            if (field === 'tall') {
                input.value = item.tall ? 'true' : 'false';
            } else {
                input.value = item[field] || '';
            }
            input.addEventListener('input', (e) => {
                if (field === 'tall') {
                    state.content.gallery[index].tall = e.target.value === 'true';
                } else {
                    state.content.gallery[index][field] = e.target.value;
                }
            });
        });
        node.querySelector('[data-action="remove-item"]').addEventListener('click', () => {
            state.content.gallery.splice(index, 1);
            renderGalleryList();
        });
        container.appendChild(node);
    });
}

function renderSocialList() {
    const container = document.getElementById('social-list');
    container.innerHTML = '';
    const tpl = document.getElementById('social-template');
    const socials = ensureSocialArray();
    socials.forEach((item, index) => {
        const node = tpl.content.firstElementChild.cloneNode(true);
        node.querySelectorAll('[data-field]').forEach(input => {
            const field = input.dataset.field;
            input.value = item[field] || '';
            input.addEventListener('input', (e) => {
                state.content.social[index][field] = e.target.value;
            });
        });
        node.querySelector('[data-action="remove-item"]').addEventListener('click', () => {
            state.content.social.splice(index, 1);
            renderSocialList();
        });
        container.appendChild(node);
    });
}

async function saveContent() {
    const saveBtn = document.getElementById('btn-save');
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.dataset.saving = '1';
    }

    try {
        const token = state.token || document.getElementById('admin-token').value.trim();
        if (!token) {
            alert('Lütfen yönetici anahtarını girin.');
            return;
        }
        if (!state.content) {
            alert('İçerik yüklenmedi. Önce “Verileri Yenile” yap.');
            return;
        }

        const res = await fetch('/api/content', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Cache-Control': 'no-store'
            },
            body: JSON.stringify(state.content)
        });

        if (!res.ok) {
            const text = await res.text().catch(() => '');
            alert('Kaydetme başarısız.\n\nDurum: ' + res.status + '\n' + (text || ''));
            return;
        }

        alert('İçerik kaydedildi.');
        document.getElementById('raw-json').value = JSON.stringify(state.content, null, 2);
    } catch (err) {
        alert('Kaydetme sırasında hata: ' + (err?.message || err));
    } finally {
        if (saveBtn) {
            saveBtn.disabled = false;
            delete saveBtn.dataset.saving;
        }
    }
}

function attachEvents() {
    document.getElementById('btn-refresh').addEventListener('click', loadContent);
    document.getElementById('btn-save').addEventListener('click', saveContent);
    document.getElementById('btn-save-token').addEventListener('click', () => {
        const value = document.getElementById('admin-token').value.trim();
        state.token = value;
        localStorage.setItem('admin-token', value);
        alert('Token kaydedildi.');
    });
    document.querySelector('[data-action="add-feature"]').addEventListener('click', () => {
        ensureFeatureArray().push({ icon: '', title: '', description: '' });
        renderFeatureList();
    });
    document.querySelector('[data-action="add-menu"]').addEventListener('click', () => {
        ensureMenuArray().push({ label: '', title: '', description: '', price: '', image: '' });
        renderMenuList();
    });
    document.querySelector('[data-action="add-gallery"]').addEventListener('click', () => {
        ensureGalleryArray().push({ image: '', alt: '', tall: false });
        renderGalleryList();
    });
    document.querySelector('[data-action="add-social"]').addEventListener('click', () => {
        ensureSocialArray().push({ platform: '', url: '' });
        renderSocialList();
    });

    document.querySelector('[data-action="add-hero-image"]').addEventListener('click', () => {
        ensureHeroImagesArray().push('');
        renderHeroImagesList();
    });
    document.getElementById('btn-sync-json').addEventListener('click', () => {
        try {
            const parsed = JSON.parse(document.getElementById('raw-json').value);
            state.content = parsed;
            fillBindings();
            renderLists();
            alert('JSON içerik form alanlarına aktarıldı.');
        } catch (error) {
            alert('JSON formatı hatalı.');
        }
    });
}

(function init() {
    document.getElementById('admin-token').value = state.token;
    attachEvents();
    loadContent();
    // Görsel yükleme inputlarını dinle
    document.body.addEventListener('change', async function (e) {
        const input = e.target;
        if (input.matches('input[type="file"][data-field="image-upload"], input[type="file"][data-field="hero-image-upload"]')) {
            const file = input.files[0];
            if (!file) return;
            // Önizleme
            const preview = input.parentElement.querySelector('img[data-field="image-preview"], img[data-field="hero-image-preview"]');
            preview.style.display = 'block';
            preview.src = URL.createObjectURL(file);
            // Yükleme
            const formData = new FormData();
            formData.append('image', file);
            try {
                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                const data = await res.json();
                if (res.ok && data.filePath) {
                    // Gizli inputa yolu yaz
                    const hidden = input.parentElement.querySelector('input[type="hidden"][data-field="image"], input[type="hidden"][data-field="hero-image"]');
                    hidden.value = data.filePath;

                    // Hero image text input (if exists)
                    const heroText = input.parentElement.querySelector('input[data-field="hero-image-path"]');
                    if (heroText) {
                        heroText.value = data.filePath;
                    }

                    // Bağlı objeye de yaz (menü veya galeri)
                    // Menü
                    const menuNode = input.closest('[id^="menu-template"],[id^="gallery-template"]');
                    if (menuNode) {
                        // Menü
                        const menuIndex = Array.from(document.querySelectorAll('#menu-list .repeat-item')).indexOf(input.closest('.repeat-item'));
                        if (menuIndex !== -1 && state.content.menu && state.content.menu[menuIndex]) {
                            state.content.menu[menuIndex].image = data.filePath;
                        }
                        // Galeri
                        const galIndex = Array.from(document.querySelectorAll('#gallery-list .repeat-item')).indexOf(input.closest('.repeat-item'));
                        if (galIndex !== -1 && state.content.gallery && state.content.gallery[galIndex]) {
                            state.content.gallery[galIndex].image = data.filePath;
                        }
                    }

                    // Hero images
                    const heroItem = input.closest('#hero-images-list .repeat-item');
                    if (heroItem) {
                        const heroIndex = Array.from(document.querySelectorAll('#hero-images-list .repeat-item')).indexOf(heroItem);
                        if (heroIndex !== -1 && state.content.hero && Array.isArray(state.content.hero.images)) {
                            state.content.hero.images[heroIndex] = data.filePath;
                        }
                    }
                } else {
                    alert('Görsel yüklenemedi: ' + (data.message || 'Sunucu hatası'));
                }
            } catch (err) {
                alert('Görsel yüklenemedi: ' + err.message);
            }
        }
    });
})();
