/* Get Bibled — sign-in page logic. Works in preview mode until assets/config.js is filled in. */
(function () {
  var cfg = window.GB_CONFIG || {};
  var configured = !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);
  var SDK = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js';
  var sb = null;

  var $ = function (id) { return document.getElementById(id); };
  var tabs = { signin: $('tab-signin'), signup: $('tab-signup') };
  var forms = { signin: $('form-signin'), signup: $('form-signup'), reset: $('form-reset') };
  var status = $('auth-status'), signedIn = $('signed-in'), formsBox = $('auth-forms');

  function say(msg, kind) {
    status.textContent = msg;
    status.className = 'auth-status ' + (kind || '');
  }
  function busy(form, on) {
    var b = form.querySelector('button[type=submit]');
    if (b) { b.disabled = on; b.dataset.label = b.dataset.label || b.textContent; b.textContent = on ? 'Please wait…' : b.dataset.label; }
  }
  function show(name) {
    Object.keys(forms).forEach(function (k) { forms[k].hidden = (k !== name); });
    tabs.signin.setAttribute('aria-selected', String(name === 'signin'));
    tabs.signup.setAttribute('aria-selected', String(name === 'signup'));
    tabs.signin.classList.toggle('on', name === 'signin');
    tabs.signup.classList.toggle('on', name === 'signup');
    $('tabs').hidden = (name === 'reset');
    say('');
    var first = forms[name].querySelector('input'); if (first) first.focus();
  }
  function previewNotice() {
    say('This is a design preview. No account was created and nothing was sent. Sign-in will be connected before launch.', 'info');
  }
  function valid(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

  tabs.signin.onclick = function () { show('signin'); };
  tabs.signup.onclick = function () { show('signup'); };
  $('go-reset').onclick = function () { show('reset'); };
  $('back-signin').onclick = function () { show('signin'); };

  document.querySelectorAll('.pw-toggle').forEach(function (btn) {
    btn.onclick = function () {
      var input = $(btn.getAttribute('data-for'));
      var hide = input.type === 'text';
      input.type = hide ? 'password' : 'text';
      btn.textContent = hide ? 'Show' : 'Hide';
      btn.setAttribute('aria-pressed', String(!hide));
    };
  });

  function render(session) {
    var on = !!(session && session.user);
    signedIn.hidden = !on; formsBox.hidden = on;
    if (on) $('who').textContent = session.user.email;
  }

  function load(cb) {
    if (window.supabase) return cb();
    var s = document.createElement('script');
    s.src = SDK; s.onload = cb;
    s.onerror = function () { say('Could not load the sign-in service. Check your connection and try again.', 'err'); };
    document.head.appendChild(s);
  }

  forms.signin.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = $('si-email').value.trim(), pw = $('si-password').value;
    if (!valid(email)) return say('Enter a valid email address.', 'err');
    if (!pw) return say('Enter your password.', 'err');
    if (!configured) return previewNotice();
    busy(forms.signin, true);
    sb.auth.signInWithPassword({ email: email, password: pw }).then(function (r) {
      busy(forms.signin, false);
      if (r.error) return say(r.error.message, 'err');
      render(r.data.session); say('');
    });
  });

  forms.signup.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = $('su-email').value.trim(), pw = $('su-password').value, pw2 = $('su-confirm').value;
    if (!valid(email)) return say('Enter a valid email address.', 'err');
    if (pw.length < 8) return say('Use at least 8 characters for your password.', 'err');
    if (pw !== pw2) return say('The two passwords do not match.', 'err');
    if (!$('su-consent').checked) return say('Please agree to the terms to create an account.', 'err');
    if (!configured) return previewNotice();
    busy(forms.signup, true);
    sb.auth.signUp({ email: email, password: pw, options: { emailRedirectTo: location.origin + location.pathname } }).then(function (r) {
      busy(forms.signup, false);
      if (r.error) return say(r.error.message, 'err');
      if (r.data.session) { render(r.data.session); return; }
      say('Account created. Check your email and open the confirmation link to finish.', 'ok');
      forms.signup.reset();
    });
  });

  forms.reset.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = $('rs-email').value.trim();
    if (!valid(email)) return say('Enter the email address for your account.', 'err');
    if (!configured) return previewNotice();
    busy(forms.reset, true);
    sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname }).then(function (r) {
      busy(forms.reset, false);
      if (r.error) return say(r.error.message, 'err');
      say('If an account exists for that email, a reset link is on its way.', 'ok');
    });
  });

  $('sign-out').onclick = function () {
    if (!configured) return;
    sb.auth.signOut().then(function () { render(null); say('You have been signed out.', 'ok'); });
  };

  show('signin');
  if (!configured) {
    $('mode-note').hidden = false;
  } else {
    load(function () {
      sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
      sb.auth.getSession().then(function (r) { render(r.data && r.data.session); });
      sb.auth.onAuthStateChange(function (_e, session) { render(session); });
    });
  }
})();
