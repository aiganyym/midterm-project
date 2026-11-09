const MAX_SEATS = 6;
const DISCOUNT_FROM_HOURS = 3;
const DISCOUNT = 0.1;
const FREE_DRINKS_AFTER_HOURS = 5;

const mapBox = document.getElementById('seatMap');
const summaryList = document.getElementById('summaryList');
const hoursInput = document.getElementById('hours');
const seatMessage = document.getElementById('seatMessage');
const totalBox = document.getElementById('total');
const discountRow = document.getElementById('discountRow');
const perkRow = document.getElementById('perkRow');
const oldTotalBox = document.getElementById('oldTotal');
const saveBadge = document.getElementById('saveBadge');
const clearButton = document.getElementById('clearSeats');
const bookingForm = document.getElementById('bookingForm');
const dateInput = document.getElementById('date');

let selected = [];

function findSeat(id) {
  return SEATS.find(function (s) {
    return s.id === id;
  });
}

function getHours() {
  const value = hoursInput.value.trim();
  const number = Number(value);
  return value !== '' && Number.isInteger(number) && number >= 1 && number <= 8 ? number : 0;
}

function calculateTotal() {
  let perHour = 0;
  selected.forEach(function (id) {
    perHour += findSeat(id).price;
  });
  const hours = getHours();
  const full = perHour * hours;
  let total = full;
  const discounted = hours >= DISCOUNT_FROM_HOURS && selected.length > 0;
  if (discounted) {
    total = full * (1 - DISCOUNT);
  }
  const freeDrinks = hours > FREE_DRINKS_AFTER_HOURS && selected.length > 0;
  return { perHour: perHour, hours: hours, full: full, total: total, discounted: discounted, freeDrinks: freeDrinks };
}

function makeSeatButton(seat) {
  const zone = ZONES[seat.zone];
  const isSelected = selected.includes(seat.id);
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'seat' + (seat.taken ? ' taken' : '') + (isSelected ? ' selected' : '');
  button.dataset.id = seat.id;
  button.setAttribute('aria-pressed', String(isSelected));
  button.setAttribute('aria-label', 'Seat ' + seat.id + ', ' + zone.name + ', $' + seat.price + ' per hour, ' + (seat.taken ? 'taken' : 'free'));

  const icon = document.createElement('i');
  icon.className = 'bi ' + zone.icon;
  icon.setAttribute('aria-hidden', 'true');

  const label = document.createElement('span');
  label.textContent = seat.id;

  button.append(icon, label);
  return button;
}

function renderMap() {
  mapBox.replaceChildren();
  for (const key in ZONES) {
    const zone = ZONES[key];
    const free = SEATS.filter(function (s) {
      return s.zone === key && !s.taken;
    }).length;

    const block = document.createElement('div');
    block.className = 'zone-block zone-' + key;

    const title = document.createElement('h3');
    title.className = 'h5';
    title.textContent = zone.name + ' — $' + zone.price + '/hour';

    const info = document.createElement('p');
    info.className = 'small text-secondary';
    info.textContent = free + ' of ' + zone.count + ' seats free';

    const grid = document.createElement('div');
    grid.className = 'seat-grid';
    SEATS.forEach(function (seat) {
      if (seat.zone === key) {
        grid.appendChild(makeSeatButton(seat));
      }
    });

    block.append(title, info, grid);
    mapBox.appendChild(block);
  }
}

function renderSummary() {
  summaryList.replaceChildren();
  if (selected.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'text-secondary';
    empty.textContent = 'No seats selected yet. Click a free seat on the map.';
    summaryList.appendChild(empty);
  }

  selected.forEach(function (id) {
    const seat = findSeat(id);
    const item = document.createElement('li');
    item.className = 'summary-item';

    const text = document.createElement('span');
    text.textContent = id + ' · ' + ZONES[seat.zone].name + ' · $' + seat.price + '/h';

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'remove-seat';
    remove.dataset.id = id;
    remove.setAttribute('aria-label', 'Remove seat ' + id);
    remove.innerHTML = '<i class="bi bi-x-lg" aria-hidden="true"></i>';

    item.append(text, remove);
    summaryList.appendChild(item);
  });

  const result = calculateTotal();
  const hasPrice = result.hours !== 0 && selected.length !== 0;
  totalBox.textContent = hasPrice ? '$' + result.total.toFixed(2) : '$0.00';
  oldTotalBox.textContent = '$' + result.full.toFixed(2);
  oldTotalBox.hidden = !result.discounted;
  saveBadge.hidden = !result.discounted;
  discountRow.hidden = !result.discounted;
  perkRow.hidden = !result.freeDrinks;
  clearButton.disabled = selected.length === 0;
}

function setMessage(text) {
  seatMessage.textContent = text;
}

function toggleSeat(id) {
  const seat = findSeat(id);
  if (seat.taken) {
    setMessage('Seat ' + id + ' is already taken. Choose another one.');
    return;
  }
  const position = selected.indexOf(id);
  if (position !== -1) {
    selected.splice(position, 1);
    setMessage('Seat ' + id + ' removed.');
  } else if (selected.length >= MAX_SEATS) {
    setMessage('You can book up to ' + MAX_SEATS + ' seats at once.');
    return;
  } else {
    selected.push(id);
    setMessage('Seat ' + id + ' selected.');
  }
  renderMap();
  renderSummary();
  $('.seat[data-id="' + id + '"]').stop(true, true).css('opacity', 0.4).animate({ opacity: 1 }, 200);
  $('#seatError').text('');
}

mapBox.addEventListener('click', function (event) {
  const button = event.target.closest('button.seat');
  if (button !== null) {
    toggleSeat(button.dataset.id);
    const again = mapBox.querySelector('button.seat[data-id="' + button.dataset.id + '"]');
    if (again !== null) {
      again.focus();
    }
  }
});

summaryList.addEventListener('click', function (event) {
  const button = event.target.closest('button.remove-seat');
  if (button !== null) {
    toggleSeat(button.dataset.id);
  }
});

clearButton.addEventListener('click', function () {
  selected = [];
  setMessage('Selection cleared.');
  renderMap();
  renderSummary();
});

hoursInput.addEventListener('input', renderSummary);

function todayString() {
  const d = new Date();
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

function pad(n) {
  return String(n).padStart(2, '0');
}

dateInput.min = todayString();

const bookingRules = {
  fullName: function (input) {
    const value = input.value.trim();
    if (value === '') {
      return 'Enter your name.';
    }
    return value.length < 2 || !/^[A-Za-zА-Яа-яЁё\s'-]+$/.test(value) ? 'Name must have at least 2 letters and no digits.' : '';
  },
  phone: function (input) {
    const value = input.value.trim();
    if (value === '') {
      return 'Enter your phone number.';
    }
    return isPhone(value) ? '' : 'Phone must look like +7 777 123 45 67.';
  },
  date: function (input) {
    if (input.value === '') {
      return 'Choose a date.';
    }
    return input.value < todayString() ? 'The date cannot be in the past.' : '';
  },
  time: function (input) {
    if (input.value === '') {
      return 'Choose the start time.';
    }
    const now = new Date();
    if (dateInput.value === todayString() && input.value < pad(now.getHours()) + ':' + pad(now.getMinutes())) {
      return 'This time has already passed today.';
    }
    return '';
  },
  hours: function (input) {
    const value = input.value.trim();
    if (value === '') {
      return 'Enter the number of hours.';
    }
    const number = Number(value);
    return Number.isInteger(number) && number >= 1 && number <= 8 ? '' : 'Hours must be a whole number from 1 to 8.';
  }
};

initForm(bookingForm, bookingRules, function () {
  if (selected.length === 0) {
    $('#seatError').text('Select at least one seat on the map first.');
    $('html, body').stop(true).animate({ scrollTop: $('#seatMap').offset().top - 80 }, 400);
    return false;
  }
  const result = calculateTotal();
  const code = 'ARENA-' + (1000 + Math.floor(Math.random() * 9000));
  const text = 'Booked! Seats ' + selected.join(', ') + ' for ' + result.hours + ' hour(s) on ' + dateInput.value +
    ' at ' + document.getElementById('time').value + '. Total $' + result.total.toFixed(2) +
    (result.discounted ? ' (instead of $' + result.full.toFixed(2) + ')' : '') + '.' +
    (result.freeDrinks ? ' Free drinks and a snack combo are included!' : '') + ' Your code: ' + code + '.';

  SEATS.forEach(function (seat) {
    if (selected.includes(seat.id)) {
      seat.taken = true;
    }
  });
  saveSeats(selected);
  selected = [];
  setMessage('');
  showSuccess(text);
});

bookingForm.addEventListener('reset', function () {
  setTimeout(function () {
    renderMap();
    renderSummary();
  }, 0);
});

renderMap();
renderSummary();