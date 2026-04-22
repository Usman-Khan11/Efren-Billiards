import React from 'react';
import Section from './ui/Section';
import Reveal from './ui/Reveal';

const TermsAndConditions: React.FC = () => {
  return (
    <Section id="terms" className="pt-32 pb-20 bg-dark-900 min-h-screen">
      <div className="max-w-4xl mx-auto px-6">
        <Reveal>
          <h1 className="text-4xl md:text-5xl font-black uppercase text-white mb-4 flex items-center gap-4 flex-wrap">
            Policies & Guidelines
            <span className="text-sm font-bold text-brand uppercase tracking-widest bg-brand/10 border border-brand/20 px-3 py-1 rounded">Beta</span>
          </h1>
          <p className="text-gray-400 mb-12 max-w-2xl leading-relaxed">
            Welcome to Efren Billiards and Events Place. To ensure a premium experience for all guests, please familiarize yourself with our House Rules and Terms & Conditions before participating in any activities.
          </p>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-20">

            {/* 1st Section - House Rules */}
            <div className="space-y-8">
              <h2 className="text-2xl font-black text-brand uppercase tracking-widest mb-6 border-b border-dark-800 pb-4">House Rules</h2>

              <div>
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-brand rounded-full"></div> General Conduct</h3>
                <ul className="list-disc pl-6 space-y-2 text-sm text-gray-400 leading-relaxed">
                  <li>Proper attire is required at all times.</li>
                  <li>Please respect other players and keep noise levels reasonable.</li>
                  <li>Smoking is only allowed in designated areas.</li>
                  <li>Outside food and drinks are strictly not permitted.</li>
                  <li>Gambling is strictly prohibited on the premises.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-brand rounded-full"></div> Equipment & Facility</h3>
                <ul className="list-disc pl-6 space-y-2 text-sm text-gray-400 leading-relaxed">
                  <li>Tables are allocated on a first-come, first-served basis unless booked.</li>
                  <li>Any damage to equipment caused by negligence or misuse will be charged to the customer.</li>
                  <li>Management reserves the right to refuse entry or service.</li>
                </ul>
              </div>
            </div>

            {/* 2nd Section - Terms and Conditions */}
            <div className="space-y-8">
              <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-6 border-b border-dark-800 pb-4">Terms & Conditions</h2>

              <div>
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-white rounded-full"></div> Membership</h3>
                <ul className="list-disc pl-6 space-y-2 text-sm text-gray-400 leading-relaxed">
                  <li>Membership cards are non-transferable unless explicitly stated otherwise.</li>
                  <li>Membership fees are non-refundable.</li>
                  <li>We reserve the right to revoke membership for violation of house rules without refund.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-white rounded-full"></div> Bookings and Events</h3>
                <ul className="list-disc pl-6 space-y-2 text-sm text-gray-400 leading-relaxed">
                  <li>Reservations are subject to availability.</li>
                  <li>Cancellations must be made at least 24 hours in advance.</li>
                  <li>Event bookings require a deposit to secure the date (non-refundable within 7 days).</li>
                  <li>Late arrivals may result in forfeiture of the reservation.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-white rounded-full"></div> Liability</h3>
                <p className="text-sm text-gray-400 leading-relaxed pl-6">
                  Efren Billiards and Events Place is not liable for any loss or damage to personal property left on the premises.
                </p>
              </div>
            </div>

          </div>

          {/* 3rd Section - Privacy Policy */}
          <div className="mt-16 pt-12 border-t border-dark-800">
            <h2 className="text-2xl font-black text-red-500 uppercase tracking-widest mb-8 border-b border-dark-800 pb-4">Privacy & Policies</h2>
            <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div> Data Collection</h3>
                  <p className="text-sm text-gray-400 leading-relaxed pl-6">
                    We collect personal information necessary for membership registration, event bookings, and communication. This may include your name, contact details, and payment information.
                  </p>
                </div>
              </div>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div> Data Usage & Security</h3>
                  <p className="text-sm text-gray-400 leading-relaxed pl-6 mb-4">
                    Your data is used solely for internal operations, improving our services, and communicating promotions. We do not sell or share your personal information with third parties without your explicit consent.
                  </p>
                  <p className="text-sm text-gray-400 leading-relaxed pl-6">
                    We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-dark-800 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
              Last updated: March 2026
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
};

export default TermsAndConditions;
