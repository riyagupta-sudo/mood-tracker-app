import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:3000/api';

const SidePanel = () => {
    const [activeTab, setActiveTab] = useState('meditating');
    const [journalText, setJournalText] = useState('');
    const [latestEntry, setLatestEntry] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchLatestJournal = async () => {
        const token = localStorage.getItem('token');
        const trackedDateStr = localStorage.getItem('trackedDate') || new Date().toISOString().split('T')[0];
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/journals`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                // Find entry for the current tracked date
                const entryForDate = data.find(j => j.target_date === trackedDateStr);
                setLatestEntry(entryForDate || null);
            }
        } catch (error) {
            console.error('Error fetching journal:', error);
        }
    };

    useEffect(() => {
        fetchLatestJournal();
    }, []);

    const handleSaveJournal = async () => {
        if (!journalText.trim()) return;

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please log in to save your journal.');
            return;
        }

        setIsLoading(true);
        const trackedDateStr = localStorage.getItem('trackedDate') || new Date().toISOString().split('T')[0];
        const now = new Date().toLocaleString();

        try {
            const response = await fetch(`${API_BASE_URL}/journals`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    text: journalText.trim(),
                    date: now,
                    target_date: trackedDateStr
                })
            });

            if (response.ok) {
                setLatestEntry({ text: journalText.trim(), date: now, target_date: trackedDateStr });
                setJournalText('');
            } else {
                const err = await response.json();
                alert(`Error: ${err.error}`);
            }
        } catch (error) {
            console.error('Error saving journal:', error);
        } finally {
            setIsLoading(false);
        }
    };

    let trackedDateStr = localStorage.getItem('trackedDate') || 'today';

    return (
        <div className="card side-panel">
            <div className="tabs">
                <span 
                    className={`tab ${activeTab === 'meditating' ? 'active' : 'text-gray'}`} 
                    onClick={() => setActiveTab('meditating')}
                >
                    Meditating
                </span>
                <span 
                    className={`tab ${activeTab === 'journal' ? 'active' : 'text-gray'}`} 
                    onClick={() => setActiveTab('journal')}
                >
                    Journal
                </span>
            </div>
            
            {activeTab === 'meditating' && (
                <div className="suggestion-list" id="suggestion-list" style={{display: 'flex'}}>
                    <a href="article.html?id=breathing" style={{textDecoration: 'none', color: 'inherit'}} className="suggestion-card">
                        <div className="icon-img placeholder-1"></div>
                        <div className="info">
                            <h4>Learning deep breath every...</h4>
                        </div>
                        <i className="fa-solid fa-arrow-up-right-from-square small-icon"></i>
                    </a>
                    <a href="article.html?id=focus" style={{textDecoration: 'none', color: 'inherit'}} className="suggestion-card">
                        <div className="icon-img placeholder-2"></div>
                        <div className="info">
                            <h4>Maintain focus session every 3 ho...</h4>
                        </div>
                        <i className="fa-solid fa-arrow-up-right-from-square small-icon"></i>
                    </a>
                    <a href="article.html?id=grounding" style={{textDecoration: 'none', color: 'inherit'}} className="suggestion-card active-suggestion">
                        <div className="icon-img placeholder-3"></div>
                        <div className="info">
                            <h4>3-minute grounding breathi...</h4>
                        </div>
                        <div className="arrow-circle"><i className="fa-solid fa-arrow-up-right-from-square"></i></div>
                    </a>
                </div>
            )}
            
            {activeTab === 'journal' && (
                <div id="journal-section" style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                    <textarea 
                        placeholder="How are you feeling right now? Write your thoughts..." 
                        style={{width: '100%', height: '120px', padding: '15px', borderRadius: '12px', border: '1px solid #E4EBF4', fontFamily: 'inherit', fontSize: '14px', resize: 'none'}}
                        value={journalText}
                        onChange={(e) => setJournalText(e.target.value)}
                        disabled={isLoading}
                    ></textarea>
                    <button 
                        onClick={handleSaveJournal}
                        disabled={isLoading}
                        style={{backgroundColor: 'var(--primary-purple)', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '500', cursor: isLoading ? 'not-allowed' : 'pointer', transition: '0.2s', opacity: isLoading ? 0.7 : 1}}
                    >
                        {isLoading ? 'Saving...' : 'Save Journal'}
                    </button>
                    
                    <div style={{marginTop: '10px'}}>
                        <h4 style={{fontSize: '14px', color: 'var(--text-light-gray)', marginBottom: '10px'}}>LATEST ENTRY</h4>
                        <div id="latest-journal" style={{background: '#F8F9FB', padding: '15px', borderRadius: '12px', fontSize: '14px', color: 'var(--text-black)', border: '1px solid #F0F2F5'}}>
                            {latestEntry ? (
                                <>
                                    <span style={{fontSize: '11px', color: 'var(--primary-purple)', fontWeight: '600', display: 'block', marginBottom: '5px'}}>
                                        {latestEntry.date}
                                    </span>
                                    {latestEntry.text}
                                </>
                            ) : (
                                <span style={{color: 'var(--text-gray)', fontStyle: 'italic'}}>
                                    No journal entries for {trackedDateStr}.
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SidePanel;
