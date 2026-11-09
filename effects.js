$('a[href^="#"]').on('click', function (event) {
  const target = $(this).attr('href');
  if (target.length < 2 || $(target).length === 0) {
    return;
  }
  event.preventDefault();
  $('html, body').stop(true).animate({ scrollTop: $(target).offset().top - 80 }, 500);
});

$('.faq-question').on('click', function () {
  const $question = $(this);
  const $answer = $('#' + $question.attr('aria-controls'));

  $('.faq-answer').not($answer).stop(true, true).slideUp(200);
  $('.faq-question').not($question).attr('aria-expanded', 'false');

  $answer.stop(true, true).slideToggle(200);
  $question.attr('aria-expanded', String($question.attr('aria-expanded') !== 'true'));
});