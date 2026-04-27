const messagesStyles = `
  .ms-root {
    background:
      radial-gradient(circle at 12% -10%, rgba(138, 90, 47, 0.1), transparent 40%),
      radial-gradient(circle at 95% 0%, rgba(31, 95, 87, 0.09), transparent 36%),
      linear-gradient(160deg, #f8f5ef 0%, #f2ede4 55%, #f8f7f3 100%);
  }

  .ms-shell {
    width: min(1200px, calc(100% - 2rem));
    margin: 0 auto;
  }

  .ms-brand { letter-spacing: 0.24em; }

  .ms-title { letter-spacing: -0.01em; }

  .ms-error {
    border-radius: 14px;
    border: 1px solid #fecaca;
    background: #fef2f2;
    color: #b91c1c;
  }

  .ms-layout {
    display: grid;
    gap: 1rem;
  }

  .ms-section-title {
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #7d7060;
  }

  .ms-conversation {
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  .ms-conversation.is-active {
    border-color: #1f1a14;
    background: #1f1a14;
    color: #fff;
  }

  .ms-msg {
    border-radius: 14px;
    border: 1px solid rgba(0, 0, 0, 0.08);
  }

  .ms-msg.is-own {
    background: #1f1a14;
    border-color: #1f1a14;
    color: #fff;
  }

  .ms-msg.is-other {
    background: #f7f4ee;
    color: #1f1a14;
  }

  @media (min-width: 900px) {
    .ms-layout {
      grid-template-columns: 320px 1fr;
    }
  }
`

export default messagesStyles
