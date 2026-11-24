
import { useState, useEffect } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Clock,
  Send,
  Facebook,
  Instagram,
  Linkedin
} from 'lucide-react';

import { contactService } from '../services/api.service.js';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import useToast from '../hooks/useToast.js';

const DEFAULT_CONTACT = {
  phone: '+977-9801234567',
  email: 'info@sugandhika.com',
  address: 'Kathmandu, Nepal',
  whatsapp: '9801234567',
  businessHours: 'Sun–Fri: 9am – 6pm',
  socialLinks: {
    facebook: '',
    instagram: '',
    linkedin: ''
  }
};

export default function ContactPage() {
  const toast = useToast();

  const [contactInfo, setContactInfo] = useState(DEFAULT_CONTACT);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({});

  // ── LOAD CONTACT INFORMATION ──────────────────────
  useEffect(() => {
    contactService
      .get()
      .then((res) => {
        if (res?.data) {
          setContactInfo({
            ...DEFAULT_CONTACT,
            ...res.data,
            socialLinks: {
              ...DEFAULT_CONTACT.socialLinks,
              ...(res.data.socialLinks || {})
            }
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ── FORM VALIDATION ───────────────────────────────
  const validate = () => {
    const e = {};

    if (!form.name.trim()) {
      e.name = 'Name is required';
    }

    if (!form.email.trim()) {
      e.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      e.email = 'Invalid email';
    }

    if (!form.message.trim()) {
      e.message = 'Message is required';
    }

    return e;
  };

  // ── FORM INPUT CHANGE ─────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((f) => ({
      ...f,
      [name]: value
    }));

    if (errors[name]) {
      setErrors((er) => ({
        ...er,
        [name]: ''
      }));
    }
  };

  // ── SUBMIT FORM ───────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validate();

    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);

    try {
      await contactService.submit(form);

      toast.success(
        'Message sent! We will get back to you soon.'
      );

      setForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });

      setErrors({});

    } catch {
      toast.error(
        'Failed to send message. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── INPUT STYLING ──────────────────────────────────
  const inputClass = (field) =>
    `w-full min-w-0 px-2 py-2 sm:px-4 sm:py-3 border rounded-md sm:rounded-lg text-[9px] sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand transition-colors ${
      errors[field]
        ? 'border-red-400 bg-red-50'
        : 'border-gray-300 focus:border-brand'
    }`;

  // ── CONTACT DETAILS ───────────────────────────────
  const contactItems = [
    {
      icon: Phone,
      label: 'Phone',
      value: contactInfo.phone,
      href: contactInfo.phone
        ? `tel:${contactInfo.phone}`
        : null
    },
    {
      icon: Mail,
      label: 'Email',
      value: contactInfo.email,
      href: contactInfo.email
        ? `mailto:${contactInfo.email}`
        : null
    },
    {
      icon: MapPin,
      label: 'Address',
      value: contactInfo.address
    },
    {
      icon: Clock,
      label: 'Business Hours',
      value:
        contactInfo.businessHours ||
        'Sun–Fri: 9am – 6pm'
    }
  ];

  // ── SOCIAL MEDIA LINKS ─────────────────────────────
  const socialItems = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: contactInfo.socialLinks?.facebook
    },
    {
      name: 'Instagram',
      icon: Instagram,
      url: contactInfo.socialLinks?.instagram
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: contactInfo.socialLinks?.linkedin
    }
  ].filter(
    (item) =>
      typeof item.url === 'string' &&
      /^https?:\/\//i.test(item.url)
  );

  // ── WHATSAPP NUMBER ────────────────────────────────
  const whatsappNumber = (
    contactInfo.whatsapp ||
    contactInfo.phone ||
    ''
  ).replace(/\D/g, '');

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── 1. HERO ──────────────────────────────────── */}
      <section className="bg-gradient-to-br from-brand-dark to-brand text-white py-8 sm:py-14 md:py-16 px-3 sm:px-4">
        <div className="max-w-6xl mx-auto text-center">

          <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-3">
            Contact Us
          </h1>

          <p className="text-brand-cream/80 text-xs sm:text-lg">
            We'd love to hear from you
          </p>

        </div>
      </section>

      {/* ── 2. CONTACT CONTENT ───────────────────────── */}
      <section className="max-w-6xl mx-auto px-2 sm:px-5 md:px-6 py-6 sm:py-10 md:py-14">

        {/* Two columns on mobile and desktop */}
        <div className="grid grid-cols-2 gap-2 sm:gap-5 md:gap-8 items-stretch">

          {/* ── CONTACT FORM ─────────────────────────── */}
          <div className="bg-white rounded-lg sm:rounded-2xl shadow-sm border border-gray-200 p-2.5 sm:p-5 md:p-8 min-w-0">

            <h2 className="text-sm sm:text-xl md:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
              Send us a Message
            </h2>

            <p className="text-gray-500 text-[8px] sm:text-xs md:text-sm mb-3 sm:mb-6 leading-relaxed">
              Fill the form below and we'll respond as soon as possible.
            </p>

            <form
              onSubmit={handleSubmit}
              className="space-y-2 sm:space-y-4"
            >

              {/* Name and Phone */}
              <div className="grid grid-cols-2 gap-1.5 sm:gap-3">

                <div className="min-w-0">
                  <label className="block text-[8px] sm:text-xs md:text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className={inputClass('name')}
                  />

                  {errors.name && (
                    <p className="text-[7px] sm:text-xs text-red-500 mt-1">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="min-w-0">
                  <label className="block text-[8px] sm:text-xs md:text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>

                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Phone number"
                    className={inputClass('phone')}
                  />
                </div>

              </div>

              {/* Email */}
              <div>
                <label className="block text-[8px] sm:text-xs md:text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Your email"
                  className={inputClass('email')}
                />

                {errors.email && (
                  <p className="text-[7px] sm:text-xs text-red-500 mt-1">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Subject */}
              <div>
                <label className="block text-[8px] sm:text-xs md:text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>

                <input
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="Message subject"
                  className={inputClass('subject')}
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-[8px] sm:text-xs md:text-sm font-medium text-gray-700 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>

                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Your message..."
                  className={`${inputClass('message')} resize-none`}
                />

                {errors.message && (
                  <p className="text-[7px] sm:text-xs text-red-500 mt-1">
                    {errors.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-1 sm:gap-2 px-2 py-2 sm:px-6 sm:py-3 bg-brand text-white rounded-md sm:rounded-lg text-[9px] sm:text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60"
              >
                {submitting ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                )}

                {submitting ? 'Sending...' : 'Send Message'}
              </button>

            </form>
          </div>

          {/* ── CONTACT INFORMATION: SINGLE BOX ─────── */}
          <div className="bg-white rounded-lg sm:rounded-2xl shadow-sm border border-gray-200 p-2.5 sm:p-5 md:p-8 min-w-0 flex flex-col">

            <h2 className="text-sm sm:text-xl md:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
              Contact Information
            </h2>

            <p className="text-gray-500 text-[8px] sm:text-xs md:text-sm mb-3 sm:mb-6 leading-relaxed">
              Reach out to us through the following details.
            </p>

            {loading ? (
              <div className="flex justify-center py-8 sm:py-16">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:gap-5 flex-1">

                {/* Contact Details */}
                <div className="space-y-3 sm:space-y-5">

                  {contactItems.map(
                    ({ icon: Icon, label, value, href }) => (
                      <div
                        key={label}
                        className="flex items-center gap-1.5 sm:gap-3 min-w-0"
                      >

                        <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-md sm:rounded-lg bg-brand-cream flex items-center justify-center shrink-0">
                          <Icon className="w-3 h-3 sm:w-5 sm:h-5 text-brand" />
                        </div>

                        <div className="min-w-0 flex-1">

                          <p className="text-[7px] sm:text-[10px] md:text-xs text-gray-500 uppercase tracking-wide font-semibold mb-0.5">
                            {label}
                          </p>

                          {href ? (
                            <a
                              href={href}
                              className="block text-gray-800 text-[8px] sm:text-xs md:text-sm font-medium hover:text-brand break-all"
                            >
                              {value}
                            </a>
                          ) : (
                            <p className="text-gray-800 text-[8px] sm:text-xs md:text-sm font-medium break-words leading-snug">
                              {value}
                            </p>
                          )}

                        </div>
                      </div>
                    )
                  )}

                </div>

                {/* WhatsApp */}
                {whatsappNumber && (
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 sm:gap-3 bg-green-50 border border-green-200 rounded-md sm:rounded-xl p-2 sm:p-4 hover:bg-green-100 transition-colors"
                  >

                    <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                      <MessageCircle className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[7px] sm:text-[10px] md:text-xs text-gray-500 uppercase font-semibold">
                        WhatsApp
                      </p>

                      <p className="text-gray-800 text-[8px] sm:text-xs md:text-sm font-medium leading-snug">
                        Chat with us
                      </p>
                    </div>

                  </a>
                )}

                {/* Social Media */}
                {socialItems.length > 0 && (
                  <div className="bg-brand-cream rounded-md sm:rounded-xl p-2 sm:p-4">

                    <p className="text-[8px] sm:text-xs font-semibold text-brand-dark mb-2 sm:mb-3">
                      Follow Us
                    </p>

                    <div className="flex items-center gap-2 sm:gap-4 flex-wrap">

                      {socialItems.map(
                        ({ name, icon: Icon, url }) => (
                          <a
                            key={name}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={name}
                            title={name}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center text-brand-dark hover:bg-brand-dark hover:text-white transition-colors shadow-sm"
                          >
                            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                          </a>
                        )
                      )}

                    </div>
                  </div>
                )}

                {/* Visit Us */}
                <div className="bg-brand-cream rounded-md sm:rounded-xl p-2 sm:p-4 flex items-center gap-1.5 sm:gap-3">

                  <MapPin className="w-4 h-4 sm:w-7 sm:h-7 text-brand shrink-0" />

                  <div className="min-w-0">
                    <p className="font-semibold text-brand-dark text-[8px] sm:text-xs md:text-sm">
                      Visit Us
                    </p>

                    <p className="text-[8px] sm:text-xs text-gray-600 leading-snug">
                      {contactInfo.address}
                    </p>
                  </div>

                </div>

              </div>
            )}

          </div>

        </div>
      </section>

      {/* ── 3. WHATSAPP CTA ──────────────────────────── */}
      <section className="bg-gradient-to-r from-brand-dark to-brand text-white py-8 sm:py-14 md:py-16 px-3 sm:px-4">

        <div className="max-w-2xl mx-auto text-center">

          <MessageCircle className="w-7 h-7 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 text-brand-cream" />

          <h2 className="text-xl sm:text-3xl font-bold mb-2 sm:mb-3">
            Order via WhatsApp
          </h2>

          <p className="text-brand-cream/80 text-xs sm:text-base mb-4 sm:mb-6">
            The fastest way to place your order or get product information.
          </p>

          {whatsappNumber && (
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 sm:px-8 sm:py-3.5 bg-white text-brand-dark text-xs sm:text-base font-semibold rounded-full hover:bg-brand-cream transition-colors"
            >
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              Chat on WhatsApp
            </a>
          )}

        </div>
      </section>

    </div>
  );
}
