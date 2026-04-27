const homePageStyles = `
  .hm-root {
    selection-background-color: rgba(229, 231, 235, 0.75);
  }

  .hm-hero-card,
  .hm-panel,
  .hm-card {
    border: 1px solid rgba(0, 0, 0, 0.1);
    background: color-mix(in srgb, #fff 88%, transparent);
    box-shadow: 0 12px 28px rgba(20, 17, 12, 0.08);
  }

  .hm-btn {
    border-radius: 12px;
    border: 1px solid #1f1a14;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    font-size: 11px;
    transition: all 0.18s ease;
  }

  .hm-btn--solid {
    background: #1f1a14;
    color: #fff;
  }

  .hm-btn--solid:hover {
    background: #0f0d0a;
  }

  .hm-btn--ghost {
    background: transparent;
    color: #1f1a14;
  }

  .hm-btn--ghost:hover {
    background: #1f1a14;
    color: #fff;
  }
`

export default homePageStyles
