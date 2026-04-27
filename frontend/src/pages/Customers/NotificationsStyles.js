const notificationsStyles = `
  .nt-root {
    background:
      radial-gradient(circle at 10% -8%, rgba(31, 95, 87, 0.1), transparent 42%),
      radial-gradient(circle at 100% 0%, rgba(158, 61, 44, 0.08), transparent 38%),
      linear-gradient(160deg, #f8f5ef 0%, #f1ede6 52%, #f8f7f4 100%);
  }

  .nt-shell {
    width: min(1100px, calc(100% - 2rem));
    margin: 0 auto;
  }

  .nt-pill {
    border-radius: 999px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    background: #fff;
  }


  .nt-item {
    border-radius: 16px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    background: #fff;
    transition: box-shadow 0.18s ease;
  }

  .nt-item:hover {
    box-shadow: 0 8px 20px rgba(20, 17, 12, 0.08);
  }

  .nt-item.is-unread {
    border-color: rgba(59, 130, 246, 0.3);
    background: rgba(239, 246, 255, 0.72);
  }

  .nt-mini-btn {
    border-radius: 10px;
    border: 1px solid rgba(59, 130, 246, 0.4);
    color: #1d4ed8;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    font-size: 10px;
    transition: all 0.18s ease;
  }

  .nt-mini-btn:hover {
    background: #1d4ed8;
    color: #fff;
  }
`

export default notificationsStyles
