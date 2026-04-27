const adminSharedStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&display=swap');

  .ad-root {
    font-family: 'DM Sans', system-ui, sans-serif;
    color: #1f1a14;
  }

  .ad-shell {
    width: min(1280px, calc(100% - 2rem));
    margin: 0 auto;
  }

  .ad-title {
    font-family: 'DM Serif Display', serif;
    letter-spacing: -0.01em;
  }

  .ad-chip-btn {
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 10px;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    font-size: 10px;
    padding: 0.45rem 0.7rem;
    background: #fff;
    color: #2d2923;
    transition: all 0.18s ease;
  }

  .ad-chip-btn:hover {
    border-color: #1f1a14;
    background: #1f1a14;
    color: #fff;
  }
`

export default adminSharedStyles
