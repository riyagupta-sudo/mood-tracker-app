import React, { useState, useEffect } from 'react';

const API_BASE_URL = "https://mood-tracker-app-4.onrender.com/api";

const DailyInsight = () => {
    const [insight, setInsight] = useState("Analyzing your mood patterns...");

    useEffect(() => {
        const fetchInsight = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const response = await fetch(`${API_BASE_URL}/moods`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();

                    if (data.length === 0) {
                        setInsight("Log some moods to get personalized daily insights!");
                        return;
                    }

                    const trackedDate = localStorage.getItem('trackedDate') || new Date().toISOString().split('T')[0];
                    const dayLogs = data.filter(m => m.date === trackedDate);

                    // Prioritize insight for the currently viewed day
                    if (dayLogs.length > 0) {
                        const todayMood = dayLogs[dayLogs.length - 1].mood;

                        if (todayMood === 'Angry') {
                            setInsight("It's okay to feel angry. Try taking a few deep breaths or writing down what's on your mind.");
                            return;
                        } else if (todayMood === 'Sad' || todayMood === 'Anxious') {
                            setInsight("I see you're having a tough time today. Remember to be kind to yourself.");
                            return;
                        } else if (todayMood === 'Happy' || todayMood === 'Excited') {
                            setInsight("Glad you're feeling good today! What's one thing you're grateful for?");
                            return;
                        } else if (todayMood === 'Tired') {
                            setInsight("You're feeling a bit drained. A quick break or some water might help!");
                            return;
                        }
                    }

                    // Fallback to recent pattern analysis
                    const last5 = data.slice(-5);
                    const isMostlyNegative = last5.filter(m => ['Sad', 'Anxious', 'Angry'].includes(m.mood)).length >= 3;

                    if (isMostlyNegative) {
                        setInsight("You've had a difficult few days. Consider reaching out to someone or trying a grounding exercise.");
                    } else {
                        setInsight("Understand yourself better, one day at a time. Every log helps you grow.");
                    }
                }
            } catch (error) {
                console.error('Error fetching insights:', error);
            }
        };

        fetchInsight();
    }, []);

    return (
        <div className="footer-insight" style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 0' }}>
            <div className="insight-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', minWidth: '160px' }}>
                <i className="fa-solid fa-location-dot" style={{ color: 'var(--primary-purple)' }}></i>
                <span>Your Daily Insight</span>
            </div>
            <div className="insight-text" style={{ color: 'var(--text-gray)', fontSize: '14px' }}>
                {insight}
            </div>
        </div>
    );
};

export default DailyInsight;
