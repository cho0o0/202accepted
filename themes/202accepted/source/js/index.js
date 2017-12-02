var title = document.querySelector('.index-wrap .title').getAttribute('data-title');
var typed = new Typed('.title', {
  strings: [title],
  typeSpeed: 80,
  showCursor: false,
});


document.querySelectorAll('.index-wrap .link a').forEach(el => {
  el.addEventListener('mouseover', () => {
    typed.strings[0] = el.innerHTML;
    typed.reset(true);
  });
  
  el.addEventListener('focus', () => {
    typed.strings[0] = el.innerHTML;
    typed.reset(true);
  });
});