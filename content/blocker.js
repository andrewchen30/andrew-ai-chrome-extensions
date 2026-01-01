(function() {
    const defaultDomains = ['facebook.com', 'youtube.com', 'chess.com'];

    // Check if the current page should be blocked
    chrome.storage.sync.get({ blockedDomains: defaultDomains }, (data) => {
        const hostname = window.location.hostname;
        const isBlocked = data.blockedDomains.some(domain => hostname.includes(domain));

        if (isBlocked) {
            initBlocker();
        }
    });

    function initBlocker() {
        const overlay = document.createElement('div');
        overlay.id = 'andrew-blocker-overlay';
        overlay.innerHTML = `
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
        `;

        function tryInject() {
            if (!document.documentElement) {
                setTimeout(tryInject, 10);
                return;
            }
            document.documentElement.appendChild(overlay);
            
            // Add style to prevent scrolling
            const style = document.createElement('style');
            style.textContent = `
                body, html { overflow: hidden !important; height: 100% !important; }
            `;
            document.documentElement.appendChild(style);

            setupEventListeners(overlay, style);
        }

        tryInject();
    }

    function setupEventListeners(overlay, styleTag) {
        const passwordInput = overlay.querySelector('#andrew-password-input');
        const unlockBtn = overlay.querySelector('#andrew-unlock-btn');
        const passwordSection = overlay.querySelector('#password-section');
        const countdownSection = overlay.querySelector('#countdown-section');
        const countdownDisplay = overlay.querySelector('#andrew-countdown');

        unlockBtn.addEventListener('click', () => {
            const password = passwordInput.value;
            if (password === 'andrew20') {
                startCountdown(passwordSection, countdownSection, countdownDisplay, overlay, styleTag);
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

    function startCountdown(passwordSection, countdownSection, countdownDisplay, overlay, styleTag) {
        passwordSection.classList.add('hidden');
        countdownSection.classList.remove('hidden');

        let seconds = 30;
        const interval = setInterval(() => {
            seconds--;
            countdownDisplay.textContent = seconds;

            if (seconds <= 0) {
                clearInterval(interval);
                removeOverlay(overlay, styleTag);
            }
        }, 1000);
    }

    function removeOverlay(overlay, styleTag) {
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.remove();
            styleTag.remove();
        }, 500);
    }
})();
