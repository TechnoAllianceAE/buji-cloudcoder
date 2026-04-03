// Language switching functionality
const currentLang = localStorage.getItem('free-code-lang') || 'en';
document.getElementById('language-selector').value = currentLang;
applyLanguage(currentLang);

document.getElementById('language-selector').addEventListener('change', (e) => {
    const lang = e.target.value;
    localStorage.setItem('free-code-lang', lang);
    applyLanguage(lang);
});

function applyLanguage(lang) {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'sa' ? 'rtl' : 'ltr';
    
    const translations = window.translations[lang] || window.translations['en'];
    
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[key]) {
            element.textContent = translations[key];
        }
    });
}
