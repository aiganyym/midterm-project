const KEYS = {
  users: 'arenaUsers',
  current: 'arenaCurrentUser',
  favorites: 'arenaFavorites',
  bookings: 'arenaBookings',
  seats: 'arenaSeats'
};

function readStore(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value === null || value === undefined ? (fallback === undefined ? {} : fallback) : value;
  } catch (e) {
    return fallback === undefined ? {} : fallback;
  }
}

function writeStore(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    return;
  }
}

function getUsers() {
  const users = readStore(KEYS.users, []);
  return Array.isArray(users) ? users : [];
}

function findUser(email) {
  return getUsers().find(function (u) {
    return u.email === email.trim().toLowerCase();
  });
}

function addUser(name, email, password) {
  const users = getUsers();
  const user = { name: name, email: email.trim().toLowerCase(), password: password, joined: new Date().toISOString() };
  users.push(user);
  writeStore(KEYS.users, users);
  return user;
}

function getCurrentUser() {
  const email = readStore(KEYS.current, '');
  return typeof email === 'string' && email !== '' ? findUser(email) : undefined;
}

function login(email) {
  writeStore(KEYS.current, email);
}

function logout() {
  try {
    localStorage.removeItem(KEYS.current);
  } catch (e) {
    return;
  }
}

function getUserList(key) {
  const user = getCurrentUser();
  if (!user) {
    return [];
  }
  const all = readStore(key, {});
  return Array.isArray(all[user.email]) ? all[user.email] : [];
}

function saveUserList(key, list) {
  const user = getCurrentUser();
  if (!user) {
    return;
  }
  const all = readStore(key, {});
  all[user.email] = list;
  writeStore(key, all);
}

function getFavorites() {
  return getUserList(KEYS.favorites);
}

function isFavorite(id) {
  return getFavorites().includes(id);
}

function toggleFavorite(id) {
  const list = getFavorites();
  const position = list.indexOf(id);
  if (position === -1) {
    list.push(id);
  } else {
    list.splice(position, 1);
  }
  saveUserList(KEYS.favorites, list);
  return position === -1;
}

function removeFavorite(id) {
  saveUserList(KEYS.favorites, getFavorites().filter(function (x) {
    return x !== id;
  }));
}

function clearFavorites() {
  saveUserList(KEYS.favorites, []);
}

function getBookings() {
  return getUserList(KEYS.bookings);
}

function addBooking(booking) {
  const list = getBookings();
  list.push(booking);
  saveUserList(KEYS.bookings, list);
}

function freeSeats(ids) {
  const taken = readStore(KEYS.seats, {});
  ids.forEach(function (id) {
    delete taken[id];
  });
  writeStore(KEYS.seats, taken);
}

function removeBooking(code) {
  const list = getBookings();
  const booking = list.find(function (b) {
    return b.code === code;
  });
  if (booking) {
    freeSeats(booking.seats);
  }
  saveUserList(KEYS.bookings, list.filter(function (b) {
    return b.code !== code;
  }));
}

function clearBookings() {
  getBookings().forEach(function (b) {
    freeSeats(b.seats);
  });
  saveUserList(KEYS.bookings, []);
}