import React from 'react';

const Sidebar = () => {
    return (
        <aside className="sidebar">
            <div className="sidebar-menu">
                <div className="menu-item active has-submenu">
                    <div className="menu-title">
                        <div className="title-left"><i className="fa-solid fa-border-all"></i> Dashboard</div>
                        <i className="fa-solid fa-chevron-down toggle-icon"></i>
                    </div>
                    <ul className="submenu">
                        <li className="active"><a href="/" style={{textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', width: '100%', gap: '8px'}}><span className="dot"></span> Mood Tracker</a></li>
                        <li><a href="/health_insight.html" style={{textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', width: '100%', gap: '8px'}}>Health Insight</a></li>
                        <li><a href="/personal_goals.html" style={{textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', width: '100%', gap: '8px'}}>Personal Goals</a></li>
                    </ul>
                </div>
                <a href="/community.html" style={{textDecoration: 'none'}} className="menu-item">
                    <div className="menu-title text-gray">
                        <div className="title-left"><i className="fa-solid fa-users"></i> Community</div>
                    </div>
                </a>
                
                <div className="menu-section-title">SETTINGS</div>
                <a href="/settings.html" style={{textDecoration: 'none'}} className="menu-item">
                    <div className="menu-title text-gray">
                        <div className="title-left"><i className="fa-solid fa-gear"></i> Settings</div>
                    </div>
                </a>
                <a href="/notifications.html" style={{textDecoration: 'none'}} className="menu-item">
                    <div className="menu-title text-gray">
                        <div className="title-left"><i className="fa-regular fa-bell"></i> Notification</div>
                    </div>
                </a>
            </div>

            <div className="creator-stamp" style={{marginTop: 'auto', padding: '20px 15px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(90, 64, 242, 0.08), rgba(90, 64, 242, 0.02))', border: '1px solid rgba(90, 64, 242, 0.2)', textAlign: 'center', transition: 'all 0.3s ease'}}>
                <div style={{fontSize: '11px', color: 'var(--text-gray)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px', fontWeight: '600'}}>Designed & Built By</div>
                <div style={{fontSize: '16px', fontWeight: '700', color: 'var(--primary-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
                    <i className="fa-solid fa-code"></i> Riya Gupta
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
