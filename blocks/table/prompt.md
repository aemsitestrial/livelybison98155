I am building an AEM Edge Delivery Services (EDS) component for Universal Editor called "Table".

Please generate a complete production-ready implementation including JSON configuration, CSS, JavaScript, component registration entries, and all architectural decisions following AEM EDS and Universal Editor best practices.

==================================================
COMPONENT OVERVIEW
==================================================

Component Name:
table

Purpose:
A reusable enterprise-grade table component that supports multiple column configurations and multiple visual/behavioral variations.

The component should remain a SINGLE component.

DO NOT create separate components such as:

- pricing-table
- comparison-table
- searchable-table
- dark-table

Instead create:

- one table component
- one CSS file
- one JS file

and implement all variants through:

- block classes
- CSS modifiers
- conditional JS logic when required

==================================================
CURRENT FUNCTIONALITY
==================================================

The existing table component already supports:

1. 1 Column
2. 2 Columns
3. 3 Columns
4. 4 Columns

Current variations:

- striped
- bordered
- no-header

Data is authorable through table rows.

The first row acts as header when "no-header" is not selected.

==================================================
UNIVERSAL EDITOR REQUIREMENTS
==================================================

The project uses Universal Editor Sandbox.

Constraints:

- Respect XWalk rules.
- Respect max-cells limitations.
- Follow block/item architecture when needed.
- Do not create models that violate Universal Editor restrictions.

Generate:

- _table.json
- component-definition.json entries
- component-models.json entries
- component-filters.json entries

==================================================
ARCHITECTURE REQUIREMENTS
==================================================

Follow the architecture below:

table/
├── _table.json
├── table.css
└── table.js

Use:

One component
One JS file
One CSS file

Variant examples:

table
table striped
table bordered
table no-header
table compact
table hoverable
table comparison
table pricing
table searchable
table sortable
table dark
table responsive-cards

==================================================
SUPPORTED VARIATIONS
==================================================

==================================================
1. DEFAULT
==================================================

Standard table.

Example:

Name | Role | Location

Ayush | Developer | Hyderabad
Hari | QA Engineer | Chennai

==================================================
2. STRIPED
==================================================

Alternating row colors.

Example:

Row 1
Row 2 (striped)
Row 3

Purpose:
Better readability.

==================================================
3. BORDERED
==================================================

Display borders around all cells.

Purpose:
Enterprise reporting
Financial tables
Audits

==================================================
4. NO HEADER
==================================================

Treat every row as normal row.

No dedicated header styling.

==================================================
5. COMPACT
==================================================

Reduced spacing.

Characteristics:

- smaller font
- smaller row height
- smaller padding

Use case:

Dense datasets

==================================================
6. HOVERABLE
==================================================

Highlight row on hover.

Example:

Hover row
→ row background changes

Use case:

Interactive enterprise tables

==================================================
7. COMPARISON
==================================================

Feature comparison table.

Example:

Feature | Basic | Premium | Enterprise

Storage | 10GB | 100GB | Unlimited

Use case:

Product comparison
Subscription plans

==================================================
8. PRICING
==================================================

Pricing-oriented style.

Example:

Basic      $10
Premium    $30
Enterprise $99

Use case:

Service plans
Subscriptions

==================================================
9. DARK
==================================================

Dark theme table.

Characteristics:

- dark background
- white text

Use case:

Dark themed corporate websites

==================================================
10. RESPONSIVE-CARDS
==================================================

Desktop:

Name | Role | Location

Mobile:

-----------------
Name: Ayush
Role: Developer
Location: Hyderabad
-----------------

Use case:

Mobile-first experiences

Requires:
CSS and possibly JS support.

==================================================
11. SORTABLE
==================================================

Allow sorting by clicking column headers.

Example:

Name ↑
Name ↓

Requirements:

- ascending
- descending
- visual indicators

Must be implemented inside the same JS file.

==================================================
12. SEARCHABLE
==================================================

Adds a search field above table.

Example:

[ Search ]

User enters text.

Matching rows remain visible.

Requirements:

- live search
- client-side filtering
- case-insensitive

Must be implemented inside the same JS file.

==================================================
CSS REQUIREMENTS
==================================================

Use a modifier approach.

Examples:

.table
.table.striped
.table.bordered
.table.compact
.table.hoverable
.table.comparison
.table.pricing
.table.dark
.table.responsive-cards

Maintain:

- responsive behavior
- overflow-x support
- accessibility
- enterprise-grade styling
- clean BEM/modifier style architecture

==================================================
JS REQUIREMENTS
==================================================

Use ONE JS file.

Implement:

if sortable variant:
- sorting behavior

if searchable variant:
- search field
- filtering

if responsive-cards variant:
- mobile card presentation

Do NOT create:

sortable.js
searchable.js
pricing.js

Everything should stay inside a single:

table.js

==================================================
ACCESSIBILITY REQUIREMENTS
==================================================

Support:

- keyboard navigation
- semantic table markup
- proper heading structure
- ARIA where required
- screen reader friendliness

==================================================
OUTPUT REQUIRED
==================================================

Generate:

1. _table.json
2. component-definition.json entries
3. component-models.json entries
4. component-filters.json entries
5. table.css
6. table.js

==================================================
EXPLANATION REQUIRED
==================================================

Explain:

1. Why a single component architecture is preferred.
2. Why variants should be implemented through classes.
3. Which variants require only CSS.
4. Which variants require CSS + JS.
5. How the solution remains scalable for future variants.
6. How it complies with Universal Editor and XWalk constraints.
7. How authors will select and use each variation within Universal Editor.

Produce a complete production-ready implementation.