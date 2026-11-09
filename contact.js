const contactForm = document.getElementById('contactForm');

const contactRules = {
  contactName: function (input) {
    const value = input.value.trim();
    if (value === '') {
      return 'Enter your name.';
    }
    return value.length < 2 || !/^[A-Za-zА-Яа-яЁё\s'-]+$/.test(value) ? 'Name must have at least 2 letters and no digits.' : '';
  },
  contactEmail: function (input) {
    const value = input.value.trim();
    if (value === '') {
      return 'Enter your email address.';
    }
    return isEmail(value) ? '' : 'Enter a correct email, for example player@example.com.';
  },
  contactTopic: function (input) {
    return input.value === '' ? 'Choose a topic.' : '';
  },
  contactMessage: function (input) {
    const length = input.value.trim().length;
    if (length === 0) {
      return 'Write your message.';
    }
    if (length < 10) {
      return 'The message is too short (at least 10 characters).';
    }
    return length > 300 ? 'The message is too long (at most 300 characters).' : '';
  }
};

initForm(contactForm, contactRules, function () {
  const name = document.getElementById('contactName').value.trim();
  const email = document.getElementById('contactEmail').value.trim();
  showSuccess('Thank you, ' + name + '! We will answer to ' + email + ' within 24 hours.');
});