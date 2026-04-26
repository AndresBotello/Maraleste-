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
    --green-border: #C3DFCb;
    --radius-sm: 6px;
    --radius-md: 10px;
    --radius-lg: 16px;
    --radius-xl: 20px;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
    --shadow-md: 0 4px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05);
    --shadow-lg: 0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .mp-root {
    font-family: 'DM Sans', system-ui, sans-serif;
    background: var(--bg);
    color: var(--text-primary);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Loading ── */
  .mp-loading-screen {
    background: var(--bg);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Sans', sans-serif;
  }
  .mp-loading-inner, .mp-error-inner {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
  .mp-spinner {
    width: 32px; height: 32px;
    border: 2px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: mp-spin 0.8s linear infinite;
  }
  @keyframes mp-spin { to { transform: rotate(360deg); } }
  .mp-loading-text { font-size: 14px; color: var(--text-secondary); letter-spacing: 0.02em; }
  .mp-error-icon { font-size: 40px; color: var(--text-tertiary); }
  .mp-error-title { font-family: 'DM Serif Display', serif; font-size: clamp(20px, 3vw, 28px); color: var(--text-primary); font-weight: 400; }

  /* ── Header ── */
  .mp-header {
    position: sticky; top: 0; z-index: 100;
    background: rgba(247,246,243,0.92);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
  }
  .mp-header-inner {
    max-width: 1280px; margin: 0 auto;
    padding: 0 24px;
    height: 56px;
    display: flex; align-items: center; justify-content: space-between;
    gap: 16px;
  }
  .mp-header-left {
    display: flex; align-items: center;
    gap: 16px; min-width: 0; flex: 1;
  }
  .mp-logo {
    font-family: 'DM Serif Display', serif;
    font-size: 16px;
    letter-spacing: 0.18em;
    color: var(--text-primary);
    text-decoration: none;
    flex-shrink: 0;
    transition: opacity 0.2s;
  }
  .mp-logo:hover { opacity: 0.6; }
  .mp-header-divider {
    width: 1px; height: 20px;
    background: var(--border-strong);
    flex-shrink: 0;
  }
  .mp-header-meta {
    display: flex; flex-direction: column;
    gap: 1px; min-width: 0;
  }
  .mp-meta-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--text-tertiary);
    font-weight: 500;
  }
  .mp-meta-title {
    font-size: 13px;
    color: var(--text-primary);
    font-weight: 400;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 300px;
  }
  .mp-header-right {
    display: flex; align-items: center; gap: 8px; flex-shrink: 0;
  }
  .mp-nav-link {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-secondary);
    background: none; border: none; cursor: pointer;
    padding: 6px 10px;
    border-radius: var(--radius-sm);
    transition: color 0.2s, background 0.2s;
  }
  .mp-nav-link:hover { color: var(--text-primary); background: var(--accent-soft); }
  .mp-sidebar-toggle {
    width: 36px; height: 36px;
    display: flex; align-items: center; justify-content: center;
    background: var(--accent-soft); border: none; cursor: pointer;
    border-radius: var(--radius-sm);
    transition: background 0.2s;
  }
  .mp-sidebar-toggle:hover { background: var(--border); }
  .mp-toggle-icon { font-size: 16px; color: var(--text-primary); }
  .mp-header-progress {
    height: 2px; background: var(--border);
  }
  .mp-header-progress-fill {
    height: 100%;
    background: var(--accent);
    transition: width 0.5s ease;
  }

  /* ── Layout ── */
  .mp-layout {
    display: flex;
    flex: 1;
    max-width: 1280px;
    width: 100%;
    margin: 0 auto;
    position: relative;
  }

  /* ── Main ── */
  .mp-main {
    flex: 1;
    overflow: auto;
    min-width: 0;
  }
  .mp-content-area {
    padding: 32px 24px 64px;
    max-width: 760px;
    margin: 0 auto;
  }
  @media (min-width: 1024px) {
    .mp-content-area { padding: 40px 48px 80px; }
  }

  /* ── Empty ── */
  .mp-empty-state {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 16px;
    padding: 80px 24px;
    text-align: center;
  }
  .mp-empty-icon { font-size: 48px; color: var(--text-tertiary); }
  .mp-empty-title { font-family: 'DM Serif Display', serif; font-size: 24px; font-weight: 400; color: var(--text-secondary); }

  /* ── Lesson Header ── */
  .mp-lesson-header { margin-bottom: 28px; }
  .mp-lesson-meta-row {
    display: flex; align-items: center; gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 14px;
  }
  .mp-lesson-badge {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--badge-color, var(--text-primary));
    background: color-mix(in srgb, var(--badge-color, var(--text-primary)) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--badge-color, var(--text-primary)) 25%, transparent);
    padding: 4px 10px;
    border-radius: 100px;
  }
  .mp-badge-icon { font-size: 10px; }
  .mp-lesson-duration {
    display: flex; align-items: center; gap: 6px;
    font-size: 12px; color: var(--text-tertiary);
  }
  .mp-duration-dot {
    width: 3px; height: 3px; border-radius: 50%;
    background: var(--text-tertiary);
  }
  .mp-lesson-number {
    margin-left: auto;
    font-size: 12px; color: var(--text-tertiary);
    font-variant-numeric: tabular-nums;
  }
  .mp-lesson-title {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(26px, 4vw, 38px);
    font-weight: 400;
    line-height: 1.2;
    color: var(--text-primary);
    letter-spacing: -0.01em;
  }

  /* ── Video ── */
  .mp-video-wrap {
    margin-bottom: 28px;
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--border);
    background: #000;
  }
  .mp-video-ratio {
    position: relative;
    width: 100%;
    padding-bottom: 56.25%;
  }
  .mp-video-iframe {
    position: absolute; inset: 0; width: 100%; height: 100%;
    border: none;
  }
  .mp-video-native { width: 100%; display: block; }

  /* ── Progress strip ── */
  .mp-progress-strip {
    display: flex; align-items: center; justify-content: space-between;
    gap: 16px;
    padding: 14px 18px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    margin-bottom: 28px;
  }
  .mp-progress-strip-left { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
  .mp-progress-bar-wrap {
    width: 120px; height: 3px;
    background: var(--border);
    border-radius: 100px;
    flex-shrink: 0;
  }
  .mp-progress-bar-fill {
    height: 100%; background: var(--accent);
    border-radius: 100px;
    transition: width 0.5s ease;
  }
  .mp-progress-label { font-size: 12px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mp-progress-pct { font-size: 13px; font-weight: 600; color: var(--text-primary); font-variant-numeric: tabular-nums; flex-shrink: 0; }

  /* ── Content Blocks ── */
  .mp-blocks { display: flex; flex-direction: column; gap: 16px; margin-bottom: 28px; }
  .mp-block {
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 24px 28px;
    background: var(--surface);
  }
  .mp-block-objetivo { background: var(--accent-soft); border-color: var(--border-strong); }
  .mp-block-ejemplos { background: #F0F6FF; border-color: #C9DEFF; }
  .mp-block-caso { background: #F5F0FF; border-color: #D4C5F9; }
  .mp-block-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: var(--text-tertiary);
    margin-bottom: 12px;
  }
  .mp-block-body { font-size: 15px; color: var(--text-secondary); line-height: 1.7; font-weight: 300; }
  .mp-prose {
    font-size: 15px;
    color: var(--text-secondary);
    line-height: 1.8;
    font-weight: 300;
    white-space: pre-wrap;
  }

  .mp-concept-list { list-style: none; display: flex; flex-direction: column; gap: 8px; }
  .mp-concept-item {
    display: flex; gap: 12px; align-items: flex-start;
    padding: 10px 14px;
    background: var(--accent-soft);
    border-radius: var(--radius-sm);
    font-size: 14px; color: var(--text-secondary); line-height: 1.6;
  }
  .mp-concept-bullet { color: var(--text-tertiary); flex-shrink: 0; font-weight: 600; }

  /* ── Image block ── */
  .mp-image-block {
    border-radius: var(--radius-lg);
    overflow: hidden;
    border: 1px solid var(--border);
    margin-bottom: 0;
  }
  .mp-lesson-img { width: 100%; height: clamp(200px, 40vw, 400px); object-fit: cover; display: block; }
  .mp-image-caption { padding: 20px 24px; background: var(--surface); border-top: 1px solid var(--border); }
  .mp-caption-body { font-size: 14px; color: var(--text-secondary); line-height: 1.6; }

  /* ── Resources ── */
  .mp-resources-block {
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 24px 28px;
    background: var(--surface);
    margin-bottom: 28px;
  }
  .mp-resources-title {
    font-family: 'DM Serif Display', serif;
    font-size: 18px; font-weight: 400;
    margin-bottom: 16px;
    color: var(--text-primary);
  }
  .mp-resource-list { display: flex; flex-direction: column; gap: 4px; }
  .mp-resource-item { display: flex; }
  .mp-resource-link, .mp-resource-text {
    display: flex; align-items: baseline; gap: 8px;
    font-size: 14px; line-height: 1.6;
    padding: 6px 0;
    border-bottom: 1px solid var(--border);
    width: 100%;
  }
  .mp-resource-link { color: var(--accent); text-decoration: none; transition: opacity 0.2s; }
  .mp-resource-link:hover { opacity: 0.65; }
  .mp-resource-text { color: var(--text-secondary); }
  .mp-resource-arrow { flex-shrink: 0; font-size: 12px; color: var(--text-tertiary); }

  /* ── Empty lesson ── */
  .mp-empty-lesson {
    display: flex; align-items: center; gap: 16px;
    padding: 32px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    color: var(--text-secondary);
    font-size: 14px;
    margin-bottom: 28px;
  }
  .mp-empty-lesson-icon { font-size: 28px; color: var(--text-tertiary); }

  /* ── Challenge ── */
  .mp-challenge-block {
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    margin-bottom: 28px;
    background: var(--surface);
  }
  .mp-challenge-header {
    padding: 20px 24px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 12px;
    background: var(--accent-soft);
  }
  .mp-challenge-badge {
    font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.12em;
    background: var(--accent); color: #fff;
    padding: 3px 9px; border-radius: 100px;
  }
  .mp-challenge-title { font-size: 15px; font-weight: 500; color: var(--text-primary); }
  .mp-challenge-desc {
    padding: 16px 24px;
    font-size: 14px; color: var(--text-secondary);
    line-height: 1.7; border-bottom: 1px solid var(--border);
    white-space: pre-line;
  }
  .mp-submission-status {
    padding: 16px 24px;
    border-bottom: 1px solid var(--border);
    background: var(--green-bg);
  }
  .mp-submission-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: var(--green); margin-bottom: 6px; }
  .mp-submission-state { font-size: 14px; font-weight: 500; color: var(--text-primary); text-transform: capitalize; }
  .mp-submission-img-wrap { margin-top: 12px; display: flex; flex-direction: column; gap: 8px; }
  .mp-submission-img { width: 100%; max-width: 400px; height: 200px; object-fit: cover; border-radius: var(--radius-md); border: 1px solid var(--green-border); }
  .mp-feedback-text { margin-top: 10px; font-size: 13px; color: var(--text-secondary); }
  .mp-challenge-form { padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; }
  .mp-file-input { display: none; }
  .mp-file-label { display: inline-block; cursor: pointer; }
  .mp-file-btn {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 13px; font-weight: 500;
    color: var(--text-primary);
    border: 1px dashed var(--border-strong);
    padding: 10px 18px;
    border-radius: var(--radius-md);
    transition: background 0.2s, border-color 0.2s;
    background: var(--accent-soft);
  }
  .mp-file-btn:hover { background: var(--border); border-color: var(--accent); }
  .mp-preview-wrap {
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    overflow: hidden;
  }
  .mp-preview-img { width: 100%; height: 160px; object-fit: cover; display: block; }
  .mp-preview-meta {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 16px; gap: 12px;
    border-top: 1px solid var(--border);
  }
  .mp-preview-name { font-size: 13px; color: var(--text-primary); font-weight: 500; }
  .mp-preview-size { font-size: 11px; color: var(--text-tertiary); margin-top: 2px; }
  .mp-remove-btn {
    background: none; border: 1px solid var(--border);
    color: var(--text-secondary); font-size: 12px;
    width: 28px; height: 28px;
    border-radius: var(--radius-sm);
    cursor: pointer; transition: all 0.2s; flex-shrink: 0;
  }
  .mp-remove-btn:hover { background: #FEE2E2; border-color: #FECACA; color: #B91C1C; }
  .mp-textarea {
    width: 100%; padding: 12px 16px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; color: var(--text-primary);
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    resize: vertical;
    outline: none;
    transition: border-color 0.2s;
    line-height: 1.6;
  }
  .mp-textarea::placeholder { color: var(--text-tertiary); }
  .mp-textarea:focus { border-color: var(--accent); background: var(--surface); }
  .mp-challenge-submit { align-self: flex-start; }

    /* ── Nav Bar ── */
    .mp-nav-bar {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 10px;
    padding: 16px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    margin-bottom: 28px;
    }

    /* En móviles: layout vertical con botones de ancho completo */
    @media (max-width: 640px) {
    .mp-nav-bar {
        grid-template-columns: 1fr;
        gap: 12px;
        padding: 12px;
    }
    
    .mp-nav-btn {
        width: 100%;
        justify-content: center;
    }
    
    .mp-complete-btn {
        width: 100%;
        justify-content: center;
    }
    
    /* Reordenar para mejor UX móvil: Completar arriba, Anterior y Siguiente abajo */
    .mp-nav-bar > .mp-complete-btn {
        order: -1;
    }
    
    .mp-nav-bar > .mp-nav-btn:first-child {
        order: 1;
    }
    
    .mp-nav-bar > .mp-nav-btn:last-child {
        order: 2;
        text-align: center;
    }
    }

    .mp-nav-btn {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-primary);
    background: none;
    border: 1px solid var(--border);
    padding: 10px 16px;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    }

    @media (max-width: 640px) {
    .mp-nav-btn {
        font-size: 11px;
        padding: 12px 16px;
    }
    }

    .mp-nav-btn:hover:not(:disabled) { 
    background: var(--accent); 
    color: #fff; 
    border-color: var(--accent); 
    }

    .mp-nav-btn--disabled { 
    opacity: 0.3; 
    cursor: not-allowed; 
    }

    .mp-nav-bar > .mp-nav-btn:last-child { 
    text-align: right; 
    }

    .mp-complete-btn {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 10px 20px;
    border-radius: var(--radius-md);
    border: none; 
    cursor: pointer;
    transition: all 0.2s;
    background: var(--accent); 
    color: #fff;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    }

    @media (max-width: 640px) {
    .mp-complete-btn {
        font-size: 11px;
        padding: 12px 20px;
    }
    }

    .mp-complete-btn--done { 
    background: var(--green); 
    }

    .mp-complete-btn:hover { 
    opacity: 0.85; 
    transform: translateY(-1px); 
    }

  /* ── Quiz CTA ── */
  .mp-quiz-cta {
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    overflow: hidden;
    background: var(--surface);
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  .mp-quiz-cta-content {
    padding: 32px 32px 24px;
    border-bottom: 1px solid var(--border);
  }
  .mp-quiz-eyebrow {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    font-weight: 600;
    color: var(--text-tertiary);
    margin-bottom: 10px;
  }
  .mp-quiz-heading {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(22px, 3vw, 30px);
    font-weight: 400;
    color: var(--text-primary);
    margin-bottom: 10px;
  }
  .mp-quiz-sub { font-size: 14px; color: var(--text-secondary); line-height: 1.6; }
  .mp-quiz-actions {
    padding: 20px 32px;
    display: flex; flex-wrap: wrap; gap: 12px;
    align-items: center;
  }

  /* ── Buttons ── */
  .mp-btn {
    display: inline-flex; align-items: center; gap: 6px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 500;
    letter-spacing: 0.02em;
    padding: 11px 22px;
    border-radius: var(--radius-md);
    border: none; cursor: pointer;
    text-decoration: none;
    transition: all 0.2s;
    white-space: nowrap;
  }
  .mp-btn-primary {
    background: var(--accent); color: #fff;
  }
  .mp-btn-primary:hover { opacity: 0.82; transform: translateY(-1px); }
  .mp-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
  .mp-btn-ghost {
    background: transparent;
    color: var(--text-secondary);
    border: 1px solid var(--border);
  }
  .mp-btn-ghost:hover { background: var(--accent-soft); color: var(--text-primary); }

  /* ── Links ── */
  .mp-link { color: var(--accent); text-decoration: underline; text-underline-offset: 3px; font-size: 14px; transition: opacity 0.2s; }
  .mp-link:hover { opacity: 0.65; }
  .mp-link-sm { font-size: 12px; }

  /* ── Card info ── */
  .mp-card { display: flex; align-items: baseline; gap: 10px; padding: 16px 20px; border-radius: var(--radius-md); margin-bottom: 20px; }
  .mp-card-info { background: #EFF6FF; border: 1px solid #BFDBFE; }
  .mp-card-icon { flex-shrink: 0; }

  /* ── Sidebar ── */
  .mp-sidebar {
    width: 320px; flex-shrink: 0;
    background: var(--surface);
    border-left: 1px solid var(--border);
    display: flex; flex-direction: column;
    position: fixed; right: 0; top: 0; bottom: 0; z-index: 200;
    transform: translateX(100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
  }
  .mp-sidebar--open { transform: translateX(0); }
  .mp-sidebar-overlay {
    position: fixed; inset: 0; z-index: 150;
    background: rgba(26,25,22,0.4);
    backdrop-filter: blur(2px);
  }
  @media (min-width: 1024px) {
    .mp-sidebar {
      position: sticky; top: 58px;
      height: calc(100vh - 58px);
      transform: translateX(0) !important;
    }
    .mp-sidebar-overlay { display: none !important; }
  }
  .mp-sidebar-head {
    padding: 20px 20px 16px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
    flex-shrink: 0;
    background: var(--surface);
  }
  .mp-sidebar-module-label {
    font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em;
    color: var(--text-tertiary); font-weight: 600; margin-bottom: 4px;
  }
  .mp-sidebar-module-title { font-size: 14px; font-weight: 500; color: var(--text-primary); line-height: 1.4; }
  .mp-sidebar-close {
    background: none; border: none; cursor: pointer;
    color: var(--text-tertiary); font-size: 16px;
    width: 28px; height: 28px;
    display: flex; align-items: center; justify-content: center;
    border-radius: var(--radius-sm); transition: all 0.2s;
    flex-shrink: 0;
  }
  .mp-sidebar-close:hover { background: var(--accent-soft); color: var(--text-primary); }
  .mp-sidebar-progress {
    padding: 14px 20px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }
  .mp-sidebar-bar {
    height: 3px; background: var(--border); border-radius: 100px;
    margin-bottom: 8px;
  }
  .mp-sidebar-bar-fill {
    height: 100%; background: var(--accent); border-radius: 100px;
    transition: width 0.4s ease;
  }
  .mp-sidebar-stats {
    display: flex; justify-content: space-between;
    font-size: 11px; color: var(--text-tertiary);
  }
  .mp-lesson-list {
    flex: 1; overflow-y: auto; padding: 12px;
    display: flex; flex-direction: column; gap: 4px;
  }
  .mp-lesson-item {
    width: 100%; text-align: left;
    padding: 12px 14px;
    border-radius: var(--radius-md);
    border: 1px solid transparent;
    background: none; cursor: pointer;
    transition: all 0.18s;
    display: flex; align-items: flex-start; gap: 12px;
  }
  .mp-lesson-item:hover { background: var(--accent-soft); }
  .mp-lesson-item--active {
    background: var(--accent) !important;
    border-color: var(--accent) !important;
  }
  .mp-lesson-item--done {
    background: var(--green-bg);
    border-color: var(--green-border);
  }
  .mp-lesson-item-num {
    width: 22px; height: 22px; flex-shrink: 0;
    border-radius: 50%; border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    margin-top: 1px;
  }
  .mp-lesson-item--active .mp-lesson-item-num { border-color: rgba(255,255,255,0.3); }
  .mp-lesson-item--done .mp-lesson-item-num { background: var(--green); border-color: var(--green); }
  .mp-check { font-size: 11px; color: #fff; }
  .mp-num { font-size: 10px; font-weight: 600; color: var(--text-tertiary); }
  .mp-lesson-item--active .mp-num { color: rgba(255,255,255,0.7); }
  .mp-lesson-item-body { flex: 1; min-width: 0; }
  .mp-lesson-item-top { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
  .mp-lesson-item-type {
    font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;
    color: var(--badge-color, var(--text-tertiary));
  }
  .mp-lesson-item--active .mp-lesson-item-type { color: rgba(255,255,255,0.65) !important; }
  .mp-lesson-item-dur { font-size: 10px; color: var(--text-tertiary); margin-left: auto; }
  .mp-lesson-item--active .mp-lesson-item-dur { color: rgba(255,255,255,0.5); }
  .mp-lesson-item-title {
    font-size: 13px; font-weight: 400; color: var(--text-primary);
    line-height: 1.4;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .mp-lesson-item--active .mp-lesson-item-title { color: #fff; }
  .mp-lesson-item--done .mp-lesson-item-title { color: var(--green); }
  .mp-sidebar-instructor {
    padding: 16px 20px;
    border-top: 1px solid var(--border);
    flex-shrink: 0;
  }
  .mp-instructor-text { font-size: 12px; color: var(--text-tertiary); line-height: 1.8; }
  .mp-instructor-text strong { color: var(--text-secondary); }

  /* ── Responsive helpers ── */
  .mp-hide-mobile { display: none !important; }
  .mp-hide-xs { display: none !important; }
  .mp-show-mobile { display: flex !important; }
  @media (min-width: 640px) {
    .mp-hide-xs { display: flex !important; }
  }
  @media (min-width: 1024px) {
    .mp-hide-mobile { display: flex !important; }
    .mp-show-mobile { display: none !important; }
  }

  /* ── Scrollbar ── */
  .mp-lesson-list::-webkit-scrollbar { width: 4px; }
  .mp-lesson-list::-webkit-scrollbar-track { background: transparent; }
  .mp-lesson-list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 100px; }
`

export default globalStyles