(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // stagger rise
  var batch = [], flush;
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      batch.push(e.target);
      io.unobserve(e.target);
    });
    if (batch.length && !flush) {
      flush = requestAnimationFrame(function () {
        batch.forEach(function (el, i) {
          el.style.transitionDelay = reduce ? '0s' : (i * 90) + 'ms';
          el.classList.add('in');
        });
        batch = [];
        flush = null;
      });
    }
  }, { threshold: 0.15 });
  document.querySelectorAll('.rise').forEach(function (el) { io.observe(el); });

  // scroll progress bar
  if (!reduce) {
    var bar = document.createElement('div');
    bar.className = 'progress';
    document.body.appendChild(bar);
    var ticking = false;
    addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var h = document.documentElement;
        var p = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
        bar.style.transform = 'scaleX(' + p + ')';
        ticking = false;
      });
    }, { passive: true });
  }

  // counters
  function tween(el) {
    var text = el.textContent;
    var m = text.match(/(\d+(?:[.,]\d+)?)/);
    if (!m) return;
    var raw = m[1];
    var comma = raw.indexOf(',') > -1;
    var target = parseFloat(raw.replace(',', '.'));
    var decimals = (raw.split(/[.,]/)[1] || '').length;
    var start = null, dur = 1100;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = (target * eased).toFixed(decimals);
      if (comma) val = val.replace('.', ',');
      el.textContent = text.replace(raw, val);
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = text;
    }
    requestAnimationFrame(frame);
  }
  if (!reduce) {
    var seen = new WeakSet();
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && !seen.has(e.target)) {
          seen.add(e.target);
          tween(e.target);
          cio.unobserve(e.target);
        }
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('.nums b, .work-card__nums b, .nums-side b').forEach(function (el) { cio.observe(el); });
  }
})();
