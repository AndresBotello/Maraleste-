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
    --green: #2D6A3F;
    --green-bg: #EEF7F1;
    --green-border: #C3DFCb;
    --red: #DC2626;
    --red-bg: #FEE2E2;
    --red-border: #FECACA;
    --amber: #F59E0B;
    --amber-bg: #FFFBEB;
    --amber-border: #FCD34D;
    --blue: #3B82F6;
    --blue-bg: #EFF6FF;
    --blue-border: #BFDBFE;
    --radius-sm: 6px;
    --radius-md: 10px;
    --radius-lg: 16px;
    --radius-xl: 20px;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
    --shadow-md: 0 4px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05);
    --shadow-lg: 0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .cq-root {
    font-family: 'DM Sans', system-ui, sans-serif;
    background: var(--bg);
    color: var(--text-primary);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Loading ── */
  .cq-loading-screen {
    background: var(--bg);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Sans', sans-serif;
  }
  .cq-loading-inner, .cq-error-inner {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
  .cq-spinner {
    width: 32px; height: 32px;
    border: 2px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: cq-spin 0.8s linear infinite;
  }
  @keyframes cq-spin { to { transform: rotate(360deg); } }
  .cq-loading-text { font-size: 14px; color: var(--text-secondary); letter-spacing: 0.02em; }
  .cq-error-icon { font-size: 40px; color: var(--text-tertiary); }
  .cq-error-title { font-family: 'DM Serif Display', serif; font-size: clamp(20px, 3vw, 28px); color: var(--text-primary); font-weight: 400; }

  /* ── Header ── */
  .cq-header {
    position: sticky; top: 0; z-index: 100;
    background: rgba(247,246,243,0.92);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
  }
  .cq-header-inner {
    max-width: 1280px; margin: 0 auto;
    padding: 0 16px;
    height: auto;
    min-height: 56px;
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }
  @media (max-width: 768px) {
    .cq-header-inner { padding: 0 12px; min-height: 50px; }
  }
  @media (max-width: 480px) {
    .cq-header-inner { gap: 8px; min-height: 48px; }
  }
  .cq-header-left {
    display: flex; align-items: center;
    gap: 12px; min-width: 0; flex: 1;
  }
  @media (max-width: 480px) {
    .cq-header-left { gap: 8px; }
  }
  .cq-logo {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(12px, 3vw, 16px);
    letter-spacing: 0.18em;
    color: var(--text-primary);
    text-decoration: none;
    flex-shrink: 0;
    transition: opacity 0.2s;
  }
  .cq-logo:hover { opacity: 0.6; }
  .cq-header-divider {
    width: 1px; height: 16px;
    background: var(--border-strong);
    flex-shrink: 0;
  }
  @media (max-width: 480px) {
    .cq-header-divider { height: 14px; }
  }
  .cq-header-meta {
    display: flex; flex-direction: column;
    gap: 1px; min-width: 0;
  }
  .cq-meta-label {
    font-size: clamp(8px, 2vw, 10px);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--text-tertiary);
    font-weight: 500;
  }
  .cq-meta-title {
    font-size: clamp(11px, 2vw, 13px);
    color: var(--text-primary);
    font-weight: 400;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: clamp(150px, 30vw, 300px);
  }
  .cq-header-right {
    display: flex; align-items: center; gap: 6px; flex-shrink: 0;
  }
  .cq-nav-link {
    font-size: clamp(10px, 2vw, 12px);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-secondary);
    background: none; border: none; cursor: pointer;
    padding: 6px 10px;
    border-radius: var(--radius-sm);
    transition: color 0.2s, background 0.2s;
    white-space: nowrap;
  }
  @media (max-width: 480px) {
    .cq-nav-link { padding: 4px 6px; font-size: 9px; }
  }
  .cq-nav-link:hover { color: var(--text-primary); background: var(--accent-soft); }

  /* ── Main ── */
  .cq-main {
    flex: 1;
    overflow: auto;
    min-width: 0;
    padding: clamp(16px, 5vw, 32px) clamp(12px, 4vw, 24px) clamp(40px, 8vw, 64px);
  }
  @media (min-width: 768px) {
    .cq-main { padding: 32px 24px 64px; }
  }
  @media (min-width: 1024px) {
    .cq-main { padding: 40px 48px 80px; }
  }
  .cq-content-area {
    max-width: 760px;
    margin: 0 auto;
    width: 100%;
  }

  /* ── Empty / Error ── */
  .cq-empty-state {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 16px;
    padding: 80px 24px;
    text-align: center;
  }
  .cq-empty-icon { font-size: 48px; color: var(--text-tertiary); }
  .cq-empty-title { font-family: 'DM Serif Display', serif; font-size: 24px; font-weight: 400; color: var(--text-secondary); }

  /* ── Quiz Info ── */
  .cq-quiz-info { margin-bottom: clamp(16px, 4vw, 28px); }
  .cq-quiz-title {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(20px, 5vw, 38px);
    font-weight: 400;
    line-height: 1.2;
    color: var(--text-primary);
    letter-spacing: -0.01em;
    margin-bottom: 8px;
  }
  .cq-quiz-desc { 
    font-size: clamp(13px, 2vw, 15px); 
    color: var(--text-secondary); 
    line-height: 1.6; 
    font-weight: 300;
  }

  /* ── Progress ── */
  .cq-progress-strip {
    display: flex; align-items: center; justify-content: space-between;
    gap: clamp(10px, 2vw, 16px);
    padding: clamp(10px, 2vw, 14px) clamp(12px, 2vw, 18px);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    margin-bottom: clamp(16px, 4vw, 28px);
    flex-wrap: wrap;
  }
  @media (max-width: 480px) {
    .cq-progress-strip { flex-direction: column; align-items: flex-start; }
  }
  .cq-progress-strip-left { 
    display: flex; 
    align-items: center; 
    gap: clamp(8px, 2vw, 12px); 
    flex: 1; 
    min-width: 0; 
  }
  .cq-progress-bar-wrap {
    width: clamp(80px, 20vw, 120px);
    height: 3px;
    background: var(--border);
    border-radius: 100px;
    flex-shrink: 0;
  }
  .cq-progress-bar-fill {
    height: 100%; 
    background: var(--accent);
    border-radius: 100px;
    transition: width 0.5s ease;
  }
  .cq-progress-label { 
    font-size: clamp(10px, 2vw, 12px); 
    color: var(--text-secondary); 
    white-space: nowrap; 
    overflow: hidden; 
    text-overflow: ellipsis;
  }
  .cq-progress-pct { 
    font-size: clamp(11px, 2vw, 13px); 
    font-weight: 600; 
    color: var(--text-primary); 
    font-variant-numeric: tabular-nums; 
    flex-shrink: 0; 
  }

  /* ── Question Card ── */
  .cq-question-card {
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: clamp(16px, 4vw, 24px) clamp(14px, 4vw, 28px);
    background: var(--surface);
    margin-bottom: clamp(16px, 4vw, 28px);
  }
  .cq-question-text {
    font-size: clamp(14px, 3vw, 18px);
    font-weight: 500;
    color: var(--text-primary);
    line-height: 1.6;
    margin-bottom: clamp(14px, 4vw, 24px);
  }
  .cq-options { display: flex; flex-direction: column; gap: 10px; }
  .cq-option-label {
    display: flex; align-items: center; gap: 10px;
    padding: clamp(10px, 3vw, 14px) clamp(12px, 3vw, 16px);
    border: 1.5px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--surface);
    cursor: pointer;
    transition: all 0.2s;
  }
  .cq-option-label:hover { border-color: var(--border-strong); background: var(--surface-2); }
  .cq-option-label.active { border-color: var(--accent); background: var(--accent-soft); }
  .cq-option-input { 
    width: clamp(14px, 4vw, 18px); 
    height: clamp(14px, 4vw, 18px);
    flex-shrink: 0; 
    cursor: pointer; 
    accent-color: var(--accent); 
  }
  .cq-option-text { 
    font-size: clamp(12px, 2.5vw, 14px); 
    color: var(--text-primary); 
    font-weight: 400; 
    line-height: 1.5; 
  }

  /* ── Question Navigation ── */
  .cq-question-nav {
    display: flex; flex-wrap: wrap; gap: clamp(6px, 2vw, 8px); justify-content: center;
    margin-bottom: clamp(16px, 4vw, 28px);
    padding: 0 clamp(8px, 2vw, 12px);
  }
  .cq-question-btn {
    width: clamp(28px, 8vw, 36px); 
    height: clamp(28px, 8vw, 36px);
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    background: var(--surface);
    font-size: clamp(10px, 2vw, 12px); 
    font-weight: 600;
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.2s;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .cq-question-btn:hover { border-color: var(--border-strong); background: var(--surface-2); }
  .cq-question-btn.active { border-color: var(--accent); background: var(--accent); color: #fff; }
  .cq-question-btn.answered { border-color: var(--green-border); background: var(--green-bg); color: var(--green); }

  /* ── Navigation Bar ── */
  .cq-nav-bar {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: clamp(8px, 2vw, 10px);
    padding: clamp(12px, 3vw, 16px);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    margin-bottom: clamp(16px, 4vw, 28px);
  }
  @media (max-width: 640px) {
    .cq-nav-bar { 
      grid-template-columns: 1fr; 
      gap: clamp(10px, 3vw, 12px); 
      padding: clamp(10px, 2vw, 12px);
    }
  }
  .cq-nav-btn {
    font-family: 'DM Sans', sans-serif;
    font-size: clamp(10px, 2vw, 12px);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-primary);
    background: none;
    border: 1px solid var(--border);
    padding: clamp(8px, 2vw, 10px) clamp(12px, 2vw, 16px);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 36px;
  }
  .cq-nav-btn:hover:not(:disabled) { background: var(--accent); color: #fff; border-color: var(--accent); }
  .cq-nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  @media (max-width: 640px) {
    .cq-nav-btn { 
      width: 100%; 
      justify-content: center;
      padding: clamp(10px, 2vw, 12px);
    }
  }

  /* ── Submit Button ── */
  .cq-submit-btn {
    font-family: 'DM Sans', sans-serif;
    font-size: clamp(10px, 2vw, 12px);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: clamp(8px, 2vw, 10px) clamp(14px, 2vw, 20px);
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
    min-height: 36px;
  }
  .cq-submit-btn:hover { opacity: 0.85; transform: translateY(-1px); }
  .cq-submit-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
  .cq-submit-btn.green { background: var(--green); }
  @media (max-width: 640px) {
    .cq-submit-btn { 
      width: 100%;
      padding: clamp(10px, 2vw, 12px);
    }
  }

  /* ── Results ── */
  .cq-results-heading {
    text-align: center;
    margin-bottom: clamp(16px, 4vw, 28px);
  }
  .cq-result-emoji { font-size: clamp(32px, 8vw, 48px); margin-bottom: clamp(12px, 3vw, 16px); }
  .cq-result-title {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(20px, 5vw, 38px);
    font-weight: 400;
    color: var(--text-primary);
    margin-bottom: 8px;
  }
  .cq-result-subtitle { 
    font-size: clamp(12px, 2.5vw, 15px); 
    color: var(--text-secondary); 
    line-height: 1.6; 
  }

  /* ── Score Card ── */
  .cq-score-card {
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: clamp(16px, 4vw, 24px) clamp(14px, 4vw, 28px);
    background: var(--surface);
    margin-bottom: clamp(16px, 4vw, 28px);
    text-align: center;
  }
  .cq-score-value { 
    font-size: clamp(42px, 10vw, 64px); 
    font-weight: 300; 
    color: var(--text-primary); 
    margin-bottom: 6px; 
  }
  .cq-score-max { 
    font-size: clamp(14px, 3vw, 18px); 
    color: var(--text-tertiary); 
    margin-bottom: 16px; 
  }
  .cq-score-bar { 
    height: 4px; 
    background: var(--border); 
    border-radius: 100px; 
    overflow: hidden; 
    margin-bottom: 16px; 
  }
  .cq-score-bar-fill { 
    height: 100%; 
    border-radius: 100px; 
    transition: width 0.5s ease; 
  }

  /* ── Score Stats ── */
  .cq-score-stats { 
    display: grid; 
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); 
    gap: clamp(10px, 3vw, 16px);
  }
  @media (max-width: 480px) {
    .cq-score-stats { grid-template-columns: 1fr; }
  }
  .cq-stat {
    padding: clamp(10px, 2vw, 14px);
    border-radius: var(--radius-md);
    background: var(--surface-2);
    text-align: center;
  }
  .cq-stat-value { 
    font-size: clamp(18px, 4vw, 24px); 
    font-weight: 600; 
    color: var(--text-primary); 
  }
  .cq-stat-label { 
    font-size: clamp(9px, 2vw, 11px); 
    text-transform: uppercase; 
    letter-spacing: 0.08em; 
    color: var(--text-tertiary); 
    margin-top: 4px; 
  }

  /* ── Review ── */
  .cq-review-section { margin-bottom: clamp(16px, 4vw, 28px); }
  .cq-review-title {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(18px, 4vw, 22px);
    font-weight: 400;
    color: var(--text-primary);
    margin-bottom: clamp(12px, 3vw, 16px);
  }
  .cq-review-items { display: flex; flex-direction: column; gap: clamp(10px, 3vw, 16px); }
  .cq-review-item {
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: clamp(14px, 4vw, 24px) clamp(12px, 4vw, 28px);
    background: var(--surface);
  }
  .cq-review-item-header { display: flex; align-items: flex-start; gap: clamp(8px, 2vw, 12px); margin-bottom: 12px; }
  .cq-review-item-icon { font-size: clamp(16px, 4vw, 20px); flex-shrink: 0; }
  .cq-review-item-number {
    font-size: clamp(10px, 2vw, 12px);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 600;
    color: var(--text-tertiary);
  }
  .cq-review-item-text {
    font-size: clamp(13px, 2vw, 15px);
    color: var(--text-primary);
    font-weight: 500;
    line-height: 1.5;
  }
  .cq-review-answer-block {
    padding: clamp(8px, 2vw, 12px) clamp(10px, 2vw, 14px);
    border-radius: var(--radius-md);
    margin: clamp(8px, 2vw, 12px) 0;
    font-size: clamp(11px, 2vw, 13px);
    line-height: 1.5;
  }
  .cq-review-answer-correct { background: var(--green-bg); border: 1px solid var(--green-border); color: var(--green); }
  .cq-review-answer-incorrect { background: var(--red-bg); border: 1px solid var(--red-border); color: var(--red); }
  .cq-review-explanation {
    padding: clamp(8px, 2vw, 12px) clamp(10px, 2vw, 14px);
    border-radius: var(--radius-md);
    background: var(--blue-bg);
    border: 1px solid var(--blue-border);
    font-size: clamp(11px, 2vw, 13px);
    line-height: 1.5;
    color: var(--blue);
  }

  /* ── Actions ── */
  .cq-actions { 
    display: flex; 
    flex-wrap: wrap; 
    gap: clamp(8px, 2vw, 12px); 
    justify-content: center; 
    margin-bottom: clamp(16px, 4vw, 28px); 
  }
  @media (max-width: 640px) {
    .cq-actions { flex-direction: column; }
  }
  .cq-btn {
    display: inline-flex; align-items: center; gap: 6px;
    font-family: 'DM Sans', sans-serif;
    font-size: clamp(11px, 2vw, 13px); 
    font-weight: 500;
    letter-spacing: 0.02em;
    padding: clamp(9px, 2vw, 11px) clamp(16px, 3vw, 22px);
    border-radius: var(--radius-md);
    border: none; cursor: pointer;
    text-decoration: none;
    transition: all 0.2s;
    white-space: nowrap;
    min-height: 36px;
  }
  @media (max-width: 640px) {
    .cq-btn { 
      width: 100%; 
      justify-content: center;
      padding: clamp(10px, 2vw, 12px);
    }
  }
  .cq-btn-primary {
    background: var(--accent); color: #fff;
  }
  .cq-btn-primary:hover { opacity: 0.82; transform: translateY(-1px); }
  .cq-btn-ghost {
    background: transparent;
    color: var(--text-secondary);
    border: 1px solid var(--border);
  }
  .cq-btn-ghost:hover { background: var(--accent-soft); color: var(--text-primary); }
  .cq-btn.green { background: var(--green); color: #fff; }
  .cq-btn.green:hover { opacity: 0.85; transform: translateY(-1px); }

  /* ── Footer ── */
  .cq-footer { 
    margin-top: clamp(24px, 5vw, 40px); 
    text-align: center; 
    font-size: clamp(10px, 2vw, 12px); 
    color: var(--text-tertiary);
    padding: 0 clamp(8px, 2vw, 12px);
    line-height: 1.5;
  }
  .cq-footer-note { color: var(--text-secondary); font-weight: 500; }

  /* ── Responsive ── */
  @media (max-width: 1024px) {
    .cq-empty-state { padding: clamp(40px, 8vw, 80px) clamp(16px, 4vw, 24px); }
  }

  @media (max-width: 768px) {
    .cq-question-card { padding: clamp(14px, 3vw, 18px) clamp(12px, 3vw, 20px); }
    .cq-review-item { padding: clamp(12px, 3vw, 18px) clamp(12px, 3vw, 20px); }
    .cq-score-stats { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 640px) {
    .cq-main { padding: clamp(12px, 3vw, 20px) clamp(10px, 2vw, 16px) clamp(30px, 5vw, 40px); }
    .cq-question-card { 
      padding: clamp(12px, 2vw, 16px) clamp(10px, 2vw, 14px); 
      margin-bottom: clamp(12px, 2vw, 16px);
    }
    .cq-question-text { margin-bottom: clamp(12px, 2vw, 16px); }
    .cq-options { gap: clamp(8px, 2vw, 10px); }
    .cq-option-label { gap: clamp(8px, 2vw, 10px); }
    .cq-score-stats { grid-template-columns: 1fr; }
    .cq-review-item { 
      padding: clamp(12px, 2vw, 16px) clamp(10px, 2vw, 14px);
      margin-bottom: clamp(8px, 2vw, 12px);
    }
    .cq-score-card { padding: clamp(12px, 2vw, 16px) clamp(10px, 2vw, 14px); }
    .cq-progress-strip { padding: clamp(8px, 2vw, 12px) clamp(10px, 2vw, 14px); }
  }

  @media (max-width: 480px) {
    .cq-main { padding: 10px 8px 30px; }
    .cq-empty-state { padding: clamp(40px, 10vw, 60px) 12px; }
    .cq-question-nav { 
      gap: clamp(4px, 1vw, 6px);
      padding: 0 6px;
    }
    .cq-question-btn { 
      width: clamp(24px, 6vw, 32px);
      height: clamp(24px, 6vw, 32px);
    }
    .cq-meta-title { max-width: clamp(100px, 20vw, 150px); }
    .cq-progress-bar-wrap { width: clamp(60px, 15vw, 100px); }
    .cq-question-text { font-size: clamp(12px, 2vw, 14px); }
    .cq-option-label { padding: clamp(8px, 1.5vw, 10px) clamp(8px, 1.5vw, 12px); }
    .cq-score-value { font-size: clamp(32px, 8vw, 48px); }
    .cq-stat { padding: clamp(8px, 1.5vw, 10px); }
  }
`

export default globalStyles
