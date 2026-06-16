/* ============================================
   Punto Servicios Colombia - i18n (ES / EN)
   Motor de traducción con persistencia (localStorage)
   --------------------------------------------
   Uso en el HTML:
     <h2 data-i18n="clave">Texto en español</h2>
   - El español original se cachea en data-i18n-es la primera vez.
   - El inglés vive en el diccionario PS_I18N.en, indexado por la clave.
   - Para traducir atributos (placeholder, aria-label, content...):
     <input data-i18n-attr="placeholder:clave">
   - La elección se guarda en localStorage bajo 'ps_lang' y se lee en
     cada carga para que persista al navegar entre vistas.
   ============================================ */

(function () {
  'use strict';

  var STORAGE_KEY = 'ps_lang';
  var DEFAULT_LANG = 'es';
  var EN = (window.PS_I18N && window.PS_I18N.en) || {};

  function currentLang() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      return v === 'en' ? 'en' : 'es';
    } catch (e) { return DEFAULT_LANG; }
  }

  function saveLang(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }

  function applyText(lang) {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      // Cachear el español original (innerHTML conserva <em>, <br>, <strong>...)
      if (!el.hasAttribute('data-i18n-es')) {
        el.setAttribute('data-i18n-es', el.innerHTML.trim());
      }
      var key = el.getAttribute('data-i18n');
      if (lang === 'en') {
        if (Object.prototype.hasOwnProperty.call(EN, key) && EN[key] != null) {
          el.innerHTML = EN[key];
        }
      } else {
        el.innerHTML = el.getAttribute('data-i18n-es');
      }
    });
  }

  function applyAttrs(lang) {
    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      // Formato: "attr:clave, attr2:clave2"
      el.getAttribute('data-i18n-attr').split(',').forEach(function (pair) {
        var parts = pair.split(':');
        var attr = (parts[0] || '').trim();
        var key = (parts[1] || '').trim();
        if (!attr || !key) return;
        var cacheAttr = 'data-i18n-es-' + attr;
        if (!el.hasAttribute(cacheAttr)) {
          el.setAttribute(cacheAttr, el.getAttribute(attr) || '');
        }
        if (lang === 'en') {
          if (Object.prototype.hasOwnProperty.call(EN, key) && EN[key] != null) {
            el.setAttribute(attr, EN[key]);
          }
        } else {
          el.setAttribute(attr, el.getAttribute(cacheAttr));
        }
      });
    });
  }

  function syncToggles(lang) {
    document.querySelectorAll('.lang-toggle').forEach(function (btn) {
      var label = btn.querySelector('.lang-toggle-label');
      // El botón muestra el idioma AL QUE se cambiará.
      if (label) label.textContent = lang === 'en' ? 'ES' : 'EN';
      btn.setAttribute('aria-label', lang === 'en' ? 'Cambiar a español' : 'Switch to English');
      btn.setAttribute('aria-pressed', String(lang === 'en'));
    });
  }

  function apply(lang) {
    document.documentElement.setAttribute('lang', lang);
    applyText(lang);
    applyAttrs(lang);
    syncToggles(lang);
  }

  // Aplicar lo antes posible (el script se carga al final del body).
  var lang = currentLang();
  apply(lang);

  // Toggle por delegación (cubre nav y menú móvil).
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.lang-toggle');
    if (!btn) return;
    e.preventDefault();
    lang = currentLang() === 'en' ? 'es' : 'en';
    saveLang(lang);
    apply(lang);
  });

  // Exponer por si otros scripts lo necesitan.
  window.PSI18N = { apply: apply, get: currentLang, set: function (l) { saveLang(l); apply(l); } };
})();
