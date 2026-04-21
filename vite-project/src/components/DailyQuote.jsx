import React, { useEffect, useState } from 'react';

const DailyQuote = () => {
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');

    useEffect(() => {
        const d = new Date();
        const dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
        const [dNum, mStr] = dateStr.split(' ');
        
        const suffix = (dNum.endsWith('1') && dNum !== '11') ? 'st' : 
                       (dNum.endsWith('2') && dNum !== '12') ? 'nd' : 
                       (dNum.endsWith('3') && dNum !== '13') ? 'rd' : 'th';
        
        setDay(`${dNum}${suffix}`);
        setMonth(mStr);
    }, []);

    return (
        <div className="card daily-quote">
            <h2 id="current-day">{day}</h2>
            <p className="month" id="current-month">{month}</p>
            <p className="quote">Focus on what you can control today...</p>
        </div>
    );
};

export default DailyQuote;
