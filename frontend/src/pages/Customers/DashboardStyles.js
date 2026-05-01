const customerDashboardStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

  :root {
    --cd-bg: #f6f3ed;
    --cd-surface: #ffffff;
    --cd-surface-soft: #f2eee7;
    --cd-border: #e2dbcf;
    --cd-border-strong: #cdc2b0;
    --cd-text: #1f1a14;
    --cd-text-soft: #685f53;
    --cd-text-mute: #978b7a;
    --cd-accent: #8a5a2f;
    --cd-accent-soft: rgba(138, 90, 47, 0.12);
    --cd-accent-2: #1f5f57;
    --cd-accent-3: #9e3d2c;
    --cd-success: #2f7c4e;
    --cd-danger: #a23a2b;
    --cd-radius-sm: 8px;
    --cd-radius-md: 14px;
    --cd-radius-lg: 20px;
    --cd-radius-xl: 28px;
    --cd-shadow-sm: 0 1px 3px rgba(25, 18, 10, 0.08);
    --cd-shadow-md: 0 10px 28px rgba(25, 18, 10, 0.1), 0 1px 4px rgba(25, 18, 10, 0.08);
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  .cd-root {
    font-family: 'DM Sans', system-ui, sans-serif;
    color: var(--cd-text);
    min-height: 100vh;
    background:
      radial-gradient(circle at 15% -10%, rgba(138, 90, 47, 0.1), transparent 40%),
      radial-gradient(circle at 90% 0%, rgba(31, 95, 87, 0.08), transparent 36%),
      linear-gradient(160deg, #f8f5ef 0%, #f2ede4 48%, #f8f7f3 100%);
  }

  .cd-shell {
    width: min(1200px, 100% - 2.5rem);
    margin: 0 auto;
    padding: 2rem 0 3rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .cd-header {
    position: sticky;
    top: 0;
    z-index: 30;
    background: color-mix(in srgb, var(--cd-surface) 84%, transparent);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid color-mix(in srgb, var(--cd-border) 72%, transparent);
  }

  .cd-header-inner {
    width: min(1200px, 100% - 2.5rem);
    margin: 0 auto;
    min-height: 78px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .cd-brand {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(1rem, 2.2vw, 1.35rem);
    letter-spacing: 0.22em;
    text-transform: uppercase;
    text-decoration: none;
    color: var(--cd-text);
  }

  .cd-header-actions {
    display: flex;
    align-items: center;
    gap: 0.65rem;
  }

  .cd-icon-btn {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    border: 1px solid color-mix(in srgb, var(--cd-border) 85%, transparent);
    background: color-mix(in srgb, var(--cd-surface) 80%, transparent);
    color: var(--cd-text);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.2s ease, border-color 0.2s ease;
    position: relative;
  }

  .cd-icon-btn:hover {
    transform: translateY(-1px);
    border-color: var(--cd-border-strong);
  }

  .cd-badge {
    position: absolute;
    top: -6px;
    right: -6px;
    min-width: 18px;
    height: 18px;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 700;
    line-height: 18px;
    text-align: center;
    color: #fff;
    background: var(--cd-danger);
    padding: 0 5px;
  }

  .cd-profile-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    border: 1px solid var(--cd-border);
    background: color-mix(in srgb, var(--cd-surface) 80%, transparent);
    border-radius: 14px;
    padding: 0.42rem 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    font-size: 10px;
    color: var(--cd-text-soft);
  }

  .cd-avatar {
    width: 34px;
    height: 34px;
    border-radius: 999px;
    overflow: hidden;
    border: 1px solid var(--cd-border);
    flex-shrink: 0;
  }

  .cd-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .cd-hero {
    border: 1px solid var(--cd-border);
    border-radius: var(--cd-radius-xl);
    background: linear-gradient(145deg, #fffdf8, #f6efe5);
    box-shadow: var(--cd-shadow-sm);
    padding: clamp(1.2rem, 2.5vw, 2rem);
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.9fr);
    gap: 1rem;
    align-items: center;
  }

  .cd-eyebrow {
    margin: 0;
    font-size: 10px;
    letter-spacing: 0.26em;
    text-transform: uppercase;
    color: var(--cd-text-mute);
    font-weight: 600;
  }

  .cd-title {
    margin: 0.55rem 0 0;
    font-family: 'DM Serif Display', serif;
    font-size: clamp(1.8rem, 4vw, 3rem);
    line-height: 1.12;
    letter-spacing: -0.01em;
  }

  .cd-title em {
    font-style: italic;
    color: var(--cd-accent);
  }

  .cd-subtitle {
    margin: 0.8rem 0 0;
    font-size: clamp(13px, 1.3vw, 16px);
    color: var(--cd-text-soft);
    line-height: 1.6;
    max-width: 62ch;
  }

  .cd-hero-actions {
    margin-top: 1.2rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.55rem;
  }

  .cd-btn {
    border-radius: 12px;
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    font-weight: 600;
    padding: 0.75rem 1rem;
    border: 1px solid var(--cd-text);
    text-decoration: none;
    cursor: pointer;
    transition: transform 0.18s ease, background 0.18s ease, color 0.18s ease;
  }

  .cd-btn:hover {
    transform: translateY(-1px);
  }

  .cd-btn--solid {
    color: #fff;
    background: var(--cd-text);
  }

  .cd-btn--solid:hover {
    background: #0f0d0a;
  }

  .cd-btn--ghost {
    color: var(--cd-text);
    background: transparent;
  }

  .cd-btn--ghost:hover {
    background: var(--cd-text);
    color: #fff;
  }

  .cd-kpi-panel {
    border: 1px solid var(--cd-border);
    border-radius: var(--cd-radius-lg);
    background: color-mix(in srgb, var(--cd-surface) 86%, transparent);
    padding: 1rem;
    display: grid;
    gap: 0.65rem;
  }

  .cd-kpi-item {
    border-radius: var(--cd-radius-md);
    border: 1px solid var(--cd-border);
    background: #fff;
    padding: 0.8rem 0.9rem;
    transition: box-shadow 0.2s ease;
  }

  .cd-kpi-item:hover {
    box-shadow: var(--cd-shadow-sm);
  }

  .cd-kpi-label {
    font-size: 10px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--cd-text-mute);
    margin: 0;
  }

  .cd-kpi-value {
    margin: 0.35rem 0 0;
    font-family: 'DM Serif Display', serif;
    font-size: clamp(26px, 3.2vw, 34px);
    color: var(--cd-text);
    line-height: 1;
  }

  .cd-kpi-detail {
    margin: 0.3rem 0 0;
    font-size: 11px;
    color: var(--cd-text-soft);
  }

  .cd-tabs {
    display: inline-flex;
    border: 1px solid var(--cd-border);
    background: color-mix(in srgb, var(--cd-surface) 78%, transparent);
    border-radius: 16px;
    padding: 0.36rem;
    gap: 0.3rem;
  }

  .cd-tab {
    border: 0;
    background: transparent;
    border-radius: 11px;
    padding: 0.56rem 0.9rem;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: var(--cd-text-soft);
    cursor: pointer;
    transition: background 0.18s ease, color 0.18s ease;
  }

  .cd-tab.is-active {
    background: var(--cd-text);
    color: #fff;
  }

  .cd-section {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }

  .cd-section-head {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 0.8rem;
    flex-wrap: wrap;
  }

  .cd-section-title {
    margin: 0;
    font-family: 'DM Serif Display', serif;
    font-size: clamp(24px, 2.8vw, 30px);
    line-height: 1.15;
  }

  .cd-section-subtitle {
    margin: 0.35rem 0 0;
    font-size: 13px;
    color: var(--cd-text-soft);
  }

  .cd-count {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: var(--cd-text-mute);
  }

  .cd-filter-grid {
    display: grid;
    grid-template-columns: minmax(220px, 0.4fr) minmax(0, 1fr);
    gap: 0.8rem;
  }

  .cd-panel {
    background: color-mix(in srgb, var(--cd-surface) 86%, transparent);
    border: 1px solid var(--cd-border);
    border-radius: var(--cd-radius-lg);
    padding: 1rem;
  }

  .cd-category-list {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
  }

  .cd-category-btn {
    border: 1px solid transparent;
    background: #fff;
    border-radius: 12px;
    color: var(--cd-text-soft);
    padding: 0.62rem 0.8rem;
    text-align: left;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.18s ease;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.45rem;
  }

  .cd-category-btn:hover {
    border-color: var(--cd-border);
    color: var(--cd-text);
  }

  .cd-category-btn.is-active {
    border-color: var(--cd-text);
    background: var(--cd-text);
    color: #fff;
  }

  .cd-search-wrap {
    position: relative;
  }

  .cd-search-input {
    width: 100%;
    border-radius: 14px;
    border: 1px solid var(--cd-border);
    background: color-mix(in srgb, var(--cd-surface) 88%, transparent);
    color: var(--cd-text);
    font-size: 13px;
    padding: 0.86rem 2.4rem 0.86rem 1rem;
    outline: none;
    transition: border-color 0.18s ease, box-shadow 0.18s ease;
  }

  .cd-search-input:focus {
    border-color: var(--cd-accent);
    box-shadow: 0 0 0 3px rgba(138, 90, 47, 0.12);
  }

  .cd-search-icon {
    position: absolute;
    right: 0.9rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 13px;
    color: var(--cd-text-mute);
    pointer-events: none;
  }

  .cd-grid {
    display: grid;
    gap: 0.85rem;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .cd-grid--works {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .cd-card {
    display: flex;
    flex-direction: column;
    min-height: 100%;
    border-radius: var(--cd-radius-lg);
    overflow: hidden;
    border: 1px solid var(--cd-border);
    background: color-mix(in srgb, var(--cd-surface) 92%, transparent);
    box-shadow: var(--cd-shadow-sm);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .cd-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--cd-shadow-md);
  }

  .cd-card-cover {
    position: relative;
    height: 150px;
    background: linear-gradient(150deg, #efe5d7, #e7d6c4 55%, #efe9df);
    overflow: hidden;
  }

  .cd-card-cover--course {
    background: linear-gradient(145deg, #e3e6ff, #eecfff 52%, #ffd8e8);
  }

  .cd-card-cover--workshop {
    background: linear-gradient(145deg, #ffebcc, #ffd9be 52%, #ffcfc4);
  }

  .cd-card-cover--work {
    background: linear-gradient(145deg, #ececec, #dddddd 52%, #cecece);
  }

  .cd-card-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.35s ease;
  }

  .cd-card:hover .cd-card-cover img {
    transform: scale(1.05);
  }

  .cd-card-body {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    padding: 0.9rem;
    flex: 1;
  }

  .cd-pill {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    padding: 0.18rem 0.5rem;
    color: var(--cd-text-soft);
    border: 1px solid color-mix(in srgb, var(--cd-border) 88%, transparent);
    background: color-mix(in srgb, var(--cd-surface-soft) 90%, transparent);
  }

  .cd-pill--live {
    color: var(--cd-success);
    border-color: color-mix(in srgb, var(--cd-success) 30%, transparent);
    background: color-mix(in srgb, var(--cd-success) 12%, transparent);
  }

  .cd-card-title {
    margin: 0;
    font-size: 16px;
    color: var(--cd-text);
    line-height: 1.35;
  }

  .cd-card-meta {
    margin: 0;
    font-size: 12px;
    color: var(--cd-text-soft);
  }

  .cd-card-description {
    margin: 0.2rem 0 0;
    font-size: 13px;
    color: var(--cd-text-soft);
    line-height: 1.6;
  }

  .cd-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin-top: 0.2rem;
  }

  .cd-card-foot {
    margin-top: auto;
    border-top: 1px solid var(--cd-border);
    padding-top: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.7rem;
  }

  .cd-card-badge {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.55rem;
    border-radius: 10px;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #fff;
    background: rgba(0, 0, 0, 0.56);
    backdrop-filter: blur(4px);
  }

  .cd-loading-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
    gap: 0.6rem;
    color: var(--cd-text-soft);
  }

  .cd-error-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2.8rem 1rem;
    gap: 0.7rem;
    color: var(--cd-text-soft);
    text-align: center;
  }

  .cd-error-icon {
    width: 62px;
    height: 62px;
    border-radius: 999px;
    background: #fef2f2;
    color: #f87171;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .cd-panel-title {
    margin: 0;
    font-family: 'DM Serif Display', serif;
    font-size: 28px;
    line-height: 1.2;
  }

  .cd-panel-subtitle {
    margin: 0.3rem 0 0;
    font-size: 13px;
    color: var(--cd-text-soft);
  }

  .cd-mono-count {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: var(--cd-text-mute);
  }

  .cd-price {
    font-family: 'DM Serif Display', serif;
    font-size: 22px;
    line-height: 1;
    color: var(--cd-text);
  }

  .cd-link {
    text-decoration: none;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: var(--cd-text-soft);
    border-bottom: 1px solid transparent;
    padding-bottom: 2px;
    transition: color 0.18s ease, border-color 0.18s ease;
  }

  .cd-link:hover {
    color: var(--cd-text);
    border-color: var(--cd-text);
  }

  .cd-empty {
    border: 1px dashed var(--cd-border-strong);
    border-radius: var(--cd-radius-lg);
    padding: 1.3rem 1rem;
    text-align: center;
    background: color-mix(in srgb, var(--cd-surface) 75%, transparent);
    color: var(--cd-text-soft);
    font-size: 13px;
  }

  .cd-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.55rem;
    padding: 1.3rem;
    color: var(--cd-text-soft);
    font-size: 13px;
  }

  .cd-spinner {
    width: 30px;
    height: 30px;
    border-radius: 999px;
    border: 2px solid var(--cd-border);
    border-top-color: var(--cd-text);
    animation: cd-spin 0.9s linear infinite;
  }

  @keyframes cd-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .cd-modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.28);
    backdrop-filter: blur(4px);
    z-index: 0;
  }

  .cd-center-modal-wrap {
    position: fixed;
    inset: 0;
    z-index: 105;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 1.25rem;
  }

  .cd-center-modal-card {
    position: relative;
    width: min(880px, 100%);
    max-height: 70vh;
    overflow-y: auto;
    border-radius: var(--cd-radius-xl);
    border: 1px solid var(--cd-border);
    background: var(--cd-surface);
    box-shadow: 0 18px 36px rgba(20, 17, 12, 0.2);
    z-index: 1;
  }

  .cd-modal-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.45rem;
  }

  .cd-profile-actions {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
  }

  .cd-panel-modal {
    position: fixed;
    top: 0;
    right: 0;
    height: 100%;
    width: min(410px, 100%);
    z-index: 1;
    background: color-mix(in srgb, var(--cd-surface) 92%, transparent);
    border-left: 1px solid var(--cd-border);
    box-shadow: -8px 0 24px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
  }

  .cd-modal-header {
    position: sticky;
    top: 0;
    background: inherit;
    border-bottom: 1px solid var(--cd-border);
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.8rem;
  }

  .cd-modal-title {
    margin: 0;
    font-family: 'DM Serif Display', serif;
    font-size: 22px;
  }

  .cd-modal-body {
    padding: 1rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
  }

  .cd-note-item {
    border: 1px solid var(--cd-border);
    border-radius: var(--cd-radius-md);
    padding: 0.75rem;
    background: #fff;
  }

  .cd-note-item.is-unread {
    border-color: color-mix(in srgb, var(--cd-accent-2) 34%, transparent);
    background: color-mix(in srgb, var(--cd-accent-2) 9%, #fff);
  }

  .cd-note-type {
    margin: 0;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: var(--cd-text-mute);
  }

  .cd-note-title {
    margin: 0.4rem 0 0;
    font-size: 14px;
    color: var(--cd-text);
  }

  .cd-note-text {
    margin: 0.3rem 0 0;
    font-size: 13px;
    color: var(--cd-text-soft);
    line-height: 1.5;
  }

  .cd-note-date {
    margin: 0.5rem 0 0;
    font-size: 11px;
    color: var(--cd-text-mute);
  }

  .cd-note-actions {
    margin-top: 0.65rem;
    display: flex;
    justify-content: flex-end;
    gap: 0.4rem;
  }

  .cd-chip-btn {
    border: 1px solid var(--cd-border);
    border-radius: 10px;
    background: #fff;
    color: var(--cd-text-soft);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    padding: 0.5rem 0.6rem;
    cursor: pointer;
    transition: all 0.18s ease;
  }

  .cd-chip-btn:hover {
    border-color: var(--cd-text);
    color: var(--cd-text);
  }

  .cd-chip-btn--primary {
    border-color: var(--cd-text);
    background: var(--cd-text);
    color: #fff;
  }

  .cd-chip-btn--primary:hover {
    background: #0f0d0a;
  }

  .cd-artwork-modal {
    position: fixed;
    z-index: 110;
    inset: 50% auto auto 50%;
    transform: translate(-50%, -50%);
    width: min(860px, calc(100% - 2rem));
    max-height: calc(100vh - 2rem);
    overflow-y: auto;
    border-radius: var(--cd-radius-xl);
    border: 1px solid var(--cd-border);
    background: var(--cd-surface);
    box-shadow: 0 30px 60px rgba(20, 17, 12, 0.28);
  }

  .cd-artwork-cover {
    width: 100%;
    height: 280px;
    object-fit: cover;
    border-bottom: 1px solid var(--cd-border);
  }

  .cd-artwork-content {
    padding: 1.2rem;
    display: grid;
    gap: 0.9rem;
  }

  .cd-detail-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.6rem;
  }

  .cd-detail-box {
    border: 1px solid var(--cd-border);
    border-radius: 12px;
    background: var(--cd-surface-soft);
    padding: 0.7rem;
  }

  .cd-detail-label {
    margin: 0;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: var(--cd-text-mute);
  }

  .cd-detail-value {
    margin: 0.3rem 0 0;
    font-size: 13px;
    color: var(--cd-text);
  }

  @media (max-width: 1180px) {
    .cd-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .cd-grid--works {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (max-width: 960px) {
    .cd-shell,
    .cd-header-inner {
      width: min(1200px, 100% - 1.4rem);
    }

    .cd-hero {
      grid-template-columns: 1fr;
    }

    .cd-filter-grid {
      grid-template-columns: 1fr;
    }

    .cd-profile-btn span:first-child {
      display: none;
    }

    .cd-grid--works {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 680px) {
    .cd-grid,
    .cd-grid--works {
      grid-template-columns: 1fr;
    }

    .cd-shell {
      padding-top: 1rem;
      gap: 1rem;
    }

    .cd-title {
      font-size: clamp(1.5rem, 7vw, 2rem);
    }

    .cd-hero-actions {
      width: 100%;
      flex-direction: column;
    }

    .cd-btn {
      width: 100%;
      text-align: center;
    }

    .cd-detail-grid {
      grid-template-columns: 1fr;
    }
  }
`

export default customerDashboardStyles
