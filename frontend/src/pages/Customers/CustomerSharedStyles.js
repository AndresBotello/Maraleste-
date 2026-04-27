const customerSharedStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&display=swap');

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  .ms-root,
  .nt-root,
  .pf-root {
    min-height: 100vh;
    color: #1f1a14;
    font-family: 'DM Sans', system-ui, sans-serif;
  }

  .ms-header,
  .nt-header,
  .pf-header {
    position: sticky;
    top: 0;
    z-index: 40;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    background: color-mix(in srgb, #fff 76%, transparent);
    backdrop-filter: blur(10px);
  }

  .ms-brand,
  .nt-brand,
  .pf-brand,
  .ms-title,
  .nt-title,
  .pf-title {
    font-family: 'DM Serif Display', serif;
  }

  .ms-side,
  .ms-main,
  .nt-panel,
  .pf-card,
  .pf-form-card {
    border: 1px solid rgba(0, 0, 0, 0.08);
    background: color-mix(in srgb, #fff 90%, transparent);
    box-shadow: 0 12px 28px rgba(20, 17, 12, 0.08);
  }

  .ms-field,
  .ms-textarea,
  .pf-input {
    border: 1px solid rgba(0, 0, 0, 0.14);
    border-radius: 12px;
    outline: none;
    transition: border-color 0.18s ease, box-shadow 0.18s ease;
    background: #fff;
  }

  .ms-field:focus,
  .ms-textarea:focus,
  .pf-input:focus {
    border-color: #8a5a2f;
    box-shadow: 0 0 0 3px rgba(138, 90, 47, 0.12);
  }

  .ms-btn,
  .nt-btn,
  .pf-btn {
    border: 1px solid #1f1a14;
    border-radius: 12px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    font-size: 10px;
    cursor: pointer;
    transition: all 0.18s ease;
  }

  .ms-btn:hover,
  .pf-btn:hover {
    transform: translateY(-1px);
  }

  .nt-btn:hover {
    background: #1f1a14;
    color: #fff;
  }

  .ms-btn--solid,
  .pf-btn--solid {
    background: #1f1a14;
    color: #fff;
  }

  .ms-btn--solid:hover,
  .pf-btn--solid:hover {
    background: #0f0d0a;
  }

  .pf-btn--ghost {
    background: transparent;
    color: #1f1a14;
  }

  .pf-btn--ghost:hover {
    background: #1f1a14;
    color: #fff;
  }
`

export default customerSharedStyles
