(function() {
    const defaultDomains = ['facebook.com', 'youtube.com', 'chess.com'];

    const css = `
    :host {
        all: initial;
    }
    #andrew-blocker-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: #ffffff;
        z-index: 2147483647;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #222222;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        transition: opacity 0.4s ease;
        line-height: 1.5;
        text-align: center;
        box-sizing: border-box;
    }

    #andrew-blocker-overlay *, 
    #andrew-blocker-overlay *::before, 
    #andrew-blocker-overlay *::after {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }

    #andrew-blocker-container {
        padding: 32px;
        text-align: center;
        max-width: 400px;
        width: 90%;
    }

    #andrew-blocker-container h1 {
        font-size: 28px;
        margin-bottom: 16px;
        color: #222222;
        font-weight: 700;
        letter-spacing: -0.5px;
        line-height: 1.2;
    }

    #andrew-blocker-container p {
        color: #717171;
        margin-bottom: 40px;
        line-height: 1.5;
        font-size: 16px;
    }

    #andrew-password-input {
        width: 100%;
        padding: 14px 18px;
        background: #ffffff;
        border: 1px solid #b0b0b0;
        border-radius: 8px;
        color: #222222;
        font-size: 16px;
        margin-bottom: 16px;
        outline: none;
        transition: all 0.2s ease;
        box-sizing: border-box;
        text-align: center;
        height: auto;
        display: block;
    }

    #andrew-password-input:focus {
        border-color: #222222;
        box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
    }

    #andrew-unlock-btn {
        width: 100%;
        padding: 14px;
        background: #eba434;
        border: none;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        font-size: 16px;
        cursor: pointer;
        transition: transform 0.1s ease, background 0.2s ease;
        display: block;
    }

    #andrew-unlock-btn:hover {
        background: #d18f2b;
    }

    #andrew-unlock-btn:active {
        transform: scale(0.98);
    }

    #andrew-countdown {
        font-size: 3.5rem;
        font-weight: 700;
        margin: 1.5rem 0;
        color: #eba434;
        letter-spacing: -1px;
    }

    .hidden {
        display: none !important;
    }

    .error-shake {
        animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
    }

    @keyframes shake {
        10%, 90% { transform: translate3d(-1px, 0, 0); }
        20%, 80% { transform: translate3d(2px, 0, 0); }
        30%, 50%, 70% { transform: translate3d(-3px, 0, 0); }
        40%, 60% { transform: translate3d(3px, 0, 0); }
    }
    `;

    // Check if the current page should be blocked
    chrome.storage.sync.get({ blockedDomains: defaultDomains }, (data) => {
        const hostname = window.location.hostname;
        const isBlocked = data.blockedDomains.some(domain => hostname.includes(domain));

        if (isBlocked) {
            initBlocker();
        }
    });

    function initBlocker() {
        // Create Host
        const host = document.createElement('div');
        host.id = 'andrew-ai-blocker-host';
        const shadow = host.attachShadow({mode: 'open'});

        // Inject Styles & HTML
        shadow.innerHTML = `
            <style>${css}</style>
            <div id="andrew-blocker-overlay">
                <div id="andrew-blocker-container">
                    <h1>專注模式已啟動</h1>
                    <p>這個網站可能會分散你的注意力。如果你真的需要進入，請輸入密碼並等待冷卻。</p>
                    
                    <div id="password-section">
                        <input type="password" id="andrew-password-input" placeholder="請輸入密碼..." autocomplete="off">
                        <button id="andrew-unlock-btn">開始解鎖</button>
                    </div>

                    <div id="countdown-section" class="hidden">
                        <p>解鎖中，請稍候...</p>
                        <div id="andrew-countdown">30</div>
                    </div>
                </div>
            </div>
        `;

        function tryInject() {
            if (!document.documentElement) {
                setTimeout(tryInject, 10);
                return;
            }
            document.documentElement.appendChild(host);
            
            // Add style to document body to prevent scrolling
            // Note: This must be on the main document to work effectively
            const style = document.createElement('style');
            style.id = 'andrew-blocker-scroll-lock';
            style.textContent = `
                body, html { overflow: hidden !important; height: 100% !important; }
            `;
            document.documentElement.appendChild(style);

            setupEventListeners(shadow, style, host);
        }

        tryInject();
    }

    function setupEventListeners(shadowRoot, styleTag, hostElement) {
        const passwordInput = shadowRoot.querySelector('#andrew-password-input');
        const unlockBtn = shadowRoot.querySelector('#andrew-unlock-btn');
        const passwordSection = shadowRoot.querySelector('#password-section');
        const countdownSection = shadowRoot.querySelector('#countdown-section');
        const countdownDisplay = shadowRoot.querySelector('#andrew-countdown');

        unlockBtn.addEventListener('click', () => {
            const password = passwordInput.value;
            if (password === 'andrew20') {
                startCountdown(passwordSection, countdownSection, countdownDisplay, hostElement, styleTag);
            } else {
                passwordInput.classList.add('error-shake');
                passwordInput.style.borderColor = '#ef4444';
                setTimeout(() => {
                    passwordInput.classList.remove('error-shake');
                }, 500);
            }
        });

        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                unlockBtn.click();
            }
        });
    }

    function startCountdown(passwordSection, countdownSection, countdownDisplay, hostElement, styleTag) {
        passwordSection.classList.add('hidden');
        countdownSection.classList.remove('hidden');

        let seconds = 30;
        const interval = setInterval(() => {
            seconds--;
            countdownDisplay.textContent = seconds;

            if (seconds <= 0) {
                clearInterval(interval);
                removeOverlay(hostElement, styleTag);
            }
        }, 1000);
    }

    function removeOverlay(hostElement, styleTag) {
        hostElement.style.transition = 'opacity 0.5s';
        hostElement.style.opacity = '0';
        setTimeout(() => {
            hostElement.remove();
            styleTag.remove();
        }, 500);
    }
})();
