'use strict';

const DIRECTORY_API_URL = 'https://portal.quoralinex.com/directory-api/employees';

let staff = [];

const $ = (sel) => document.querySelector(sel);

const loadBtn = $('#load-data-btn');
const select = $('#employee-select');
const form = $('#employee-form');
const output = $('#json-output');

loadBtn.addEventListener('click', function () {
  fetch(DIRECTORY_API_URL + '?_=' + Date.now())
    .then((res) => res.json())
    .then((data) => {
      staff = Array.isArray(data) ? data : (data.staff || []);
      renderSelect();
      updateOutput();
    })
    .catch((err) => {
      console.error('Failed to load directory API', err);
      alert('Failed to load the live directory – check console.');
    });
});

const renderSelect = () => {
  // keep first option "New employee"
  select.innerHTML = '<option value="">— New employee —</option>';
  staff.forEach((emp, i) => {
    const opt = document.createElement('option');
    opt.value = String(i);
    opt.textContent = emp.name + ' (' + emp.slug + ')';
    select.appendChild(opt);
  });
};

select.addEventListener('change', function () {
  const idx = this.value ? parseInt(this.value, 10) : -1;
  if (idx >= 0 && staff[idx]) {
    loadIntoForm(staff[idx]);
  } else {
    form.reset();
  }
});

const loadIntoForm = (emp) => {
  form.slug.value = emp.slug || '';
  form.name.value = emp.name || '';
  form.role.value = emp.role || '';
  form.email.value = emp.email || '';
  form.location.value = emp.location || '';
  form.avatar.value = emp.avatar || '';
  form.about_intro.value = (emp.about && emp.about.intro) || '';
  form.about_detail.value = (emp.about && emp.about.detail) || '';
};

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const data = {
    slug: form.slug.value.trim(),
    name: form.name.value.trim(),
    role: form.role.value.trim(),
    email: form.email.value.trim(),
    location: form.location.value.trim(),
    avatar: form.avatar.value.trim(),
    about: {
      intro: form.about_intro.value.trim(),
      detail: form.about_detail.value.trim(),
    },
  };

  if (!data.slug || !data.name) {
    alert('Slug and name are required.');
    return;
  }

  const idx = select.value ? parseInt(select.value, 10) : -1;
  if (idx >= 0 && staff[idx]) {
    staff[idx] = Object.assign({}, staff[idx], data);
  } else {
    staff.push(data);
  }

  renderSelect();
  updateOutput();

  alert('Updated in memory. Save changes in the portal to persist them.');
});

const updateOutput = () => {
  output.value = JSON.stringify({ staff }, null, 2);
};
