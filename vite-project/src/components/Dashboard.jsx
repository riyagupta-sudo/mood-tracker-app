import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MoodSelector from './MoodSelector';
import WeeklyTrend from './WeeklyTrend';
import DailyQuote from './DailyQuote';
import DailyTrendChart from './DailyTrendChart';
import SidePanel from './SidePanel';

const Dashboard = () => {
    return (
        <div className="app-wrapper">
            <div className="dashboard-container">
                <Sidebar />
                <main className="main-content">
                    <Header />
                    
                    <div className="grid-layout">
                        {/* Top Row */}
                        <div className="card todays-mood" id="mood-selector-root">
                            <MoodSelector />
                        </div>
                        
                        <WeeklyTrend />
                        <DailyQuote />
                        
                        {/* Bottom Row */}
                        <DailyTrendChart />
                        <SidePanel />
                    </div>
                    
                    <div className="footer-insight">
                        <div className="insight-label">
                            <i className="fa-solid fa-location-dot purple-icon"></i> <b>Your Daily Insight</b>
                        </div>
                        <div className="insight-text">
                            You've been tracking mood consistently. It's okay - let's focus on one thing you can control.
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;