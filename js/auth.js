function updateNav(animate) {
  const user = getCurrentUser();
  document.querySelectorAll('[data-auth="guest"]').forEach(function (item) {
    item.hidden = user !== undefined;
  });
  document.querySelectorAll('[data-auth="user"]').forEach(function (item) {
    item.hidden = user === undefined;
  });
  if (user) {
    const count = getFavorites().length + getBookings().length;
    document.getElementById('navUserName').textContent = user.name.split(' ')[0];
    const badge = document.getElementById('navCount');
    badge.textContent = String(count);
    badge.hidden = count === 0;
    badge.setAttribute('aria-label', count + ' saved items');
    if (animate) {
      badge.classList.remove('pulse');
      void badge.offsetWidth;
      badge.classList.add('pulse');
    }
  }
}

function prefillForm(form, fields) {
  function fill() {
    const user = getCurrentUser();
    if (!user) {
      return;
    }
    for (const id in fields) {
      document.getElementById(id).value = user[fields[id]];
    }
  }
  fill();
  form.addEventListener('reset', function () {
    setTimeout(fill, 0);
  });
}

document.getElementById('logoutBtn').addEventListener('click', function () {
  logout();
  window.location.href = 'index.html';
});

updateNav();