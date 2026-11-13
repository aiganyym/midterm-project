const signupForm = document.getElementById('signupForm');
const signPassword = document.getElementById('signPassword');
const signConfirm = document.getElementById('signConfirm');

if (getCurrentUser()) {
  window.location.replace('profile.html');
}

const signupRules = {
  signName: function (input) {
    const value = input.value.trim();
    if (value === '') {
      return 'Enter your name.';
    }
    return value.length < 2 || !/^[A-Za-zА-Яа-яЁё\s'-]+$/.test(value) ? 'Name must have at least 2 letters and no digits.' : '';
  },
  signEmail: function (input) {
    const value = input.value.trim();
    if (value === '') {
      return 'Enter your email address.';
    }
    if (!isEmail(value)) {
      return 'Enter a correct email, for example player@example.com.';
    }
    return findUser(value) ? 'This email is already registered. Please log in.' : '';
  },
  signPassword: function (input) {
    const value = input.value;
    if (value === '') {
      return 'Create a password.';
    }
    if (value.length < 6) {
      return 'Password must have at least 6 characters.';
    }
    return /[A-Za-z]/.test(value) && /\d/.test(value) ? '' : 'Password must contain a letter and a digit.';
  },
  signConfirm: function (input) {
    if (input.value === '') {
      return 'Repeat the password.';
    }
    return input.value === signPassword.value ? '' : 'Passwords do not match.';
  },
  signAgree: function (input) {
    return input.checked ? '' : 'Please confirm that you understand this is a demo.';
  }
};

signPassword.addEventListener('input', function () {
  signConfirm.dispatchEvent(new Event('input'));
});

initForm(signupForm, signupRules, function () {
  const name = document.getElementById('signName').value.trim();
  const email = document.getElementById('signEmail').value;
  addUser(name, email, signPassword.value);
  login(email.trim().toLowerCase());
  showSuccess('Account created. Welcome, ' + name + '! Opening your profile...');
  setTimeout(function () {
    window.location.href = 'profile.html';
  }, 1200);
});