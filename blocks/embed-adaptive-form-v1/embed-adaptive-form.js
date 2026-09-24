import { loadFragment } from '../fragment/fragment.js';

const VARIANTS = [
  'default',
  'with-header',
  'two-column',
  'with-image',
  'modal',
];

function getVariant(block) {
  return VARIANTS.find((variant) => block.classList.contains(variant)) || 'default';
}

function getFieldCell(block, index) {
  const row = block.children[index];

  if (!row) {
    return null;
  }

  return row.children[0] || row;
}

function getText(block, index, fallback = '') {
  const cell = getFieldCell(block, index);

  if (!cell) {
    return fallback;
  }

  const value = cell.textContent.trim();

  return value || fallback;
}

function getPath(block, index) {
  const cell = getFieldCell(block, index);

  if (!cell) {
    return '';
  }

  const link = cell.querySelector('a[href]');

  if (link) {
    try {
      return new URL(link.href, window.location.href).pathname;
    } catch (error) {
      return link.getAttribute('href') || '';
    }
  }

  return cell.textContent.trim();
}

function getImage(block, index) {
  const cell = getFieldCell(block, index);

  if (!cell) {
    return null;
  }

  const picture = cell.querySelector('picture');

  if (picture) {
    return picture.cloneNode(true);
  }

  const image = cell.querySelector('img');

  return image ? image.cloneNode(true) : null;
}

function createElement(tag, className, text = '') {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text) {
    element.textContent = text;
  }

  return element;
}

function showError(container, message) {
  const error = createElement(
    'div',
    'embed-adaptive-form-error',
    message,
  );

  error.setAttribute('role', 'alert');

  container.replaceChildren(error);
}

function normalizeFormPath(path) {
  if (!path) {
    return '';
  }

  try {
    const url = new URL(path, window.location.href);

    return url.pathname
      .replace(/\.html$/, '')
      .replace(/\/$/, '');
  } catch (error) {
    return path
      .replace(/\.html$/, '')
      .replace(/\/$/, '');
  }
}

async function loadAdaptiveForm(path) {
  const formPath = normalizeFormPath(path);

  if (!formPath) {
    throw new Error('No Adaptive Form path was configured.');
  }

  if (!formPath.startsWith('/content/forms/af/')) {
    throw new Error(
      'Invalid Adaptive Form path. The form must be under /content/forms/af.',
    );
  }

  const fragment = await loadFragment(formPath);

  if (!fragment) {
    throw new Error(
      `Unable to load the Adaptive Form at ${formPath}.`,
    );
  }

  const formBlock = fragment.querySelector('.form');

  if (!formBlock) {
    throw new Error(
      'The selected resource does not contain an Adaptive Form block.',
    );
  }

  return formBlock;
}

async function renderForm(container, formPath) {
  container.classList.add('is-loading');

  try {
    const form = await loadAdaptiveForm(formPath);

    container.classList.remove('is-loading');
    container.classList.add('is-loaded');
    container.replaceChildren(form);
  } catch (error) {
    container.classList.remove('is-loading');
    container.classList.add('is-error');

    // eslint-disable-next-line no-console
    console.error('Embedded Adaptive Form failed to load:', error);

    showError(
      container,
      'The form could not be loaded. Please try again later.',
    );
  }
}

function createHeader(title, description) {
  const header = createElement(
    'div',
    'embed-adaptive-form-header',
  );

  if (title) {
    header.append(
      createElement(
        'h2',
        'embed-adaptive-form-title',
        title,
      ),
    );
  }

  if (description) {
    header.append(
      createElement(
        'p',
        'embed-adaptive-form-description',
        description,
      ),
    );
  }

  return header;
}

function createFormContainer() {
  return createElement(
    'div',
    'embed-adaptive-form-form',
  );
}

function observeForm(block, formContainer, formPath) {
  let loaded = false;

  const load = async () => {
    if (loaded) {
      return;
    }

    loaded = true;

    await renderForm(
      formContainer,
      formPath,
    );
  };

  if (!('IntersectionObserver' in window)) {
    load();
    return;
  }

  const observer = new IntersectionObserver(
    async (entries) => {
      const [entry] = entries;

      if (entry && entry.isIntersecting) {
        observer.disconnect();
        await load();
      }
    },
    {
      rootMargin: '200px 0px',
      threshold: 0.01,
    },
  );

  observer.observe(block);
}

function renderDefault(block) {
  const formPath = getPath(block, 0);

  const formContainer = createFormContainer();

  block.replaceChildren(formContainer);

  observeForm(
    block,
    formContainer,
    formPath,
  );
}

function renderWithHeader(block) {
  const title = getText(block, 0);
  const description = getText(block, 1);
  const formPath = getPath(block, 2);

  const wrapper = createElement(
    'div',
    'embed-adaptive-form-inner',
  );

  const header = createHeader(
    title,
    description,
  );

  const formContainer = createFormContainer();

  wrapper.append(
    header,
    formContainer,
  );

  block.replaceChildren(wrapper);

  observeForm(
    block,
    formContainer,
    formPath,
  );
}

function renderTwoColumn(block) {
  const title = getText(block, 0);
  const description = getText(block, 1);
  const formPath = getPath(block, 2);

  const wrapper = createElement(
    'div',
    'embed-adaptive-form-layout',
  );

  const content = createElement(
    'div',
    'embed-adaptive-form-content',
  );

  if (title) {
    content.append(
      createElement(
        'h2',
        'embed-adaptive-form-title',
        title,
      ),
    );
  }

  if (description) {
    content.append(
      createElement(
        'p',
        'embed-adaptive-form-description',
        description,
      ),
    );
  }

  const formContainer = createFormContainer();

  wrapper.append(
    content,
    formContainer,
  );

  block.replaceChildren(wrapper);

  observeForm(
    block,
    formContainer,
    formPath,
  );
}

function renderWithImage(block) {
  const image = getImage(block, 0);
  const title = getText(block, 1);
  const description = getText(block, 2);
  const formPath = getPath(block, 3);

  const wrapper = createElement(
    'div',
    'embed-adaptive-form-layout',
  );

  const visual = createElement(
    'div',
    'embed-adaptive-form-visual',
  );

  if (image) {
    visual.append(image);
  }

  const rightColumn = createElement(
    'div',
    'embed-adaptive-form-form-column',
  );

  const content = createElement(
    'div',
    'embed-adaptive-form-content',
  );

  if (title) {
    content.append(
      createElement(
        'h2',
        'embed-adaptive-form-title',
        title,
      ),
    );
  }

  if (description) {
    content.append(
      createElement(
        'p',
        'embed-adaptive-form-description',
        description,
      ),
    );
  }

  const formContainer = createFormContainer();

  rightColumn.append(
    content,
    formContainer,
  );

  wrapper.append(
    visual,
    rightColumn,
  );

  block.replaceChildren(wrapper);

  observeForm(
    block,
    formContainer,
    formPath,
  );
}

function createModal(block) {
  const buttonText = getText(
    block,
    0,
    'Open Form',
  );

  const modalTitle = getText(
    block,
    1,
  );

  const formPath = getPath(
    block,
    2,
  );

  const trigger = createElement(
    'button',
    'embed-adaptive-form-modal-trigger',
    buttonText,
  );

  trigger.type = 'button';

  const dialog = document.createElement('dialog');

  dialog.className = 'embed-adaptive-form-dialog';

  const dialogContent = createElement(
    'div',
    'embed-adaptive-form-dialog-content',
  );

  const closeButton = createElement(
    'button',
    'embed-adaptive-form-dialog-close',
    'Close',
  );

  closeButton.type = 'button';

  closeButton.setAttribute(
    'aria-label',
    'Close form',
  );

  if (modalTitle) {
    dialogContent.append(
      createElement(
        'h2',
        'embed-adaptive-form-dialog-title',
        modalTitle,
      ),
    );
  }

  const formContainer = createFormContainer();

  dialogContent.append(
    formContainer,
    closeButton,
  );

  dialog.append(dialogContent);

  const closeDialog = () => {
    if (dialog.open) {
      dialog.close();
    }
  };

  closeButton.addEventListener(
    'click',
    closeDialog,
  );

  dialog.addEventListener(
    'click',
    (event) => {
      if (event.target === dialog) {
        closeDialog();
      }
    },
  );

  trigger.addEventListener(
    'click',
    async () => {
      if (!dialog.open) {
        dialog.showModal();

        if (!formContainer.dataset.loaded) {
          formContainer.dataset.loaded = 'true';

          await renderForm(
            formContainer,
            formPath,
          );
        }
      }
    },
  );

  block.replaceChildren(
    trigger,
    dialog,
  );
}

export default function decorate(block) {
  const variant = getVariant(block);

  switch (variant) {
    case 'with-header':
      renderWithHeader(block);
      break;

    case 'two-column':
      renderTwoColumn(block);
      break;

    case 'with-image':
      renderWithImage(block);
      break;

    case 'modal':
      createModal(block);
      break;

    case 'default':
    default:
      renderDefault(block);
      break;
  }
}
