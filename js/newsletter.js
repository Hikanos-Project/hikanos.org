(function () {
  var dialog = document.getElementById('newsletter');
  if (!dialog || typeof dialog.showModal !== 'function') return;

  var form = dialog.querySelector('.newsletter-form');
  var done = dialog.querySelector('.newsletter-done');
  var email = form.querySelector('input[type="email"]');
  var trap = form.querySelector('input[name="website"]');
  var submit = form.querySelector('button[type="submit"]');
  var status = form.querySelector('.newsletter-status');
  var message = function (name) { return dialog.querySelector('[data-msg="' + name + '"]').innerHTML; };
  var opener = null;

  function open(from) {
    opener = from;
    form.hidden = false;
    done.hidden = true;
    status.textContent = '';
    if (!dialog.open) dialog.showModal();
    email.focus();
  }
  document.querySelectorAll('[data-newsletter-open]').forEach(function (button) {
    button.hidden = false;
    button.addEventListener('click', function () { open(button); });
  });

  // Direct link to the sign-up, e.g. from slides or emails: https://hikanos.org/#newsletter
  function openFromLink() {
    if (location.hash !== '#newsletter') return;
    history.replaceState(null, '', location.pathname + location.search);
    open(null);
  }
  openFromLink();
  window.addEventListener('hashchange', openFromLink);

  dialog.querySelectorAll('[data-newsletter-close]').forEach(function (button) {
    button.addEventListener('click', function () { dialog.close(); });
  });
  dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', function () { if (opener) opener.focus(); });

  function showError(html) {
    status.innerHTML = html;
    status.classList.add('is-error');
    email.setAttribute('aria-invalid', 'true');
  }

  function showDone() {
    form.hidden = true;
    done.hidden = false;
    done.querySelector('button').focus();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.textContent = '';
    status.classList.remove('is-error');
    email.removeAttribute('aria-invalid');

    if (!email.value.trim() || !email.checkValidity()) {
      showError(message('invalid'));
      email.focus();
      return;
    }
    if (trap.value) { showDone(); return; }

    submit.disabled = true;
    status.textContent = 'Sending…';
    fetch(form.action, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new URLSearchParams({ 'fields[email]': email.value.trim(), 'ml-submit': '1', anticsrf: 'true' }),
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data && data.success === true) {
          form.reset();
          status.textContent = '';
          showDone();
        } else {
          var fieldError = data && data.errors && data.errors.fields && data.errors.fields.email;
          console.warn('Newsletter sign-up failed: MailerLite answered', JSON.stringify(data));
          showError(fieldError ? message('invalid') : message('error'));
        }
      })
      .catch(function (err) {
        console.warn('Newsletter sign-up failed: request blocked or offline', String(err));
        showError(message('error'));
      })
      .then(function () { submit.disabled = false; });
  });
})();
