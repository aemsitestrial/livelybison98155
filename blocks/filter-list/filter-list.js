/* eslint-disable linebreak-style, eol-last -- Windows editor writes CRLF. */

const DEFAULT_API_URL = 'https://dummyjson.com/products?limit=20';

/**
 * Read the JSON API URL from the block.
 *
 * The first block property is the API URL.
 *
 * @param {Element} block Filter List block.
 * @returns {string} API URL.
 */
function getApiUrl(block) {
  const firstRow = block.children[0];

  if (!firstRow) {
    return DEFAULT_API_URL;
  }

  const value = firstRow.textContent.trim();

  return value || DEFAULT_API_URL;
}

/**
 * Read authorable filter options.
 *
 * Every Filter Option contains:
 * 1. Filter Label
 * 2. Category Key
 *
 * @param {Element} block Filter List block.
 * @returns {Array} Filter options.
 */
function getFilterOptions(block) {
  const options = [];

  [...block.children].forEach((row) => {
    const cells = [...row.children];

    if (cells.length !== 2) {
      return;
    }

    const label = cells[0].textContent.trim();
    const category = cells[1].textContent.trim();

    if (!label || !category) {
      return;
    }

    options.push({
      label,
      category,
    });
  });

  return options;
}

/**
 * Normalize an API response.
 *
 * Supports:
 * - { products: [] }
 * - { items: [] }
 * - { data: [] }
 * - []
 *
 * @param {Object|Array} data API response.
 * @returns {Array} Normalized items.
 */
function normalizeApiResponse(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.products)) {
    return data.products;
  }

  if (Array.isArray(data.items)) {
    return data.items;
  }

  if (Array.isArray(data.data)) {
    return data.data;
  }

  return [];
}

/**
 * Get the first available image from an API item.
 *
 * @param {Object} item API item.
 * @returns {string} Image URL.
 */
function getItemImage(item) {
  if (item.thumbnail) {
    return item.thumbnail;
  }

  if (item.image) {
    return item.image;
  }

  if (Array.isArray(item.images) && item.images.length > 0) {
    return item.images[0];
  }

  return '';
}

/**
 * Get the item title.
 *
 * @param {Object} item API item.
 * @returns {string} Title.
 */
function getItemTitle(item) {
  return (
    item.title
        || item.name
        || item.headline
        || 'Untitled'
  );
}

/**
 * Get the item category.
 *
 * @param {Object} item API item.
 * @returns {string} Category.
 */
function getItemCategory(item) {
  if (typeof item.category === 'string') {
    return item.category;
  }

  if (Array.isArray(item.categories)) {
    return item.categories.join(', ');
  }

  if (Array.isArray(item.tags)) {
    return item.tags.join(', ');
  }

  return '';
}

/**
 * Get the item URL.
 *
 * @param {Object} item API item.
 * @returns {string} URL.
 */
function getItemLink(item) {
  if (item.url) {
    return item.url;
  }

  if (item.link) {
    return item.link;
  }

  if (item.id) {
    return `https://dummyjson.com/products/${item.id}`;
  }

  return '#';
}

/**
 * Format a category for display.
 *
 * @param {string} category Category key.
 * @returns {string} Display category.
 */
function formatCategory(category) {
  return category
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => (
      item
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
    ))
    .join('  ');
}

/**
 * Create a content card.
 *
 * @param {Object} item API item.
 * @returns {HTMLElement} Card.
 */
function createCard(item) {
  const card = document.createElement('article');
  card.className = 'filter-list-card';

  const link = document.createElement('a');
  link.className = 'filter-list-card-link';
  link.href = getItemLink(item);
  link.target = '_self';
  link.setAttribute(
    'aria-label',
    getItemTitle(item),
  );

  const imageWrapper = document.createElement('div');
  imageWrapper.className = 'filter-list-card-image';

  const image = document.createElement('img');
  image.src = getItemImage(item);
  image.alt = getItemTitle(item);
  image.loading = 'lazy';
  image.decoding = 'async';

  imageWrapper.append(image);

  const content = document.createElement('div');
  content.className = 'filter-list-card-content';

  const category = getItemCategory(item);

  if (category) {
    const categoryElement = document.createElement('div');

    categoryElement.className = 'filter-list-card-category';

    categoryElement.textContent = formatCategory(category);

    content.append(categoryElement);
  }

  const title = document.createElement('h2');

  title.className = 'filter-list-card-title';
  title.textContent = getItemTitle(item);

  content.append(title);

  link.append(
    imageWrapper,
    content,
  );

  card.append(link);

  return card;
}

/**
 * Render cards.
 *
 * @param {HTMLElement} grid Card grid.
 * @param {Array} items Items.
 * @param {string} activeCategory Active category.
 */
function renderCards(
  grid,
  items,
  activeCategory,
) {
  grid.replaceChildren();

  const normalizedCategory = activeCategory.toLowerCase().trim();

  const filteredItems = normalizedCategory === 'all'
    ? items
    : items.filter((item) => {
      const category = getItemCategory(item).toLowerCase();

      return category
        .split(',')
        .map((value) => value.trim())
        .includes(normalizedCategory);
    });

  if (filteredItems.length === 0) {
    const empty = document.createElement('p');

    empty.className = 'filter-list-empty';
    empty.textContent = 'No content available for this filter.';

    grid.append(empty);
    return;
  }

  filteredItems.forEach((item) => {
    grid.append(createCard(item));
  });
}

/**
 * Create filter navigation.
 *
 * @param {HTMLElement} navigation Filter navigation.
 * @param {Array} options Filter options.
 * @param {Array} items API items.
 * @param {HTMLElement} grid Card grid.
 */
function createFilters(
  navigation,
  options,
  items,
  grid,
) {
  navigation.replaceChildren();

  options.forEach((option, index) => {
    const button = document.createElement('button');

    button.type = 'button';
    button.className = 'filter-list-filter';
    button.textContent = option.label;
    button.dataset.category = option.category.toLowerCase().trim();

    if (index === 0) {
      button.classList.add('active');
      button.setAttribute('aria-current', 'true');
    }

    button.addEventListener('click', () => {
      navigation
        .querySelectorAll('.filter-list-filter')
        .forEach((filter) => {
          filter.classList.remove('active');
          filter.removeAttribute('aria-current');
        });

      button.classList.add('active');
      button.setAttribute('aria-current', 'true');

      renderCards(
        grid,
        items,
        button.dataset.category,
      );
    });

    navigation.append(button);
  });
}

/**
 * Create loading state.
 *
 * @param {HTMLElement} grid Card grid.
 */
function showLoading(grid) {
  grid.replaceChildren();

  const loading = document.createElement('p');

  loading.className = 'filter-list-status';
  loading.textContent = 'Loading content...';

  grid.append(loading);
}

/**
 * Create error state.
 *
 * @param {HTMLElement} grid Card grid.
 */
function showError(grid) {
  grid.replaceChildren();

  const error = document.createElement('p');

  error.className = 'filter-list-status';
  error.textContent = 'Unable to load content. Please try again later.';

  grid.append(error);
}

/**
 * Decorate Filter List.
 *
 * @param {Element} block Filter List block.
 */
export default async function decorate(block) {
  const apiUrl = getApiUrl(block);

  const filterOptions = getFilterOptions(block);

  /*
     * Preserve authored configuration before
     * replacing the block markup.
     */
  block.innerHTML = '';

  block.classList.add('filter-list');

  /*
     * Filter selection area.
     */
  const filterBar = document.createElement('div');

  filterBar.className = 'filter-list-bar';

  const filterInner = document.createElement('div');

  filterInner.className = 'filter-list-bar-inner';

  const filterLabel = document.createElement('span');

  filterLabel.className = 'filter-list-label';
  filterLabel.textContent = 'Filters';

  const navigation = document.createElement('nav');

  navigation.className = 'filter-list-navigation';
  navigation.setAttribute(
    'aria-label',
    'Content filters',
  );

  const filterIcon = document.createElement('button');

  filterIcon.type = 'button';
  filterIcon.className = 'filter-list-icon';
  filterIcon.setAttribute(
    'aria-label',
    'Filter options',
  );
  filterIcon.setAttribute(
    'title',
    'Filter options',
  );

  filterIcon.innerHTML = `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M4 5h16l-6.5 7.2V18l-3 1.5v-7.3L4 5z"
      />
    </svg>
  `;

  filterInner.append(
    filterLabel,
    navigation,
    filterIcon,
  );

  filterBar.append(filterInner);

  /*
     * Content section.
     */
  const content = document.createElement('div');

  content.className = 'filter-list-content';

  const grid = document.createElement('div');

  grid.className = 'filter-list-grid';

  content.append(grid);

  block.append(
    filterBar,
    content,
  );

  showLoading(grid);

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status}`,
      );
    }

    const data = await response.json();

    const items = normalizeApiResponse(data);

    if (items.length === 0) {
      showError(grid);
      return;
    }

    /*
         * If no filters have been authored,
         * automatically create an All filter
         * plus filters from API categories.
         */
    let options = filterOptions;

    if (options.length === 0) {
      const categories = [
        ...new Set(
          items
            .map((item) => getItemCategory(item))
            .filter(Boolean),
        ),
      ];

      options = [
        {
          label: 'All',
          category: 'all',
        },
        ...categories.map((category) => ({
          label: formatCategory(category),
          category,
        })),
      ];
    }

    createFilters(
      navigation,
      options,
      items,
      grid,
    );

    const firstCategory = options[0]?.category || 'all';

    renderCards(
      grid,
      items,
      firstCategory,
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      'Filter List API error:',
      error,
    );

    showError(grid);
  }
}
