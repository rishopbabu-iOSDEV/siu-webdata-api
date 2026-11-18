// my-portfolio/script.js
// Module 5  — DOM: Selecting & Modifying Elements
// Module 6  — Events & Interactive Components
// Module 7  — Data-Driven UI: Rendering Content from Data
// Module 8  — Forms, Validation & Client-Side Storage
// Module 9  — Fetch, APIs & Asynchronous JavaScript
// Module 10 — Code Quality, Debugging, Git Workflow & Demo Day
//
// Linked with `defer` from every page of the portfolio (index.html,
// about.html, projects.html, contact.html), so every feature below is
// written null-safe: not every page has every element this script touches,
// and a missing one should never throw an error for a visitor.
//
// Module 10 added NO new features to this file. Every behavior below is
// exactly what Module 9 shipped -- confirmed pixel-for-pixel identical
// before and after this pass. What changed is entirely organizational:
// features are now grouped under "---- Feature Name ----" banners in
// page-load order, every leftover `// TEMP` console.log from earlier
// modules has been deleted, one unused variable has been removed, and the
// old commented-out warm-up demos (Module 5's classList test, Module 6's
// event-object/input/keydown tours) have been cleared out as dead code --
// they did their job live in class and are not needed in the shipped file.

// ============================================================
// ---- Theme Persistence (must run FIRST, before anything else) ----
// ============================================================
//
// This is the one block in the whole file that deliberately runs before
// every other feature below it. `localStorage` is where the theme
// switcher's choice lives (see the "Theme Switcher" section further down),
// but reading it back needs to happen before the page has a chance to
// paint in the default (light) theme -- waiting for a `DOMContentLoaded`
// event, or simply placing this block lower in the file, would let the
// browser render light first and then visibly flip to dark a moment
// later. Because `script.js` is linked with `defer`, `document.documentElement`
// (the `<html>` element) already exists by the time this line runs, even
// though it comes before every other line in this file.
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark');
}

// ============================================================
// ---- Footer & Greeting ----
// ============================================================
//
// Two small, always-safe DOM reads/writes: the current year in the
// footer, and a time-of-day-aware greeting on the Home page only.

// Automatically insert the current year into the footer so the copyright
// line never needs to be hand-updated again. Every page has a
// #current-year span, but the null check is kept anyway as the safe habit.
const yearSpan = document.querySelector('#current-year');
if (yearSpan) {
  const currentYear = new Date().getFullYear();
  yearSpan.textContent = currentYear;
}

// Show a short, time-of-day-aware greeting under the main heading on the
// Home page. Only index.html has a #greeting element, so this null check
// is what keeps the script from throwing on every other page.
const greetingElement = document.querySelector('#greeting');
if (greetingElement) {
  const hour = new Date().getHours(); // 0-23
  let timeOfDay;

  if (hour < 12) {
    timeOfDay = 'morning';
  } else if (hour < 18) {
    timeOfDay = 'afternoon';
  } else {
    timeOfDay = 'evening';
  }

  greetingElement.textContent = `Good ${timeOfDay}! Thanks for visiting my portfolio.`;
}

// Append a small "Last updated" note to the footer on every page, built
// entirely with JavaScript, using createElement + appendChild.
const footer = document.querySelector('.site-footer');
if (footer) {
  const lastUpdatedNote = document.createElement('p');
  lastUpdatedNote.classList.add('site-footer__note');
  const today = new Date();
  lastUpdatedNote.textContent = `Last updated: ${today.toLocaleDateString()}`;
  footer.appendChild(lastUpdatedNote);
}

// ============================================================
// ---- Navigation ----
// ============================================================
//
// Mobile navigation toggle. The button (.site-header__nav-toggle) and the
// <nav> it controls (#primary-nav) already exist in the header on every
// page (from Course 1) -- this makes the button do something. JS decides
// WHEN the menu opens; the existing .site-header__nav--open CSS rule
// decides what "open" looks like. `aria-expanded` is kept in sync with the
// actual state so screen reader and keyboard users always know whether
// the menu is open.
const navToggleButton = document.querySelector('.site-header__nav-toggle');
const primaryNav = document.querySelector('#primary-nav');

if (navToggleButton && primaryNav) {
  navToggleButton.addEventListener('click', function () {
    const isOpen = primaryNav.classList.toggle('site-header__nav--open');
    navToggleButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
}

// ============================================================
// ---- Theme Switcher (persisted) ----
// ============================================================
//
// Light/dark theme switcher. Every color in css/style.css is already a
// CSS custom property, redefined under :root[data-theme="dark"] (set up
// back in Course 1) -- so toggling one attribute on <html> re-colors the
// whole page at once. The choice is saved to localStorage so it survives
// a page reload; the block at the very top of this file is what reads it
// back on the next load, before this button even exists yet.
const themeToggleButton = document.querySelector('.site-header__theme-toggle');

if (themeToggleButton) {
  // Sync the button's own icon/aria state with whatever theme was already
  // applied by the Theme Persistence block at the top of this file --
  // otherwise a page that loads dark would still show the light-mode moon
  // icon until the button was clicked once.
  const startedDark = document.documentElement.getAttribute('data-theme') === 'dark';
  themeToggleButton.setAttribute('aria-pressed', String(startedDark));
  themeToggleButton.textContent = startedDark ? '☀️' : '🌙';
  themeToggleButton.setAttribute(
    'aria-label',
    startedDark ? 'Switch to light theme' : 'Switch to dark theme'
  );

  themeToggleButton.addEventListener('click', function () {
    const root = document.documentElement;
    const isDark = root.getAttribute('data-theme') === 'dark';

    if (isDark) {
      root.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    } else {
      root.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    }

    themeToggleButton.setAttribute('aria-pressed', String(!isDark));
    themeToggleButton.textContent = isDark ? '🌙' : '☀️';
    themeToggleButton.setAttribute(
      'aria-label',
      isDark ? 'Switch to dark theme' : 'Switch to light theme'
    );
  });
}

// ============================================================
// ---- Projects: Data-Driven Rendering & Filtering ----
// ============================================================
//
// `projects` (the const array) comes from projects-data.js -- the exact
// Module 4 dataset, copied in unchanged -- linked with `defer` immediately
// BEFORE this file, but ONLY from projects.html. On every other page
// `projects` doesn't exist at all, so this entire section is guarded
// behind the one element that only exists on projects.html (#project-list).
// That single guard is what keeps this script null-safe sitewide, exactly
// like every feature above it -- without it, referencing `projects` on
// about.html/contact.html/index.html would throw a ReferenceError and
// stop the rest of this file from running.
const projectListContainer = document.querySelector('#project-list');

if (projectListContainer) {
  // ONE reusable function that turns a single project object into a
  // card's HTML. It doesn't render anything by itself -- it just returns
  // a string. Note on innerHTML: `projects` is our own trusted, local data
  // (from projects-data.js, written by us, in our own project) -- not text
  // typed by a visitor -- so building HTML with a template literal and
  // inserting it via innerHTML is safe and standard practice here. (This
  // is different from the Contact form's user-typed input below, where
  // innerHTML would NOT be an acceptable choice.)
  function createProjectCardHtml(project) {
    const featuredBadge = project.featured
      ? '<span class="project-card__badge">Featured</span>'
      : '';

    return `
      <article class="card project-card" data-project-id="${project.id}">
        ${featuredBadge}
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <p class="card__meta">Category: ${project.category} &middot; ${project.technologies.join(', ')}</p>
      </article>
    `;
  }

  // The reusable render function. It takes ANY array of project objects
  // and completely replaces whatever is currently inside #project-list --
  // it does not care whether that array is all 6 projects, one project,
  // or zero. Resetting the container with `=` (not `+=`) every time is
  // what makes repeated calls safe: each render REPLACES the previous one
  // instead of piling new cards on top of old ones.
  function renderProjects(projectList) {
    if (projectList.length === 0) {
      projectListContainer.innerHTML =
        '<p class="projects-empty">No projects match this search or filter yet. Try a different category or search term.</p>';
      return;
    }

    const cardsHtml = projectList
      .map(function (project) {
        return createProjectCardHtml(project);
      })
      .join('');

    projectListContainer.innerHTML = cardsHtml;
  }

  // Category filter buttons, derived from the data itself (rather than
  // hard-coded), so a brand-new category added later to projects-data.js
  // gets its own filter button automatically, with no change needed here.
  const filterBar = document.querySelector('#filter-buttons');
  let activeCategory = 'All';

  function renderCategoryFilters() {
    const uniqueCategories = projects.map(function (project) {
      return project.category;
    });
    // `new Set()` drops duplicate categories; the `...` spread unpacks it
    // back into a plain array we can map over like any other array.
    const categories = ['All', ...new Set(uniqueCategories)];

    filterBar.innerHTML = categories
      .map(function (category) {
        return `<button type="button" class="filter-btn" data-category="${category}">${category}</button>`;
      })
      .join('');
  }

  // Search input + empty-state handling. Both the active category AND the
  // current search text are applied together every time either one
  // changes -- this is what lets "Design" + "dashboard" narrow down to
  // exactly one card, and lets a search term that matches nothing (in any
  // category) genuinely produce zero results, which renderProjects now
  // handles gracefully instead of leaving a confusing blank grid.
  const searchInput = document.querySelector('#project-search');

  function applyFilters() {
    const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';

    const filtered = projects.filter(function (project) {
      const matchesCategory =
        activeCategory === 'All' || project.category === activeCategory;
      const matchesSearch =
        searchTerm === '' ||
        project.title.toLowerCase().includes(searchTerm) ||
        project.description.toLowerCase().includes(searchTerm);

      return matchesCategory && matchesSearch;
    });

    renderProjects(filtered);
  }

  if (filterBar) {
    renderCategoryFilters();

    // One click listener on the container (event delegation), not one per
    // button -- this still works even though the buttons themselves are
    // generated dynamically and didn't exist when the page first loaded.
    filterBar.addEventListener('click', function (event) {
      if (event.target.matches('.filter-btn')) {
        activeCategory = event.target.dataset.category;

        filterBar.querySelectorAll('.filter-btn').forEach(function (button) {
          button.classList.toggle(
            'filter-btn--active',
            button.dataset.category === activeCategory
          );
        });

        applyFilters();
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      applyFilters();
    });
  }

  // Initial render: every project, no filter or search applied yet.
  applyFilters();
}

// ============================================================
// ---- Contact Form: Validation & Storage ----
// ============================================================
//
// `contactForm` only exists on contact.html -- exactly like the Projects
// section's guard above, this whole section is wrapped in one null check
// that keeps the rest of this file safe on every other page.
//
// Required disclaimers (state these to students, and keep them true):
//   - This form does NOT send an email anywhere. There is no backend
//     listening -- every "submission" below is saved to THIS BROWSER's
//     own localStorage only.
//   - Client-side validation like the checks below makes a form pleasant
//     to use, but it does not secure a server. A real backend must always
//     re-validate anything a browser claims, since a visitor can bypass
//     any JavaScript running in their own browser.
//   - localStorage is browser-specific: it is invisible on a different
//     browser, a different device, or after the site's data is cleared.
//   - Never store passwords, access tokens, or other sensitive personal
//     data in localStorage -- it is plain text, readable by anyone with
//     access to that browser (see DevTools' Application tab).
const contactForm = document.querySelector('#contact-form');

if (contactForm) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // A single, reusable email-format check. It won't catch every edge case
  // a real mail server would -- that's fine. It catches every typo a
  // beginner is likely to actually make (ada@, ada.edu with no @, ada@siu
  // with no dot), which is the job it needs to do here.
  function isValidEmail(value) {
    return emailPattern.test(value);
  }

  // Shows (or clears) one field's inline error message. Setting
  // `textContent` directly -- rather than toggling a CSS class -- works
  // here because every `<p class="form-field__error">` in contact.html
  // starts empty and already reserves its own line of space in the layout
  // (see css/style.css), so there is no visible jump when a message
  // appears or clears.
  function showFieldError(fieldId, message) {
    const errorEl = document.querySelector(`#${fieldId}-error`);
    if (errorEl) {
      errorEl.textContent = message;
    }
  }

  // The validation gate. Three checks, three displays, one combined
  // answer -- every field's check runs and every field's message is set
  // (or cleared) independently, so fixing one field never hides or clears
  // a different field's still-real error.
  function validateContactForm(name, email, message) {
    let isValid = true;

    if (name === '') {
      showFieldError('contact-name', 'Please enter your name.');
      isValid = false;
    } else {
      showFieldError('contact-name', '');
    }

    if (email === '') {
      showFieldError('contact-email', 'Please enter your email address.');
      isValid = false;
    } else if (!isValidEmail(email)) {
      showFieldError(
        'contact-email',
        'Please enter a valid email address (e.g. name@example.com).'
      );
      isValid = false;
    } else {
      showFieldError('contact-email', '');
    }

    if (message === '') {
      showFieldError('contact-message', 'Please enter a message.');
      isValid = false;
    } else {
      showFieldError('contact-message', '');
    }

    return isValid;
  }

  // Read the saved messages array back safely. localStorage only ever
  // stores strings, so a saved array has to be turned back into real
  // JavaScript with JSON.parse -- but JSON.parse throws on anything that
  // isn't valid JSON, and getItem returns `null` the very first time
  // (before anything has ever been saved). Both cases -- a missing key
  // and a corrupted value -- are handled here so a bad or absent
  // localStorage entry never crashes the rest of the page.
  function getSavedMessages() {
    const stored = localStorage.getItem('contactMessages');

    if (!stored) {
      return [];
    }

    try {
      const parsedMessages = JSON.parse(stored);
      return Array.isArray(parsedMessages) ? parsedMessages : [];
    } catch (error) {
      console.warn(
        'Saved contact messages could not be read (corrupted data) -- starting from an empty list.',
        error
      );
      return [];
    }
  }

  // Append one validated message to the growing array, then save the
  // WHOLE array back with JSON.stringify -- never the raw object by
  // itself, which localStorage would silently store as the useless text
  // "[object Object]".
  function saveMessage(name, email, message) {
    const messages = getSavedMessages();

    messages.push({
      name: name,
      email: email,
      message: message,
      timestamp: new Date().toISOString()
    });

    localStorage.setItem('contactMessages', JSON.stringify(messages));
  }

  // Render the saved messages using safe DOM creation (createElement +
  // textContent), NOT innerHTML with a template literal. Every value here
  // (name, email, message) was typed by a real visitor, not written by us
  // in our own file -- unlike the Projects section's trusted, local
  // projects-data.js, this is untrusted input, so each piece is built and
  // inserted as plain text instead of being parsed as markup.
  function renderMessages() {
    const messages = getSavedMessages();
    const container = document.querySelector('#messages-list');

    if (!container) {
      return;
    }

    container.innerHTML = '';

    if (messages.length === 0) {
      const emptyMessage = document.createElement('p');
      emptyMessage.classList.add('messages-empty');
      emptyMessage.textContent = 'No messages sent yet.';
      container.appendChild(emptyMessage);
      return;
    }

    messages.forEach(function (savedMessage) {
      const card = document.createElement('article');
      card.classList.add('message-card');

      const meta = document.createElement('p');
      meta.classList.add('message-card__meta');
      const nameStrong = document.createElement('strong');
      nameStrong.textContent = savedMessage.name;
      meta.appendChild(nameStrong);
      meta.append(` · ${savedMessage.email}`); // appended as text, never markup
      card.appendChild(meta);

      const body = document.createElement('p');
      body.textContent = savedMessage.message; // user-typed text -- never innerHTML
      card.appendChild(body);

      const dateLine = document.createElement('p');
      dateLine.classList.add('message-card__date');
      const sentDate = new Date(savedMessage.timestamp).toLocaleString();
      dateLine.textContent = `Sent ${sentDate}`;
      card.appendChild(dateLine);

      container.appendChild(card);
    });
  }

  const successMessageEl = document.querySelector('#contact-success');

  contactForm.addEventListener('submit', function (event) {
    // Stop the browser's default behavior (trying to navigate away and
    // "send" the form somewhere) -- there is no backend here, so without
    // this line the page would flash and reload, wiping out everything
    // below before it ever runs.
    event.preventDefault();

    // Read each field's current value, trimmed. Without .trim(), a name
    // field containing only spacebar presses would pass a "not empty"
    // check.
    const name = document.querySelector('#contact-name').value.trim();
    const email = document.querySelector('#contact-email').value.trim();
    const message = document.querySelector('#contact-message').value.trim();

    const formIsValid = validateContactForm(name, email, message);

    if (successMessageEl) {
      successMessageEl.hidden = true;
    }

    if (formIsValid) {
      saveMessage(name, email, message);
      renderMessages();
      contactForm.reset();

      if (successMessageEl) {
        successMessageEl.hidden = false;
      }
    }
  });

  // Render any previously-saved messages immediately on page load, not
  // only after a brand-new submission.
  renderMessages();
}

// ============================================================
// ---- GitHub Profile Card (Fetch API) ----
// ============================================================
//
// `githubCardContainer` only exists on about.html -- exactly like the
// Projects and Contact Form guards above, this whole section is wrapped
// in one null check that keeps the rest of this file safe on every other
// page.
//
// The public API used here is GitHub's own public, read-only, no-auth
// REST endpoint: https://api.github.com/users/{username} -- confirmed
// free, with no signup, no API key, and no login required. Nothing in
// this section ever needs a secret key, token, or password, and none is
// stored anywhere in this project or committed to Git.
//
// Four states this section explicitly handles, every time the page loads:
//   1. LOADING -- shown the instant the page loads, before the network
//      request settles (fetch() never freezes the rest of the page while
//      this is showing).
//   2. SUCCESS -- the live GitHub profile, rendered as a card.
//   3. EMPTY   -- individual fields GitHub itself often leaves blank (a
//      bio, a display name) are shown with a calm placeholder, never
//      "null" or a blank gap.
//   4. FAILURE -- the live request could not be completed at all (offline,
//      a typo'd username, GitHub rate-limiting the room) -- handled by
//      falling back to a saved offline snapshot first, and only showing a
//      true failure message if that ALSO fails.
const githubCardContainer = document.querySelector('#githubCard');

if (githubCardContainer) {
  // This is meant to be the student's own real GitHub username from
  // Course 1 -- the whole point of this feature is seeing YOUR OWN data
  // appear, not a hardcoded example. Jordan Blake's own placeholder
  // username is used here only because this file is the class's shared
  // reference identity, exactly like every other module's facilitator
  // material.
  const gitHubUsername = 'jordan-blake-dev';

  // The offline fallback fixture, shaped exactly like a real response
  // from https://api.github.com/users/{username} -- see
  // shared/offline-data/public-api-fixture.json for where this project's
  // own copy came from, and shared/offline-data/README.md for why it
  // exists. Fetched with a plain relative fetch() (same-origin, works
  // with Live Server, no internet required) rather than read from a
  // hardcoded JS object, so the offline path exercises the exact same
  // fetch/await/JSON steps as the live one.
  const OFFLINE_FIXTURE_PATH = 'data/public-api-fixture.json';

  // Shows (or restores) the loading message. Called once on page load,
  // before either fetch attempt begins.
  function showLoadingState() {
    githubCardContainer.textContent = 'Loading GitHub activity…';
    githubCardContainer.classList.add('github-card-mount--loading');
  }

  // The failure state -- shown ONLY if both the live request and the
  // offline fallback fixture could not be loaded. Deliberately calm and
  // human, never a raw error dump a real visitor would find confusing or
  // alarming.
  function showFailureState(message) {
    githubCardContainer.textContent = '';
    githubCardContainer.classList.remove('github-card-mount--loading');

    const errorMessage = document.createElement('p');
    errorMessage.classList.add('github-error');
    errorMessage.textContent = message;
    githubCardContainer.appendChild(errorMessage);
  }

  // The render-from-data pattern (same idea as the Projects section
  // above), applied to a single fetched object instead of an array. Every
  // value here came from GitHub's servers, not from a file this project
  // wrote itself -- exactly like the Contact form's visitor-typed
  // messages above, this is untrusted, externally-sourced data, so it is
  // built with createElement/textContent throughout, never innerHTML with
  // an interpolated value. `isFallback` adds one small, honest on-card
  // note when the data shown is the saved offline snapshot, not a live
  // request -- never silently pass off old data as current.
  function renderGitHubCard(user, isFallback) {
    githubCardContainer.classList.remove('github-card-mount--loading');
    githubCardContainer.textContent = '';

    const card = document.createElement('article');
    card.classList.add('github-card');

    const avatar = document.createElement('img');
    avatar.classList.add('github-avatar');
    avatar.src = user.avatar_url;
    avatar.alt = `${user.login}'s GitHub avatar`;
    card.appendChild(avatar);

    const info = document.createElement('div');
    info.classList.add('github-info');

    const displayName = document.createElement('h3');
    // The EMPTY state -- GitHub returns `name: null` for any account that
    // never set a display name, so fall back to the login handle instead
    // of showing a blank heading.
    displayName.textContent = user.name ? user.name : user.login;
    info.appendChild(displayName);

    const bio = document.createElement('p');
    // The same "handle missing data gracefully" habit used elsewhere in
    // this file, applied here because a GitHub bio is very commonly left
    // blank (`bio: null`).
    bio.textContent = user.bio
      ? user.bio
      : "This developer hasn't added a bio yet.";
    info.appendChild(bio);

    const repoCount = document.createElement('p');
    const repoCountStrong = document.createElement('strong');
    repoCountStrong.textContent = user.public_repos;
    repoCount.appendChild(repoCountStrong);
    repoCount.append(' public repositories'); // appended as text, never markup
    info.appendChild(repoCount);

    card.appendChild(info);
    githubCardContainer.appendChild(card);

    if (isFallback) {
      const fallbackNote = document.createElement('p');
      fallbackNote.classList.add('github-fallback-note');
      fallbackNote.textContent =
        "Showing a saved snapshot -- couldn't reach the live GitHub API right now.";
      githubCardContainer.appendChild(fallbackNote);
    }
  }

  // The offline fallback path. A plain, same-origin fetch of this
  // project's own bundled fixture file -- no internet required, and no
  // different in shape from the live response, which is exactly what
  // makes it a safe drop-in for renderGitHubCard().
  async function loadOfflineFallback() {
    const response = await fetch(OFFLINE_FIXTURE_PATH);

    if (!response.ok) {
      throw new Error('Offline fixture file could not be loaded either.');
    }

    const user = await response.json();
    renderGitHubCard(user, true);
  }

  // Fetch the student's own live GitHub profile, render it, and recover
  // gracefully -- first by falling back to the offline fixture, and only
  // showing a true failure message if THAT also fails.
  async function loadGitHubActivity() {
    showLoadingState();

    try {
      const response = await fetch(`https://api.github.com/users/${gitHubUsername}`);

      // fetch() only rejects for a true network failure (offline, DNS
      // down). A typo'd or nonexistent username still comes back as a
      // normal response, just with response.ok set to false -- so this
      // check is what catches THAT case too, not just a dead network.
      // Without it, a 404 would try to render a broken card (missing
      // avatar, undefined name) instead of failing cleanly.
      if (!response.ok) {
        throw new Error(`GitHub API responded with status ${response.status}`);
      }

      const user = await response.json();
      renderGitHubCard(user, false);
    } catch (error) {
      console.warn(
        'Could not load live GitHub activity -- falling back to the saved offline snapshot.',
        error
      );

      try {
        await loadOfflineFallback();
      } catch (fallbackError) {
        console.error('Offline fallback also failed:', fallbackError);
        showFailureState(
          "Couldn't load GitHub activity right now. Please check your connection or try again later."
        );
      }
    }
  }

  loadGitHubActivity();
}
