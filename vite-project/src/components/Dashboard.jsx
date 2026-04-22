import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MoodSelector from './MoodSelector';
import WeeklyTrend from './WeeklyTrend';
import DailyQuote from './DailyQuote';
import DailyTrendChart from './DailyTrendChart';
import SidePanel from './SidePanel';
import DailyInsight from './DailyInsight';

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
                    
                    <DailyInsight />
                </main>
            </div>
        </div>
    );
};

export default Dashboard;