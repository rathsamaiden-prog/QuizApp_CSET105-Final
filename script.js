// Wait for the DOM so elements are present when we attach listeners
document.addEventListener('DOMContentLoaded', () => {
  // Use question blocks present in the HTML instead of a JS questions array.
  const pages = Array.from(document.querySelectorAll('.questionBlock'));
  if (!pages || pages.length === 0) {
    console.warn('No .questionBlock elements found in HTML.');
    return;
  }

  let currentIndex = 0;

  // Show the page at index, hide others
  function showPage(index) {
    pages.forEach((p, i) => {
      p.style.display = i === index ? '' : 'none';
    });
    // when showing a page, ensure options are enabled and remove transient classes
    const page = pages[index];
    if (!page) return;
    const opts = page.querySelectorAll('.options');
    opts.forEach((o) => {
      o.classList.remove('wrong-answer', 'correct-answer');
      o.classList.remove('selected');
      o.removeAttribute('aria-disabled');
      o.tabIndex = 0;
    });
    // reset submit text when entering a fresh page
    const submitBtn = document.getElementById('submit');
    if (submitBtn && page.dataset.answered !== 'true') submitBtn.textContent = 'SUBMIT';
  }

  // Helper: activate an option within a specific page
  function activateOption(optionEl) {
    const radio = optionEl.querySelector('input[type="radio"]');
    if (radio) {
      radio.checked = true;
      radio.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  // Ensure only the active option in the same page has the .selected class
  function updateSelectedVisualWithin(page, optionEl) {
    const opts = page.querySelectorAll('.options');
    opts.forEach((o) => o.classList.remove('selected'));
    if (optionEl) optionEl.classList.add('selected');
  }

  // Wire handlers for each page separately so selection is scoped to the page
  pages.forEach((page) => {
    const opts = page.querySelectorAll('.options');
    // initialize from pre-checked radio inside this page
    const pre = page.querySelector('input[type="radio"]:checked');
    if (pre) {
      const parent = pre.closest('.options');
      if (parent) updateSelectedVisualWithin(page, parent);
    }

    opts.forEach((opt) => {
      if (!opt.hasAttribute('tabindex')) opt.setAttribute('tabindex', '0');
      if (!opt.hasAttribute('role')) opt.setAttribute('role', 'button');

      opt.addEventListener('click', (e) => {
        // ignore interaction if page already answered
        if (page.dataset.answered === 'true') return;
        activateOption(opt);
        updateSelectedVisualWithin(page, opt);
      });

      opt.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (page.dataset.answered === 'true') return;
          activateOption(opt);
          updateSelectedVisualWithin(page, opt);
        }
      });
    });
  });

  // Initial page show
  showPage(currentIndex);

  // Submit button advances through the HTML-defined pages
  const submit = document.getElementById('submit');
  if (submit) {
    submit.dataset.mode = 'next';
    submit.addEventListener('click', () => {
      if (submit.dataset.mode === 'restart') return;

      const currentPage = pages[currentIndex];
      if (!currentPage) return;

      // If this page hasn't been graded yet, grade it first
      if (currentPage.dataset.answered !== 'true') {
        const checked = currentPage.querySelector('input[type="radio"]:checked');
        if (!checked) {
          console.log('Please select an option before continuing.');
          return;
        }

        const selectedOpt = checked.closest('.options');
        const correctOpt = currentPage.querySelector('.options[data-correct="true"]');

        if (selectedOpt && selectedOpt.dataset.correct === 'true') {
          selectedOpt.classList.add('correct-answer');
        } else {
          if (selectedOpt) selectedOpt.classList.add('wrong-answer');
          if (correctOpt) correctOpt.classList.add('correct-answer');
        }

        // mark page as answered and prepare Next button
        currentPage.dataset.answered = 'true';
        // disable interaction for page options
        currentPage.querySelectorAll('.options').forEach((o) => {
          o.setAttribute('aria-disabled', 'true');
          o.tabIndex = -1;
        });
        submit.textContent = 'Next';
        return;
      }

      // If already graded, move to next page
      currentIndex += 1;
      if (currentIndex < pages.length) {
        showPage(currentIndex);
      } else {
        // finished: show completion and convert button to restart
        const quizView = document.getElementById('quizView');
        if (quizView) {
          quizView.innerHTML = '<h2>Quiz Complete</h2><p>You finished the quiz.</p>';
        }
        submit.textContent = 'Restart';
        submit.dataset.mode = 'restart';
        // restart on next click
        submit.addEventListener('click', () => {
          if (submit.dataset.mode === 'restart') window.location.reload();
        });
      }
    });
  }
});