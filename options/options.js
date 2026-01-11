document.addEventListener('DOMContentLoaded', () => {
    const domainInput = document.getElementById('domain-input');
    const addBtn = document.getElementById('add-btn');
    const domainList = document.getElementById('domain-list');
    const statusMsg = document.getElementById('status-msg');
    const timerList = document.getElementById('timer-list');
    const timerStatusMsg = document.getElementById('timer-status-msg');

    // Default domains
    const defaultDomains = ['facebook.com', 'youtube.com', 'chess.com'];

    // Load domains from storage
    chrome.storage.sync.get({ blockedDomains: defaultDomains }, (data) => {
        renderList(data.blockedDomains);
        loadTimerSettings(data.blockedDomains);
    });

    // Add new domain
    addBtn.addEventListener('click', () => {
        const domain = domainInput.value.trim().toLowerCase();
        if (domain) {
            chrome.storage.sync.get({ blockedDomains: defaultDomains }, (data) => {
                const newList = [...data.blockedDomains];
                if (!newList.includes(domain)) {
                    newList.push(domain);
                    chrome.storage.sync.set({ blockedDomains: newList }, () => {
                        renderList(newList);
                        loadTimerSettings(newList);
                        domainInput.value = '';
                        showStatus('已成功新增網域！');
                    });
                } else {
                    showStatus('該網域已在清單中', true);
                }
            });
        }
    });

    // Delete domain
    domainList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const domainToDelete = e.target.getAttribute('data-domain');
            chrome.storage.sync.get({ blockedDomains: defaultDomains }, (data) => {
                const newList = data.blockedDomains.filter(d => d !== domainToDelete);
                chrome.storage.sync.set({ blockedDomains: newList }, () => {
                    renderList(newList);
                    loadTimerSettings(newList);
                    showStatus('已刪除網域');
                });
            });
        }
    });

    // Timer input change handler
    timerList.addEventListener('change', (e) => {
        if (e.target.classList.contains('timer-input')) {
            const domain = e.target.getAttribute('data-domain');
            let minutes = parseInt(e.target.value);
            
            // 驗證輸入
            if (isNaN(minutes) || minutes < 1) {
                minutes = 1;
                e.target.value = 1;
            } else if (minutes > 120) {
                minutes = 120;
                e.target.value = 120;
            }

            // 儲存設定
            chrome.storage.sync.get({ domainTimers: {} }, (data) => {
                const timers = data.domainTimers || {};
                timers[domain] = minutes;
                chrome.storage.sync.set({ domainTimers: timers }, () => {
                    showTimerStatus(`${domain} 的時長已更新為 ${minutes} 分鐘`);
                });
            });
        }
    });

    function renderList(domains) {
        domainList.innerHTML = '';
        domains.forEach(domain => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="domain-name">${domain}</span>
                <button class="delete-btn" data-domain="${domain}">刪除</button>
            `;
            domainList.appendChild(li);
        });
    }

    function loadTimerSettings(domains) {
        chrome.storage.sync.get({ domainTimers: {} }, (data) => {
            const timers = data.domainTimers || {};
            renderTimerList(domains, timers);
        });
    }

    function renderTimerList(domains, timers) {
        timerList.innerHTML = '';
        domains.forEach(domain => {
            const minutes = timers[domain] || 15; // 預設 15 分鐘
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="timer-item-left">${domain}</span>
                <div class="timer-item-right">
                    <input type="number" class="timer-input" data-domain="${domain}" 
                           min="1" max="120" value="${minutes}">
                    <span>分鐘</span>
                </div>
            `;
            timerList.appendChild(li);
        });
    }

    function showStatus(msg, isError = false) {
        statusMsg.textContent = msg;
        statusMsg.style.color = isError ? '#ef4444' : '#22c55e';
        setTimeout(() => {
            statusMsg.textContent = '';
        }, 2000);
    }

    function showTimerStatus(msg) {
        timerStatusMsg.textContent = msg;
        timerStatusMsg.style.color = '#22c55e';
        setTimeout(() => {
            timerStatusMsg.textContent = '';
        }, 2000);
    }
});
