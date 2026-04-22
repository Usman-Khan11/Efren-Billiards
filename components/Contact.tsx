import React, { useState } from 'react';
import Section from './ui/Section';
import Button from './ui/Button';
import Reveal from './ui/Reveal';
import { Phone, Mail, Clock, MapPin, Send } from 'lucide-react';
import { useCMSContent } from '../hooks/useCMSContent';

const Contact: React.FC = () => {
  const [formState, setFormState] = useState({ name: '', email: '', type: 'Table Booking', message: '' });

  const { data: contactInfo } = useCMSContent('contact-info', {
    address: "5th Floor Captsone Bldg., Al Mansoura\nDoha, Qatar",
    phone: "+974 50986454, +974 66953450",
    email: "efrenbilliards@gmail.com",
    hours: "Open 24 Hours Daily",
    whatsapp: "97451622111",
    mapsUrl: "https://maps.app.goo.gl/NAggUvmWoE7Vh7cA6?g_st=ic"
  });

  const { data: socialLinks } = useCMSContent('social-links', {
    facebook: "https://www.facebook.com/share/1DZ7ux6Qmi/?mibextid=wwXIfr",
    instagram: "https://www.instagram.com/efrenbilliards?igsh=YnQwdDI1MjJ0aDZm",
    tiktok: "https://www.tiktok.com/@efren.billiards.m?_r=1&_t=ZS-93hdvwpNUdp",
    whatsapp: "https://wa.me/97451622111",
    linkedin: "",
    googleBusinessProfile: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Format message for WhatsApp
    const text = `*New Inquiry via Website* %0A%0A` +
      `*Name:* ${formState.name} %0A` +
      `*Type:* ${formState.type} %0A` +
      `*Email:* ${formState.email} %0A` +
      `*Message:* ${formState.message || 'No additional details provided.'}`;

    // Open WhatsApp API (using universal link)
    const whatsappUrl = `https://wa.me/${contactInfo.whatsapp}?text=${text}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Section id="contact" className="bg-dark-800 border-t border-dark-700">
      <div className="grid lg:grid-cols-2 gap-16">

        {/* Info */}
        <div>
          <Reveal>
            <h2 className="text-4xl font-extrabold text-white uppercase mb-8">Get In Touch</h2>
            <p className="text-gray-400 mb-8">
              Tell us what you're planning, and we'll help you design the perfect night.
            </p>
          </Reveal>

          <div className="space-y-8">
            <Reveal delay={100}>
              <div className="flex items-start gap-4">
                <div className="bg-maroon p-3 rounded text-white"><MapPin /></div>
                <div>
                  <h4 className="font-bold text-white uppercase mb-1">Visit Us</h4>
                  <a
                    href={contactInfo.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-brand transition-colors"
                  >
                    {contactInfo.address.split('\n').map((line: string, i: number) => (
                        <React.Fragment key={i}>
                            {line}
                            {i !== contactInfo.address.split('\n').length - 1 && <br />}
                        </React.Fragment>
                    ))}
                  </a>
                </div>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="flex items-start gap-4">
                <div className="bg-maroon p-3 rounded text-white"><Clock /></div>
                <div>
                  <h4 className="font-bold text-white uppercase mb-1">Opening Hours</h4>
                  <div className="text-gray-400 text-sm font-medium text-lg">
                    {contactInfo.hours}
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={300}>
              <div className="flex items-start gap-4">
                <div className="bg-maroon p-3 rounded text-white"><Phone /></div>
                <div>
                  <h4 className="font-bold text-white uppercase mb-1">Contact</h4>
                  <p className="text-gray-400">Call: {contactInfo.phone}</p>
                  <p className="text-gray-400">{contactInfo.email}</p>
                </div>
              </div>
            </Reveal>

            {/* Social Buttons */}
            <Reveal delay={400}>
              <div className="flex flex-wrap gap-4 mt-6">
                {/* WhatsApp */}
                {socialLinks.whatsapp && (
                <a
                  href={socialLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white px-5 py-3 rounded-full transition-colors font-bold"
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  WhatsApp
                </a>
                )}

                {/* Facebook */}
                {socialLinks.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-[#1877F2] hover:bg-[#166FE5] text-white px-5 py-3 rounded-full transition-colors font-bold"
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.148 0-2.971.956-2.971 3.594v.376h3.428l-.581 3.669h-2.847v7.98c5.096-1.45 8.92-6.059 8.92-11.66 0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.25 9.101 11.66Z"></path>
                  </svg>
                  Facebook
                </a>
                )}

                {/* Instagram */}
                {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-90 text-white px-5 py-3 rounded-full transition-all font-bold"
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  Instagram
                </a>
                )}
                {/* TikTok */}
                {socialLinks.tiktok && (
                <a
                  href={socialLinks.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-black hover:bg-gray-900 border border-gray-800 text-white px-5 py-3 rounded-full transition-colors font-bold"
                >
                  <svg viewBox="0 0 448 512" className="w-6 h-6">
                    <path fill="#ff0050" d="M380.9 97.1C339 97.1 305 63.1 305 21.2v-1.1l-102.1-1.1V352c0 40-32.3 72.3-72.3 72.3s-72.3-32.3-72.3-72.3c0-40 32.3-72.3 72.3-72.3c15.6 0 30 4.9 41.7 13.1l1.1-102.1c-13.8-2.6-28-4.1-42.8-4.1C63.1 190.9 0 254 0 331.4 0 408.8 63.1 471.9 140.5 471.9c67.3 0 123.5-47.5 136.1-110.8c.1 0 .2 0 .4 0c41.9 0 75.8 34 75.8 75.8v1.1l102.1 1.1V331.4c13.8 2.6 28 4.1 42.8 4.1c77.4 0 140.5-63.1 140.5-140.5s-63.1-140.5-140.5-140.5c-6.8 0-13.4.5-20 1.5v94c6.2-.8 12.5-1.5 19.3-1.5z" opacity=".4"/>
                    <path fill="#00f2ea" d="M380.9 97.1C339 97.1 305 63.1 305 21.2v-1.1l-102.1-1.1V352c0 40-32.3 72.3-72.3 72.3s-72.3-32.3-72.3-72.3c0-40 32.3-72.3 72.3-72.3c15.6 0 30 4.9 41.7 13.1l1.1-102.1c-13.8-2.6-28-4.1-42.8-4.1C63.1 190.9 0 254 0 331.4 0 408.8 63.1 471.9 140.5 471.9c67.3 0 123.5-47.5 136.1-110.8c.1 0 .2 0 .4 0c41.9 0 75.8 34 75.8 75.8v1.1l102.1 1.1V331.4c13.8 2.6 28 4.1 42.8 4.1c77.4 0 140.5-63.1 140.5-140.5s-63.1-140.5-140.5-140.5c-6.8 0-13.4.5-20 1.5v94c6.2-.8 12.5-1.5 19.3-1.5z" transform="translate(6 -6)" opacity=".9"/>
                    <path fill="#fff" d="M380.9 97.1C339 97.1 305 63.1 305 21.2v-1.1l-102.1-1.1V352c0 40-32.3 72.3-72.3 72.3s-72.3-32.3-72.3-72.3c0-40 32.3-72.3 72.3-72.3c15.6 0 30 4.9 41.7 13.1l1.1-102.1c-13.8-2.6-28-4.1-42.8-4.1C63.1 190.9 0 254 0 331.4 0 408.8 63.1 471.9 140.5 471.9c67.3 0 123.5-47.5 136.1-110.8c.1 0 .2 0 .4 0c41.9 0 75.8 34 75.8 75.8v1.1l102.1 1.1V331.4c13.8 2.6 28 4.1 42.8 4.1c77.4 0 140.5-63.1 140.5-140.5s-63.1-140.5-140.5-140.5c-6.8 0-13.4.5-20 1.5v94c6.2-.8 12.5-1.5 19.3-1.5z" transform="translate(3 -3)"/>
                  </svg>
                  TikTok
                </a>
                )}

                {/* LinkedIn */}
                {socialLinks.linkedin && (
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-[#0077b5] hover:bg-[#006699] text-white px-5 py-3 rounded-full transition-colors font-bold"
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.238 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  LinkedIn
                </a>
                )}

                {/* Google Business Profile */}
                {socialLinks.googleBusinessProfile && (
                <a
                  href={socialLinks.googleBusinessProfile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-[#4285F4] hover:bg-[#357ae8] text-white px-5 py-3 rounded-full transition-colors font-bold"
                >
                  <MapPin className="w-6 h-6" />
                  Google
                </a>
                )}
              </div>
            </Reveal>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white p-8 rounded-2xl shadow-xl z-10 relative">
          <Reveal delay={200}>
            <form onSubmit={handleSubmit} className="space-y-6 text-dark-900">
              <h3 className="text-2xl font-bold uppercase mb-4 text-maroon">Reserve via WhatsApp</h3>
              <p className="text-gray-600 text-sm mb-4">Fill in the details below and we'll open a chat for you instantly.</p>

              <div>
                <label className="block text-sm font-bold uppercase text-gray-700 mb-2">Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="Your Name"
                  className="w-full bg-gray-100 border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-maroon"
                  onChange={e => setFormState({ ...formState, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold uppercase text-gray-700 mb-2">Email (Optional)</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full bg-gray-100 border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-maroon"
                  onChange={e => setFormState({ ...formState, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold uppercase text-gray-700 mb-2">Inquiry Type</label>
                <select
                  className="w-full bg-gray-100 border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-maroon"
                  onChange={e => setFormState({ ...formState, type: e.target.value })}
                  value={formState.type}
                >
                  <option>Table Booking</option>
                  <option>Event Inquiry</option>
                  <option>Membership</option>
                  <option>Sports Cafe</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold uppercase text-gray-700 mb-2">Message (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Date, time, number of people..."
                  className="w-full bg-gray-100 border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-maroon"
                  onChange={e => setFormState({ ...formState, message: e.target.value })}
                />
              </div>

              <div className="pt-2">
                <Button variant="primary" fullWidth type="submit" className="bg-[#25D366] text-white hover:bg-[#128C7E] border-none">
                  <Send size={18} className="mr-2" /> Send to WhatsApp
                </Button>
              </div>
            </form>
          </Reveal>
        </div>

      </div>
    </Section>
  );
};

export default Contact;