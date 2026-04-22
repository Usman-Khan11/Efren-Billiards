import React from 'react';
import Section from './ui/Section';
import Reveal from './ui/Reveal';
import { useCMSContent } from '../hooks/useCMSContent';

const Timetable: React.FC = () => {
  const { data: scheduleData } = useCMSContent('weekly-schedule', {
    schedule: [
      { day: 'Monday', event: 'Industry Night', offer: '50% Off Tables for Hospitality Staff', time: '18:00 - Close' },
      { day: 'Tuesday', event: 'League Night', offer: 'Competitive League Play', time: '19:00 Start' },
      { day: 'Wednesday', event: 'Midweek Break', offer: 'Free Coffee with 2hrs Play', time: '14:00 - 18:00' },
      { day: 'Thursday', event: 'Corporate Challenge', offer: 'Group Packages Available', time: 'All Evening' },
      { day: 'Friday', event: 'Weekend Warmup', offer: 'DJ Sets & Late Night Play', time: '20:00 - 02:00' },
      { day: 'Saturday', event: 'Open Tournament', offer: 'Winner Takes All - Cash Prize', time: '14:00 Start' },
      { day: 'Sunday', event: 'Family Day', offer: 'Kids Play Free (with Adult)', time: '12:00 - 18:00' },
    ]
  });

  const schedule = scheduleData.schedule || [];

  return (
    <Section id="schedule" className="bg-dark-900">
      <Reveal>
        <div className="mb-10 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white uppercase">Weekly Happenings</h2>
          <p className="text-gray-400 mt-2">There's always something happening at Efren Billiards.</p>
        </div>
      </Reveal>

      <Reveal delay={200}>
        <div className="max-w-4xl mx-auto border border-dark-700 rounded-lg overflow-hidden bg-dark-800">
          <div className="grid grid-cols-1 divide-y divide-dark-700">
            {schedule.map((item: any, idx: number) => (
               <div key={idx} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-dark-700/50 transition-colors">
                  <div className="md:w-1/4 mb-2 md:mb-0">
                    <span className="text-brand font-bold uppercase tracking-wider">{item.day}</span>
                  </div>
                  <div className="md:w-2/4 mb-2 md:mb-0">
                    <h4 className="text-xl font-bold text-white uppercase">{item.event}</h4>
                    <p className="text-sm text-gray-400">{item.offer}</p>
                  </div>
                  <div className="md:w-1/4 text-right">
                     <span className="inline-block px-3 py-1 bg-maroon/20 text-maroon rounded text-xs font-bold border border-maroon/30">
                       {item.time}
                     </span>
                  </div>
               </div>
            ))}
          </div>
        </div>
      </Reveal>
    </Section>
  );
};

export default Timetable;