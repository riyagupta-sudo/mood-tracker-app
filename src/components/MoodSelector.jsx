import React, { useState, useEffect } from 'react';

const MoodSelector = () => {
    const [selectedMood, setSelectedMood] = useState(null);

    // Keep reference stable to avoid infinite useEffect renders, but defined inside so Vite HMR recovers
    const moods = React.useMemo(() => [
        { label: 'Happy', emoji: '😊', value: 85 },
        { label: 'Excited', emoji: '🤩', value: 95 },
        { label: 'Neutral', emoji: '😐', value: 50 },
        { label: 'Tired', emoji: '🥱', value: 30 },
        { label: 'Sad', emoji: '😢', value: 20 },
        { label: 'Anxious', emoji: '😰', value: 15 },
        { label: 'Angry', emoji: '😠', value: 10 },
        { label: 'Confused', emoji: '😕', value: 40 }
    ], []);

    // Determine current user safely
    let currentUser = 'guest';
    try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            if (userStr.startsWith('{')) {
                const storedUser = JSON.parse(userStr);
                currentUser = storedUser.name || storedUser.email || 'guest';
            } else {
                currentUser = userStr; // fallback if someone just stored a plain string name
            }
        }
    } catch(e) {}

    // Read initial date context and existing mood
    useEffect(() => {
        let trackedDateStr = localStorage.getItem('trackedDate');
        if (!trackedDateStr) {
            const d = new Date();
            trackedDateStr = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
            localStorage.setItem('trackedDate', trackedDateStr);
        }
        
        // Load user-specific data from localStorage
        try {
            const userDataJSON = localStorage.getItem(currentUser + "_data");
            if (userDataJSON) {
                const userData = JSON.parse(userDataJSON);
                const history = userData.mood || {};
                const loggedMood = history[trackedDateStr];
                
                if (loggedMood) {
                    setSelectedMood(`${loggedMood.moodLabel} ${moods.find(m => m.label === loggedMood.moodLabel)?.emoji || ''}`);
                }
            }
        } catch(e) {
            console.error(e);
        }
    }, [currentUser, moods]);

    const handleMoodClick = (mood) => {
        setSelectedMood(`${mood.label} ${mood.emoji}`);
        
        let trackedDateStr = localStorage.getItem('trackedDate');
        
        // Get or initialize user-specific data
        let userData = { mood: {}, journal: {} };
        try {
            const parsed = JSON.parse(localStorage.getItem(currentUser + "_data"));
            if (parsed && typeof parsed === 'object') userData = parsed;
        } catch (e) {}
        
        if (!userData.mood) userData.mood = {};
        
        userData.mood[trackedDateStr] = {
            moodLabel: mood.label,
            height: mood.value
        };
        
        // Save user-specific data back to localStorage
        localStorage.setItem(currentUser + "_data", JSON.stringify(userData));
        
        if (window.syncLocalToCloud) window.syncLocalToCloud();

        // Reload the window slightly delayed to visually show the graph updating with the new data
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    };

    return (
        <div style={{ textAlign: 'center', fontFamily: 'sans-serif', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#1E1E1E'}}>Today's Mood</h3>
            <p style={{fontSize: '13px', color: '#8F95A2', marginBottom: '15px'}}>Tracking for: <b>{localStorage.getItem('trackedDate')}</b>. Tap once to log.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '15px' }}>
                {moods.map((mood) => (
                    <button 
                        key={mood.label}
                        onClick={() => handleMoodClick(mood)}
                        title={mood.label}
                        style={{ 
                            fontSize: '24px', 
                            padding: '10px', 
                            cursor: 'pointer', 
                            background: selectedMood === `${mood.label} ${mood.emoji}` ? '#F0EDFE' : '#F8F9FB', 
                            border: selectedMood === `${mood.label} ${mood.emoji}` ? '2px solid #5A40F2' : 'none', 
                            borderRadius: '12px',
                            transition: 'all 0.2s',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        {mood.emoji}
                    </button>
                ))}
            </div>

            {selectedMood ? (
                <div style={{ marginTop: 'auto', padding: '12px', background: '#eafaf1', borderRadius: '12px', color: '#29B880', fontWeight: '500', fontSize: '14px' }}>
                    Logged: {selectedMood}
                </div>
            ) : (
                <div style={{ marginTop: 'auto', fontSize: '13px', color: '#B0B5C1' }}>
                    Awaiting check-in for this date...
                </div>
            )}
        </div>
    );
};

export default MoodSelector;