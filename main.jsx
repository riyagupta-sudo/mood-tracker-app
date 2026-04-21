import React from 'react';
import { createRoot } from 'react-dom/client';
import MoodSelector from './vite-project/src/components/MoodSelector.jsx';
import DailyTrendChart from './vite-project/src/components/DailyTrendChart.jsx';
import SidePanel from './vite-project/src/components/SidePanel.jsx';
import WeeklyTrend from './vite-project/src/components/WeeklyTrend.jsx';
import Header from './vite-project/src/components/Header.jsx';
import DailyInsight from './vite-project/src/components/DailyInsight.jsx';

// Function to mount a component to an element ID if it exists
const mountComponent = (id, Component) => {
    const element = document.getElementById(id);
    if (element) {
        const root = createRoot(element);
        root.render(<Component />);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    mountComponent('mood-selector-root', MoodSelector);
    mountComponent('daily-trend-chart-root', DailyTrendChart);
    mountComponent('side-panel-root', SidePanel);
    mountComponent('weekly-trend-root', WeeklyTrend);
    mountComponent('header-root', Header);
    mountComponent('daily-insight-root', DailyInsight);
});
