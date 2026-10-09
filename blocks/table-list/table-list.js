/* eslint-disable linebreak-style, eol-last -- Windows editor writes CRLF. */

const DEFAULTS = {
  variations: '',
  maxCards: 4,
  view: 'list',
  cardColor: 'white',
  display: 'title-description',
  viewAllTitle: 'View all',
  viewAllLink: '',
  motionType: 'none',
  listTitle: 'Our transformation solutions',
  tags: false,
};

const VALID_VARIATIONS = [
  '',
  'compact',
  'no-description',
  'dark',
  'featured-industry',
  'no-number',
  'description-first',
  'title-right',
];

const VALID_VIEWS = ['list', 'table'];

const VALID_CARD_COLORS = [
  'white',
  'blue',
  'black',
  'grey',
];

const VALID_DISPLAYS = [
  'title-description',
  'title',
  'description',
];

const VALID_MOTIONS = [
  'none',
  'fade',
  'slide',
  'reveal',
];

/**
 * Read the text content of a model field row.
 *
 * @param {Element} row Model field row.
 * @param {string} fallback Fallback value.
 * @returns {string} Field value.
 */
function getFieldText(row, fallback = '') {
  const value = row?.textContent?.trim();

  return value || fallback;
}

/**
 * Convert an authored value into a boolean.
 *
 * @param {string} value Authored value.
 * @returns {boolean} Whether the value is enabled.
 */
function toBoolean(value) {
  return [
    'true',
    'yes',
    'on',
    'enabled',
    '1',
  ].includes(String(value).trim().toLowerCase());
}

/**
 * Read parent properties and child content rows.
 *
 * Parent fields must remain in the same order as
 * the fields in _table-list.json.
 *
 * The Tags toggle is expected after List Title.
 *
 * @param {Element} block Table List block.
 * @returns {Object} Properties and content rows.
 */
function readBlockConfig(block) {
  const configRows = [];
  const contentRows = [];

  [...block.children].forEach((row) => {
    const cells = [...row.children];

    if (cells.length === 1) {
      configRows.push(row);
    } else {
      contentRows.push(row);
    }
  });

  const getValue = (index, fallback) => getFieldText(
    configRows[index],
    String(fallback),
  );

  const linkRow = configRows[6];
  const link = linkRow?.querySelector('a');

  return {
    properties: {
      variations: getValue(0, DEFAULTS.variations),

      maxCards: Number.parseInt(
        getValue(1, DEFAULTS.maxCards),
        10,
      ),

      view: getValue(2, DEFAULTS.view),

      cardColor: getValue(3, DEFAULTS.cardColor),

      display: getValue(4, DEFAULTS.display),

      viewAllTitle: getValue(
        5,
        DEFAULTS.viewAllTitle,
      ),

      viewAllLink: link?.getAttribute('href')
        || '',

      motionType: getValue(7, DEFAULTS.motionType),

      listTitle: getValue(8, DEFAULTS.listTitle),

      tags: toBoolean(getValue(9, DEFAULTS.tags)),
    },

    contentRows,
  };
}

/**
 * Normalize parent properties.
 *
 * @param {Object} properties Raw properties.
 * @returns {Object} Normalized properties.
 */
function normalizeProperties(properties) {
  const variation = VALID_VARIATIONS.includes(
    properties.variations,
  )
    ? properties.variations
    : DEFAULTS.variations;

  const parsedMax = Number.isNaN(properties.maxCards)
    ? DEFAULTS.maxCards
    : properties.maxCards;

  return {
    ...properties,

    variations: variation,

    maxCards: Math.min(
      Math.max(parsedMax, 1),
      4,
    ),

    view: VALID_VIEWS.includes(properties.view)
      ? properties.view
      : DEFAULTS.view,

    cardColor: VALID_CARD_COLORS.includes(
      properties.cardColor,
    )
      ? properties.cardColor
      : DEFAULTS.cardColor,

    display: VALID_DISPLAYS.includes(properties.display)
      ? properties.display
      : DEFAULTS.display,

    motionType: VALID_MOTIONS.includes(
      properties.motionType,
    )
      ? properties.motionType
      : DEFAULTS.motionType,

    tags: Boolean(properties.tags),
  };
}

/**
 * Decorate a link cell.
 *
 * @param {Element} cell Link cell.
 * @param {string} className CSS class.
 * @returns {HTMLAnchorElement|null} Link element.
 */
function decorateLink(cell, className) {
  cell.classList.add(className);

  const link = cell.querySelector('a');

  if (link) {
    link.classList.remove('button', 'secondary');
  }

  return link;
}

/**
 * Add an accessible label to a card link.
 *
 * @param {Element} cell Link cell.
 * @param {Element} titleCell Title cell.
 */
function enhanceCardLink(cell, titleCell) {
  const link = cell.querySelector('a');
  const title = titleCell?.textContent?.trim();

  if (link && title) {
    link.setAttribute('aria-label', title);
  }
}

/**
 * Read the legacy header row.
 *
 * @param {Element} row Header row.
 * @returns {Object} Legacy header data.
 */
function readLegacyHeader(row) {
  const cells = [...row.children];

  return {
    heading: cells[0]?.textContent?.trim() || '',
    linkCell: cells[1] || null,
  };
}

/**
 * Create the parent header and View All CTA.
 *
 * @param {Object} properties Parent properties.
 * @param {Object|null} legacyHeader Legacy header data.
 * @returns {HTMLElement} Header element.
 */
function createHeader(properties, legacyHeader) {
  const header = document.createElement('div');
  header.className = 'table-list-header';

  const heading = document.createElement('h2');
  heading.className = 'table-list-heading';

  heading.textContent = properties.listTitle
    || legacyHeader?.heading
    || DEFAULTS.listTitle;

  header.append(heading);

  const legacyLink = legacyHeader?.linkCell?.querySelector('a');
  const href = properties.viewAllLink || legacyLink?.getAttribute('href');
  const title = properties.viewAllTitle
    || legacyLink?.textContent?.trim()
    || DEFAULTS.viewAllTitle;

  if (href) {
    const explore = document.createElement('div');
    explore.className = 'table-list-explore';

    const exploreLink = document.createElement('a');
    exploreLink.href = href;
    exploreLink.textContent = title;

    explore.append(exploreLink);
    header.append(explore);
  }

  return header;
}

/**
 * Parse author-entered tags.
 *
 * Tags can be separated by commas, semicolons,
 * or line breaks in the child-card Tags field.
 *
 * @param {Element|null} tagsCell Tags field cell.
 * @returns {string[]} Tag labels.
 */
function parseTags(tagsCell) {
  if (!tagsCell) {
    return [];
  }

  const text = tagsCell.textContent.trim();

  if (!text) {
    return [];
  }

  return text
    .split(/[,;\n\r]+/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

/**
 * Create the tags container.
 *
 * @param {string[]} tags Tag labels.
 * @returns {HTMLElement} Tags container.
 */
function createTags(tags) {
  const container = document.createElement('div');
  container.className = 'table-list-tags';

  tags.forEach((label) => {
    const tag = document.createElement('span');
    tag.className = 'table-list-tag';
    tag.textContent = label;
    container.append(tag);
  });

  return container;
}

/**
 * Build a card's description and optional tags group.
 *
 * The tags are placed directly above the description.
 *
 * @param {Element} descriptionCell Description cell.
 * @param {Element|null} tagsCell Tags field cell.
 * @param {boolean} showTags Parent Tags toggle.
 * @returns {HTMLElement} Description group.
 */
function createDescriptionGroup(
  descriptionCell,
  tagsCell,
  showTags,
) {
  const group = document.createElement('div');
  group.className = 'table-list-description-group';

  if (showTags) {
    const tags = parseTags(tagsCell);
    group.append(createTags(tags));
  }

  descriptionCell.classList.add('table-list-description');
  group.append(descriptionCell);

  return group;
}

/**
 * Apply the Featured Industry variation.
 *
 * @param {Element} block Table List block.
 */
function applyFeaturedIndustry(block) {
  if (!block.classList.contains('featured-industry')) {
    return;
  }

  const firstCard = block.querySelector('.table-list-card');

  if (firstCard) {
    firstCard.classList.add('table-list-card-featured');
  }
}

/**
 * Apply the display mode.
 *
 * @param {Element} block Table List block.
 * @param {string} display Display mode.
 */
function applyDisplayMode(block, display) {
  block.classList.add(`display-${display}`);
}

/**
 * Apply the card color.
 *
 * @param {Element} block Table List block.
 * @param {string} color Card color.
 */
function applyCardColor(block, color) {
  block.classList.add(`card-${color}`);
}

/**
 * Apply the motion type.
 *
 * @param {Element} block Table List block.
 * @param {string} motion Motion type.
 */
function applyMotion(block, motion) {
  block.classList.add(`motion-${motion}`);
}

/**
 * Convert the cards into a semantic table.
 *
 * @param {Element} block Table List block.
 * @param {string} display Display mode.
 */
function applyTableView(block, display) {
  block.classList.add('view-table');

  const cards = [...block.querySelectorAll('.table-list-card')];

  if (!cards.length) {
    return;
  }

  const table = document.createElement('table');
  table.className = 'table-list-table';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  const showTitle = display !== 'description';
  const showDescription = display !== 'title';

  ['Number']
    .concat(showTitle ? ['Title'] : [])
    .concat(showDescription ? ['Description'] : [])
    .concat([''])
    .forEach((label) => {
      const th = document.createElement('th');
      th.textContent = label;
      headerRow.append(th);
    });

  thead.append(headerRow);

  const tbody = document.createElement('tbody');

  cards.forEach((card) => {
    const row = document.createElement('tr');

    const number = card.querySelector('.table-list-number');
    const title = card.querySelector('.table-list-title');
    const description = card.querySelector('.table-list-description');
    const link = card.querySelector('.table-list-link a');

    const sources = [number];

    if (showTitle) {
      sources.push(title);
    }

    if (showDescription) {
      sources.push(description);
    }

    sources.forEach((source) => {
      const cell = document.createElement('td');
      cell.textContent = source?.textContent?.trim() || '';
      row.append(cell);
    });

    const actionCell = document.createElement('td');

    if (link) {
      const actionLink = link.cloneNode(true);
      actionLink.className = 'table-list-table-link';
      actionCell.append(actionLink);
    }

    row.append(actionCell);
    tbody.append(row);
    card.remove();
  });

  table.append(thead, tbody);

  const cardsContainer = block.querySelector('.table-list-cards');

  if (cardsContainer) {
    cardsContainer.replaceWith(table);
  } else {
    block.append(table);
  }
}

/**
 * Decorate Table List.
 *
 * Card field order:
 * Number, Title, Description, Card Link, Tags.
 *
 * Tags is an optional fifth child-card field.
 *
 * @param {Element} block Table List block.
 */
export default function decorate(block) {
  const {
    properties: rawProperties,
    contentRows,
  } = readBlockConfig(block);

  const properties = normalizeProperties(rawProperties);

  const legacyVariation = VALID_VARIATIONS.find(
    (variation) => variation
      && block.classList.contains(variation),
  ) || '';

  const selectedVariation = properties.variations
    || legacyVariation;

  block.classList.add('table-list');

  if (selectedVariation) {
    block.classList.add(selectedVariation);
  }

  applyDisplayMode(block, properties.display);
  applyCardColor(block, properties.cardColor);
  applyMotion(block, properties.motionType);

  let legacyHeader = null;
  const cardRows = [];

  contentRows.forEach((row) => {
    const cells = [...row.children];

    if (cells.length === 2 && !legacyHeader) {
      legacyHeader = readLegacyHeader(row);
      return;
    }

    if (cells.length >= 4) {
      cardRows.push(row);
    }
  });

  block.replaceChildren();

  block.append(createHeader(properties, legacyHeader));

  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'table-list-cards';

  cardRows.slice(0, properties.maxCards).forEach((row, index) => {
    const cells = [...row.children];

    const numberCell = cells[0];
    const titleCell = cells[1];
    const descriptionCell = cells[2];
    const linkCell = cells[3];
    const tagsCell = cells[4] || null;

    row.className = 'table-list-card';

    /* Number */
    numberCell.className = 'table-list-number';

    if (!numberCell.textContent.trim()) {
      const number = document.createElement('span');
      number.textContent = String(index + 1).padStart(2, '0');
      numberCell.append(number);
    }

    /* Title group */
    titleCell.classList.add('table-list-title');

    const titleGroup = document.createElement('div');
    titleGroup.className = 'table-list-title-group';
    titleGroup.append(titleCell);

    /* Description and tags */
    let descriptionGroup;

    if (selectedVariation === 'title-right') {
      descriptionGroup = createDescriptionGroup(
        descriptionCell,
        tagsCell,
        properties.tags,
      );
    } else {
      descriptionCell.classList.add('table-list-description');
      descriptionGroup = descriptionCell;
    }

    /* Link */
    decorateLink(linkCell, 'table-list-link');
    enhanceCardLink(linkCell, titleCell);

    /*
     * Rebuild the card in a predictable order.
     * CSS grid positions each element for its variation.
     */
    row.replaceChildren(
      numberCell,
      descriptionGroup,
      titleGroup,
      linkCell,
    );

    cardsContainer.append(row);
  });

  block.append(cardsContainer);

  applyFeaturedIndustry(block);

  if (properties.view === 'table') {
    applyTableView(block, properties.display);
  }
}