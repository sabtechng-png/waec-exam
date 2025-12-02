document.addEventListener("DOMContentLoaded", function() {
  function checkAdBlocker() {
    var ad = document.createElement('div');
    ad.className = 'adsbox';
    ad.style.display = 'none';
    document.body.appendChild(ad);

    setTimeout(function() {
      if (ad.offsetHeight === 0) {
        window.location.href = '/adblocker-warning';
      }
    }, 1000);
  }

  checkAdBlocker();
});
