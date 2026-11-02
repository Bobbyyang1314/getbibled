/* Get Bibled — page guard.
   Loaded in <head> of every page except index.html (the sign-in page).
   When sign-in is configured (assets/config.js), visitors who are not signed in are sent to index.html.
   In preview mode (config.js empty) every page stays open.
   Note: this controls the visitor flow only. On a static host the page files themselves are still public. */
(function () {
  var cfg = window.GB_CONFIG || {};
  if (!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY)) return; // preview mode

  var SDK = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js';
  var ref = '';
  try { ref = new URL(cfg.SUPABASE_URL).hostname.split('.')[0]; } catch (e) {}
  var storageKey = 'sb-' + ref + '-auth-token';

  function hasSession() {
    try { return !!localStorage.getItem(storageKey); } catch (e) { return false; }
  }

  if (!hasSession()) {
    var here = location.pathname.split('/').pop() || 'home.html';
    location.replace('index.html?next=' + encodeURIComponent(here + location.search + location.hash));
    return;
  }

  function signOut(e) {
    e.preventDefault();
    var done = function () {
      try { localStorage.removeItem(storageKey); } catch (err) {}
      location.replace('index.html');
    };
    var run = function () {
      try {
        window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY).auth.signOut().then(done, done);
      } catch (err) { done(); }
    };
    if (window.supabase) return run();
    var s = document.createElement('script');
    s.src = SDK; s.onload = run; s.onerror = done;
    document.head.appendChild(s);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var link = document.getElementById('nav-signout');
    if (!link) return;
    link.hidden = false;
    link.addEventListener('click', signOut);
  });
})();
