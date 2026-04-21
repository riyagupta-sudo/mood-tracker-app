import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:3000/api';

const DailyTrendChart = () => {
    const [bars, setBars] = useState([]);

    const fetchMoodTrend = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/moods`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                const now = new Date();
                const localToday = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                const trackedDate = localStorage.getItem('trackedDate') || localToday;
                const endDate = new Date(trackedDate + 'T00:00:00');
                const generatedBars = [];

                // Generate last 7 days from tracked date
                for(let i=6; i>=0; i--) {
                    const dateCursor = new Date(endDate.getTime());
                    dateCursor.setDate(endDate.getDate() - i);
                    let dateStr = new Date(dateCursor.getTime() - (dateCursor.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                    const dNum = dateCursor.getDate().toString().padStart(2, '0');
                    
                    // Find any logs for this date
                    const dayLogs = data.filter(m => m.date === dateStr);
                    let averageScore = 0;
                    if (dayLogs.length > 0) {
                        averageScore = dayLogs.reduce((acc, curr) => acc + curr.mood_score, 0) / dayLogs.length;
                    }
                    
                    let bgColor = 'var(--bar-bg)';
                    if (averageScore > 0) {
                        if (averageScore >= 80) bgColor = 'var(--primary-purple)';
                        else if (averageScore >= 60) bgColor = '#F08C4A';
                        else if (averageScore >= 40) bgColor = 'var(--green)';
                        else if (averageScore >= 20) bgColor = '#FA6060';
                        else bgColor = 'var(--blob-blue)';
                    }

                    generatedBars.push(
                        <div className="bar-col" key={dateStr}>
                            <div className="bar-bg">
                                {averageScore > 0 && (
                                    <div 
                                        className="bar-fill" 
                                        style={{ height: `${averageScore}%`, backgroundColor: bgColor }}
                                    ></div>
                                )}
                            </div>
                            <span className="x-label">{dNum}</span>
                        </div>
                    );
                }
                setBars(generatedBars);
            }
        } catch (error) {
            console.error('Error fetching mood trend:', error);
        }
    };

    useEffect(() => {
        fetchMoodTrend();
    }, []);

    return (
        <div className="card daily-trend-chart">
            <div className="card-header">
                <div>
                    <h3>Daily Mood Trend</h3>
                    <p className="subtitle mt-0">Track how your feelings change day by day.</p>
                </div>
                <i className="fa-solid fa-ellipsis text-gray"></i>
            </div>
            <div className="chart-area">
                <div className="y-axis">
                    <div className="y-icon purple-text"><i className="fa-solid fa-face-laugh-beam"></i></div>
                    <div className="y-icon orange-text"><i className="fa-solid fa-face-smile"></i></div>
                    <div className="y-icon green-text"><i className="fa-solid fa-face-meh"></i></div>
                    <div className="y-icon red-text"><i className="fa-solid fa-face-frown"></i></div>
                    <div className="y-icon blue-text"><i className="fa-solid fa-face-sad-tear"></i></div>
                    <div className="y-icon light-blue-text"><i className="fa-solid fa-face-dizzy"></i></div>
                </div>
                <div className="chart-grid">
                    <div className="grid-line"></div>
                    <div className="grid-line"></div>
                    <div className="grid-line"></div>
                    <div className="grid-line"></div>
                    <div className="grid-line"></div>
                    
                    <div className="bars" id="dynamic-bars">
                        {bars.length > 0 ? bars : <div style={{width: '100%', textAlign: 'center', color: '#ccc', fontSize: '12px'}}>No data yet</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailyTrendChart;
