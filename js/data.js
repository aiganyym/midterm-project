const TOURNAMENTS = [
  { id: 1, game: 'Counter-Strike 2', category: 'Esports', date: '2026-11-21T18:00', format: '5 vs 5', prize: 150000, status: 'open', slots: 16, taken: 11 },
  { id: 2, game: 'Dota 2', category: 'Esports', date: '2026-11-28T17:00', format: '5 vs 5', prize: 200000, status: 'open', slots: 16, taken: 9 },
  { id: 3, game: 'Valorant', category: 'Esports', date: '2026-12-05T16:00', format: '5 vs 5', prize: 100000, status: 'soon', slots: 16, taken: 0 },
  { id: 4, game: 'Catan (Board Game)', category: 'Board games', date: '2026-12-12T19:00', format: 'Solo (1v1v1v1)', prize: 40000, status: 'open', slots: 12, taken: 5 },
  { id: 5, game: 'Codenames Night', category: 'Board games', date: '2026-11-25T19:00', format: 'Teams of 2', prize: 25000, status: 'open', slots: 12, taken: 12 },
  { id: 6, game: 'EA FC 26', category: 'Esports', date: '2026-11-30T18:00', format: '1 vs 1', prize: 80000, status: 'open', slots: 32, taken: 20 },
  { id: 7, game: 'Rocket League', category: 'Esports', date: '2026-12-13T17:00', format: '3 vs 3', prize: 90000, status: 'soon', slots: 12, taken: 0 },
  { id: 8, game: 'Warhammer Duel', category: 'Board games', date: '2026-12-19T15:00', format: 'Solo 1v1', prize: 60000, status: 'soon', slots: 8, taken: 0 }
];

const ZONES = {
  standard: { name: 'Standard Zone', price: 3, icon: 'bi-pc-display', prefix: 'S', count: 12 },
  vip: { name: 'VIP Lounge', price: 5, icon: 'bi-display', prefix: 'V', count: 6 },
  board: { name: 'Board Games Zone', price: 2, icon: 'bi-dice-5', prefix: 'B', count: 8 }
};

const STATUS_BADGES = {
  open: { text: 'Registration Open', cls: 'status-open' },
  soon: { text: 'Coming Soon', cls: 'status-soon' },
  full: { text: 'Full', cls: 'status-full' },
  finished: { text: 'Finished', cls: 'status-finished' }
};

const MAX_SEATS = 6;
const DISCOUNT_FROM_HOURS = 3;
const DISCOUNT = 0.1;
const FREE_DRINKS_AFTER_HOURS = 5;

const PRESET_TAKEN = ['S3', 'S4', 'S7', 'V2', 'V5', 'B6'];

const SEATS = [];
for (const key in ZONES) {
  const zone = ZONES[key];
  for (let i = 1; i <= zone.count; i++) {
    const id = zone.prefix + i;
    SEATS.push({ id: id, zone: key, number: i, price: zone.price, taken: PRESET_TAKEN.includes(id) });
  }
}

function addRegistration(tournament) {
  const saved = readStore('arenaRegistrations');
  saved[tournament.id] = (saved[tournament.id] || 0) + 1;
  writeStore('arenaRegistrations', saved);
  tournament.taken++;
}

function saveSeats(ids) {
  const saved = readStore('arenaSeats');
  ids.forEach(function (id) {
    saved[id] = true;
  });
  writeStore('arenaSeats', saved);
}

const savedRegistrations = readStore('arenaRegistrations');
TOURNAMENTS.forEach(function (t) {
  t.taken += savedRegistrations[t.id] || 0;
});

const savedSeats = readStore('arenaSeats');
SEATS.forEach(function (s) {
  if (savedSeats[s.id]) {
    s.taken = true;
  }
});

function priceFor(perHour, hours) {
  const full = perHour * hours;
  const discounted = hours >= DISCOUNT_FROM_HOURS && perHour > 0;
  return {
    full: full,
    total: discounted ? full * (1 - DISCOUNT) : full,
    discounted: discounted,
    freeDrinks: hours > FREE_DRINKS_AFTER_HOURS && perHour > 0
  };
}

function statusOf(t) {
  if (new Date(t.date) < new Date()) {
    return 'finished';
  }
  if (t.status === 'open' && t.taken >= t.slots) {
    return 'full';
  }
  return t.status;
}

function formatDate(iso) {
  const d = new Date(iso);
  const day = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return day + ', ' + time;
}