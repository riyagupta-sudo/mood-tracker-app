import React, { useState, useEffect } from 'react';
import './Header.css';

const Header = () => {
    const [date, setDate] = useState();
    const [user, setUser] = useState(null);

    useEffect(() => {
        let trackedDateStr = localStorage.getItem('trackedDate');
        if (!trackedDateStr) {
            const d = new Date();
            trackedDateStr = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
            localStorage.setItem('trackedDate', trackedDateStr);
        }
        setDate(trackedDateStr);

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user", e);
            }
        }
    }, []);

    const handleDateChange = (e) => {
        localStorage.setItem('trackedDate', e.target.value);
        window.location.reload();
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    };

    return (
        <header className="top-header">
            <div className="header-titles">
                <h1>Mood Tracker</h1>
                <p>Understand yourself better, one day at a time.</p>
            </div>
            <div className="header-right">
                <div className="auth-links" id="auth-links">
                    {user ? (
                        <>
                            <span className="user-welcome" style={{ fontSize: '14px', fontWeight: '500', marginRight: '15px' }}>Hi, {user.name}</span>
                            <button onClick={handleLogout} style={{ background: 'none', border: '1px solid var(--red)', color: 'var(--red)', padding: '5px 12px', borderRadius: '8px', cursor: 'pointer' }}>Logout</button>
                        </>
                    ) : (
                        <>
                            <a href="/login.html" className="auth-link-btn">Log In</a>
                            <a href="/signup.html" className="auth-link-btn primary">Sign Up</a>
                        </>
                    )}
                </div>
                <div className="date-picker" style={{ padding: 0 }}>
                    <input
                        type="date"
                        value={date || ''}
                        onChange={handleDateChange}
                        style={{ border: 'none', outline: 'none', padding: '10px 15px', borderRadius: '12px', fontFamily: 'inherit', color: 'var(--text-black)', fontWeight: '600', cursor: 'pointer', background: 'transparent' }}
                    />
                </div>
            </div>
        </header>
    );
};

export default Header;
