function getCellValue(block, index) {
  const cell = block.children[index];

  if (!cell) {
    return '';
  }

  return cell.textContent.trim();
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
  const label = getCellValue(block, 0);
  const name = getCellValue(block, 1);
  const placeholder = getCellValue(block, 2);
  const requiredValue = getCellValue(block, 3);

  const fieldName = name || 'custom-field';
  const fieldId = `custom-form-${fieldName}`;
  const isRequired = requiredValue === 'true';

  const wrapper = createElement('div', {
    class: 'custom-form-field-wrapper',
  });

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

  const input = createElement('input', {
    class: 'custom-form-field-input',
    id: fieldId,
    name: fieldName,
    type: 'text',
    placeholder,
  });

  input.required = isRequired;

  wrapper.append(labelElement);
  wrapper.append(input);

  block.replaceChildren(wrapper);
}
