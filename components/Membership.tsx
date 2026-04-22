import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Section from './ui/Section';
import Button from './ui/Button';
import Reveal from './ui/Reveal';
import { Check, Crown, Star, Loader2 } from 'lucide-react';
import { useCMSContent } from '../hooks/useCMSContent';
import { createNoqoodyPaymentLink } from '@/lib/payment';
import { useAuth } from '@/contexts/AuthContext';

const Membership: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const { user, profile } = useAuth();
  const { data: cmsData, loading } = useCMSContent('membership-plans', {
    plans: [
      {
        id: "gold",
        name: "Gold",
        desc: "The ultimate VIP experience.",
        priceMonthly: 85,
        priceAnnual: 68,
        features: [
          "Free 3 hours playing time monthly",
          "Discounted table rate: QAR30/hour with Free 1 large Efren signature coffee per visit",
          "Free haircut (Soon to offer)",
          "Free use of event place for 3 hours on your birthday (Valued @ QAR600)",
          "20% Discounts in food and drinks",
          "20% discount on event place rental",
          "20% discount on photobooth and 360 videbooth rental",
          "Free 7 sessions of professional career coaching (transferrable)"
        ],
        isGold: true,
        popular: false
      },
      {
        id: "silver",
        name: "Silver",
        desc: "For the regular enthusiast.",
        priceMonthly: 60,
        priceAnnual: 48,
        features: [
          "Free 2 hours playing time monthly",
          "Discounted table rate: QAR30/hour",
          "Free haircut (Soon to offer)",
          "Free use of event place for 2 hours on your birthday (Valued @ QAR400)",
          "20% Discounts in food and drinks",
          "20% discount on event place rental",
          "20% discount on photobooth and 360 videbooth rental",
          "Free 5 sessions of professional career coaching (transferrable)"
        ],
        popular: false
      },
      {
        id: "bronze",
        name: "Bronze",
        desc: "Perfect for casual players.",
        priceMonthly: 35,
        priceAnnual: 28,
        features: [
          "Free 1 hour playing time monthly",
          "Discounted table rate: QAR30/hour",
          "Free haircut (Soon to offer)",
          "Free use of event place for 1 hour on your birthday (Valued @ QAR200)",
          "20% Discounts in food and drinks",
          "20% discount on event place rental",
          "20% discount on photobooth and 360 videbooth rental",
          "Free 3 sessions of professional career coaching (transferrable)"
        ],
        popular: false
      }
    ]
  });

  const plans = cmsData.plans || [];

  const handleJoinClick = async (planName: string, price: number) => {
    const period = isAnnual ? 'Annual' : 'Monthly';
    const text = `Hi, I am interested in the *${planName} Membership* (${period} Plan at QAR ${price}/mo). Please provide me with the registration details.`;
    // const whatsappUrl = `https://wa.me/97451622111?text=${encodeURIComponent(text)}`;
    // window.open(whatsappUrl, '_blank');

    if (!user?.id) {
      alert('Please login to continue.');
      return;
    }

    if (!profile?.full_name) {
      alert('Please enter your name in profile.');
      return;
    }

    if (!profile?.phone) {
      alert('Please enter your phone number in profile.');
      return;
    }

    const result = await createNoqoodyPaymentLink({
      description: `Buy *${planName} Membership* (${period} Plan at QAR ${price}/mo).`,
      amount: price,
      email: profile?.email,
      phone: profile?.phone,
      name: profile?.full_name
    });

    if (result.PaymentUrl) {
      window.location.assign(result.PaymentUrl);
    } else {
      alert('Something went wrong please try again.');
    }
  };

  return (
    <Section id="membership" className="bg-dark-900 relative overflow-hidden py-24 border-b border-dark-800">
      {/* Abstract Background Element */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-maroon/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      <div className="text-center mb-12 relative z-10">
        <Reveal>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white uppercase mb-6">Choose Your Membership Rank</h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            Play more, pay less. Unlock exclusive rates, priority booking, and VIP perks.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center bg-dark-800 p-1 rounded-full border border-dark-700">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2 rounded-full text-sm font-bold uppercase transition-all ${!isAnnual ? 'bg-brand text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2 rounded-full text-sm font-bold uppercase transition-all ${isAnnual ? 'bg-brand text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              Annual <span className="text-[10px] ml-1 opacity-70">(Save 20%)</span>
            </button>
          </div>
        </Reveal>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start relative z-10">
        {plans.map((plan, idx) => (
          <Reveal
            key={idx}
            delay={idx * 150}
            width="100%"
            variant={idx === 1 ? 'slide-right' : 'slide-left'}
          >
            <div
              className={`relative rounded-2xl p-8 border transition-all duration-300 hover:-translate-y-2 hover:scale-105 
                ${plan.isGold
                  ? 'bg-gradient-to-b from-dark-800 to-black border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.2)] hover:shadow-[0_0_50px_rgba(234,179,8,0.4)] z-30 scale-105'
                  : plan.id === 'silver'
                    ? 'bg-gradient-to-b from-dark-800 to-black border-slate-400 shadow-[0_0_30px_rgba(148,163,184,0.2)] hover:shadow-[0_0_50px_rgba(148,163,184,0.4)] z-20'
                    : plan.popular
                      ? 'bg-dark-800 border-brand shadow-2xl shadow-brand/10 z-20 hover:shadow-glow'
                      : 'bg-dark-800 border-dark-700 hover:border-gray-500'
                }
              `}
            >
              {plan.popular && !plan.isGold && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-maroon text-white text-xs font-black uppercase px-4 py-1 rounded-full tracking-widest shadow-lg">
                  Most Popular
                </div>
              )}
              {plan.isGold && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-500 text-black text-xs font-black uppercase px-4 py-1 rounded-full tracking-widest shadow-lg flex items-center gap-1">
                  <Crown size={12} fill="currentColor" /> Best Value
                </div>
              )}

              <h3 className={`text-2xl font-bold uppercase flex items-center gap-2 ${plan.isGold ? 'text-yellow-500 drop-shadow-sm' : plan.id === 'silver' ? 'text-slate-300' : 'text-white'}`}>
                {plan.name} {plan.isGold && <Star size={20} className="fill-yellow-500 text-yellow-500" />}
                {plan.id === 'silver' && <Star size={20} className="fill-slate-400 text-slate-400" />}
              </h3>
              <div className="mt-2 min-h-[40px]">
                <p className="text-gray-500 text-sm">{plan.desc}</p>
                {isAnnual && (
                  <p className="text-brand text-[10px] font-black uppercase tracking-widest mt-1">
                    Per Month, Billed Annually
                  </p>
                )}
              </div>

              <div className="my-8 flex flex-col min-h-[64px]">
                <div className="flex items-baseline gap-2">
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={isAnnual ? 'annual' : 'monthly'}
                      initial={{ opacity: 0, scale: 0.8, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -15 }}
                      transition={{ type: "spring", bounce: 0.4, duration: 0.5 }}
                      className={`text-4xl font-extrabold ${plan.isGold ? 'text-yellow-400' : plan.id === 'silver' ? 'text-slate-300' : 'text-white'}`}
                    >
                      QAR {isAnnual ? plan.priceAnnual : plan.priceMonthly}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-gray-500 font-medium"> / month</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feat, i) => (
                  <li key={i} className="flex items-start text-gray-300 text-sm">
                    <Check size={16} className={`${plan.isGold ? 'text-yellow-500' : plan.id === 'silver' ? 'text-slate-400' : 'text-brand'} mr-3 shrink-0 mt-0.5`} />
                    <span className="leading-tight">{feat}</span>
                  </li>
                ))}
              </ul>

              <p className="text-xs text-gray-500 italic mb-6 text-center">
                Note: <a href="#terms" className="underline hover:text-brand transition-colors">Terms & Conditions Applied</a>
              </p>

              <Button
                variant={plan.popular || plan.isGold || plan.id === 'silver' ? 'primary' : 'outline'}
                fullWidth
                className={
                  plan.isGold
                    ? 'bg-yellow-500 text-black hover:bg-yellow-400 border-none'
                    : plan.id === 'silver'
                      ? 'bg-slate-400 text-black hover:bg-slate-300 border-none'
                      : ''
                }
                onClick={() => handleJoinClick(plan.name, isAnnual ? plan.priceAnnual : plan.priceMonthly)}
              >
                Join Us Now
              </Button>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
};

export default Membership;