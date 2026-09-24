// import { loadFragment } from '../fragment/fragment.js';

// export default function decorate(block) {
//   // Create observer to load form when block enters viewport
//   const observer = new IntersectionObserver(async (entries) => {
//     const [entry] = entries;
//     if (entry.isIntersecting) {
//       // Disconnect observer after loading to prevent multiple loads
//       observer.disconnect();

//       const container = block.querySelector('a[href]');
//       // get the pathname from the href
//       const { pathname } = new URL(container.href);
//       const form = await loadFragment(pathname);
//       block.replaceChildren(form.children[0]);
//     }
//   });

//   // Start observing the block
//   observer.observe(block);
// }
import { loadFragment } from '../fragment/fragment.js';

function getVariation(block) {
  if (block.classList.contains('with-header')) {
    return 'with-header';
  }

  if (block.classList.contains('two-column')) {
    return 'two-column';
  }

  if (block.classList.contains('with-image')) {
    return 'with-image';
  }

  if (block.classList.contains('modal')) {
    return 'modal';
  }

  return 'default';
}

function applyVariation(block, form, variation) {
  switch (variation) {
    case 'with-header': {
      const wrapper = document.createElement('div');
      wrapper.className = 'embed-adaptive-form-header';

      const title = document.createElement('h2');
      title.textContent = 'Contact Us';

      const description = document.createElement('p');
      description.textContent = 'Please fill out the form below.';

      wrapper.append(title, description, form);
      block.replaceChildren(wrapper);
      break;
    }

    case 'two-column': {
      const wrapper = document.createElement('div');
      wrapper.className = 'embed-adaptive-form-columns';

      const content = document.createElement('div');
      content.className = 'embed-adaptive-form-content';

      const title = document.createElement('h2');
      title.textContent = 'Get in Touch';

      content.append(title);

      const formWrapper = document.createElement('div');
      formWrapper.className = 'embed-adaptive-form-form';

      formWrapper.append(form);

      wrapper.append(content, formWrapper);
      block.replaceChildren(wrapper);
      break;
    }

    case 'with-image': {
      const wrapper = document.createElement('div');
      wrapper.className = 'embed-adaptive-form-image-layout';

      const image = document.createElement('div');
      image.className = 'embed-adaptive-form-image';

      const imageElement = document.createElement('div');
      imageElement.className = 'embed-adaptive-form-image-placeholder';
      imageElement.textContent = 'Image';

      image.append(imageElement);

      const formWrapper = document.createElement('div');
      formWrapper.className = 'embed-adaptive-form-form';

      formWrapper.append(form);

      wrapper.append(image, formWrapper);
      block.replaceChildren(wrapper);
      break;
    }

    case 'modal': {
      const button = document.createElement('button');
      button.className = 'embed-adaptive-form-modal-button';
      button.type = 'button';
      button.textContent = 'Open Form';

      const dialog = document.createElement('dialog');
      dialog.className = 'embed-adaptive-form-modal-dialog';

      const closeButton = document.createElement('button');
      closeButton.className = 'embed-adaptive-form-modal-close';
      closeButton.type = 'button';
      closeButton.textContent = 'Close';

      closeButton.addEventListener('click', () => {
        dialog.close();
      });

      dialog.append(closeButton, form);

      button.addEventListener('click', () => {
        dialog.showModal();
      });

      block.replaceChildren(button, dialog);
      break;
    }

    default:
      block.replaceChildren(form);
      break;
  }
}

export default function decorate(block) {
  const variation = getVariation(block);

  // Create observer to load form when block enters viewport
  const observer = new IntersectionObserver(async (entries) => {
    const [entry] = entries;

    if (entry.isIntersecting) {
      // Disconnect observer after loading to prevent multiple loads
      observer.disconnect();

      const container = block.querySelector('a[href]');

      // get the pathname from the href
      const { pathname } = new URL(container.href);

      const form = await loadFragment(pathname);

      applyVariation(block, form.children[0], variation);
    }
  });

  // Start observing the block
  observer.observe(block);
}
