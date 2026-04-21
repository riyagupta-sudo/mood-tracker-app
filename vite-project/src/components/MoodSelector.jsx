import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:3000/api';

const MoodSelector = () => {
    const [selectedMood, setSelectedMood] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

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

    const fetchLoggedMood = async () => {
        const token = localStorage.getItem('token');
        const trackedDateStr = localStorage.getItem('trackedDate') || new Date().toISOString().split('T')[0];
        
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/moods`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                // Find mood for the current tracked date
                const moodForDate = data.find(m => m.date === trackedDateStr);
                if (moodForDate) {
                    const moodConfig = moods.find(m => m.label === moodForDate.mood);
                    setSelectedMood(`${moodForDate.mood} ${moodConfig?.emoji || ''}`);
                } else {
                    setSelectedMood(null);
                }
            }
        } catch (error) {
            console.error('Error fetching mood:', error);
        }
    };

    useEffect(() => {
        fetchLoggedMood();
    }, [moods]);

    const handleMoodClick = async (mood) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please log in to save your mood.');
            return;
        }

        setIsLoading(true);
        const trackedDateStr = localStorage.getItem('trackedDate') || new Date().toISOString().split('T')[0];
        const timeStr = new Date().toLocaleTimeString();

        try {
            const response = await fetch(`${API_BASE_URL}/moods`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    mood: mood.label,
                    mood_score: mood.value,
                    date: trackedDateStr,
                    time: timeStr,
                    note: ''
                })
            });

            if (response.ok) {
                setSelectedMood(`${mood.label} ${mood.emoji}`);
                setTimeout(() => {
                    window.location.reload();
                }, 800);
            } else {
                const err = await response.json();
                alert(`Error: ${err.error}`);
            }
        } catch (error) {
            console.error('Error saving mood:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="card todays-mood" style={{ textAlign: 'center', fontFamily: 'sans-serif', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#1E1E1E'}}>Today's Mood</h3>
            <p style={{fontSize: '13px', color: '#8F95A2', marginBottom: '15px'}}>Tracking for: <b>{localStorage.getItem('trackedDate') || 'today'}</b>. Tap once to log.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '15px' }}>
                {moods.map((mood) => (
                    <button 
                        key={mood.label}
                        onClick={() => handleMoodClick(mood)}
                        disabled={isLoading}
                        title={mood.label}
                        style={{ 
                            fontSize: '24px', 
                            padding: '10px', 
                            cursor: isLoading ? 'not-allowed' : 'pointer', 
                            background: selectedMood?.startsWith(mood.label) ? '#F0EDFE' : '#F8F9FB', 
                            border: selectedMood?.startsWith(mood.label) ? '2px solid #5A40F2' : 'none', 
                            borderRadius: '12px',
                            transition: 'all 0.2s',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            opacity: isLoading ? 0.7 : 1
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
                    {isLoading ? 'Saving...' : 'Awaiting check-in for this date...'}
                </div>
            )}
        </div>
    );
};

export default MoodSelector;