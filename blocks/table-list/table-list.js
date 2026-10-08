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
];

const VALID_VIEWS = [
  'list',
  'table',
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
 * Get text from a model field row.
 *
 * @param {Element} row Field row.
 * @param {string} fallback Fallback value.
 * @returns {string} Field text.
 */
function getFieldText(row, fallback = '') {
  const text = row?.textContent?.trim();

  return text || fallback;
}

/**
 * Read authored Table List properties.
 *
 * Universal Editor renders block model fields
 * before child components.
 *
 * @param {Element} block Table List block.
 * @returns {Object} Block properties and content rows.
 */
function readBlockConfig(block) {
  const configRows = [];
  const contentRows = [];

  [...block.children].forEach((row) => {
    const cells = [...row.children];

    /*
     * Parent model fields are single-cell rows.
     * Header/card child components have multiple cells.
     */
    if (cells.length === 1) {
      configRows.push(row);
    } else {
      contentRows.push(row);
    }
  });

  const getConfigValue = (index, fallback) => getFieldText(
    configRows[index],
    fallback,
  );

  return {
    properties: {
      variations: getConfigValue(
        0,
        DEFAULTS.variations,
      ),

      maxCards: Number.parseInt(
        getConfigValue(
          1,
          String(DEFAULTS.maxCards),
        ),
        10,
      ),

      view: getConfigValue(
        2,
        DEFAULTS.view,
      ),

      cardColor: getConfigValue(
        3,
        DEFAULTS.cardColor,
      ),

      display: getConfigValue(
        4,
        DEFAULTS.display,
      ),

      viewAllTitle: getConfigValue(
        5,
        DEFAULTS.viewAllTitle,
      ),

      viewAllLink:
        configRows[6]?.querySelector('a')?.href
        || getConfigValue(
          6,
          DEFAULTS.viewAllLink,
        ),

      motionType: getConfigValue(
        7,
        DEFAULTS.motionType,
      ),

      listTitle: getConfigValue(
        8,
        DEFAULTS.listTitle,
      ),

      reportCtaTitle: getConfigValue(
        9,
        DEFAULTS.reportCtaTitle,
      ),
    },

    contentRows,
  };
}

/**
 * Normalize Table List properties.
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

  const maxCards = Number.isNaN(
    properties.maxCards,
  )
    ? DEFAULTS.maxCards
    : Math.min(
      Math.max(properties.maxCards, 1),
      4,
    );

  const view = VALID_VIEWS.includes(properties.view)
    ? properties.view
    : DEFAULTS.view;

  const cardColor = VALID_CARD_COLORS.includes(
    properties.cardColor,
  )
    ? properties.cardColor
    : DEFAULTS.cardColor;

  const display = VALID_DISPLAYS.includes(
    properties.display,
  )
    ? properties.display
    : DEFAULTS.display;

  const motionType = VALID_MOTIONS.includes(
    properties.motionType,
  )
    ? properties.motionType
    : DEFAULTS.motionType;

  return {
    ...properties,
    variations: variation,
    maxCards,
    view,
    cardColor,
    display,
    motionType,
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
    link.classList.remove(
      'button',
      'secondary',
    );
  }

  return link;
}

/**
 * Add accessibility label to a card link.
 *
 * @param {Element} cell Link cell.
 * @param {Element} titleCell Title cell.
 */
function enhanceCardLink(
  cell,
  titleCell,
) {
  const link = cell.querySelector('a');

  if (
    link
    && titleCell.textContent.trim()
  ) {
    link.setAttribute(
      'aria-label',
      titleCell.textContent.trim(),
    );
  }
}

/**
 * Read legacy header content.
 *
 * @param {Element} row Header row.
 * @returns {Object} Header data.
 */
function readLegacyHeader(row) {
  const cells = [...row.children];

  return {
    heading:
      cells[0]?.textContent?.trim()
      || '',

    linkCell:
      cells[1]
      || null,
  };
}

/**
 * Apply Featured Industry variation.
 *
 * @param {Element} block Table List block.
 */
function applyFeaturedIndustry(block) {
  if (
    !block.classList.contains(
      'featured-industry',
    )
  ) {
    return;
  }

  const cards = block.querySelectorAll(
    '.table-list-card',
  );

  if (cards.length > 0) {
    cards[0].classList.add(
      'table-list-card-featured',
    );
  }
}

/**
 * Create Table List header.
 *
 * @param {Object} properties Table List properties.
 * @param {Object|null} legacyHeader Legacy header.
 * @returns {HTMLElement} Header element.
 */
function createHeader(
  properties,
  legacyHeader,
) {
  const header = document.createElement('div');

  header.className = 'table-list-header';

  const heading = document.createElement('h2');

  heading.className = 'table-list-heading';

  heading.textContent = properties.listTitle
    || legacyHeader?.heading
    || DEFAULTS.listTitle;

  header.append(heading);

  const legacyLink = legacyHeader?.linkCell?.querySelector('a');

  if (
    properties.viewAllLink
    || legacyLink
  ) {
    const explore = document.createElement('div');

    explore.className = 'table-list-explore';

    const exploreLink = document.createElement('a');

    exploreLink.href = properties.viewAllLink
      || legacyLink?.href
      || '#';

    exploreLink.textContent = properties.viewAllTitle
      || legacyLink?.textContent?.trim()
      || DEFAULTS.viewAllTitle;

    explore.append(exploreLink);

    header.append(explore);
  }

  return header;
}

/**
 * Create report CTA.
 *
 * @param {Element} card Card element.
 * @param {string} title CTA title.
 */
function createReportCta(
  card,
  title,
) {
  const link = card.querySelector(
    '.table-list-link a',
  );

  if (!link || !title) {
    return;
  }

  const cta = document.createElement('span');

  cta.className = 'table-list-report-cta';

  cta.textContent = title;

  link.append(cta);
}

/**
 * Apply display mode.
 *
 * @param {Element} block Table List block.
 * @param {string} display Display mode.
 */
function applyDisplayMode(
  block,
  display,
) {
  block.classList.add(
    `display-${display}`,
  );
}

/**
 * Apply card color.
 *
 * @param {Element} block Table List block.
 * @param {string} cardColor Card color.
 */
function applyCardColor(
  block,
  cardColor,
) {
  block.classList.add(
    `card-${cardColor}`,
  );
}

/**
 * Apply motion.
 *
 * @param {Element} block Table List block.
 * @param {string} motionType Motion type.
 */
function applyMotion(
  block,
  motionType,
) {
  block.classList.add(
    `motion-${motionType}`,
  );
}

/**
 * Convert the cards to a table view.
 *
 * @param {Element} block Table List block.
 * @param {string} display Display mode.
 */
function applyTableView(
  block,
  display,
) {
  block.classList.add('view-table');

  const cards = [
    ...block.querySelectorAll(
      '.table-list-card',
    ),
  ];

  if (cards.length === 0) {
    return;
  }

  const table = document.createElement('table');

  table.className = 'table-list-table';

  const thead = document.createElement('thead');

  const headerRow = document.createElement('tr');

  const showTitle = display !== 'description';

  const showDescription = display !== 'title';

  ['Number']
    .concat(
      showTitle
        ? ['Title']
        : [],
    )
    .concat(
      showDescription
        ? ['Description']
        : [],
    )
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

    const number = card.querySelector(
      '.table-list-number',
    );

    const title = card.querySelector(
      '.table-list-title',
    );

    const description = card.querySelector(
      '.table-list-description',
    );

    const link = card.querySelector(
      '.table-list-link a',
    );

    const sources = [number];

    if (showTitle) {
      sources.push(title);
    }

    if (showDescription) {
      sources.push(description);
    }

    sources.forEach((source) => {
      const cell = document.createElement('td');

      cell.innerHTML = source?.innerHTML || '';

      row.append(cell);
    });

    const actionCell = document.createElement('td');

    if (link) {
      const actionLink = link.cloneNode(true);

      actionLink.className = 'table-list-table-link';

      actionLink.removeAttribute(
        'aria-label',
      );

      actionCell.append(actionLink);
    }

    row.append(actionCell);
    tbody.append(row);

    card.remove();
  });

  table.append(
    thead,
    tbody,
  );

  const cardsContainer = block.querySelector(
    '.table-list-cards',
  );

  if (cardsContainer) {
    cardsContainer.replaceWith(table);
  } else {
    block.append(table);
  }
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

  const properties = normalizeProperties(
    rawProperties,
  );

  /*
   * Preserve old variation classes if
   * existing content already contains one.
   */
  const legacyVariation = VALID_VARIATIONS.find(
    (variation) => variation
        && block.classList.contains(
          variation,
        ),
  ) || '';

  const selectedVariation = properties.variations
    || legacyVariation
    || '';

  block.classList.add(
    'table-list',
  );

  if (selectedVariation) {
    block.classList.add(
      selectedVariation,
    );
  }

  applyDisplayMode(
    block,
    properties.display,
  );

  applyCardColor(
    block,
    properties.cardColor,
  );

  applyMotion(
    block,
    properties.motionType,
  );

  /*
   * Detect legacy header.
   */
  let legacyHeader = null;

  const cardRows = [];

  contentRows.forEach((row) => {
    const cells = [...row.children];

    if (
      cells.length === 2
      && !legacyHeader
    ) {
      row.classList.add(
        'table-list-header',
      );

      cells[0].classList.add(
        'table-list-heading',
      );

      decorateLink(
        cells[1],
        'table-list-explore',
      );

      legacyHeader = readLegacyHeader(row);

      return;
    }

    if (cells.length >= 4) {
      cardRows.push(row);
    }
  });

  /*
   * Clear authored source rows.
   */
  block.replaceChildren();

  /*
   * Render parent-level header.
   */
  block.append(
    createHeader(
      properties,
      legacyHeader,
    ),
  );

  /*
   * Card container.
   */
  const cardsContainer = document.createElement('div');

  cardsContainer.className = 'table-list-cards';

  /*
   * Respect Maximum Cards.
   */
  const rowsToRender = cardRows.slice(
    0,
    properties.maxCards,
  );

  rowsToRender.forEach(
    (row, index) => {
      const cells = [...row.children];

      const cardIndex = index + 1;

      row.className = 'table-list-card';

      /*
       * Number.
       */
      cells[0].className = 'table-list-number';

      if (
        !cells[0].textContent.trim()
      ) {
        const number = document.createElement(
          'span',
        );

        number.textContent = String(cardIndex).padStart(
          2,
          '0',
        );

        cells[0].append(number);
      }

      /*
       * Title.
       */
      cells[1].className = 'table-list-title';

      /*
       * Description.
       */
      cells[2].className = 'table-list-description';

      /*
       * Link.
       */
      decorateLink(
        cells[3],
        'table-list-link',
      );

      enhanceCardLink(
        cells[3],
        cells[1],
      );

      /*
       * Report CTA.
       */
      createReportCta(
        row,
        properties.reportCtaTitle,
      );

      cardsContainer.append(row);
    },
  );

  block.append(cardsContainer);

  /*
   * Featured Industry.
   */
  applyFeaturedIndustry(block);

  /*
   * Table view.
   */
  if (
    properties.view === 'table'
  ) {
    applyTableView(
      block,
      properties.display,
    );
  }
}