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
    const token = state.token || document.getElementById('admin-token').value.trim();
    if (!token) {
        alert('Lütfen yönetici anahtarını girin.');
        return;
    }
    const res = await fetch('/api/content', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(state.content)
    });
    if (!res.ok) {
        alert('Kaydetme başarısız: ' + (await res.text()));
        return;
    }
    alert('İçerik kaydedildi.');
    document.getElementById('raw-json').value = JSON.stringify(state.content, null, 2);
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
})();
