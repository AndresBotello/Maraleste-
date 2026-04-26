const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

  :root {
    --bg: #F7F6F3;
    --surface: #FFFFFF;
    --surface-2: #F2F1EE;
    --border: #E8E6E0;
    --border-strong: #D0CEC8;
    --text-primary: #1A1916;
    --text-secondary: #6B6860;
    --text-tertiary: #9E9C97;
    --accent: #1A1916;
    --accent-soft: rgba(26,25,22,0.06);
    --accent-video: #C0501E;
    --accent-read: #1A5C8C;
    --accent-resource: #3D7A4B;
    --green: #2D6A3F;
    --radius-sm: 6px;
    --radius-md: 10px;
    --radius-lg: 16px;
    --radius-xl: 20px;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.06);
    --shadow-md: 0 4px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05);
  }

  *, *::before, *::after { box-sizing: border-box; }

  /* ── Root ── */
  .db-root {
    font-family: 'DM Sans', system-ui, sans-serif;
    color: var(--text-primary);
    display: flex; flex-direction: column;
    gap: 32px;
    padding-bottom: 48px;
  }

  /* ── Header ── */
  .db-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
    flex-wrap: wrap;
    padding-bottom: 28px;
    border-bottom: 1px solid var(--border);
  }
  .db-header-text { display: flex; flex-direction: column; gap: 8px; }
  .db-eyebrow {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: var(--text-tertiary);
  }
  .db-title {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(28px, 4vw, 44px);
    font-weight: 400;
    color: var(--text-primary);
    line-height: 1.15;
    letter-spacing: -0.01em;
  }
  .db-title em { font-style: italic; color: var(--text-secondary); }
  .db-subtitle { font-size: 14px; color: var(--text-secondary); font-weight: 300; max-width: 420px; }
  .db-header-date { text-align: right; flex-shrink: 0; }
  .db-date-day {
    font-size: 11px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.12em;
    color: var(--text-tertiary);
    text-transform: capitalize;
  }
  .db-date-full { font-size: 13px; color: var(--text-secondary); margin-top: 3px; text-transform: capitalize; }

  /* ── KPI Grid ── */
  .db-kpi-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  @media (min-width: 900px) {
    .db-kpi-grid { grid-template-columns: repeat(4, 1fr); }
  }
  .db-kpi {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    padding: 20px 22px 18px;
    display: flex; flex-direction: column; gap: 6px;
    transition: box-shadow 0.2s, transform 0.2s;
  }
  .db-kpi:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
  .db-kpi--skeleton { pointer-events: none; }
  .db-kpi-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
  .db-kpi-label {
    font-size: 10px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.12em;
    color: var(--text-tertiary);
  }
  .db-kpi-icon {
    width: 28px; height: 28px;
    border-radius: var(--radius-sm);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700; flex-shrink: 0;
  }
  .db-kpi-value {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(28px, 4vw, 36px);
    font-weight: 400;
    color: var(--text-primary);
    line-height: 1;
  }
  .db-kpi-context { font-size: 11px; color: var(--text-tertiary); line-height: 1.5; }
  .db-kpi-bar { height: 2px; background: var(--border); border-radius: 100px; margin-top: 8px; }
  .db-kpi-bar-fill { height: 100%; border-radius: 100px; transition: width 0.6s ease; }

  /* ── Skeleton ── */
  .db-skeleton {
    background: linear-gradient(90deg, var(--border) 25%, var(--surface-2) 50%, var(--border) 75%);
    background-size: 200% 100%;
    animation: db-shimmer 1.4s infinite;
    border-radius: var(--radius-sm);
  }
  .db-skeleton--sm { height: 12px; width: 100%; }
  .db-skeleton--lg { height: 36px; width: 50%; }
  .db-skeleton--circle { width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0; }
  @keyframes db-shimmer { to { background-position: -200% 0; } }

  /* ── Content Grid ── */
  .db-content-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
    align-items: start;
  }
  @media (min-width: 900px) {
    .db-content-grid { grid-template-columns: 1.8fr 1fr; }
  }

  /* ── Card ── */
  .db-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    padding: 24px;
  }
  .db-card-head {
    display: flex; align-items: flex-start; justify-content: space-between;
    gap: 12px; margin-bottom: 20px;
  }
  .db-card-title {
    font-family: 'DM Serif Display', serif;
    font-size: 20px; font-weight: 400;
    color: var(--text-primary); margin-top: 5px;
  }
  .db-record-count {
    font-family: 'DM Serif Display', serif;
    font-size: 28px; color: var(--text-tertiary);
    line-height: 1; flex-shrink: 0;
  }
  .db-card-link {
    display: inline-block; margin-top: 18px;
    font-size: 11px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.14em;
    color: var(--text-primary);
    text-decoration: none;
    border-bottom: 1px solid var(--border);
    padding-bottom: 2px;
    transition: border-color 0.2s, color 0.2s;
  }
  .db-card-link:hover { border-color: var(--accent); }

  /* ── Feed ── */
  .db-feed { display: flex; flex-direction: column; gap: 4px; }
  .db-feed-item {
    display: flex; align-items: center; gap: 14px;
    padding: 12px 14px;
    border-radius: var(--radius-md);
    border: 1px solid transparent;
    text-decoration: none;
    color: inherit;
    transition: background 0.15s, border-color 0.15s;
  }
  .db-feed-item:hover { background: var(--surface-2); border-color: var(--border); }
  .db-feed-item--skeleton { pointer-events: none; }
  .db-feed-icon {
    width: 32px; height: 32px; border-radius: var(--radius-sm);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700; flex-shrink: 0;
  }
  .db-feed-body { flex: 1; min-width: 0; }
  .db-feed-title { font-size: 13px; font-weight: 400; color: var(--text-primary); line-height: 1.4; margin-bottom: 4px; }
  .db-feed-meta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .db-type-pill {
    font-size: 10px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.08em;
    color: var(--pill-color, var(--text-tertiary));
    background: color-mix(in srgb, var(--pill-color, var(--text-tertiary)) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--pill-color, var(--text-tertiary)) 25%, transparent);
    padding: 1px 7px; border-radius: 100px;
  }
  .db-feed-meta > span:not(.db-type-pill) { font-size: 11px; color: var(--text-tertiary); }
  .db-feed-right { text-align: right; flex-shrink: 0; }
  .db-feed-time { font-size: 11px; color: var(--text-tertiary); font-variant-numeric: tabular-nums; }
  .db-feed-owner { font-size: 11px; color: var(--text-tertiary); max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 2px; }

  /* ── Empty ── */
  .db-empty { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 32px 16px; text-align: center; }
  .db-empty-icon { font-size: 28px; color: var(--text-tertiary); }
  .db-empty p { font-size: 13px; color: var(--text-tertiary); }

  /* ── Aside ── */
  .db-aside { display: flex; flex-direction: column; gap: 12px; }

  /* ── Workshop ── */
  .db-workshop-list { display: flex; flex-direction: column; gap: 8px; }
  .db-workshop-item {
    padding: 14px 16px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    display: flex; flex-direction: column; gap: 6px;
    background: var(--surface-2);
  }
  .db-workshop-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
  .db-workshop-title { font-size: 13px; font-weight: 400; color: var(--text-primary); line-height: 1.4; }
  .db-workshop-date { font-size: 11px; color: var(--text-tertiary); }
  .db-virtual-badge {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;
    color: var(--accent-read);
    background: color-mix(in srgb, var(--accent-read) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--accent-read) 25%, transparent);
    padding: 2px 7px; border-radius: 100px;
    flex-shrink: 0;
  }
  .db-virtual-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: var(--accent-read);
    animation: db-pulse 1.5s ease-in-out infinite;
  }
  @keyframes db-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
  .db-workshop-cupos { display: flex; align-items: center; gap: 8px; margin-top: 2px; }
  .db-cupos-bar-wrap { flex: 1; height: 3px; background: var(--border); border-radius: 100px; }
  .db-cupos-bar-fill { height: 100%; background: var(--accent); border-radius: 100px; transition: width 0.4s ease; }
  .db-cupos-text { font-size: 10px; color: var(--text-tertiary); white-space: nowrap; font-variant-numeric: tabular-nums; }

  /* ── Quick Actions ── */
  .db-quick-actions { display: flex; flex-direction: column; }
  .db-quick-btn {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 4px;
    border-bottom: 1px solid var(--border);
    text-decoration: none; color: inherit;
    transition: background 0.15s;
    border-radius: var(--radius-sm);
    cursor: pointer;
  }
  .db-quick-btn:last-child { border-bottom: none; }
  .db-quick-btn:hover { background: var(--surface-2); padding-left: 8px; }
  .db-quick-icon {
    width: 30px; height: 30px; border-radius: var(--radius-sm);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700; flex-shrink: 0;
  }
  .db-quick-label { font-size: 13px; font-weight: 400; color: var(--text-primary); flex: 1; }
  .db-quick-arrow { font-size: 14px; color: var(--text-tertiary); transition: transform 0.2s; }
  .db-quick-btn:hover .db-quick-arrow { transform: translateX(3px); color: var(--text-primary); }
`

export default globalStyles