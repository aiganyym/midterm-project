const currentUser = getCurrentUser();

if (!currentUser) {
  window.location.replace('login.html');
}

const favList = document.getElementById('favList');
const bookList = document.getElementById('bookList');
const favEmpty = document.getElementById('favEmpty');
const bookEmpty = document.getElementById('bookEmpty');
const clearFavBtn = document.getElementById('clearFav');
const clearBookBtn = document.getElementById('clearBook');
const profileNote = document.getElementById('profileNote');

function makeInfoBlock(title, line, extra) {
  const wrap = document.createElement('div');
  const heading = document.createElement('h3');
  heading.textContent = title;
  const text = document.createElement('p');
  text.textContent = line;
  wrap.append(heading, text);
  if (extra) {
    wrap.appendChild(extra);
  }
  return wrap;
}

function makeRemoveButton(label, id, type) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'remove-btn';
  button.dataset.id = id;
  button.dataset.type = type;
  button.setAttribute('aria-label', label);
  button.innerHTML = '<i class="bi bi-trash3" aria-hidden="true"></i> Remove';
  return button;
}

function renderFavorites() {
  favList.replaceChildren();
  const ids = getFavorites();
  ids.forEach(function (id) {
    const t = TOURNAMENTS.find(function (x) {
      return x.id === id;
    });
    if (!t) {
      return;
    }
    const item = document.createElement('li');
    item.className = 'saved-item';
    const price = document.createElement('p');
    price.className = 'price';
    price.textContent = t.prize.toLocaleString('en-US') + ' KZT';
    item.append(
      makeInfoBlock(t.game, formatDate(t.date) + ' · ' + t.format + ' · ' + STATUS_BADGES[statusOf(t)].text, price),
      makeRemoveButton('Remove ' + t.game + ' from favorites', String(id), 'fav')
    );
    favList.appendChild(item);
  });
  favEmpty.hidden = favList.children.length > 0;
  clearFavBtn.disabled = favList.children.length === 0;
}

function renderBookings() {
  bookList.replaceChildren();
  getBookings().forEach(function (b) {
    const item = document.createElement('li');
    item.className = 'saved-item';
    let line = 'Seats ' + b.seats.join(', ') + ' · ' + b.hours + ' h · ' + b.date + ' at ' + b.time;
    if (b.freeDrinks) {
      line += ' · free drinks';
    }
    const price = document.createElement('p');
    price.className = 'price';
    price.textContent = '$' + b.total.toFixed(2) + (b.discounted ? ' (was $' + b.full.toFixed(2) + ')' : '');
    item.append(
      makeInfoBlock('Booking ' + b.code, line, price),
      makeRemoveButton('Cancel booking ' + b.code, b.code, 'book')
    );
    bookList.appendChild(item);
  });
  bookEmpty.hidden = bookList.children.length > 0;
  clearBookBtn.disabled = bookList.children.length === 0;
}

function renderStats() {
  const bookings = getBookings();
  let spent = 0;
  bookings.forEach(function (b) {
    spent += b.total;
  });
  document.getElementById('statFav').textContent = String(getFavorites().length);
  document.getElementById('statBook').textContent = String(bookings.length);
  document.getElementById('statSpent').textContent = '$' + spent.toFixed(2);
}

function refresh(message) {
  renderFavorites();
  renderBookings();
  renderStats();
  updateNav(true);
  profileNote.textContent = message;
}

function removeWithEffect(button, action, message) {
  $(button).closest('.saved-item').stop(true, true).fadeOut(250, function () {
    action();
    refresh(message);
  });
}

document.addEventListener('click', function (event) {
  const button = event.target.closest('.remove-btn');
  if (button === null) {
    return;
  }
  if (button.dataset.type === 'fav') {
    removeWithEffect(button, function () {
      removeFavorite(Number(button.dataset.id));
    }, 'Removed from favorites.');
  } else {
    removeWithEffect(button, function () {
      removeBooking(button.dataset.id);
    }, 'Booking cancelled. The seats are free again.');
  }
});

clearFavBtn.addEventListener('click', function () {
  clearFavorites();
  refresh('Favorites cleared.');
});

clearBookBtn.addEventListener('click', function () {
  clearBookings();
  refresh('All bookings cancelled. The seats are free again.');
});

document.getElementById('profileLogout').addEventListener('click', function () {
  logout();
  window.location.href = 'index.html';
});

if (currentUser) {
  document.getElementById('avatar').textContent = currentUser.name.charAt(0).toUpperCase();
  document.getElementById('profileName').textContent = currentUser.name;
  document.getElementById('profileEmail').textContent = currentUser.email;
  document.getElementById('profileJoined').textContent = 'Member since ' + new Date(currentUser.joined).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  refresh('');
  $('#savedArea').hide().fadeIn(300);
}