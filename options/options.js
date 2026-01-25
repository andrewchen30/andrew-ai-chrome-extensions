document.addEventListener('DOMContentLoaded', () => {
    // 頁面切換
    const rulesPage = document.getElementById('rules-page');
    const statsPage = document.getElementById('stats-page');
    const navLinks = document.querySelectorAll('nav a[data-page]');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            if (page === 'rules') {
                rulesPage.classList.remove('hidden');
                statsPage.classList.add('hidden');
            } else if (page === 'stats') {
                rulesPage.classList.add('hidden');
                statsPage.classList.remove('hidden');
                loadStats();
            }
        });
    });

    // 生成時間選項（30分鐘間隔）
    function generateTimeOptions() {
        const options = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                options.push(time);
            }
        }
        return options;
    }

    const timeOptions = generateTimeOptions();

    // 載入規則列表
    async function loadRules() {
        const { blockingRules = [] } = await new Promise(resolve => {
            chrome.storage.sync.get({ blockingRules: [] }, resolve);
        });
        renderRules(blockingRules);
    }

    // 渲染規則列表
    function renderRules(rules) {
        const rulesList = document.getElementById('rules-list');
        rulesList.innerHTML = '';

        if (rules.length === 0) {
            rulesList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 32px;">尚無規則，請新增規則</p>';
            return;
        }

        rules.forEach(rule => {
            const ruleCard = createRuleCard(rule);
            rulesList.appendChild(ruleCard);
        });
    }

    // 建立規則卡片
    function createRuleCard(rule) {
        const card = document.createElement('div');
        card.className = 'rule-card';
        card.dataset.ruleId = rule.id;

        const weekdaysSchedule = rule.schedule.weekdays;
        const weekendsSchedule = rule.schedule.weekends;

        const exceptionCount = (rule.exceptionUrls || []).length;
        const hasManyExceptions = exceptionCount > 3;
        const bodyClass = hasManyExceptions ? 'rule-card-body has-many-exceptions' : 'rule-card-body';

        card.innerHTML = `
            <div class="rule-card-title-row">
                <div class="rule-card-title">
                    <input type="checkbox" class="rule-enabled" ${rule.enabled ? 'checked' : ''} data-rule-id="${rule.id}">
                    <span class="rule-domain">${rule.domain}</span>
                </div>
                <button class="delete-rule-btn" data-rule-id="${rule.id}">刪除</button>
            </div>
            
            <div class="${bodyClass}">
                <div class="rule-field">
                    <label>解鎖時長（分鐘）</label>
                    <input type="number" class="rule-unlock-duration" data-rule-id="${rule.id}" 
                           min="1" max="120" value="${rule.unlockDuration}">
                </div>

                <div class="rule-field">
                    <label>平日封鎖時間</label>
                    <div class="schedule-controls">
                        <select class="weekdays-type" data-rule-id="${rule.id}">
                            <option value="none" ${!weekdaysSchedule ? 'selected' : ''}>不封鎖</option>
                            <option value="all-day" ${weekdaysSchedule === 'all-day' ? 'selected' : ''}>整日</option>
                            <option value="range" ${weekdaysSchedule && weekdaysSchedule !== 'all-day' ? 'selected' : ''}>時間範圍</option>
                        </select>
                        <div class="time-range-group weekdays-range" style="display: ${weekdaysSchedule && weekdaysSchedule !== 'all-day' ? 'flex' : 'none'};">
                            <select class="time-start weekdays-start" data-rule-id="${rule.id}">
                                ${timeOptions.map(t => `<option value="${t}" ${weekdaysSchedule && weekdaysSchedule.start === t ? 'selected' : ''}>${t}</option>`).join('')}
                            </select>
                            <span>至</span>
                            <select class="time-end weekdays-end" data-rule-id="${rule.id}">
                                ${timeOptions.map(t => `<option value="${t}" ${weekdaysSchedule && weekdaysSchedule.end === t ? 'selected' : ''}>${t}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                </div>

                <div class="rule-field">
                    <label>週末封鎖時間</label>
                    <div class="schedule-controls">
                        <select class="weekends-type" data-rule-id="${rule.id}">
                            <option value="none" ${!weekendsSchedule ? 'selected' : ''}>不封鎖</option>
                            <option value="all-day" ${weekendsSchedule === 'all-day' ? 'selected' : ''}>整日</option>
                            <option value="range" ${weekendsSchedule && weekendsSchedule !== 'all-day' ? 'selected' : ''}>時間範圍</option>
                        </select>
                        <div class="time-range-group weekends-range" style="display: ${weekendsSchedule && weekendsSchedule !== 'all-day' ? 'flex' : 'none'};">
                            <select class="time-start weekends-start" data-rule-id="${rule.id}">
                                ${timeOptions.map(t => `<option value="${t}" ${weekendsSchedule && weekendsSchedule.start === t ? 'selected' : ''}>${t}</option>`).join('')}
                            </select>
                            <span>至</span>
                            <select class="time-end weekends-end" data-rule-id="${rule.id}">
                                ${timeOptions.map(t => `<option value="${t}" ${weekendsSchedule && weekendsSchedule.end === t ? 'selected' : ''}>${t}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                </div>

                <div class="rule-field exception-field">
                    <label>例外網址</label>
                    <div class="exception-urls-group">
                        <div class="input-group-small">
                            <input type="text" class="exception-url-input" data-rule-id="${rule.id}" placeholder="例如: /watch">
                            <button class="add-exception-btn" data-rule-id="${rule.id}">新增</button>
                        </div>
                        <ul class="exception-urls-list" data-rule-id="${rule.id}">
                            ${(rule.exceptionUrls || []).map(url => `
                                <li>
                                    <span>${url}</span>
                                    <button class="delete-exception-btn" data-rule-id="${rule.id}" data-url="${url}">刪除</button>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;

        // 綁定事件
        setupRuleCardEvents(card, rule);

        return card;
    }

    // 設定規則卡片事件
    function setupRuleCardEvents(card, rule) {
        const ruleId = rule.id;

        // 啟用/停用
        card.querySelector('.rule-enabled').addEventListener('change', async (e) => {
            await updateRule(ruleId, { enabled: e.target.checked });
            showStatus('規則已更新');
        });

        // 解鎖時長
        card.querySelector('.rule-unlock-duration').addEventListener('change', async (e) => {
            const value = Math.max(1, Math.min(120, parseInt(e.target.value) || 15));
            e.target.value = value;
            await updateRule(ruleId, { unlockDuration: value });
            showStatus('規則已更新');
        });

        // 平日時間類型
        const weekdaysType = card.querySelector('.weekdays-type');
        const weekdaysRange = card.querySelector('.weekdays-range');
        const weekdaysStart = card.querySelector('.weekdays-start');
        const weekdaysEnd = card.querySelector('.weekdays-end');
        weekdaysType.addEventListener('change', async (e) => {
            const value = e.target.value;
            weekdaysRange.style.display = value === 'range' ? 'flex' : 'none';
            
            let schedule = null;
            if (value === 'all-day') {
                schedule = 'all-day';
            } else if (value === 'range') {
                // 如果沒有預設值，設定為 00:00 到 23:30
                if (!weekdaysStart.value || weekdaysStart.value === '') {
                    weekdaysStart.value = '00:00';
                }
                if (!weekdaysEnd.value || weekdaysEnd.value === '') {
                    weekdaysEnd.value = '23:30';
                }
                const start = weekdaysStart.value;
                const end = weekdaysEnd.value;
                schedule = { start, end };
            }
            
            await updateRule(ruleId, { schedule: { ...rule.schedule, weekdays: schedule } });
            showStatus('規則已更新');
        });

        // 平日時間範圍
        weekdaysStart.addEventListener('change', async (e) => {
            const start = e.target.value;
            const end = weekdaysEnd.value || '23:30';
            await updateRule(ruleId, { 
                schedule: { 
                    ...rule.schedule, 
                    weekdays: { start, end } 
                } 
            });
            showStatus('規則已更新');
        });

        weekdaysEnd.addEventListener('change', async (e) => {
            const end = e.target.value;
            const start = weekdaysStart.value || '00:00';
            await updateRule(ruleId, { 
                schedule: { 
                    ...rule.schedule, 
                    weekdays: { start, end } 
                } 
            });
            showStatus('規則已更新');
        });

        // 週末時間類型
        const weekendsType = card.querySelector('.weekends-type');
        const weekendsRange = card.querySelector('.weekends-range');
        const weekendsStart = card.querySelector('.weekends-start');
        const weekendsEnd = card.querySelector('.weekends-end');
        weekendsType.addEventListener('change', async (e) => {
            const value = e.target.value;
            weekendsRange.style.display = value === 'range' ? 'flex' : 'none';
            
            let schedule = null;
            if (value === 'all-day') {
                schedule = 'all-day';
            } else if (value === 'range') {
                // 如果沒有預設值，設定為 00:00 到 23:30
                if (!weekendsStart.value || weekendsStart.value === '') {
                    weekendsStart.value = '00:00';
                }
                if (!weekendsEnd.value || weekendsEnd.value === '') {
                    weekendsEnd.value = '23:30';
                }
                const start = weekendsStart.value;
                const end = weekendsEnd.value;
                schedule = { start, end };
            }
            
            await updateRule(ruleId, { schedule: { ...rule.schedule, weekends: schedule } });
            showStatus('規則已更新');
        });

        // 週末時間範圍
        weekendsStart.addEventListener('change', async (e) => {
            const start = e.target.value;
            const end = weekendsEnd.value || '23:30';
            await updateRule(ruleId, { 
                schedule: { 
                    ...rule.schedule, 
                    weekends: { start, end } 
                } 
            });
            showStatus('規則已更新');
        });

        weekendsEnd.addEventListener('change', async (e) => {
            const end = e.target.value;
            const start = weekendsStart.value || '00:00';
            await updateRule(ruleId, { 
                schedule: { 
                    ...rule.schedule, 
                    weekends: { start, end } 
                } 
            });
            showStatus('規則已更新');
        });

        // 新增例外網址
        const exceptionInput = card.querySelector('.exception-url-input');
        const addExceptionBtn = card.querySelector('.add-exception-btn');
        addExceptionBtn.addEventListener('click', async () => {
            const url = exceptionInput.value.trim();
            if (url) {
                await addExceptionUrl(ruleId, url);
                exceptionInput.value = '';
                await loadRules(); // 重新載入以更新佈局
                showStatus('例外網址已新增');
            }
        });

        exceptionInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addExceptionBtn.click();
            }
        });

        // 刪除例外網址
        card.querySelectorAll('.delete-exception-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const url = btn.getAttribute('data-url');
                await removeExceptionUrl(ruleId, url);
                await loadRules(); // 重新載入以更新佈局
                showStatus('例外網址已刪除');
            });
        });

        // 刪除規則
        card.querySelector('.delete-rule-btn').addEventListener('click', async () => {
            if (confirm(`確定要刪除規則「${rule.domain}」嗎？`)) {
                await deleteRule(ruleId);
                await loadRules();
                showStatus('規則已刪除');
            }
        });
    }

    // 新增規則
    const newDomainInput = document.getElementById('new-domain-input');
    const addRuleBtn = document.getElementById('add-rule-btn');
    
    const handleAddRule = async () => {
        const domain = newDomainInput.value.trim();
        if (domain) {
            await createRule(domain.toLowerCase());
            newDomainInput.value = '';
            await loadRules();
            showStatus('規則已新增');
            newDomainInput.focus();
        }
    };
    
    addRuleBtn.addEventListener('click', handleAddRule);
    newDomainInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAddRule();
        }
    });

    // 建立規則
    async function createRule(domain) {
        const { blockingRules = [] } = await new Promise(resolve => {
            chrome.storage.sync.get({ blockingRules: [] }, resolve);
        });

        const newRule = {
            id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            domain: domain,
            enabled: true,
            unlockDuration: 15,
            exceptionUrls: [],
            schedule: {
                weekdays: 'all-day',
                weekends: 'all-day'
            }
        };

        blockingRules.push(newRule);
        await new Promise(resolve => {
            chrome.storage.sync.set({ blockingRules }, resolve);
        });
    }

    // 更新規則
    async function updateRule(ruleId, updates) {
        const { blockingRules = [] } = await new Promise(resolve => {
            chrome.storage.sync.get({ blockingRules: [] }, resolve);
        });

        const index = blockingRules.findIndex(r => r.id === ruleId);
        if (index !== -1) {
            blockingRules[index] = { ...blockingRules[index], ...updates };
            await new Promise(resolve => {
                chrome.storage.sync.set({ blockingRules }, resolve);
            });
        }
    }

    // 刪除規則
    async function deleteRule(ruleId) {
        const { blockingRules = [] } = await new Promise(resolve => {
            chrome.storage.sync.get({ blockingRules: [] }, resolve);
        });

        const filtered = blockingRules.filter(r => r.id !== ruleId);
        await new Promise(resolve => {
            chrome.storage.sync.set({ blockingRules: filtered }, resolve);
        });
    }

    // 新增例外網址
    async function addExceptionUrl(ruleId, url) {
        const { blockingRules = [] } = await new Promise(resolve => {
            chrome.storage.sync.get({ blockingRules: [] }, resolve);
        });

        const rule = blockingRules.find(r => r.id === ruleId);
        if (rule) {
            if (!rule.exceptionUrls) {
                rule.exceptionUrls = [];
            }
            if (!rule.exceptionUrls.includes(url)) {
                rule.exceptionUrls.push(url);
                await new Promise(resolve => {
                    chrome.storage.sync.set({ blockingRules }, resolve);
                });
            }
        }
    }

    // 刪除例外網址
    async function removeExceptionUrl(ruleId, url) {
        const { blockingRules = [] } = await new Promise(resolve => {
            chrome.storage.sync.get({ blockingRules: [] }, resolve);
        });

        const rule = blockingRules.find(r => r.id === ruleId);
        if (rule && rule.exceptionUrls) {
            rule.exceptionUrls = rule.exceptionUrls.filter(u => u !== url);
            await new Promise(resolve => {
                chrome.storage.sync.set({ blockingRules }, resolve);
            });
        }
    }

    // 載入統計
    async function loadStats() {
        const { blockingRules = [] } = await new Promise(resolve => {
            chrome.storage.sync.get({ blockingRules: [] }, resolve);
        });

        const { blockingStats = {} } = await new Promise(resolve => {
            chrome.storage.local.get({ blockingStats: {} }, resolve);
        });

        const tbody = document.getElementById('stats-tbody');
        tbody.innerHTML = '';

        if (blockingRules.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 32px; color: var(--text-secondary);">尚無規則</td></tr>';
            return;
        }

        blockingRules.forEach(rule => {
            const tr = document.createElement('tr');
            const count = blockingStats[rule.id] || 0;
            tr.innerHTML = `
                <td>${rule.domain}</td>
                <td>${rule.enabled ? '<span style="color: #22c55e;">啟用</span>' : '<span style="color: #717171;">停用</span>'}</td>
                <td>${count}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // 重置統計
    document.getElementById('reset-stats-btn').addEventListener('click', async () => {
        if (confirm('確定要重置所有統計資料嗎？')) {
            await new Promise(resolve => {
                chrome.storage.local.set({ blockingStats: {} }, resolve);
            });
            await loadStats();
            showStatsStatus('統計已重置');
        }
    });

    // 顯示狀態訊息
    function showStatus(msg, isError = false) {
        const statusMsg = document.getElementById('status-msg');
        statusMsg.textContent = msg;
        statusMsg.style.color = isError ? '#ef4444' : '#22c55e';
        setTimeout(() => {
            statusMsg.textContent = '';
        }, 2000);
    }

    function showStatsStatus(msg, isError = false) {
        const statusMsg = document.getElementById('stats-status-msg');
        statusMsg.textContent = msg;
        statusMsg.style.color = isError ? '#ef4444' : '#22c55e';
        setTimeout(() => {
            statusMsg.textContent = '';
        }, 2000);
    }

    // 初始化：載入規則
    loadRules();
});
