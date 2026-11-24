// ═══════════════════════════════════════════════════════════
// Cookie banner
// ═══════════════════════════════════════════════════════════
function cookieAkkoord() {
  localStorage.setItem('cookie_akkoord', '1');
  document.getElementById('cookie-banner').style.display = 'none';
}

(function() {
  if (!localStorage.getItem('cookie_akkoord')) {
    setTimeout(() => {
      document.getElementById('cookie-banner').style.display = 'block';
    }, 1200);
  }
})();
