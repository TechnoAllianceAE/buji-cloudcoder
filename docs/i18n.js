const currentLang = localStorage.getItem('bc2-lang') || 'en';
document.getElementById('language-selector').value = currentLang;
applyLanguage(currentLang);

document.getElementById('language-selector').addEventListener('change', function() {
    localStorage.setItem('bc2-lang', this.value);
    applyLanguage(this.value);
    if (this.value === 'sa') {
        document.documentElement.setAttribute('dir', 'rtl');
    } else {
        document.documentElement.removeAttribute('dir');
    }
});

function applyLanguage(lang) {
    const t = window.translations[lang] || window.translations.en;
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
            el.textContent = t[key];
        }
    });
}
