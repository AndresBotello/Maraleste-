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
    --green-bg: #EEF7F1;
    --green-border: #C3DFCB;
    --amber-bg: #FFFBEB;
    --amber-border: #FDE68A;
    --amber-text: #92400E;
    --radius-sm: 6px;
    --radius-md: 10px;
    --radius-lg: 16px;
    --radius-xl: 20px;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
    --shadow-md: 0 4px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05);
    --shadow-lg: 0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .cd-root {
    font-family: 'DM Sans', system-ui, sans-serif;
    background: var(--bg);
    color: var(--text-primary);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Loading / Error ── */
  .cd-loading-screen {
    background: var(--bg);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Sans', sans-serif;
  }
  .cd-loading-inner, .cd-error-inner {
    text-align: center;
    display: flex; flex-direction: column; align-items: center; gap: 16px;
  }
  .cd-spinner {
    width: 32px; height: 32px;
    border: 2px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: cd-spin 0.8s linear infinite;
  }
  @keyframes cd-spin { to { transform: rotate(360deg); } }
  .cd-loading-text { font-size: 14px; color: var(--text-secondary); letter-spacing: 0.02em; }
  .cd-error-icon { font-size: 40px; color: var(--text-tertiary); }
  .cd-error-title {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(20px, 3vw, 28px);
    color: var(--text-primary); font-weight: 400;
  }

  /* ── Header ── */
  .cd-header {
    position: sticky; top: 0; z-index: 100;
    background: rgba(247,246,243,0.92);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
  }
  .cd-header-inner {
    max-width: 1280px; margin: 0 auto;
    padding: 0 24px;
    height: 56px;
    display: flex; align-items: center; justify-content: space-between;
    gap: 16px;
  }
  .cd-logo {
    font-family: 'DM Serif Display', serif;
    font-size: 16px;
    letter-spacing: 0.18em;
    color: var(--text-primary);
    text-decoration: none;
    flex-shrink: 0;
    transition: opacity 0.2s;
  }
  .cd-logo:hover { opacity: 0.6; }
  .cd-header-nav { display: flex; align-items: center; gap: 4px; }
  .cd-nav-link {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-secondary);
    background: none; border: none; cursor: pointer;
    padding: 6px 10px;
    border-radius: var(--radius-sm);
    text-decoration: none;
    transition: color 0.2s, background 0.2s;
  }
  .cd-nav-link:hover { color: var(--text-primary); background: var(--accent-soft); }
  .cd-header-progress { height: 2px; background: var(--border); }
  .cd-header-progress-fill {
    height: 100%; background: var(--accent);
    transition: width 0.5s ease;
  }

  /* ── Main Layout ── */
  .cd-main {
    max-width: 1280px; margin: 0 auto;
    padding: 40px 24px 80px;
    width: 100%;
  }
  .cd-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 32px;
    align-items: start;
  }
  @media (min-width: 900px) {
    .cd-grid {
      grid-template-columns: 1fr 320px;
      gap: 48px;
    }
  }
  @media (min-width: 1100px) {
    .cd-grid { grid-template-columns: 1fr 360px; }
  }

  /* ── Left Column ── */
  .cd-left { display: flex; flex-direction: column; gap: 32px; min-width: 0; }

  /* ── Hero ── */
  .cd-hero { display: flex; flex-direction: column; gap: 10px; }
  .cd-hero-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .cd-level-badge {
    font-size: 11px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.1em;
    color: var(--text-tertiary);
    border: 1px solid var(--border-strong);
    padding: 3px 10px; border-radius: 100px;
    background: var(--surface);
  }
  .cd-paid-badge {
    font-size: 11px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.1em;
    color: var(--accent-video);
    border: 1px solid color-mix(in srgb, var(--accent-video) 30%, transparent);
    background: color-mix(in srgb, var(--accent-video) 8%, transparent);
    padding: 3px 10px; border-radius: 100px;
  }
  .cd-course-title {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(28px, 5vw, 48px);
    font-weight: 400;
    line-height: 1.15;
    letter-spacing: -0.01em;
    color: var(--text-primary);
  }
  .cd-instructor {
    font-size: 14px; color: var(--text-secondary); font-weight: 300;
  }

  /* ── Cover ── */
  .cd-cover {
    border-radius: var(--radius-xl);
    overflow: hidden;
    border: 1px solid var(--border);
    background: var(--surface-2);
    box-shadow: var(--shadow-md);
    height: clamp(180px, 35vw, 380px);
  }
  .cd-cover-img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .cd-cover-placeholder {
    width: 100%; height: 100%;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 12px; padding: 24px; text-align: center;
  }
  .cd-cover-icon { font-size: 40px; color: var(--text-tertiary); }
  .cd-cover-name { font-size: 16px; color: var(--text-secondary); font-weight: 300; }

  /* ── Sections ── */
  .cd-section { display: flex; flex-direction: column; gap: 16px; }
  .cd-section-title {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(20px, 3vw, 26px);
    font-weight: 400;
    color: var(--text-primary);
  }
  .cd-about-text {
    font-size: 15px; color: var(--text-secondary);
    line-height: 1.8; font-weight: 300;
    white-space: pre-line;
  }

  /* ── Progress Card ── */
  .cd-progress-card {
    padding: 18px 20px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
  }
  .cd-progress-top {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 10px;
  }
  .cd-progress-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: var(--text-tertiary); }
  .cd-progress-pct { font-size: 13px; font-weight: 600; color: var(--text-primary); }
  .cd-progress-bar-wrap { height: 3px; background: var(--border); border-radius: 100px; }
  .cd-progress-bar-fill { height: 100%; background: var(--accent); border-radius: 100px; transition: width 0.5s ease; }
  .cd-progress-updating { font-size: 11px; color: var(--text-tertiary); margin-top: 8px; }

  /* ── Lock notice ── */
  .cd-lock-notice {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 16px;
    background: var(--amber-bg);
    border: 1px solid var(--amber-border);
    border-radius: var(--radius-md);
    font-size: 13px; color: var(--amber-text); font-weight: 400;
  }
  .cd-lock-icon { font-size: 14px; flex-shrink: 0; }

  /* ── Module List ── */
  .cd-module-list { display: flex; flex-direction: column; gap: 8px; }
  .cd-module {
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--surface);
    overflow: hidden;
    transition: box-shadow 0.2s;
  }
  .cd-module--open { box-shadow: var(--shadow-md); }
  .cd-module-btn {
    width: 100%; text-align: left;
    display: flex; align-items: center; justify-content: space-between;
    gap: 16px;
    padding: 18px 20px;
    background: none; border: none; cursor: pointer;
    transition: background 0.15s;
  }
  .cd-module-btn:hover { background: var(--accent-soft); }
  .cd-module-left { display: flex; align-items: flex-start; gap: 14px; flex: 1; min-width: 0; }
  .cd-module-num-wrap {
    width: 28px; height: 28px; flex-shrink: 0;
    border-radius: 50%;
    border: 1px solid var(--border-strong);
    display: flex; align-items: center; justify-content: center;
    margin-top: 2px;
  }
  .cd-module-check { font-size: 12px; color: var(--green); font-weight: 600; }
  .cd-module-num { font-size: 11px; font-weight: 600; color: var(--text-tertiary); }
  .cd-module-info { flex: 1; min-width: 0; }
  .cd-module-badges { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 4px; }
  .cd-module-label {
    font-size: 10px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.12em;
    color: var(--text-tertiary);
  }
  .cd-module-locked {
    font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;
    color: var(--text-tertiary);
    background: var(--surface-2); border: 1px solid var(--border);
    padding: 1px 7px; border-radius: 100px;
  }
  .cd-module-done {
    font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;
    color: var(--green);
    background: var(--green-bg); border: 1px solid var(--green-border);
    padding: 1px 7px; border-radius: 100px;
  }
  .cd-module-title { font-size: 15px; font-weight: 400; color: var(--text-primary); line-height: 1.4; margin-bottom: 3px; }
  .cd-module-desc { font-size: 12px; color: var(--text-secondary); font-weight: 300; line-height: 1.5; }
  .cd-module-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
  .cd-module-dur { font-size: 12px; color: var(--text-tertiary); white-space: nowrap; }
  .cd-module-chevron {
    font-size: 20px; color: var(--text-tertiary);
    display: inline-block;
    transition: transform 0.2s;
    line-height: 1;
  }
  .cd-module-chevron--open { transform: rotate(90deg); }

  /* ── Module Body ── */
  .cd-module-body {
    border-top: 1px solid var(--border);
    padding: 20px;
    background: var(--surface-2);
    display: flex; flex-direction: column; gap: 20px;
  }

  /* ── Sub label ── */
  .cd-sub-label {
    font-size: 10px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.12em;
    color: var(--text-tertiary);
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 10px;
  }
  .cd-lessons-count {
    font-size: 10px; font-weight: 500;
    color: var(--text-tertiary);
    background: var(--surface);
    border: 1px solid var(--border);
    padding: 1px 7px; border-radius: 100px;
  }

  /* ── Lesson List ── */
  .cd-lessons-wrap {}
  .cd-lesson-list { display: flex; flex-direction: column; gap: 6px; }
  .cd-lesson {
    display: flex; align-items: flex-start; justify-content: space-between;
    gap: 12px;
    padding: 14px 16px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    transition: box-shadow 0.15s;
  }
  .cd-lesson:hover { box-shadow: var(--shadow-sm); }
  .cd-lesson--locked { opacity: 0.55; }
  .cd-lesson-left { display: flex; align-items: flex-start; gap: 12px; flex: 1; min-width: 0; }
  .cd-lesson-type-icon { font-size: 13px; flex-shrink: 0; margin-top: 2px; font-weight: 700; }
  .cd-lesson-info { flex: 1; min-width: 0; }
  .cd-lesson-title { font-size: 14px; font-weight: 400; color: var(--text-primary); line-height: 1.4; margin-bottom: 5px; }
  .cd-lesson-meta { display: flex; align-items: center; gap: 8px; }
  .cd-lesson-badge {
    font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em;
    color: var(--badge-color, var(--text-tertiary));
    background: color-mix(in srgb, var(--badge-color, var(--text-tertiary)) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--badge-color, var(--text-tertiary)) 25%, transparent);
    padding: 2px 7px; border-radius: 100px;
  }
  .cd-lesson-dur { font-size: 11px; color: var(--text-tertiary); }
  .cd-lesson-desc { font-size: 12px; color: var(--text-secondary); font-weight: 300; line-height: 1.5; margin-top: 5px; }
  .cd-lesson-action { flex-shrink: 0; display: flex; align-items: center; }
  .cd-lesson-lock { font-size: 14px; color: var(--text-tertiary); }

  /* ── Quiz Card ── */
  .cd-quiz-card {
    padding: 16px 18px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    display: flex; flex-direction: column; gap: 12px;
  }
  @media (min-width: 640px) {
    .cd-quiz-card { flex-direction: row; align-items: center; justify-content: space-between; }
  }
  .cd-quiz-info {}
  .cd-quiz-title { font-size: 14px; font-weight: 400; color: var(--text-primary); margin-bottom: 4px; }
  .cd-quiz-meta { font-size: 12px; color: var(--text-tertiary); }
  .cd-quiz-action { flex-shrink: 0; }
  .cd-status-tag {
    display: inline-block;
    font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em;
    padding: 5px 12px; border-radius: var(--radius-sm);
  }
  .cd-status-tag--locked { background: var(--surface-2); color: var(--text-tertiary); border: 1px solid var(--border); }
  .cd-status-tag--pending { background: var(--amber-bg); color: var(--amber-text); border: 1px solid var(--amber-border); }

  /* ── Module CTA ── */
  .cd-module-cta { display: flex; }

  /* ── Sidebar ── */
  .cd-sidebar {}
  @media (min-width: 900px) {
    .cd-sidebar { position: sticky; top: 72px; }
  }
  .cd-sidebar-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    overflow: hidden;
    box-shadow: var(--shadow-md);
  }

  /* ── Stats ── */
  .cd-stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
  }
  .cd-stat {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
    border-right: 1px solid var(--border);
  }
  .cd-stat:nth-child(even) { border-right: none; }
  .cd-stat-label {
    font-size: 10px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.12em;
    color: var(--text-tertiary);
    margin-bottom: 5px;
  }
  .cd-stat-value { font-size: 15px; font-weight: 400; color: var(--text-primary); }

  .cd-sidebar-divider { height: 1px; background: var(--border); }

  .cd-sidebar-section { padding: 18px 20px; }
  .cd-requisitos-text { font-size: 13px; color: var(--text-secondary); line-height: 1.6; font-weight: 300; margin-top: 6px; }

  /* ── Price block ── */
  .cd-price-block {
    padding: 20px;
    display: flex; flex-direction: column; gap: 12px;
  }
  .cd-price {
    font-family: 'DM Serif Display', serif;
    font-size: 28px; font-weight: 400;
    color: var(--text-primary);
    letter-spacing: -0.01em;
  }
  .cd-completed-note {
    font-size: 12px; color: var(--green); font-weight: 500;
    text-align: center;
  }

  /* ── Buttons ── */
  .cd-btn {
    display: inline-flex; align-items: center; gap: 6px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 500;
    letter-spacing: 0.02em;
    padding: 10px 20px;
    border-radius: var(--radius-md);
    border: none; cursor: pointer;
    text-decoration: none;
    transition: all 0.2s;
    white-space: nowrap;
  }
  .cd-btn-primary { background: var(--accent); color: #fff; }
  .cd-btn-primary:hover { opacity: 0.82; transform: translateY(-1px); }
  .cd-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
  .cd-btn-ghost {
    background: transparent; color: var(--text-secondary);
    border: 1px solid var(--border);
  }
  .cd-btn-ghost:hover { background: var(--accent-soft); color: var(--text-primary); }
  .cd-btn-sm { font-size: 12px; padding: 7px 14px; }
  .cd-btn-full { width: 100%; justify-content: center; padding: 13px 20px; }

  /* ── Modal ── */
  .cd-modal-overlay {
    position: fixed; inset: 0; z-index: 400;
    background: rgba(26,25,22,0.5);
    backdrop-filter: blur(4px);
  }
  .cd-modal {
    position: fixed; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    z-index: 500;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    padding: 32px;
    width: min(440px, calc(100vw - 32px));
    box-shadow: var(--shadow-lg);
    display: flex; flex-direction: column; gap: 12px;
    max-height: 90vh; overflow-y: auto;
  }
  .cd-modal-eyebrow {
    font-size: 10px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.14em;
    color: var(--text-tertiary);
  }
  .cd-modal-title {
    font-family: 'DM Serif Display', serif;
    font-size: 22px; font-weight: 400;
    color: var(--text-primary); line-height: 1.3;
  }
  .cd-modal-desc { font-size: 14px; color: var(--text-secondary); line-height: 1.6; font-weight: 300; }
  .cd-modal-price {
    font-family: 'DM Serif Display', serif;
    font-size: 26px; color: var(--text-primary);
    padding: 12px 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
  }
  .cd-modal-actions {
    display: flex; gap: 10px;
    flex-direction: column;
  }
  @media (min-width: 400px) {
    .cd-modal-actions { flex-direction: row; }
    .cd-modal-actions .cd-btn { flex: 1; justify-content: center; }
  }
`

export default globalStyles