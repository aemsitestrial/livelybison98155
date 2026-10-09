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

function getFieldText(row, fallback = '') {
  return row?.textContent?.trim() || fallback;
}

function getBooleanField(row, fallback = false) {
  if (!row) return fallback;

  const input = row.querySelector('input[type="checkbox"]');

  if (input) return input.checked;

  const value = row.textContent.trim().toLowerCase();

  if (['true', 'yes', 'on'].includes(value)) return true;
  if (['false', 'no', 'off'].includes(value)) return false;

  return fallback;
}

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

  return {
    properties: {
      variations: getValue(0, DEFAULTS.variations),
      maxCards: Number.parseInt(
        getValue(1, DEFAULTS.maxCards),
        10,
      ),
      showTags: getBooleanField(
        configRows[2],
        DEFAULTS.showTags,
      ),
      view: getValue(3, DEFAULTS.view),
      cardColor: getValue(4, DEFAULTS.cardColor),
      display: getValue(5, DEFAULTS.display),
      viewAllTitle: getValue(6, DEFAULTS.viewAllTitle),
      viewAllLink:
        configRows[7]?.querySelector('a')?.getAttribute('href')
        || getValue(7, DEFAULTS.viewAllLink),
      motionType: getValue(8, DEFAULTS.motionType),
      listTitle: getValue(9, DEFAULTS.listTitle),
    },
    contentRows,
  };
}

function normalizeProperties(properties) {
  const variation = VALID_VARIATIONS.includes(properties.variations)
    ? properties.variations
    : DEFAULTS.variations;

  const maxCards = Number.isNaN(properties.maxCards)
    ? DEFAULTS.maxCards
    : Math.min(Math.max(properties.maxCards, 1), 4);

  return {
    ...properties,
    variations: variation,
    maxCards,
    showTags: properties.showTags === true
      || String(properties.showTags).toLowerCase() === 'true',
  };
}

function decorateLink(cell, className) {
  cell.classList.add(className);

  const link = cell.querySelector('a');

  if (link) {
    link.classList.remove('button', 'secondary');
  }

  return link;
}

function enhanceCardLink(cell, titleCell) {
  const link = cell.querySelector('a');

  if (link && titleCell.textContent.trim()) {
    link.setAttribute(
      'aria-label',
      titleCell.textContent.trim(),
    );
  }
}

function applyFeaturedIndustry(block) {
  if (!block.classList.contains('featured-industry')) return;

  const cards = block.querySelectorAll('.table-list-card');

  if (cards.length > 0) {
    cards[0].classList.add('table-list-card-featured');
  }
}

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

  if (properties.viewAllLink || legacyLink) {
    const explore = document.createElement('div');
    explore.className = 'table-list-explore';

    const exploreLink = document.createElement('a');
    exploreLink.href = properties.viewAllLink
      || legacyLink?.getAttribute('href')
      || '#';

    exploreLink.textContent = properties.viewAllTitle
      || legacyLink?.textContent?.trim()
      || DEFAULTS.viewAllTitle;

    explore.append(exploreLink);
    header.append(explore);
  }

  return header;
}

function createCardTitleGroup(titleCell, tagValues, showTags) {
  const group = document.createElement('div');
  group.className = 'table-list-title-group';

  if (showTags && tagValues.length > 0) {
    const tags = document.createElement('div');
    tags.className = 'table-list-tags';

    tagValues.forEach((tagText) => {
      const tag = document.createElement('span');
      tag.className = 'table-list-tag';
      tag.textContent = tagText;
      tags.append(tag);
    });

    group.append(tags);
  }

  titleCell.classList.add('table-list-title');
  group.append(titleCell);

  return group;
}

/**
 * Decorate Table List.
 *
 * @param {Element} block Table List block.
 */
export default function decorate(block) {
  const {
    properties: rawProperties,
    contentRows,
  } = readBlockConfig(block);

  const properties = normalizeProperties(rawProperties);

  const selectedVariation = properties.variations;

  block.classList.add('table-list');

  if (selectedVariation) {
    block.classList.add(selectedVariation);
  }

  block.classList.add(`card-${properties.cardColor || 'white'}`);
  block.classList.add(`display-${properties.display || 'title-description'}`);
  block.classList.add(`motion-${properties.motionType || 'none'}`);

  let legacyHeader = null;
  const cardRows = [];

  contentRows.forEach((row) => {
    const cells = [...row.children];

    if (cells.length === 2 && !legacyHeader) {
      legacyHeader = {
        heading: cells[0]?.textContent?.trim() || '',
        linkCell: cells[1],
      };
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

    const tagValues = [
      cells[4]?.textContent?.trim() || '',
      cells[5]?.textContent?.trim() || '',
    ].filter(Boolean);

    row.className = 'table-list-card';

    numberCell.classList.add('table-list-number');

    if (!numberCell.textContent.trim()) {
      const number = document.createElement('span');
      number.textContent = String(index + 1).padStart(2, '0');
      numberCell.append(number);
    }

    descriptionCell.classList.add('table-list-description');

    const titleGroup = createCardTitleGroup(
      titleCell,
      tagValues,
      properties.showTags && selectedVariation === 'title-right',
    );

    /*
     * Keep the title and tags in a single grid column.
     * This avoids changing the existing card column order.
     */
    row.insertBefore(titleGroup, descriptionCell);

    /*
     * The title cell has been moved into titleGroup.
     * Remove the original tag cells from the rendered card.
     */
    cells[4]?.remove();
    cells[5]?.remove();

    decorateLink(linkCell, 'table-list-link');
    enhanceCardLink(linkCell, titleCell);

    cardsContainer.append(row);
  });

  block.append(cardsContainer);

  applyFeaturedIndustry(block);
}
