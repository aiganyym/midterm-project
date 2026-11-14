const calcZone = document.getElementById('calcZone');
const calcSeats = document.getElementById('calcSeats');
const calcHours = document.getElementById('calcHours');
const calcTotal = document.getElementById('calcTotal');
const calcOld = document.getElementById('calcOld');
const calcSave = document.getElementById('calcSave');
const calcPerHour = document.getElementById('calcPerHour');
const calcPerk = document.getElementById('calcPerk');
const calcTip = document.getElementById('calcTip');
const openList = document.getElementById('openList');
const openEmpty = document.getElementById('openEmpty');

for (const key in ZONES) {
  const option = document.createElement('option');
  option.value = key;
  option.textContent = ZONES[key].name + ' ($' + ZONES[key].price + '/hour)';
  calcZone.appendChild(option);
}

function readNumber(input, min, max, label) {
  const value = input.value.trim();
  const number = Number(value);
  const ok = value !== '' && Number.isInteger(number) && number >= min && number <= max;
  showError(input, ok ? '' : label + ' must be a whole number from ' + min + ' to ' + max + '.', true);
  return ok ? number : 0;
}

function plural(n, word) {
  return n + ' ' + word + (n > 1 ? 's' : '');
}

function savingTip(hours) {
  if (hours < DISCOUNT_FROM_HOURS) {
    return 'Add ' + plural(DISCOUNT_FROM_HOURS - hours, 'more hour') + ' to get ' + DISCOUNT * 100 + '% off.';
  }
  if (hours <= FREE_DRINKS_AFTER_HOURS) {
    return 'Add ' + plural(FREE_DRINKS_AFTER_HOURS + 1 - hours, 'more hour') + ' to get free drinks.';
  }
  return 'Best deal: ' + DISCOUNT * 100 + '% off and free drinks are included!';
}

function updateCalculator() {
  const seats = readNumber(calcSeats, 1, MAX_SEATS, 'Seats');
  const hours = readNumber(calcHours, 1, 8, 'Hours');

  if (seats === 0 || hours === 0) {
    calcTotal.textContent = '$0.00';
    calcPerHour.textContent = 'Enter correct numbers to see the price.';
    calcOld.hidden = true;
    calcSave.hidden = true;
    calcPerk.hidden = true;
    calcTip.textContent = '';
    return;
  }

  const perHour = ZONES[calcZone.value].price * seats;
  const result = priceFor(perHour, hours);
  calcPerHour.textContent = plural(seats, 'seat') + ' × $' + ZONES[calcZone.value].price + ' = $' + perHour + ' per hour, ' + plural(hours, 'hour');
  calcOld.textContent = '$' + result.full.toFixed(2);
  calcOld.hidden = !result.discounted;
  calcSave.hidden = !result.discounted;
  calcTotal.textContent = '$' + result.total.toFixed(2);
  calcPerk.hidden = !result.freeDrinks;
  calcTip.textContent = savingTip(hours);
}

['input', 'change'].forEach(function (type) {
  calcZone.addEventListener(type, updateCalculator);
  calcSeats.addEventListener(type, updateCalculator);
  calcHours.addEventListener(type, updateCalculator);
});

function openTournaments() {
  return TOURNAMENTS.filter(function (t) {
    return statusOf(t) === 'open';
  });
}

function setNumber(id, value, animate) {
  const box = document.getElementById(id);
  if (!animate) {
    box.textContent = value.toLocaleString('en-US');
    return;
  }
  $({ n: 0 }).animate({ n: value }, {
    duration: 900,
    step: function (now) {
      box.textContent = Math.round(now).toLocaleString('en-US');
    },
    complete: function () {
      box.textContent = value.toLocaleString('en-US');
    }
  });
}

function updateStats(animate) {
  const list = openTournaments();
  let slots = 0;
  let prize = 0;
  list.forEach(function (t) {
    slots += t.slots - t.taken;
    prize += t.prize;
  });
  setNumber('statOpen', list.length, animate);
  setNumber('statSlots', slots, animate);
  setNumber('statPrize', prize, animate);
}

function makeOpenCard(t) {
  const left = t.slots - t.taken;
  const col = document.createElement('div');
  col.className = 'col-12 col-md-6 col-lg-3';

  const card = document.createElement('article');
  card.className = 'tour-card';
  card.dataset.id = t.id;

  const category = document.createElement('span');
  category.className = 'badge tour-tag';
  category.textContent = t.category;

  const title = document.createElement('h3');
  title.className = 'h5';
  title.textContent = t.game;

  const info = document.createElement('p');
  info.className = 'small text-secondary mb-2';
  info.textContent = formatDate(t.date) + ' · ' + t.format;

  const prize = document.createElement('p');
  prize.className = 'tour-prize';
  prize.textContent = t.prize.toLocaleString('en-US') + ' KZT';

  const label = document.createElement('div');
  label.className = 'small mb-1';
  label.textContent = left + ' of ' + t.slots + ' slots left';

  const bar = document.createElement('div');
  bar.className = 'progress mb-3';
  const fill = document.createElement('div');
  fill.className = 'progress-bar';
  fill.style.width = Math.round((t.taken / t.slots) * 100) + '%';
  bar.appendChild(fill);

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn btn-neon choose-btn';
  button.dataset.id = t.id;
  button.textContent = 'Register for this';
  button.setAttribute('aria-label', 'Register for ' + t.game);

  card.append(category, title, info, prize, label, bar, button);
  col.appendChild(card);
  return col;
}

function markChosen() {
  document.querySelectorAll('.tour-card').forEach(function (card) {
    card.classList.toggle('chosen', card.dataset.id === gameSelect.value);
  });
}

function renderOpenCards() {
  openList.replaceChildren();
  const list = openTournaments();
  list.forEach(function (t) {
    openList.appendChild(makeOpenCard(t));
  });
  openEmpty.hidden = list.length > 0;
  markChosen();
}

openList.addEventListener('click', function (event) {
  const button = event.target.closest('.choose-btn');
  if (button === null) {
    return;
  }
  gameSelect.value = button.dataset.id;
  gameSelect.dispatchEvent(new Event('change'));
  $('html, body').stop(true).animate({ scrollTop: $('#registerCard').offset().top - 90 }, 500, function () {
    document.getElementById('nickname').focus();
  });
  $('#registerCard').stop(true, true).fadeTo(150, 0.6).fadeTo(250, 1);
});

gameSelect.addEventListener('change', markChosen);

updateCalculator();
renderOpenCards();
updateStats(true);