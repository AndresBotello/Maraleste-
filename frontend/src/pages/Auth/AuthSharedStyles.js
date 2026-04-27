const authSharedStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&display=swap');

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  .auth-root {
    min-height: 100vh;
    color: #1f1a14;
    font-family: 'DM Sans', system-ui, sans-serif;
    background:
      radial-gradient(circle at 10% -10%, rgba(138, 90, 47, 0.09), transparent 40%),
      radial-gradient(circle at 95% 0%, rgba(31, 95, 87, 0.07), transparent 36%),
      linear-gradient(160deg, #f8f5ef 0%, #f2ede4 52%, #f8f7f4 100%);
    selection-background-color: rgba(229, 231, 235, 0.75);
  }

  .auth-header {
    position: sticky;
    top: 0;
    z-index: 50;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    background: color-mix(in srgb, #fff 75%, transparent);
    backdrop-filter: blur(10px);
  }

  .auth-shell {
    width: min(1280px, calc(100% - 2rem));
    margin: 0 auto;
  }

  .auth-brand,
  .auth-title,
  .auth-section-title {
    font-family: 'DM Serif Display', serif;
  }

  .auth-link {
    text-decoration: none;
    transition: color 0.18s ease, text-decoration-color 0.18s ease;
  }

  .auth-link:hover {
    color: #000;
  }

  .auth-panel,
  .auth-feature,
  .auth-stat,
  .auth-form-card {
    border: 1px solid rgba(0, 0, 0, 0.1);
    background: color-mix(in srgb, #fff 88%, transparent);
    box-shadow: 0 12px 28px rgba(20, 17, 12, 0.08);
  }

  .auth-panel {
    backdrop-filter: blur(12px);
  }

  .auth-label {
    font-size: 11px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: #7d7060;
    font-weight: 600;
  }

  .auth-input {
    width: 100%;
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 12px;
    background: #fff;
    color: #1f1a14;
    outline: none;
    transition: border-color 0.18s ease, box-shadow 0.18s ease;
  }

  .auth-input:focus {
    border-color: #8a5a2f;
    box-shadow: 0 0 0 3px rgba(138, 90, 47, 0.12);
  }

  .auth-btn {
    border: 1px solid #1f1a14;
    border-radius: 12px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.18s ease;
  }

  .auth-btn:hover {
    transform: translateY(-1px);
  }

  .auth-btn--solid {
    background: #1f1a14;
    color: #fff;
  }

  .auth-btn--solid:hover {
    background: #0f0d0a;
  }

  .auth-btn--ghost {
    background: transparent;
    color: #1f1a14;
  }

  .auth-btn--ghost:hover {
    background: #1f1a14;
    color: #fff;
  }

  .auth-muted {
    color: #6b6860;
  }

  .auth-error {
    border: 1px solid #fecaca;
    background: #fef2f2;
    color: #b91c1c;
    border-radius: 12px;
  }

  .auth-success {
    border: 1px solid #bbf7d0;
    background: #f0fdf4;
    color: #15803d;
    border-radius: 12px;
  }

  .auth-divider {
    height: 1px;
    background: linear-gradient(to right, transparent, rgba(0, 0, 0, 0.14), transparent);
  }

  .auth-pulse-dot {
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: #1f1a14;
    animation: auth-pulse 1.6s ease-in-out infinite;
  }

  @keyframes auth-pulse {
    0%,
    100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.45; transform: scale(0.85); }
  }
`

export default authSharedStyles
