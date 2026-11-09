function showError(input, message, touched) {
  const box = document.getElementById('err-' + input.id);
  box.textContent = message;
  input.classList.toggle('is-invalid', message !== '');
  input.classList.toggle('is-valid', message === '' && touched);
  input.setAttribute('aria-invalid', message === '' ? 'false' : 'true');
}

function clearMarks(form) {
  form.querySelectorAll('.is-invalid, .is-valid').forEach(function (input) {
    input.classList.remove('is-invalid', 'is-valid');
    input.removeAttribute('aria-invalid');
  });
  form.querySelectorAll('.invalid-feedback').forEach(function (box) {
    box.textContent = '';
  });
}

function initForm(form, rules, onValid) {
  const touched = new Set();
  const ids = Object.keys(rules);

  function check(id) {
    const input = document.getElementById(id);
    const message = rules[id](input);
    showError(input, message, touched.has(id));
    return message === '';
  }

  ids.forEach(function (id) {
    const input = document.getElementById(id);
    input.addEventListener('blur', function () {
      touched.add(id);
      check(id);
    });
    ['input', 'change'].forEach(function (type) {
      input.addEventListener(type, function () {
        if (touched.has(id)) {
          check(id);
        }
      });
    });
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    let firstWrong = null;
    ids.forEach(function (id) {
      touched.add(id);
      if (!check(id) && firstWrong === null) {
        firstWrong = document.getElementById(id);
      }
    });
    if (firstWrong !== null) {
      firstWrong.focus();
      return;
    }
    if (onValid() === false) {
      return;
    }
    form.reset();
    touched.clear();
    clearMarks(form);
  });
}

function showSuccess(text) {
  $('#successMessage').stop(true, true).hide().text(text).slideDown(250).delay(7000).slideUp(250);
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function isPhone(value) {
  return /^\+7\d{10}$/.test(value.replace(/[\s\-()]/g, ''));
}