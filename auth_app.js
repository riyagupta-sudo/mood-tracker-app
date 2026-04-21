const API_BASE_URL = 'http://localhost:3000/api';

const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const errorMsg = document.getElementById('auth-error-msg');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Sync user data from cloud to local storage
            try {
                const syncRes = await fetch(`${API_BASE_URL}/sync`, {
                    headers: { 'Authorization': `Bearer ${data.token}` }
                });
                if (syncRes.ok) {
                    const syncData = await syncRes.json();
                    if (syncData.moodHistory) localStorage.setItem('moodHistory', syncData.moodHistory);
                    if (syncData.moodJournals) localStorage.setItem('moodJournals', syncData.moodJournals);
                }
            } catch(e) { console.error('Error syncing down', e); }

            window.location.href = 'index.html';

        } catch (err) {
            errorMsg.textContent = err.message;
        }
    });
}

if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            // Auto-login after signup
            const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const loginData = await loginRes.json();
            if(loginRes.ok) {
                localStorage.setItem('token', loginData.token);
                localStorage.setItem('user', JSON.stringify(loginData.user));
                
                try {
                    const syncRes = await fetch(`${API_BASE_URL}/sync`, {
                        headers: { 'Authorization': `Bearer ${loginData.token}` }
                    });
                    if (syncRes.ok) {
                        const syncData = await syncRes.json();
                        if (syncData.moodHistory) localStorage.setItem('moodHistory', syncData.moodHistory);
                        if (syncData.moodJournals) localStorage.setItem('moodJournals', syncData.moodJournals);
                    }
                } catch(e) { console.error('Error syncing down', e); }

                window.location.href = 'index.html';
            }
        } catch (err) {
            errorMsg.textContent = err.message;
        }
    });
}
