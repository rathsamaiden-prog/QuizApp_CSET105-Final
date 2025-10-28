document.addEventListener('DOMContentLoaded', () => {
const pages = Array.from(document.querySelectorAll('.questionBlock'));
if (!pages || pages.length === 0) {
    console.warn('No .questionBlock elements found in HTML.');
    return;
}

let currentIndex = 0;
let correctAnswers = 0; 

function showPage(index) {
    pages.forEach((p, i) => {
p.style.display = i === index ? '' : 'none';
    });
    const page = pages[index];
    if (!page) return;
    const opts = page.querySelectorAll('.options');
    opts.forEach((o) => {
o.classList.remove('wrong-answer', 'correct-answer');
    o.classList.remove('selected');
    o.removeAttribute('aria-disabled');
    o.tabIndex = 0;
    });
    const submitBtn = document.getElementById('submit');
    if (submitBtn && page.dataset.answered !== 'true') submitBtn.textContent = 'SUBMIT';
}

const timerEl = document.getElementById('timer');
const DEFAULT_SECONDS = 20;
let timerId = null;
let timerRemaining = 0;

function updateTimerDisplay() {
    if (!timerEl) return;
    timerEl.textContent = String(timerRemaining);
}

function clearTimer() {
    if (timerId) {
        clearInterval(timerId);
        timerId = null;
    }
}

function startTimerForPage(page) {
    clearTimer();
    if (!page) return;
    const seconds = page.dataset.time ? parseInt(page.dataset.time, 10) || DEFAULT_SECONDS : DEFAULT_SECONDS;
    timerRemaining = seconds;
    updateTimerDisplay();
    timerId = setInterval(() => {
        timerRemaining -= 1;
        updateTimerDisplay();
        if (timerRemaining <= 0) {
            clearTimer();
            handleTimeUpForCurrentPage();
        }
    }, 1000);
}

function handleTimeUpForCurrentPage() {
    const page = pages[currentIndex];
    if (!page) return;
    if (page.dataset.answered === 'true') return;
    gradeCurrentPage(page);
}

const _origShowPage = showPage;
showPage = function(index) {
    _origShowPage(index);
    const page = pages[index];
    if (page) startTimerForPage(page);
};

function activateOption(optionEl) {
    const radio = optionEl.querySelector('input[type="radio"]');
    if (radio) {
    radio.checked = true;
    radio.dispatchEvent(new Event('change', { bubbles: true }));
    }
}

function updateSelectedVisualWithin(page, optionEl) {
    const opts = page.querySelectorAll('.options');
    opts.forEach((o) => o.classList.remove('selected'));
    if (optionEl) optionEl.classList.add('selected');
}

function gradeCurrentPage(page) {
    if (!page) return;
    if (page.dataset.answered === 'true') return;
    const submitBtn = document.getElementById('submit');
    const checked = page.querySelector('input[type="radio"]:checked');
    const selectedOpt = checked ? checked.closest('.options') : null;
    const correctOpt = page.querySelector('.options[data-correct="true"]');

    if (selectedOpt && selectedOpt.dataset.correct === 'true') {
        selectedOpt.classList.add('correct-answer');
        correctAnswers++; 
    } else {
        if (selectedOpt) selectedOpt.classList.add('wrong-answer');
        if (correctOpt) correctOpt.classList.add('correct-answer');
    }

    page.dataset.answered = 'true';
    page.querySelectorAll('.options').forEach((o) => {
        o.setAttribute('aria-disabled', 'true');
        o.tabIndex = -1;
    });

    if (submitBtn) submitBtn.textContent = 'Next';
    clearTimer();
}

pages.forEach((page) => {
    const opts = page.querySelectorAll('.options');
    const pre = page.querySelector('input[type="radio"]:checked');
    if (pre) {
    const parent = pre.closest('.options');
    if (parent) updateSelectedVisualWithin(page, parent);
    }

    opts.forEach((opt) => {
    if (!opt.hasAttribute('tabindex')) opt.setAttribute('tabindex', '0');
if (!opt.hasAttribute('role')) opt.setAttribute('role', 'button');

    opt.addEventListener('click', (e) => {
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

showPage(currentIndex);

const submit = document.getElementById('submit');
if (submit) {
    submit.dataset.mode = 'next';
    submit.addEventListener('click', () => {
    if (submit.dataset.mode === 'restart') return;

    const currentPage = pages[currentIndex];
    if (!currentPage) return;

    if (currentPage.dataset.answered !== 'true') {
        const checked = currentPage.querySelector('input[type="radio"]:checked');
        if (!checked) {
        console.log('Please select an option before continuing.');
        return;
        }

        gradeCurrentPage(currentPage);
        return;
}
currentIndex += 1;
    if (currentIndex < pages.length) {
        showPage(currentIndex);
    } else {
        clearTimer();
        const quizView = document.getElementById('quizView');
        if (quizView) {
            quizView.innerHTML = `
                <h2>Quiz Complete</h2>
                <p>You got ${correctAnswers} out of ${pages.length} questions correct!</p>
                <p>Score: ${Math.round((correctAnswers / pages.length) * 100)}%</p>
                <button id="submit" style="margin-top: 20px;">RESTART</button>
            `;
            const startBtn = document.getElementById('submit');
            if (startBtn) {
                startBtn.addEventListener('click', () => window.location.reload());
            }
        }
        submit.remove();
        submit.remove();
    }
    });
}
});