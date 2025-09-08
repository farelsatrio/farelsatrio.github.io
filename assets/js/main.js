document.addEventListener('DOMContentLoaded', function() {
  var scrollToTopBtn = document.querySelector('.scroll-to-top');
  
  // Tampilkan tombol setelah scroll 300px
  window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
      scrollToTopBtn.style.display = 'block';
    } else {
      scrollToTopBtn.style.display = 'none';
    }
  });
  
  // Scroll ke atas dengan smooth
  scrollToTopBtn.addEventListener('click', function(e) {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
});