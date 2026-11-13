const searchInput = document.getElementById('search');
const statusFilter = document.getElementById('statusFilter');
const sortSelect = document.getElementById('sortBy');
const tableBody = document.getElementById('tournamentBody');
const emptyMessage = document.getElementById('emptyMessage');
const resultInfo = document.getElementById('resultInfo');
const resetFilters = document.getElementById('resetFilters');
const favNote = document.getElementById('favNote');

function getVisibleTournaments() {
  const query = searchInput.value.trim().toLowerCase();
  const status = statusFilter.value;

  const list = TOURNAMENTS.filter(function (t) {
    const matchesName = t.game.toLowerCase().includes(query);
    const matchesStatus = status === 'all' || statusOf(t) === status;
    return matchesName && matchesStatus;
  });

  list.sort(function (a, b) {
    if (sortSelect.value === 'prize') {
      return b.prize - a.prize;
    }
    if (sortSelect.value === 'name') {
      return a.game.localeCompare(b.game);
    }
    return new Date(a.date) - new Date(b.date);
  });
  return list;
}

function makeCell(label, content, className) {
  const td = document.createElement('td');
  td.dataset.label = label;
  if (className) {
    td.className = className;
  }
  if (typeof content === 'string') {
    td.textContent = content;
  } else {
    td.appendChild(content);
  }
  return td;
}

function makeSlotsBar(t) {
  const left = t.slots - t.taken;
  const wrap = document.createElement('div');

  const label = document.createElement('div');
  label.className = 'small mb-1';
  label.textContent = left + ' of ' + t.slots + ' left';

  const bar = document.createElement('div');
  bar.className = 'progress';
  bar.setAttribute('role', 'progressbar');
  bar.setAttribute('aria-label', 'Slots taken for ' + t.game);
  bar.setAttribute('aria-valuemin', '0');
  bar.setAttribute('aria-valuemax', String(t.slots));
  bar.setAttribute('aria-valuenow', String(t.taken));

  const fill = document.createElement('div');
  fill.className = 'progress-bar';
  fill.style.width = Math.round((t.taken / t.slots) * 100) + '%';

  bar.appendChild(fill);
  wrap.append(label, bar);
  return wrap;
}

function makeFavButton(t) {
  const active = isFavorite(t.id);
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'fav-btn';
  button.dataset.id = t.id;
  setFavState(button, active, t.game);
  return button;
}

function setFavState(button, active, game) {
  button.setAttribute('aria-pressed', String(active));
  button.setAttribute('aria-label', (active ? 'Remove ' : 'Add ') + game + (active ? ' from favorites' : ' to favorites'));
  button.innerHTML = '<i class="bi ' + (active ? 'bi-heart-fill' : 'bi-heart') + '" aria-hidden="true"></i>';
}

function renderTable() {
  const list = getVisibleTournaments();
  tableBody.replaceChildren();

  let totalPrize = 0;
  list.forEach(function (t) {
    const tr = document.createElement('tr');
    const name = document.createElement('strong');
    name.textContent = t.game;

    const badge = document.createElement('span');
    const info = STATUS_BADGES[statusOf(t)];
    badge.className = 'badge ' + info.cls;
    badge.textContent = info.text;

    tr.append(
      makeCell('Discipline', name),
      makeCell('Date & Time', formatDate(t.date)),
      makeCell('Format', t.format),
      makeCell('Prize Pool', t.prize.toLocaleString('en-US') + ' KZT', 'text-gold fw-bold'),
      makeCell('Slots', makeSlotsBar(t)),
      makeCell('Status', badge),
      makeCell('Save', makeFavButton(t))
    );
    tableBody.appendChild(tr);
    totalPrize += t.prize;
  });

  emptyMessage.hidden = list.length > 0;
  resultInfo.textContent = list.length === 0
    ? 'Showing 0 tournaments'
    : 'Showing ' + list.length + ' of ' + TOURNAMENTS.length + ' tournaments, total prize pool ' + totalPrize.toLocaleString('en-US') + ' KZT';

  $(tableBody).children().hide().fadeIn(250);
}

tableBody.addEventListener('click', function (event) {
  const button = event.target.closest('.fav-btn');
  if (button === null) {
    return;
  }
  const tournament = TOURNAMENTS.find(function (x) {
    return x.id === Number(button.dataset.id);
  });
  if (!getCurrentUser()) {
    favNote.replaceChildren('Please ', makeLink('log in', 'login.html'), ' or ', makeLink('sign up', 'signup.html'), ' to save favorites.');
    return;
  }
  const active = toggleFavorite(tournament.id);
  setFavState(button, active, tournament.game);
  favNote.textContent = active ? tournament.game + ' added to favorites.' : tournament.game + ' removed from favorites.';
  $(button).stop(true, true).animate({ fontSize: '1.7rem' }, 120).animate({ fontSize: '1.3rem' }, 120);
  updateNav(true);
});

function makeLink(text, href) {
  const link = document.createElement('a');
  link.href = href;
  link.textContent = text;
  return link;
}

searchInput.addEventListener('input', renderTable);
statusFilter.addEventListener('change', renderTable);
sortSelect.addEventListener('change', renderTable);

resetFilters.addEventListener('click', function () {
  searchInput.value = '';
  statusFilter.value = 'all';
  sortSelect.value = 'date';
  renderTable();
  searchInput.focus();
});

const countdownBox = document.getElementById('countdown');
const countdownTitle = document.getElementById('countdownTitle');
const countdownParts = {
  days: document.getElementById('cdDays'),
  hours: document.getElementById('cdHours'),
  minutes: document.getElementById('cdMinutes'),
  seconds: document.getElementById('cdSeconds')
};

function nextTournament() {
  const now = new Date();
  const upcoming = TOURNAMENTS.filter(function (t) {
    return statusOf(t) === 'open' && new Date(t.date) > now;
  });
  upcoming.sort(function (a, b) {
    return new Date(a.date) - new Date(b.date);
  });
  return upcoming[0];
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function updateCountdown() {
  const next = nextTournament();
  if (!next) {
    countdownBox.hidden = true;
    return;
  }
  countdownBox.hidden = false;
  countdownTitle.textContent = 'Next tournament: ' + next.game + ' — ' + formatDate(next.date);

  const seconds = Math.floor((new Date(next.date) - new Date()) / 1000);
  countdownParts.days.textContent = pad(Math.floor(seconds / 86400));
  countdownParts.hours.textContent = pad(Math.floor((seconds % 86400) / 3600));
  countdownParts.minutes.textContent = pad(Math.floor((seconds % 3600) / 60));
  countdownParts.seconds.textContent = pad(seconds % 60);
}

renderTable();
updateCountdown();
setInterval(updateCountdown, 1000);