// /*
//  * Table Block
//  * Recreate a table
//  * https://www.hlx.live/developer/block-collection/table
//  */

// import { moveInstrumentation } from '../../scripts/scripts.js';

// /**
//  *
//  * @param {Element} block
//  */
// export default async function decorate(block) {
//   const table = document.createElement('table');
//   const thead = document.createElement('thead');
//   const tbody = document.createElement('tbody');
//   const header = !block.classList.contains('no-header');

//   [...block.children].forEach((row, i) => {
//     const tr = document.createElement('tr');
//     moveInstrumentation(row, tr);

//     [...row.children].forEach((cell) => {
//       const td = document.createElement(i === 0 && header ? 'th' : 'td');

//       if (i === 0) td.setAttribute('scope', 'column');
//       td.innerHTML = cell.innerHTML;
//       tr.append(td);
//     });
//     if (i === 0 && header) thead.append(tr);
//     else tbody.append(tr);
//   });
//   table.append(thead, tbody);
//   block.replaceChildren(table);
// }

/*
 * Table Block
 *
 * Supports:
 * - Default
 * - Striped
 * - Bordered
 * - No Header
 * - Compact
 * - Hoverable
 * - Comparison
 * - Pricing
 * - Dark
 * - Responsive Cards
 * - Sortable
 * - Searchable
 */

import { moveInstrumentation } from '../../scripts/scripts.js';

function getOptions(block) {
  return [...block.classList].filter(
    (className) => !['block', 'table'].includes(className),
  );
}

function createTable(block) {
  const table = document.createElement('table');

  table.setAttribute('role', 'table');

  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  const noHeader = block.classList.contains('no-header');

  [...block.children].forEach((row, rowIndex) => {
    const tr = document.createElement('tr');

    moveInstrumentation(row, tr);

    [...row.children].forEach((cell) => {
      const isHeader = rowIndex === 0 && !noHeader;

      const td = document.createElement(isHeader ? 'th' : 'td');

      if (isHeader) {
        td.setAttribute('scope', 'col');
      }

      td.innerHTML = cell.innerHTML;

      tr.append(td);
    });

    if (rowIndex === 0 && !noHeader) {
      thead.append(tr);
    } else {
      tbody.append(tr);
    }
  });

  table.append(thead, tbody);

  return table;
}

/**
 * Add sortable functionality.
 */
function enableSorting(table) {
  const headers = table.querySelectorAll('thead th');

  headers.forEach((header, columnIndex) => {
    header.classList.add('table-sortable-header');

    header.setAttribute('tabindex', '0');
    header.setAttribute('role', 'button');
    header.setAttribute('aria-sort', 'none');

    const indicator = document.createElement('span');

    indicator.className = 'table-sort-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    indicator.textContent = '↕';

    header.append(indicator);

    const sort = () => {
      const tbody = table.querySelector('tbody');

      if (!tbody) return;

      const rows = [...tbody.querySelectorAll('tr')];

      const currentDirection = header.dataset.sortDirection;

      const direction = currentDirection === 'ascending'
        ? 'descending'
        : 'ascending';

      headers.forEach((item) => {
        item.dataset.sortDirection = '';
        item.setAttribute('aria-sort', 'none');

        const itemIndicator = item.querySelector('.table-sort-indicator');

        if (itemIndicator) {
          itemIndicator.textContent = '↕';
        }
      });

      header.dataset.sortDirection = direction;
      header.setAttribute('aria-sort', direction);

      indicator.textContent = direction === 'ascending' ? '↑' : '↓';

      rows.sort((rowA, rowB) => {
        const cellA = rowA.children[columnIndex];
        const cellB = rowB.children[columnIndex];

        const valueA = cellA
          ? cellA.textContent.trim().toLowerCase()
          : '';

        const valueB = cellB
          ? cellB.textContent.trim().toLowerCase()
          : '';

        return direction === 'ascending'
          ? valueA.localeCompare(valueB, undefined, {
            numeric: true,
            sensitivity: 'base',
          })
          : valueB.localeCompare(valueA, undefined, {
            numeric: true,
            sensitivity: 'base',
          });
      });

      rows.forEach((row) => tbody.append(row));
    };

    header.addEventListener('click', sort);

    header.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        sort();
      }
    });
  });
}

/**
 * Add searchable functionality.
 */
function enableSearch(block, table) {
  const searchWrapper = document.createElement('div');

  searchWrapper.className = 'table-search';

  const label = document.createElement('label');

  label.className = 'table-search-label';
  label.setAttribute('for', `table-search-${Date.now()}`);
  label.textContent = 'Search table';

  const input = document.createElement('input');

  input.type = 'search';
  input.id = label.htmlFor;
  input.className = 'table-search-input';
  input.placeholder = 'Search';
  input.setAttribute('aria-label', 'Search table');

  searchWrapper.append(label, input);

  block.prepend(searchWrapper);

  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();

    table.querySelectorAll('tbody tr').forEach((row) => {
      const rowText = row.textContent.toLowerCase();

      row.hidden = query.length > 0 && !rowText.includes(query);
    });
  });
}

/**
 * Add responsive card presentation.
 */
function enableResponsiveCards(table) {
  const headers = [...table.querySelectorAll('thead th')]
    .map((header) => header.textContent.trim());

  table.querySelectorAll('tbody tr').forEach((row) => {
    [...row.children].forEach((cell, index) => {
      if (headers[index]) {
        cell.setAttribute('data-label', headers[index]);
      }
    });
  });
}

/**
 * Add accessibility metadata.
 */
function enhanceAccessibility(table) {
  const headers = table.querySelectorAll('thead th');

  headers.forEach((header) => {
    if (!header.id) {
      header.id = `table-header-${Math.random()
        .toString(36)
        .substring(2, 9)}`;
    }
  });
}

/**
 * Main table decorator.
 *
 * @param {Element} block
 */
export default async function decorate(block) {
  const options = getOptions(block);

  const table = createTable(block);

  block.replaceChildren(table);

  enhanceAccessibility(table);

  if (options.includes('sortable')) {
    enableSorting(table);
  }

  if (options.includes('searchable')) {
    enableSearch(block, table);
  }

  if (options.includes('responsive-cards')) {
    enableResponsiveCards(table);
  }
}
