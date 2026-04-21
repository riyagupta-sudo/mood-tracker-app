import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:3000/api';

const WeeklyTrend = () => {
    const [weeklyMoods, setWeeklyMoods] = useState([]);

    const getFaceForMood = (mood) => {
        if (mood === 'Happy' || mood === 'Excited') return 'blob-green fa-face-smile';
        if (mood === 'Neutral' || mood === 'Confused') return 'blob-light fa-face-meh';
        if (mood === 'Sad' || mood === 'Anxious') return 'blob-blue fa-face-frown';
        if (mood === 'Angry') return 'blob-red fa-face-angry';
        if (mood === 'Tired') return 'blob-purple fa-face-frown-open';
        return 'blob-light fa-face-meh';
    };

    useEffect(() => {
        const fetchWeeklyMoods = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const response = await fetch(`${API_BASE_URL}/moods`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    const trackedDate = localStorage.getItem('trackedDate') || new Date().toISOString().split('T')[0];
                    const today = new Date(trackedDate + 'T00:00:00');
                    const last7Days = [];
                    for (let i = 6; i >= 0; i--) {
                        const d = new Date(today.getTime());
                        d.setDate(today.getDate() - i);
                        const dateStr = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                        
                        const dayLog = data.find(m => m.date === dateStr);
                        last7Days.push({
                            day: dayName,
                            mood: dayLog ? dayLog.mood : null,
                            date: dateStr
                        });
                    }
                    setWeeklyMoods(last7Days);
                }
            } catch (error) {
                console.error('Error fetching weekly moods:', error);
            }
        };

        fetchWeeklyMoods();
    }, []);

    return (
        <div className="card weekly-trend">
            <div className="card-header">
                <h3>Weekly Mood Trend</h3>
                <span className="dropdown">Last 7 Days <i className="fa-solid fa-chevron-down dropdown-icon"></i></span>
            </div>
            <p className="subtitle">Visualizing your emotional journey over the past week.</p>
            <div className="week-faces">
                {weeklyMoods.map((item, index) => {
                    const faceClass = item.mood ? getFaceForMood(item.mood) : 'blob-light fa-face-meh';
                    const [blobColor, iconClass] = faceClass.split(' ');
                    return (
                        <div className="day" key={index}>
                            <div className={`face ${blobColor}`} style={{opacity: item.mood ? 1 : 0.3}}>
                                <i className={`fa-solid ${iconClass}`}></i>
                            </div>
                            <span>{item.day}</span>
                        </div>
                    );
                })}
                {weeklyMoods.length === 0 && (
                    <div style={{width: '100%', textAlign: 'center', color: '#ccc', padding: '20px'}}>
                        Log some moods to see your weekly trend!
                    </div>
                )}
            </div>
        </div>
    );
};

export default WeeklyTrend;
