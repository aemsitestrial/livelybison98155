function getValue(block, name) {
  const cells = [...block.children];

  const match = cells.find(
    (cell) => cell.dataset.aueProp === name,
  );

  return match ? match.textContent.trim() : '';
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

export default function decorate(block) {
  const label = getValue(block, 'label');
  const name = getValue(block, 'name');
  const placeholder = getValue(block, 'placeholder');
  const requiredValue = getValue(block, 'required');

  const fieldId = name || `custom-field-${Date.now()}`;
  const isRequired = requiredValue === 'true';

  const wrapper = createElement('div', {
    class: 'custom-form-field-wrapper',
  });

  if (label) {
    const labelElement = createElement('label', {
      class: 'custom-form-field-label',
      for: fieldId,
    });

    labelElement.textContent = label;

    if (isRequired) {
      const requiredMark = createElement('span', {
        class: 'custom-form-field-required',
        'aria-hidden': 'true',
      });

      requiredMark.textContent = ' *';
      labelElement.append(requiredMark);
    }

    wrapper.append(labelElement);
  }

  const input = createElement('input', {
    class: 'custom-form-field-input',
    id: fieldId,
    name: name || fieldId,
    type: 'text',
    placeholder,
  });

  if (isRequired) {
    input.required = true;
  }

  wrapper.append(input);

  block.replaceChildren(wrapper);
}
