const FEATURE_MODAL_KEY = 'shortened_answers_modal_dismissed';

function showFeatureModal() {
  if (localStorage.getItem(FEATURE_MODAL_KEY)) {
    return;
  }

  const modal = document.createElement('div');
  modal.id = 'feature-modal';
  modal.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="modal-content">
      <h2>New Feature: Shortened Answers</h2>
      <p>We've added a new "Shortened answers" setting in Settings. When enabled, Wikipedia-sourced responses will be reduced to 60% of their original length with intelligent summarization and a short concluding sentence based on the content length.</p>
      <p>Try it out and let us know what you think!</p>
      <div class="modal-actions">
        <button id="feature-modal-ok" class="confirm">Got it</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const overlay = modal.querySelector('.modal-overlay');
  const okBtn = modal.querySelector('#feature-modal-ok');

  okBtn.addEventListener('click', () => {
    localStorage.setItem(FEATURE_MODAL_KEY, 'true');
    modal.remove();
  });

  overlay.addEventListener('click', () => {
    localStorage.setItem(FEATURE_MODAL_KEY, 'true');
    modal.remove();
  });
}

const style = document.createElement('style');
style.textContent = `
  #feature-modal {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    backdrop-filter: blur(4px);
    padding: 20px;
  }

  #feature-modal .modal-overlay {
    position: absolute;
    inset: 0;
    background: transparent;
  }

  #feature-modal .modal-content {
    background: var(--modal-bg, #1e1e1e);
    padding: 30px;
    border-radius: 28px;
    width: 100%;
    max-width: 400px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
    color: var(--text, #fff);
    text-align: center;
  }

  #feature-modal h2 {
    margin: 0 0 16px;
    font-size: 22px;
    color: var(--text, #fff);
  }

  #feature-modal p {
    margin: 0 0 12px;
    font-size: 15px;
    color: var(--text-secondary, #aaa);
    line-height: 1.5;
  }

  #feature-modal p:last-of-type {
    margin-bottom: 20px;
  }

  #feature-modal .modal-actions {
    margin-top: 0;
    display: flex;
    justify-content: center;
    gap: 12px;
  }

  #feature-modal-ok {
    padding: 10px 28px;
    border-radius: 20px;
    cursor: pointer;
    font-weight: 500;
    font-size: 15px;
    border: none;
    background-color: var(--primary, #007bff);
    color: #ffffff;
  }

  #feature-modal-ok:hover {
    filter: brightness(0.9);
    transform: translateY(-1px);
  }

  @media (max-width: 480px) {
    #feature-modal {
      padding: 16px;
      align-items: flex-end;
    }

    #feature-modal .modal-content {
      padding: 24px;
      border-radius: 24px 24px 0 0;
      max-width: none;
    }

    #feature-modal h2 {
      font-size: 20px;
    }

    #feature-modal p {
      font-size: 14px;
    }

    #feature-modal-ok {
      width: 100%;
      padding: 14px 20px;
    }
  }
`;
document.head.appendChild(style);

window.showFeatureModal = showFeatureModal;