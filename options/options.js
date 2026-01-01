document.addEventListener('DOMContentLoaded', () => {
    const domainInput = document.getElementById('domain-input');
    const addBtn = document.getElementById('add-btn');
    const domainList = document.getElementById('domain-list');
    const statusMsg = document.getElementById('status-msg');

    // Default domains
    const defaultDomains = ['facebook.com', 'youtube.com', 'chess.com'];

    // Load domains from storage
    chrome.storage.sync.get({ blockedDomains: defaultDomains }, (data) => {
        renderList(data.blockedDomains);
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
                    showStatus('已刪除網域');
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

    function showStatus(msg, isError = false) {
        statusMsg.textContent = msg;
        statusMsg.style.color = isError ? '#ef4444' : '#22c55e';
        setTimeout(() => {
            statusMsg.textContent = '';
        }, 2000);
    }
});
