const catalogSharedStyles = `
  .catalog-root {
    background:
      radial-gradient(circle at top left, rgba(0, 0, 0, 0.06), transparent 30%),
      radial-gradient(circle at bottom right, rgba(0, 0, 0, 0.04), transparent 28%),
      linear-gradient(180deg, #f6f5f1 0%, #efede8 48%, #f7f5f1 100%);
    color: #1a1a1a;
    min-height: 100vh;
    position: relative;
    isolation: isolate;
  }

  

  .catalog-root::before {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    background-image:
      linear-gradient(rgba(0, 0, 0, 0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 0, 0, 0.025) 1px, transparent 1px);
    background-size: 42px 42px;
    opacity: 0.35;
    mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.9), transparent 95%);
  }

  .catalog-header {
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    backdrop-filter: blur(22px);
    background: rgba(255, 255, 255, 0.72);
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.04);
  }

  .catalog-shell {
    max-width: 80rem;
    margin: 0 auto;
  }

  .catalog-brand {
    letter-spacing: 0.4em;
    font-weight: 300;
    color: #0f0f0f;
    transition: color 160ms ease;
  }

  .catalog-brand:hover {
    color: #5c5c5c;
  }

  .catalog-link {
    transition: color 160ms ease, opacity 160ms ease;
  }

  .catalog-link:hover {
    color: #111111;
  }

  .catalog-nav-link {
    position: relative;
    transition: color 160ms ease;
  }

  .catalog-nav-link::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -0.35rem;
    width: 100%;
    height: 1px;
    background: currentColor;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 200ms ease;
  }

  .catalog-nav-link:hover::after {
    transform: scaleX(1);
  }

  .catalog-hero {
    position: relative;
    overflow: hidden;
  }

  .catalog-hero::after {
    content: '';
    position: absolute;
    inset: auto 10% 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.12), transparent);
  }

  .catalog-kicker {
    letter-spacing: 0.35em;
    text-transform: uppercase;
  }

  .catalog-title {
    letter-spacing: -0.04em;
    font-weight: 300;
  }

  .catalog-panel {
    background: rgba(255, 255, 255, 0.72);
    border: 1px solid rgba(0, 0, 0, 0.09);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(20px);
  }

  .catalog-input,
  .catalog-select {
    transition: border-color 180ms ease, box-shadow 180ms ease, background-color 180ms ease;
  }

  .catalog-input:focus,
  .catalog-select:focus {
    border-color: rgba(0, 0, 0, 0.95);
    box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.08);
  }

  .catalog-chip {
    background: rgba(255, 255, 255, 0.74);
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.05);
  }

  .catalog-pill {
    background: rgba(255, 255, 255, 0.62);
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.06);
    backdrop-filter: blur(14px);
  }

  .catalog-card {
    background: rgba(255, 255, 255, 0.76);
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.08);
    transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease;
  }

  .catalog-card:hover {
    border-color: rgba(0, 0, 0, 0.14);
    box-shadow: 0 28px 70px rgba(0, 0, 0, 0.12);
  }

  .catalog-card,
  .catalog-empty,
  .catalog-modal,
  .catalog-pill {
    animation: catalogFadeIn 320ms ease both;
  }

  .catalog-badge {
    backdrop-filter: blur(12px);
  }

  .catalog-empty {
    background: rgba(255, 255, 255, 0.54);
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.06);
  }

  .catalog-modal {
    background: rgba(246, 245, 241, 0.96);
    backdrop-filter: blur(18px);
  }

  .catalog-surface {
    background: rgba(255, 255, 255, 0.62);
    border: 1px solid rgba(0, 0, 0, 0.06);
    box-shadow: 0 14px 34px rgba(0, 0, 0, 0.05);
    backdrop-filter: blur(16px);
  }

  .catalog-action {
    transition: transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease, opacity 180ms ease;
  }

  .catalog-action:hover {
    transform: translateY(-1px);
  }

  .catalog-action:disabled {
    opacity: 0.6;
    transform: none;
  }

  .catalog-divider {
    background: linear-gradient(90deg, rgba(0, 0, 0, 0.14), rgba(0, 0, 0, 0.04));
  }

  .catalog-button-primary {
    transition: transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease;
  }

  .catalog-button-primary:hover {
    transform: translateY(-1px);
  }

  .catalog-fade {
    animation: catalogFadeIn 320ms ease both;
  }

  @keyframes catalogFadeIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export default catalogSharedStyles
