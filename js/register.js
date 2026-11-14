const registerForm = document.getElementById('registerForm');
const gameSelect = document.getElementById('game');

TOURNAMENTS.forEach(function (t) {
  const status = statusOf(t);
  if (status === 'open') {
    const option = document.createElement('option');
    option.value = String(t.id);
    option.textContent = t.game + ' (' + t.format + ') — ' + (t.slots - t.taken) + ' slots left';
    gameSelect.appendChild(option);
  }
});

const registerRules = {
  nickname: function (input) {
    const value = input.value.trim();
    if (value === '') {
      return 'Enter your gamer tag.';
    }
    if (value.length < 3 || value.length > 16) {
      return 'Gamer tag must be 3 to 16 characters.';
    }
    if (!/^[A-Za-z0-9_]+$/.test(value)) {
      return 'Use only letters, digits and the _ sign.';
    }
    return '';
  },
  email: function (input) {
    const value = input.value.trim();
    if (value === '') {
      return 'Enter your email address.';
    }
    return isEmail(value) ? '' : 'Enter a correct email, for example player@example.com.';
  },
  phone: function (input) {
    const value = input.value.trim();
    if (value === '') {
      return 'Enter your phone number.';
    }
    return isPhone(value) ? '' : 'Phone must look like +7 777 123 45 67.';
  },
  game: function (input) {
    return input.value === '' ? 'Choose a tournament.' : '';
  },
  teamSize: function (input) {
    const value = input.value.trim();
    if (value === '') {
      return 'Enter the number of players.';
    }
    const number = Number(value);
    if (!Number.isInteger(number) || number < 1 || number > 5) {
      return 'Team size must be a whole number from 1 to 5.';
    }
    return '';
  },
  teamName: function (input) {
    const value = input.value.trim();
    if (value !== '' && (value.length < 2 || value.length > 20)) {
      return 'Team name must be 2 to 20 characters.';
    }
    return '';
  },
  rulesCheck: function (input) {
    return input.checked ? '' : 'You must agree to the tournament rules.';
  }
};

initForm(registerForm, registerRules, function () {
  const tournament = TOURNAMENTS.find(function (t) {
    return String(t.id) === gameSelect.value;
  });
  const nickname = document.getElementById('nickname').value.trim();
  addRegistration(tournament);
  showSuccess('Thank you, ' + nickname + '! You are registered for ' + tournament.game + '. Slots left: ' + (tournament.slots - tournament.taken) + '.');

  const option = gameSelect.querySelector('option[value="' + tournament.id + '"]');
  if (tournament.taken >= tournament.slots) {
    option.remove();
  } else {
    option.textContent = tournament.game + ' (' + tournament.format + ') — ' + (tournament.slots - tournament.taken) + ' slots left';
  }
  renderOpenCards();
  updateStats(false);
});

prefillForm(registerForm, { email: 'email' });