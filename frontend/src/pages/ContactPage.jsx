import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, MessageCircle, Clock, Send } from 'lucide-react';
import { contactService } from '../services/api.service.js';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import useToast from '../hooks/useToast.js';

const DEFAULT_CONTACT = {
  phone: '+977-9801234567',
  email: 'info@sugandhika.com',
  address: 'Kathmandu, Nepal',
  whatsapp: '9779801234567',
  business_hours: 'Sun–Fri: 9am – 6pm',
};

export default function ContactPage() {
  const toast = useToast();
  const [contactInfo, setContactInfo] = useState(DEFAULT_CONTACT);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    contactService.get()
      .then(res => { if (res.data) setContactInfo({ ...DEFAULT_CONTACT, ...res.data }); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.message.trim()) e.message = 'Message is required';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(er => ({ ...er, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      await contactService.submit(form);
      toast.success('Message sent! We will get back to you soon.');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand transition-colors ${errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-brand'}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-dark to-brand text-white py-14 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-3">Contact Us</h1>
          <p className="text-brand-cream/80 text-lg">We'd love to hear from you</p>
          <nav className="mt-4 text-sm text-brand-cream/60">
            <Link to="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-white">Contact</span>
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Send us a Message</h2>
            <p className="text-gray-500 text-sm mb-6">Fill the form below and we'll respond as soon as possible.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="Your name" className={inputClass('name')} />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone number" className={inputClass('phone')} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Your email" className={inputClass('email')} />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input name="subject" value={form.subject} onChange={handleChange} placeholder="Message subject" className={inputClass('subject')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message <span className="text-red-500">*</span></label>
                <textarea name="message" value={form.message} onChange={handleChange} rows={5} placeholder="Your message…" className={`${inputClass('message')} resize-none`} />
                {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
              </div>
              <button type="submit" disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand text-white rounded-lg font-medium hover:bg-brand-dark transition-colors disabled:opacity-60">
                {submitting ? <LoadingSpinner size="sm" /> : <Send className="w-4 h-4" />}
                {submitting ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-5">
            {loading ? (
              <div className="flex justify-center py-16"><LoadingSpinner /></div>
            ) : (
              <>
                {[
                  { icon: Phone, label: 'Phone', value: contactInfo.phone, href: `tel:${contactInfo.phone}` },
                  { icon: Mail, label: 'Email', value: contactInfo.email, href: `mailto:${contactInfo.email}` },
                  { icon: MapPin, label: 'Address', value: contactInfo.address },
                  { icon: Clock, label: 'Business Hours', value: contactInfo.business_hours || 'Sun–Fri: 9am – 6pm' },
                ].map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-4 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <div className="w-11 h-11 rounded-full bg-brand-cream flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-brand" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-0.5">{label}</p>
                      {href ? (
                        <a href={href} className="text-gray-800 font-medium hover:text-brand transition-colors">{value}</a>
                      ) : (
                        <p className="text-gray-800 font-medium">{value}</p>
                      )}
                    </div>
                  </div>
                ))}

                {/* WhatsApp */}
                <a
                  href={`https://wa.me/${contactInfo.whatsapp || '9779801234567'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 bg-green-50 border border-green-200 rounded-xl p-5 hover:bg-green-100 transition-colors"
                >
                  <div className="w-11 h-11 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-0.5">WhatsApp</p>
                    <p className="text-gray-800 font-medium">Chat with us on WhatsApp</p>
                  </div>
                </a>

                {/* Map placeholder */}
                <div className="bg-brand-cream rounded-xl border border-brand/20 p-8 text-center">
                  <MapPin className="w-10 h-10 text-brand mx-auto mb-3" />
                  <p className="font-semibold text-brand-dark">Visit Us</p>
                  <p className="text-sm text-gray-600 mt-1">{contactInfo.address}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* WhatsApp CTA */}
      <section className="bg-gradient-to-r from-brand-dark to-brand text-white py-14 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-brand-cream" />
          <h2 className="text-3xl font-bold mb-3">Order via WhatsApp</h2>
          <p className="text-brand-cream/80 mb-6">The fastest way to place your order or get product information.</p>
          <a
            href={`https://wa.me/${contactInfo.whatsapp || '9779801234567'}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-brand-dark font-semibold rounded-full hover:bg-brand-cream transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Chat on WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
