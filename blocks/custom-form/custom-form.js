function getFieldValue(block, name) {
  const cells = [...block.children];

  const cell = cells.find((item) => item.dataset.aueProp === name);

  return cell ? cell.textContent.trim() : '';
}

function createElement(tag, attributes = {}) {
  const element = document.createElement(tag);

  Object.entries(attributes).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      element.setAttribute(key, value);
    }
  });

  return element;
}

function createHeader(title, description) {
  const header = createElement('div', {
    class: 'custom-form-header',
  });

  if (title) {
    const heading = createElement('h2', {
      class: 'custom-form-title',
    });

    heading.textContent = title;
    header.append(heading);
  }

  if (description) {
    const text = createElement('p', {
      class: 'custom-form-description',
    });

    text.textContent = description;
    header.append(text);
  }

  return header;
}

function createSubmitButton(text) {
  const button = createElement('button', {
    class: 'custom-form-submit',
    type: 'submit',
  });

  button.textContent = text || 'Submit';

  return button;
}

function createForm(block, title, description, submitText, layout) {
  const form = createElement('form', {
    class: 'custom-form-element',
    novalidate: 'novalidate',
  });

  const header = createHeader(title, description);

  if (title || description) {
    form.append(header);
  }

  const fields = createElement('div', {
    class: 'custom-form-fields',
  });

  if (layout === 'two-column') {
    fields.classList.add('custom-form-fields-two-column');
  }

  /*
   * Preserve the child components authored inside the block.
   */
  const children = [...block.children];

  children.forEach((child) => {
    const property = child.dataset.aueProp;

    if (!property) {
      fields.append(child);
    }
  });

  form.append(fields);

  const actions = createElement('div', {
    class: 'custom-form-actions',
  });

  actions.append(createSubmitButton(submitText));

  form.append(actions);

  return form;
}

function showSuccess(form) {
  let message = form.querySelector('.custom-form-success');

  if (!message) {
    message = createElement('div', {
      class: 'custom-form-success',
      role: 'status',
    });

    form.prepend(message);
  }

  message.textContent = 'Form submitted successfully.';
}

function showError(form) {
  let message = form.querySelector('.custom-form-submit-error');

  if (!message) {
    message = createElement('div', {
      class: 'custom-form-submit-error',
      role: 'alert',
    });

    form.prepend(message);
  }

  message.textContent = 'Please check the required fields.';
}

function handleSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;

  if (!form.checkValidity()) {
    showError(form);
    form.reportValidity();
    return;
  }

  showSuccess(form);
}

export default function decorate(block) {
  const title = getFieldValue(block, 'title');
  const description = getFieldValue(block, 'description');
  const submitText = getFieldValue(block, 'submitText');
  const layout = getFieldValue(block, 'layout') || 'stacked';

  const form = createForm(
    block,
    title,
    description,
    submitText,
    layout,
  );

  form.addEventListener('submit', handleSubmit);

  block.replaceChildren(form);
}
