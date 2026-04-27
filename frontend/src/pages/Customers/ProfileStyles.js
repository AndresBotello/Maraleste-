const profileStyles = `
  .pf-root {
    background:
      radial-gradient(circle at 12% -10%, rgba(138, 90, 47, 0.1), transparent 40%),
      radial-gradient(circle at 95% 0%, rgba(31, 95, 87, 0.09), transparent 36%),
      linear-gradient(160deg, #f8f5ef 0%, #f2ede4 55%, #f8f7f3 100%);
  }

  .pf-shell {
    width: min(1100px, calc(100% - 2rem));
    margin: 0 auto;
  }

  .pf-avatar {
    border: 1px solid rgba(0, 0, 0, 0.12);
    background: rgba(0, 0, 0, 0.04);
  }

  .pf-alert {
    border-radius: 12px;
    font-size: 13px;
  }

  .pf-alert.is-error {
    border: 1px solid #fecaca;
    background: #fef2f2;
    color: #b91c1c;
  }

  .pf-alert.is-success {
    border: 1px solid #bbf7d0;
    background: #f0fdf4;
    color: #15803d;
  }
`

export default profileStyles
