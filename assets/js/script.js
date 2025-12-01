'use strict';

/**
 * @typedef {Object} Employee
 * @property {string} slug
 * @property {string} name
 * @property {string} role
 * @property {string} email
 * @property {string} phone
 * @property {string} birthday
 * @property {string} location
 * @property {string} avatar
 * @property {Object<string, string>} socials
 * @property {{ intro?: string, detail?: string }} about
 * @property {Array<Object>} services
 * @property {Array<Object>} testimonials
 * @property {Array<Object>} clients
 * @property {Array<Object>} experience
 * @property {Array<Object>} education
 * @property {Array<Object>} skills
 * @property {Array<Object>} portfolio
 * @property {Array<Object>} blog
 */

/**
 * @typedef {{ staff: Employee[] }} EmployeeDirectory
 */

const DIRECTORY_API_URL = 'https://portal.quoralinex.com/directory-api/employees';

const state = {
  employees: [],
  currentIndex: -1,
  autoTimer: null,
  rotationMs: 12000,
};

const qs = (selector) => document.querySelector(selector);
const qsa = (selector) => Array.from(document.querySelectorAll(selector));

const directoryStatus = qs('#directory-status');
const profileStatus = qs('#profile-status');
const profileContent = qs('#profile-content');
const profileNotFound = qs('#profile-not-found');

const setStatus = (element, message, tone = 'info') => {
  if (!element) return;
  element.textContent = message || '';
  element.classList.remove('is-error', 'is-info', 'is-visible');
  element.setAttribute('aria-hidden', 'true');
  if (message) {
    element.classList.add('is-visible');
    element.classList.add(tone === 'error' ? 'is-error' : 'is-info');
    element.setAttribute('aria-hidden', 'false');
  }
};

const toggleProfileContent = (show) => {
  if (!profileContent) return;
  profileContent.classList.toggle('is-hidden', !show);
};

const normalizeEmployees = (entries) =>
  (entries || [])
    .filter(
      (emp) =>
        emp &&
        typeof emp.slug === 'string' &&
        emp.slug.trim() &&
        typeof emp.name === 'string' &&
        emp.name.trim()
    )
    .map((emp) => Object.assign({}, emp, { slug: emp.slug.trim().toLowerCase() }));

const showNotFound = (slug) => {
  toggleProfileContent(false);
  if (!profileNotFound) return;
  profileNotFound.textContent = slug
    ? 'Profile not found for "' + slug + '". Please choose another teammate.'
    : 'Profile not found.';
  profileNotFound.classList.add('is-visible');
};

const hideNotFound = () => {
  if (!profileNotFound) return;
  profileNotFound.classList.remove('is-visible');
};

const elementToggleFunc = function (elem) { elem.classList.toggle('active'); };

const sidebar = qs('[data-sidebar]');
const sidebarBtn = qs('[data-sidebar-btn]');
if (sidebar && sidebarBtn) {
  sidebarBtn.addEventListener('click', function () { elementToggleFunc(sidebar); });
}

const navigationLinks = qsa('[data-nav-link]');
const pages = qsa('[data-page]');

navigationLinks.forEach((link) => {
  link.addEventListener('click', function () {
    pages.forEach((page, index) => {
      if (this.innerHTML.toLowerCase() === page.dataset.page) {
        page.classList.add('active');
        navigationLinks[index].classList.add('active');
        window.scrollTo(0, 0);
      } else {
        page.classList.remove('active');
        navigationLinks[index].classList.remove('active');
      }
    });
  });
});

const form = qs('[data-form]');
const formInputs = qsa('[data-form-input]');
const formBtn = qs('[data-form-btn]');

formInputs.forEach((input) => {
  input.addEventListener('input', function () {
    if (form && form.checkValidity() && formBtn) {
      formBtn.removeAttribute('disabled');
    } else if (formBtn) {
      formBtn.setAttribute('disabled', '');
    }
  });
});

const buildMapSrc = (location) =>
  'https://www.google.com/maps?q=' + encodeURIComponent(location) + '&output=embed';

const renderContact = (employee) => {
  const email = qs('[data-email]');
  const phone = qs('[data-phone]');
  const birthday = qs('[data-birthday]');
  const locationNode = qs('[data-location]');
  const mapFrame = qs('#map-frame');

  if (email) {
    email.textContent = employee.email;
    email.href = 'mailto:' + employee.email;
  }

  if (phone) {
    phone.textContent = employee.phone;
    phone.href = 'tel:' + employee.phone.replace(/[^\d+]/g, '');
  }

  if (birthday) {
    birthday.textContent = new Date(employee.birthday).toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    birthday.setAttribute('datetime', employee.birthday);
  }

  if (locationNode) {
    locationNode.textContent = employee.location;
  }

  if (mapFrame) {
    mapFrame.src = buildMapSrc(employee.location);
  }
};

const renderSidebar = (employee) => {
  const nameEl = qs('[data-name]');
  const roleEl = qs('[data-role]');
  const avatarEl = qs('[data-avatar]');
  const aboutTitle = qs('[data-about-title]');

  if (nameEl) {
    nameEl.textContent = employee.name;
    if (employee.name && employee.name.length > 20) {
      nameEl.classList.add('long-name');
    } else {
      nameEl.classList.remove('long-name');
    }
  }
  if (roleEl) roleEl.textContent = employee.role;
  if (avatarEl) {
    avatarEl.src = employee.avatar;
    avatarEl.alt = employee.name + ' avatar';
  }
  if (aboutTitle) aboutTitle.textContent = 'About ' + employee.name;

  document.title = employee.name + ' | Quoralinex People';
};

const renderSocials = (employee) => {
  const socialLinks = qsa('[data-social-link]');
  const socials = employee.socials || {};

  socialLinks.forEach((link) => {
    const key = link.dataset.socialLink;
    const href = socials[key];
    if (href) {
      link.href = href;
      link.parentElement.style.display = 'block';
    } else {
      link.href = '#';
      link.parentElement.style.display = 'none';
    }
  });
};

const renderParagraphs = (container, paragraphs) => {
  if (!container) return;
  container.innerHTML = '';
  paragraphs.forEach((copy) => {
    const p = document.createElement('p');
    p.textContent = copy;
    container.appendChild(p);
  });
};

const renderServices = (employee) => {
  const serviceList = qs('#service-list');
  if (!serviceList) return;
  serviceList.innerHTML = '';

  (employee.services || []).forEach((service) => {
    const li = document.createElement('li');
    li.className = 'service-item';
    li.innerHTML =
      '<div class="service-icon-box">' +
      '<img src="' +
      service.icon +
      '" alt="' +
      service.title +
      ' icon" width="40">' +
      '</div>' +
      '<div class="service-content-box">' +
      '<h4 class="h4 service-item-title">' +
      service.title +
      '</h4>' +
      '<p class="service-item-text">' +
      service.description +
      '</p>' +
      '</div>';
    serviceList.appendChild(li);
  });
};

let modalContainer, modalImg, modalTitle, modalText, modalDate, overlay, modalCloseBtn;

const bindTestimonialModal = () => {
  const testimonialCards = qsa('[data-testimonials-item]');
  if (!testimonialCards.length) return;

  testimonialCards.forEach((card) => {
    card.addEventListener('click', function () {
      modalImg.src = this.querySelector('[data-testimonials-avatar]').src;
      modalImg.alt = this.querySelector('[data-testimonials-avatar]').alt;
      modalTitle.innerHTML = this.querySelector('[data-testimonials-title]').innerHTML;
      modalText.innerHTML = this.querySelector('[data-testimonials-text]').innerHTML;
      const date = this.dataset.testimonialDate;
      if (modalDate) {
        modalDate.textContent = date ? new Date(date).toLocaleDateString() : '';
        modalDate.setAttribute('datetime', date || '');
      }
      elementToggleFunc(modalContainer);
      elementToggleFunc(overlay);
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', function () {
      elementToggleFunc(modalContainer);
      elementToggleFunc(overlay);
    });
  }
  if (overlay) {
    overlay.addEventListener('click', function () {
      elementToggleFunc(modalContainer);
      elementToggleFunc(overlay);
    });
  }
};

const renderTestimonials = (employee) => {
  const list = qs('#testimonials-list');
  if (!list) return;
  list.innerHTML = '';

  if (!employee.testimonials || !employee.testimonials.length) {
    const empty = document.createElement('p');
    empty.className = 'section-sub';
    empty.textContent = 'No highlights yet — check back soon!';
    list.appendChild(empty);
    return;
  }

  employee.testimonials.forEach((testimonial) => {
    const li = document.createElement('li');
    li.className = 'testimonials-item';
    li.innerHTML =
      '<div class="content-card" data-testimonials-item data-testimonial-date="' +
      (testimonial.date || '') +
      '">' +
      '<figure class="testimonials-avatar-box">' +
      '<img src="' +
      testimonial.avatar +
      '" alt="' +
      testimonial.name +
      '" width="60" data-testimonials-avatar>' +
      '</figure>' +
      '<h4 class="h4 testimonials-item-title" data-testimonials-title>' +
      testimonial.name +
      '</h4>' +
      '<div class="testimonials-text" data-testimonials-text>' +
      '<p>' +
      testimonial.quote +
      '</p>' +
      '<p class="section-sub">' +
      testimonial.role +
      '</p>' +
      '</div>' +
      '</div>';
    list.appendChild(li);
  });

  modalContainer = qs('[data-modal-container]');
  modalImg = qs('[data-modal-img]');
  modalTitle = qs('[data-modal-title]');
  modalText = qs('[data-modal-text]');
  modalDate = qs('[data-modal-date]');
  overlay = qs('[data-overlay]');
  modalCloseBtn = qs('[data-modal-close-btn]');

  bindTestimonialModal();
};

const renderClients = (employee) => {
  const list = qs('#clients-list');
  if (!list) return;
  list.innerHTML = '';

  if (!employee.clients || !employee.clients.length) {
    const empty = document.createElement('p');
    empty.className = 'section-sub';
    empty.textContent = 'Client logos will appear here once added.';
    list.appendChild(empty);
    return;
  }

  employee.clients.forEach((client) => {
    const li = document.createElement('li');
    li.className = 'clients-item';
    li.innerHTML =
      '<a href="' +
      client.url +
      '" target="_blank" rel="noreferrer">' +
      '<img src="' +
      client.logo +
      '" alt="' +
      client.name +
      ' logo">' +
      '</a>';
    list.appendChild(li);
  });
};

const renderTimeline = (items, containerId) => {
  const container = qs(containerId);
  if (!container) return;
  container.innerHTML = '';

  if (!items || !items.length) {
    const empty = document.createElement('p');
    empty.className = 'section-sub';
    empty.textContent = 'Details coming soon.';
    container.appendChild(empty);
    return;
  }

  items.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'timeline-item';
    li.innerHTML =
      '<h4 class="h4 timeline-item-title">' +
      item.title +
      '</h4>' +
      '<span>' +
      (item.place || '') +
      '</span>' +
      '<span class="section-sub">' +
      (item.period || '') +
      '</span>' +
      '<p class="timeline-text">' +
      (item.body || '') +
      '</p>';
    container.appendChild(li);
  });
};

const renderSkills = (employee) => {
  const list = qs('#skills-list');
  if (!list) return;
  list.innerHTML = '';

  (employee.skills || []).forEach((skill) => {
    const li = document.createElement('li');
    li.className = 'skills-item';
    li.innerHTML =
      '<div class="title-wrapper">' +
      '<h5 class="h5">' +
      skill.name +
      '</h5>' +
      '<data value="' +
      skill.level +
      '">' +
      skill.level +
      '%</data>' +
      '</div>' +
      '<div class="skill-progress-bg">' +
      '<div class="skill-progress-fill" style="width: ' +
      skill.level +
      '%;"></div>' +
      '</div>';
    list.appendChild(li);
  });
};

let filterItems = [];
let filterBtn = [];
let selectItems = [];
let selectValue = null;

const filterFunc = function (selectedValue) {
  filterItems.forEach((item) => {
    if (selectedValue === 'all' || selectedValue === item.dataset.category) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
};

const bindFilters = () => {
  let lastClickedBtn = filterBtn[0];

  filterBtn.forEach((btn) => {
    btn.addEventListener('click', function () {
      const selectedValue = this.innerText.toLowerCase();
      if (selectValue) selectValue.innerText = this.innerText;
      filterFunc(selectedValue);
      if (lastClickedBtn) lastClickedBtn.classList.remove('active');
      this.classList.add('active');
      lastClickedBtn = this;
    });
  });

  selectItems.forEach((item) => {
    item.addEventListener('click', function () {
      const selectedValue = this.innerText.toLowerCase();
      if (selectValue) selectValue.innerText = this.innerText;
      elementToggleFunc(qs('[data-select]'));
      filterFunc(selectedValue);
    });
  });

  const select = qs('[data-select]');
  if (select) {
    select.addEventListener('click', function () { elementToggleFunc(this); });
  }
};

const renderPortfolio = (employee) => {
  const filterList = qs('#filter-list');
  const selectList = qs('#select-list');
  const projectList = qs('#project-list');
  selectValue = qs('[data-selecct-value]');

  if (!filterList || !selectList || !projectList) return;

  filterList.innerHTML = '';
  selectList.innerHTML = '';
  projectList.innerHTML = '';

  const categories = Array.from(
    new Set((employee.portfolio || []).map((p) => (p.category || 'misc').toLowerCase()))
  );
  const allCategories = ['all'].concat(categories);

  allCategories.forEach((category, index) => {
    const btn = document.createElement('li');
    btn.className = 'filter-item';
    btn.innerHTML =
      '<button ' +
      (index === 0 ? 'class="active"' : '') +
      ' data-filter-btn>' +
      category.replace(/\b\w/g, function (c) {
        return c.toUpperCase();
      }) +
      '</button>';
    filterList.appendChild(btn);
  });

  allCategories.forEach((category) => {
    const item = document.createElement('li');
    item.className = 'select-item';
    item.innerHTML =
      '<button data-select-item>' +
      category.replace(/\b\w/g, function (c) {
        return c.toUpperCase();
      }) +
      '</button>';
    selectList.appendChild(item);
  });

  (employee.portfolio || []).forEach((project) => {
    const li = document.createElement('li');
    li.className = 'project-item active';
    li.dataset.filterItem = '';
    li.dataset.category = (project.category || 'misc').toLowerCase();
    li.innerHTML =
      '<a href="' +
      project.url +
      '" target="_blank" rel="noreferrer">' +
      '<figure class="project-img">' +
      '<div class="project-item-icon-box"><ion-icon name="eye-outline"></ion-icon></div>' +
      '<img src="' +
      project.image +
      '" alt="' +
      project.title +
      '" loading="lazy">' +
      '</figure>' +
      '<h3 class="project-title">' +
      project.title +
      '</h3>' +
      '<p class="project-category">' +
      project.category +
      '</p>' +
      '<p class="section-sub">' +
      (project.summary || '') +
      '</p>' +
      '</a>';
    projectList.appendChild(li);
  });

  filterItems = qsa('[data-filter-item]');
  filterBtn = qsa('[data-filter-btn]');
  selectItems = qsa('[data-select-item]');

  bindFilters();
};

const renderBlog = (employee) => {
  const blogList = qs('#blog-list');
  if (!blogList) return;
  blogList.innerHTML = '';

  if (!employee.blog || !employee.blog.length) {
    const empty = document.createElement('p');
    empty.className = 'section-sub';
    empty.textContent = 'No posts yet.';
    blogList.appendChild(empty);
    return;
  }

  employee.blog.forEach((post) => {
    const li = document.createElement('li');
    li.className = 'blog-post-item';
    li.innerHTML =
      '<a href="' +
      post.url +
      '" target="_blank" rel="noreferrer">' +
      '<figure class="blog-banner-box"><img src="' +
      post.image +
      '" alt="' +
      post.title +
      '" loading="lazy"></figure>' +
      '<div class="blog-content">' +
      '<div class="blog-meta">' +
      '<p class="blog-category">' +
      post.category +
      '</p>' +
      '<span class="dot"></span>' +
      '<time datetime="' +
      post.date +
      '">' +
      new Date(post.date).toLocaleDateString() +
      '</time>' +
      '</div>' +
      '<h3 class="h3 blog-item-title">' +
      post.title +
      '</h3>' +
      '<p class="blog-text">' +
      post.excerpt +
      '</p>' +
      '</div>' +
      '</a>';
    blogList.appendChild(li);
  });
};

const renderStaffDirectory = () => {
  const list = qs('#staff-directory');
  if (!list) return;
  list.innerHTML = '';

  if (!state.employees.length) {
    setStatus(directoryStatus, 'No staff to display yet.', 'info');
    return;
  }

  setStatus(directoryStatus, '', 'info');

  state.employees.forEach((employee, index) => {
    const li = document.createElement('li');
    li.className = 'directory-item ' + (index === state.currentIndex ? 'active' : '');
    li.dataset.slug = employee.slug;
    li.innerHTML =
      '<p class="directory-name">' +
      employee.name +
      '</p>' +
      '<p class="directory-role">' +
      employee.role +
      '</p>';
    li.addEventListener('click', function () {
      setActiveEmployee(employee.slug, true);
    });
    list.appendChild(li);
  });
};

const renderProfile = (employee) => {
  renderSidebar(employee);
  renderContact(employee);
  renderSocials(employee);

  const aboutParts = [];
  if (employee.about && employee.about.intro) {
    aboutParts.push(employee.about.intro);
  }
  if (employee.about && employee.about.detail) {
    aboutParts.push(employee.about.detail);
  }
  renderParagraphs(qs('#about-text'), aboutParts);

  renderServices(employee);
  renderTestimonials(employee);
  renderClients(employee);
  renderTimeline(employee.experience, '#experience-list');
  renderTimeline(employee.education, '#education-list');
  renderSkills(employee);
  renderPortfolio(employee);
  renderBlog(employee);
};

/* --------- Querystring helpers (no URLSearchParams) ---------- */

const getQueryParam = function (name) {
  const query = window.location.search ? window.location.search.substring(1) : '';
  if (!query) return null;
  const pairs = query.split('&');
  for (let i = 0; i < pairs.length; i += 1) {
    const part = pairs[i];
    if (!part) continue;
    const eqIndex = part.indexOf('=');
    const key = decodeURIComponent(eqIndex >= 0 ? part.substring(0, eqIndex) : part);
    if (key === name) {
      const value =
        eqIndex >= 0 ? decodeURIComponent(part.substring(eqIndex + 1)) : '';
      return value || null;
    }
  }
  return null;
};

const buildUrlWithSlug = function (slug) {
  const base = window.location.origin + window.location.pathname;
  const query = window.location.search ? window.location.search.substring(1) : '';
  const parts = query ? query.split('&').filter(Boolean) : [];

  // remove any existing employee= param
  for (let i = parts.length - 1; i >= 0; i -= 1) {
    if (parts[i].split('=')[0] === 'employee') {
      parts.splice(i, 1);
    }
  }
  parts.push('employee=' + encodeURIComponent(slug));

  return base + '?' + parts.join('&');
};

/* ------------------------------------------------------------ */

const resolveSlug = () => {
  const querySlug = getQueryParam('employee');
  if (querySlug) return querySlug.toLowerCase();

  const path = window.location.pathname.split('/').pop();
  if (path && path !== '' && path !== 'index.html') {
    return path.replace('.html', '').toLowerCase();
  }

  return document.documentElement.dataset.defaultEmployee || 'marclevy';
};

const setActiveEmployee = (slug, manual = false) => {
  if (!state.employees.length) return;

  const index = state.employees.findIndex((e) => e.slug === slug);
  if (index === -1) {
    state.currentIndex = -1;
    setStatus(profileStatus, 'Profile not found.', 'error');
    showNotFound(slug);
    return;
  }

  hideNotFound();
  state.currentIndex = index;
  const employee = state.employees[state.currentIndex];

  if (!employee) return;

  setStatus(profileStatus, '', 'info');
  toggleProfileContent(true);
  renderProfile(employee);
  renderStaffDirectory();

  const newUrl = buildUrlWithSlug(employee.slug);
  window.history.replaceState({}, '', newUrl);

  if (manual) {
    restartRotation();
  }
};

const nextEmployee = () => {
  if (!state.employees.length) return;
  const nextIndex = state.currentIndex >= 0
    ? (state.currentIndex + 1) % state.employees.length
    : 0;
  setActiveEmployee(state.employees[nextIndex].slug, false);
};

const restartRotation = () => {
  if (state.autoTimer) clearInterval(state.autoTimer);
  if (!state.employees.length) return;
  state.autoTimer = setInterval(nextEmployee, state.rotationMs);
};
/* --------- Directory load using fetch ------------------------ */

const loadDirectory = async (attempt = 1) => {
  setStatus(directoryStatus, 'Loading staff directory…', 'info');
  setStatus(profileStatus, 'Loading staff directory…', 'info');
  toggleProfileContent(false);

  try {
    const res = await fetch(DIRECTORY_API_URL, { cache: 'no-cache' });
    if (!res.ok) {
      throw new Error('Directory API error HTTP ' + res.status);
    }

    /** @type {EmployeeDirectory | Employee[] | null} */
    const directory = await res.json();
    const staff = Array.isArray(directory)
      ? directory
      : (directory && Array.isArray(directory.staff) ? directory.staff : []);

    if (!Array.isArray(staff) || !staff.length) {
      throw new Error('Directory response missing staff');
    }

    const normalized = normalizeEmployees(staff);

    if (!normalized.length) {
      throw new Error('No valid employees after normalization');
    }

    state.employees = normalized;
    renderStaffDirectory();
    setStatus(directoryStatus, '', 'info');
    setStatus(profileStatus, '', 'info');
    toggleProfileContent(true);
    hideNotFound();

    setActiveEmployee(resolveSlug());
    restartRotation();
  } catch (error) {
    console.error('Failed to load employee directory', error);
    if (attempt < 2) {
      setStatus(directoryStatus, 'Loading staff directory… retrying.', 'info');
      setStatus(profileStatus, 'Retrying directory request…', 'info');
      return loadDirectory(attempt + 1);
    }

    state.employees = [];
    state.currentIndex = -1;
    renderStaffDirectory();
    if (state.autoTimer) clearInterval(state.autoTimer);
    toggleProfileContent(false);
    showNotFound();
    setStatus(directoryStatus, 'Staff directory temporarily unavailable.', 'error');
    setStatus(profileStatus, 'Staff directory temporarily unavailable.', 'error');
  }
};

loadDirectory();
