/* eslint-disable linebreak-style, eol-last -- Windows editor writes CRLF. */

const DEFAULTS = {
  variations: '',
  maxCards: 4,
  showTags: false,
  view: 'list',
  cardColor: 'white',
  display: 'title-description',
  viewAllTitle: 'View all',
  viewAllLink: '',
  motionType: 'none',
  listTitle: 'Our transformation solutions',
  reportCtaTitle: 'View Report',
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
 * Get readable text from an element.
 *
 * @param {Element|null} element Element.
 * @returns {string} Text content.
 */
function getText(element) {
  return element?.textContent?.trim() || '';
}

/**
 * Get the URL from a rich-text field or its text.
 *
 * @param {Element|null} element Field element.
 * @returns {string} URL.
 */
function getFieldLink(element) {
  const link = element?.querySelector('a');

  return link?.getAttribute('href') || getText(element);
}

/**
 * Read parent configuration fields.
 *
 * @param {Element} block Table List block.
 * @returns {Object} Configuration and child rows.
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

  const value = (index) => getText(
    configRows[index]?.children[0],
  );

  const booleanValue = (rawValue, fallback) => {
    if (rawValue === '') return fallback;

    return ['true', 'yes', '1'].includes(
      rawValue.toLowerCase(),
    );
  };

  const rawMaxCards = Number.parseInt(
    value(1),
    10,
  );

  return {
    properties: {
      variations: value(0) || DEFAULTS.variations,
      maxCards: Number.isNaN(rawMaxCards)
        ? DEFAULTS.maxCards
        : Math.min(Math.max(rawMaxCards, 1), 4),
      showTags: booleanValue(
        value(2),
        DEFAULTS.showTags,
      ),
      view: value(3) || DEFAULTS.view,
      cardColor: value(4) || DEFAULTS.cardColor,
      display: value(5) || DEFAULTS.display,
      viewAllTitle: value(6) || DEFAULTS.viewAllTitle,
      viewAllLink: getFieldLink(
        configRows[7]?.children[0],
      ),
      motionType: value(8) || DEFAULTS.motionType,
      listTitle: value(9) || DEFAULTS.listTitle,
      reportCtaTitle: value(10) || DEFAULTS.reportCtaTitle,
    },
    contentRows,
  };
}

/**
 * Validate parent configuration.
 *
 * @param {Object} properties Parent properties.
 * @returns {Object} Validated properties.
 */
function normalizeProperties(properties) {
  return {
    ...properties,
    variations: VALID_VARIATIONS.includes(properties.variations)
      ? properties.variations
      : DEFAULTS.variations,
    maxCards: Math.min(
      Math.max(Number(properties.maxCards) || DEFAULTS.maxCards, 1),
      4,
    ),
    view: ['list', 'table'].includes(properties.view)
      ? properties.view
      : DEFAULTS.view,
    cardColor: VALID_CARD_COLORS.includes(properties.cardColor)
      ? properties.cardColor
      : DEFAULTS.cardColor,
    display: VALID_DISPLAYS.includes(properties.display)
      ? properties.display
      : DEFAULTS.display,
    motionType: VALID_MOTIONS.includes(properties.motionType)
      ? properties.motionType
      : DEFAULTS.motionType,
  };
}

/**
 * Decorate a link cell.
 *
 * @param {Element} cell Link cell.
 * @param {string} className CSS class.
 * @returns {HTMLAnchorElement|null} Link.
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
 * Read the authorable header child.
 *
 * @param {Element} row Header row.
 * @returns {Object} Header data.
 */
function readHeader(row) {
  const cells = [...row.children];

  return {
    row,
    heading: getText(cells[0]),
    linkCell: cells[1] || null,
  };
}

/**
 * Create the rendered header from parent settings and header child.
 *
 * @param {Object} properties Parent configuration.
 * @param {Object|null} authoredHeader Header child data.
 * @returns {HTMLElement} Header.
 */
function createHeader(properties, authoredHeader) {
  const header = document.createElement('div');
  header.className = 'table-list-header';

  const heading = document.createElement('h2');
  heading.className = 'table-list-heading';
  heading.textContent = properties.listTitle
    || authoredHeader?.heading
    || DEFAULTS.listTitle;

  header.append(heading);

  const authoredLink = authoredHeader?.linkCell?.querySelector('a');
  const href = properties.viewAllLink
    || authoredLink?.getAttribute('href')
    || '';

  if (href) {
    const explore = document.createElement('div');
    explore.className = 'table-list-explore';

    const link = document.createElement('a');
    link.href = href;
    link.textContent = properties.viewAllTitle
      || getText(authoredLink)
      || DEFAULTS.viewAllTitle;

    explore.append(link);
    header.append(explore);
  }

  return header;
}

/**
 * Create the tag list for a card.
 *
 * @param {Element} cell1 First tag field.
 * @param {Element} cell2 Second tag field.
 * @returns {HTMLElement} Tag container.
 */
function createTags(cell1, cell2) {
  const tags = document.createElement('div');
  tags.className = 'table-list-tags';

  [getText(cell1), getText(cell2)]
    .filter(Boolean)
    .forEach((text) => {
      const tag = document.createElement('span');
      tag.className = 'table-list-tag';
      tag.textContent = text;
      tags.append(tag);
    });

  return tags;
}

/**
 * Apply the Featured Industry variation.
 *
 * @param {Element} block Table List block.
 */
function applyFeaturedIndustry(block) {
  if (!block.classList.contains('featured-industry')) return;

  const firstCard = block.querySelector('.table-list-card');

  firstCard?.classList.add('table-list-card-featured');
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
 * Convert cards to a table.
 *
 * @param {Element} block Table List block.
 * @param {string} display Display mode.
 */
function applyTableView(block, display) {
  block.classList.add('view-table');

  const cards = [...block.querySelectorAll('.table-list-card')];

  if (!cards.length) return;

  const table = document.createElement('table');
  table.className = 'table-list-table';

  const showTitle = display !== 'description';
  const showDescription = display !== 'title';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

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

    [number, ...(showTitle ? [title] : []), ...(showDescription ? [description] : [])]
      .forEach((source) => {
        const cell = document.createElement('td');
        cell.textContent = getText(source);
        row.append(cell);
      });

    const actionCell = document.createElement('td');

    if (link) {
      const actionLink = link.cloneNode(true);
      actionLink.className = 'table-list-table-link';
      actionLink.removeAttribute('aria-label');
      row.append(actionCell);
      actionCell.append(actionLink);
    } else {
      row.append(actionCell);
    }

    tbody.append(row);
  });

  table.append(thead, tbody);

  block.querySelector('.table-list-cards')?.replaceWith(table);
}

/**
 * Decorate Table List.
 *
 * @param {Element} block Table List block.
 */
export default function decorate(block) {
  const { properties: rawProperties, contentRows } = readBlockConfig(block);
  const properties = normalizeProperties(rawProperties);

  const existingVariation = VALID_VARIATIONS.find(
    (variation) => variation && block.classList.contains(variation),
  ) || '';

  const variation = properties.variations || existingVariation;

  const headerRow = contentRows.find(
    (row) => row.children.length === 2,
  );

  const authoredHeader = headerRow ? readHeader(headerRow) : null;

  const cardRows = contentRows.filter(
    (row) => row.children.length >= 4 && row !== headerRow,
  );

  block.classList.add('table-list');

  if (variation) block.classList.add(variation);

  block.classList.add(`card-${properties.cardColor}`);
  block.classList.add(`motion-${properties.motionType}`);
  applyDisplayMode(block, properties.display);

  if (properties.showTags) {
    block.classList.add('show-tags');
  }

  /*
   * Rebuild the rendered block while retaining the authored child data.
   */
  block.replaceChildren();

  block.append(createHeader(properties, authoredHeader));

  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'table-list-cards';

  cardRows.slice(0, properties.maxCards).forEach((row, index) => {
    const cells = [...row.children];

    row.className = 'table-list-card';

    const numberCell = cells[0];
    const titleCell = cells[1];
    const descriptionCell = cells[2];
    const linkCell = cells[3];

    numberCell.className = 'table-list-number';

    if (!getText(numberCell)) {
      numberCell.textContent = String(index + 1).padStart(2, '0');
    }

    titleCell.className = 'table-list-title';

    /*
     * Tags and description share a wrapper so tags always sit directly
     * above the description in the Title Right variation.
     */
    const descriptionGroup = document.createElement('div');
    descriptionGroup.className = 'table-list-description-group';

    const tags = createTags(cells[4], cells[5]);

    if (properties.showTags && variation === 'title-right') {
      descriptionGroup.append(tags);
    }

    descriptionCell.className = 'table-list-description';
    descriptionGroup.append(descriptionCell);

    const titleGroup = document.createElement('div');
    titleGroup.className = 'table-list-title-group';
    titleGroup.append(titleCell);

    decorateLink(linkCell, 'table-list-link');

    const cardLink = linkCell.querySelector('a');

    if (cardLink && getText(titleCell)) {
      cardLink.setAttribute('aria-label', getText(titleCell));
    }

    row.replaceChildren(
      numberCell,
      titleGroup,
      descriptionGroup,
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