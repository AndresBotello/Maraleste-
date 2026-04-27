const homeSharedStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&display=swap');

  .hm-root,
  .ab-root {
    min-height: 100vh;
    color: #111;
    font-family: 'DM Sans', system-ui, sans-serif;
    background:
      radial-gradient(circle at 10% -10%, rgba(138, 90, 47, 0.09), transparent 40%),
      radial-gradient(circle at 95% 0%, rgba(31, 95, 87, 0.07), transparent 36%),
      linear-gradient(160deg, #f8f5ef 0%, #f2ede4 52%, #f8f7f4 100%);
  }

  .hm-header,
  .ab-header {
    position: sticky;
    top: 0;
    z-index: 50;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    background: color-mix(in srgb, #fff 75%, transparent);
    backdrop-filter: blur(10px);
  }

  .hm-brand,
  .ab-brand,
  .hm-title,
  .ab-title,
  .hm-section-title,
  .ab-section-title {
    font-family: 'DM Serif Display', serif;
  }

  .hm-shell,
  .ab-shell {
    width: min(1280px, calc(100% - 2rem));
    margin: 0 auto;
  }

  .hm-link,
  .ab-link {
    text-decoration: none;
    transition: color 0.18s ease, border-color 0.18s ease;
  }

  .hm-link:hover,
  .ab-link:hover {
    color: #000;
  }
`

export default homeSharedStyles
