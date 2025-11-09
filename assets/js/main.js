// Main site JS: icons, mobile menu, sticky nav, year
(function(){
  function ready(fn){ if(document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }

  ready(function(){
    // Icons
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }

    // Dynamic year in footer
    var yearEl = document.getElementById('year');
    if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

    // Mobile menu toggle
    var btn = document.getElementById('mobile-menu-button');
    var menu = document.getElementById('mobile-menu');
    if (btn && menu) {
      btn.addEventListener('click', function(){
        var isHidden = menu.classList.contains('hidden');
        menu.classList.toggle('hidden');
        btn.setAttribute('aria-expanded', String(isHidden));
        menu.setAttribute('aria-hidden', String(!isHidden));
      });
      // Close on link click
      menu.querySelectorAll('a').forEach(function(link){
        link.addEventListener('click', function(){ menu.classList.add('hidden'); });
      });
    }

    // Sticky nav shadow
    var nav = document.getElementById('main-nav');
    function onScroll(){ if (!nav) return; if (window.scrollY > 50) nav.classList.add('shadow-md'); else nav.classList.remove('shadow-md'); }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Simple fade-up reveal for hero text on first paint
    try {
      var hero = document.getElementById('home');
      if (hero) {
        var textBlock = hero.querySelector('.hero-text');
        if (textBlock) {
          textBlock.classList.add('fade-up');
          requestAnimationFrame(function(){ textBlock.classList.add('appear'); });
        }
      }
    } catch(e){}

    // IntersectionObserver for fade-up elements
    try {
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            entry.target.classList.add('appear');
            io.unobserve(entry.target);
          }
        });
      }, { root: null, threshold: 0.15 });

      document.querySelectorAll('.fade-up:not(.appear)').forEach(function(el){ io.observe(el); });
    } catch(e){}
  });
})();
