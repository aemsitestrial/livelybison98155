I am building an AEM Edge Delivery Services (EDS) component for Universal Editor called "Embedded Adaptive Form".

Please generate all required files, architecture, JSON configuration, CSS, and JavaScript following AEM EDS and Universal Editor best practices.

Requirements:

1. Component Name
   - embed-adaptive-form

2. Purpose
   - The component should allow an author to select an existing AEM Adaptive Form from:
     /content/forms/af
   - The component should render/load that Adaptive Form on the webpage.
   - The component should lazy load the form when it comes into the viewport using IntersectionObserver.

3. Authoring Constraints
   - This project uses Universal Editor Sandbox.
   - A model cannot contain more than 4 cells/fields.
   - If a variation requires more than 4 authorable fields, use a parent-child structure or block item pattern that complies with Universal Editor and XWalk restrictions.
   - Avoid configurations that violate xwalk/max-cells.

4. Component Variations

   Variation 1: Default
   - Only Adaptive Form is rendered.
   - Authorable:
     - Form Path

   Example:
   ------------------------
   [Adaptive Form]
   ------------------------

   Variation 2: With Header
   - Adaptive Form with title and description above it.
   - Authorable:
     - Title
     - Description
     - Form Path

   Example:
   ------------------------
   Contact Us

   Get in touch with us.

   [Adaptive Form]
   ------------------------

   Variation 3: Two Column Layout
   - Content on the left.
   - Adaptive Form on the right.

   Authorable:
   - Title
   - Description
   - Form Path

   Layout:
   -----------------------------
   Content      | Adaptive Form
   -----------------------------

   Variation 4: With Image
   - Image displayed next to form.
   - Authorable:
   - Image
   - Title
   - Description
   - Form Path

   Layout:
   -----------------------------
   Image        | Adaptive Form
   -----------------------------

   Variation 5: Modal Form
   - Form should open inside a modal popup.
   - Authorable:
   - Button Text
   - Modal Title
   - Form Path

   Layout:
   -----------------------------
   [Open Form]

     Modal Opens

   [Adaptive Form]
   -----------------------------

5. Architecture Requirements

   Follow a scalable enterprise architecture.

   Do NOT create:
   - default-form.js
   - image-form.js
   - modal-form.js
   - two-column-form.js

   Instead:

   Use:
   - One component
   - One JS file
   - One CSS file

   Variations should be driven by:
   - Block classes
   - Variant classes
   - Conditional rendering
   - CSS layouts

   Example:

   embed-adaptive-form
   embed-adaptive-form with-header
   embed-adaptive-form two-column
   embed-adaptive-form with-image
   embed-adaptive-form modal

6. Universal Editor Integration

   Generate:

   - _embed-adaptive-form.json
   - component-definition.json entries
   - component-models.json entries
   - component-filters.json entries (only if required)

   Make sure all models comply with Universal Editor/XWalk rules.

7. JavaScript Requirements

   - Lazy load form using IntersectionObserver
   - Load Adaptive Form path selected by author
   - Handle missing form path gracefully
   - Handle load failures gracefully
   - Support variation-specific behavior
   - Modal open/close behavior should be inside the same JS file
   - Follow modern ES6+ syntax

8. CSS Requirements

   - Responsive
   - Mobile
   - Tablet
   - Desktop
   - Production-ready
   - Enterprise-grade styling structure
   - Separate variant styles clearly

9. Expected Deliverables

   Generate complete production-ready code for:

   - _embed-adaptive-form.json
   - component-definition.json entries
   - component-models.json entries
   - component-filters.json entries (if needed)
   - embed-adaptive-form.css
   - embed-adaptive-form.js

10. Important

   Explain:
   - Why the chosen architecture is suitable for AEM EDS.
   - Why variants are implemented using classes instead of separate components.
   - How the design avoids the Universal Editor 4-cell limitation.
   - How new variations can be added in the future without duplicating code.

Generate the complete implementation.