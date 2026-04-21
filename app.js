// Global Theme Applier
if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
}

window.syncLocalToCloud = async function() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const moodHistory = JSON.parse(localStorage.getItem('moodHistory')) || {};
    const moodJournals = JSON.parse(localStorage.getItem('moodJournals')) || {};

    try {
        await fetch('http://localhost:3000/api/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ moodHistory, moodJournals })
        });
    } catch(e) { console.error("Cloud sync failed:", e); }
};

// Basic interactivity for the visual prototype
document.addEventListener('DOMContentLoaded', () => {
    
    // Toggle check-in button interaction
    const checkinBtn = document.querySelector('.checkin-btn');
    if (checkinBtn) {
        checkinBtn.addEventListener('click', () => {
            alert('Opening daily check-in modal... (Functionality to be implemented)');
        });
    }

    // Toggle Side Panel suggestion cards
    const suggestionCards = document.querySelectorAll('.suggestion-card');
    
    suggestionCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove active class and arrow circle from all
            suggestionCards.forEach(c => {
                c.classList.remove('active-suggestion');
                const oldArrow = c.querySelector('.arrow-circle');
                if (oldArrow) {
                    oldArrow.classList.replace('arrow-circle', 'small-icon');
                    oldArrow.innerHTML = '';
                    oldArrow.className = 'fa-solid fa-arrow-up-right-from-square small-icon';
                }
            });

            // Add active class to clicked card
            card.classList.add('active-suggestion');
            
            // Replace small icon with circle arrow
            const icon = card.querySelector('.small-icon') || card.querySelector('.fa-arrow-up-right-from-square');
            if (icon) {
                const parent = icon.parentNode;
                const newArrow = document.createElement('div');
                newArrow.className = 'arrow-circle';
                newArrow.innerHTML = '<i class="fa-solid fa-arrow-up-right-from-square"></i>';
                parent.replaceChild(newArrow, icon);
            }
        });
    });

    // Make Sidebar interactive visually
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Prevent if clicking submenu
            if(e.target.closest('.submenu')) return;

            menuItems.forEach(mi => {
                mi.classList.remove('active');
                const title = mi.querySelector('.menu-title');
                if(title) title.classList.add('text-gray');
            });

            item.classList.add('active');
            const title = item.querySelector('.menu-title');
            if(title) title.classList.remove('text-gray');
        });
    });

    // Global Date & Dynamic Calendar Sync
    const globalDatePicker = document.getElementById('global-date-picker');
    const currentDay = document.getElementById('current-day');
    const currentMonth = document.getElementById('current-month');
    
    // Default to today if no date is tracked in localStorage
    let trackedDateStr = localStorage.getItem('trackedDate');
    if (!trackedDateStr) {
        // Form YYYY-MM-DD local
        const d = new Date();
        trackedDateStr = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        localStorage.setItem('trackedDate', trackedDateStr);
    }
    const trackedDate = new Date(trackedDateStr + 'T00:00:00'); // Force local time

    if (globalDatePicker) {
        globalDatePicker.value = trackedDateStr;
        globalDatePicker.addEventListener('change', (e) => {
            localStorage.setItem('trackedDate', e.target.value);
            window.location.reload(); // Reload to sync graphs and trackers
        });
    }

    if (currentDay && currentMonth) {
        const optionsMonth = { month: 'long' };
        currentMonth.textContent = trackedDate.toLocaleDateString('en-US', optionsMonth);
        
        const day = trackedDate.getDate();
        let suffix = 'th';
        if (day % 10 === 1 && day !== 11) suffix = 'st';
        else if (day % 10 === 2 && day !== 12) suffix = 'nd';
        else if (day % 10 === 3 && day !== 13) suffix = 'rd';
        
        currentDay.textContent = `${day}${suffix}`;
    }

    // Dynamic Chart Analysis (Real Data Sync)
    const dynamicBars = document.getElementById('dynamic-bars');
    const moodHistoryJSON = localStorage.getItem('moodHistory');
    const moodHistory = moodHistoryJSON ? JSON.parse(moodHistoryJSON) : {};

    if (dynamicBars) {
        const endDate = new Date(trackedDateStr + 'T00:00:00');
        dynamicBars.innerHTML = ''; // clear old
        
        for (let i = 13; i >= 0; i--) {
            const dateCursor = new Date(endDate.getTime());
            dateCursor.setDate(endDate.getDate() - i);
            let dateStr = new Date(dateCursor.getTime() - (dateCursor.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
            const dNum = dateCursor.getDate().toString().padStart(2, '0');
            
            // User-based storage resolution
            const user = JSON.parse(localStorage.getItem('user')) || { name: 'guest' };
            const username = user.name || user.email || 'guest';
            const appData = JSON.parse(localStorage.getItem('smartMoodData')) || {};
            const moodHistory = appData[username]?.mood || {};
            
            const rawLog = moodHistory[dateStr];
            
            const wrapper = document.createElement('div');
            wrapper.className = 'bar-wrapper';
            if (i === 0) wrapper.classList.add('active-bar-wrapper'); 

            let height = 0;
            let barClass = 'bar';
            let label = "No data tracked.";
            let bgOverride = '';
            let moodLabel = "";

            if (rawLog) {
               if (typeof rawLog === 'object' && rawLog.height !== undefined) {
                   height = rawLog.height;
                   moodLabel = rawLog.moodLabel || "Unknown";
               } else if (typeof rawLog === 'string') {
                   moodLabel = rawLog;
                   if (moodLabel.includes('Happy')) height = 85;
                   else if (moodLabel.includes('Excited')) height = 95;
                   else if (moodLabel.includes('Sad')) height = 20;
                   else height = 50; 
               }

               if (height >= 80) barClass += ' highlight-green-bar'; 
               else if (height > 50) barClass += ' highlight-purple-bar';
               else if (height <= 30) barClass += ' highlight-red-bar';
               else barClass += ' highlight-orange-bar';
               label = `You logged '${moodLabel}'`;
            } else if (i !== 0) { 
               // Empty past data
               wrapper.style.opacity = '0.4';
               bgOverride = 'background-color: transparent; border: 1px dashed var(--text-light-gray);';
            }

            wrapper.innerHTML = `
                ${i === 0 ? `<div class="tooltip" id="dynamic-mood-tooltip" style="opacity: 0; transition: opacity 0.5s ease-in-out; pointer-events: none; z-index:100; top: -50px;">${label}</div>` : ''}
                <div class="${barClass}" style="height: ${height}%; ${bgOverride}"></div>
                <span>${dNum}</span>
            `;

            dynamicBars.appendChild(wrapper);

            wrapper.addEventListener('click', () => {
                document.querySelectorAll('.bar-wrapper').forEach(bw => bw.classList.remove('active-bar-wrapper'));
                wrapper.classList.add('active-bar-wrapper');
                
                let tooltip = document.getElementById('dynamic-mood-tooltip');
                if (!tooltip) {
                    wrapper.insertAdjacentHTML('afterbegin', `<div class="tooltip" id="dynamic-mood-tooltip" style="opacity: 0; transition: opacity 0.5s ease-in-out; pointer-events: none; z-index: 100; top:-50px;"></div>`);
                    tooltip = document.getElementById('dynamic-mood-tooltip');
                } else {
                    wrapper.appendChild(tooltip); 
                }
                tooltip.innerHTML = `Date: ${dateStr}<br>${label}`;
                void tooltip.offsetWidth;
                tooltip.style.opacity = '1';
                setTimeout(() => { if (tooltip) tooltip.style.opacity = '0'; }, 3000);
            });
        }
    }

    // Auth check logic
    const authLinksDiv = document.getElementById('auth-links');
    if (authLinksDiv) {
        const user = localStorage.getItem('user');
        if (user) {
            const parsedUser = JSON.parse(user);
            authLinksDiv.innerHTML = `
                <span class="user-welcome" style="font-size: 14px; font-weight: 500; margin-right: 15px;">Hi, ${parsedUser.name}</span>
                <button id="logoutBtn" style="background: none; border: 1px solid var(--red); color: var(--red); padding: 5px 12px; border-radius: 8px; cursor: pointer;">Logout</button>
            `;
            document.getElementById('logoutBtn').addEventListener('click', () => {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                window.location.reload();
            });
        }
    }
});
