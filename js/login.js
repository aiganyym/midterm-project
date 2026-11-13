const loginForm = document.getElementById('loginForm');
const loginPassword = document.getElementById('loginPassword');

if (getCurrentUser()) {
  window.location.replace('profile.html');
}

const loginRules = {
  loginEmail: function (input) {
    const value = input.value.trim();
    if (value === '') {
      return 'Enter your email address.';
    }
    return isEmail(value) ? '' : 'Enter a correct email, for example player@example.com.';
  },
  loginPassword: function (input) {
    return input.value === '' ? 'Enter your password.' : '';
  }
};

initForm(loginForm, loginRules, function () {
  const email = document.getElementById('loginEmail').value;
  const user = findUser(email);
  if (!user || user.password !== loginPassword.value) {
    showError(loginPassword, 'Wrong email or password.', true);
    $('#loginError').text('We could not log you in. Check your email and password or sign up.').stop(true, true).hide().slideDown(200);
    return false;
  }
  $('#loginError').hide();
  login(user.email);
  showSuccess('Welcome back, ' + user.name + '! Opening your profile...');
  setTimeout(function () {
    window.location.href = 'profile.html';
  }, 900);
});