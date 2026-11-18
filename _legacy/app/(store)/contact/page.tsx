"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { submitContactForm } from "@/lib/actions/store.actions";
import { toast } from "sonner";
import { MapPin, Phone, Mail, Clock, Send, MessageSquare } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await submitContactForm({ name, email, phone, subject, message });
    setSubmitting(false);

    if (res.success) {
      toast.success("Thank you! Your message has been sent to our support team.");
      setName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
    } else {
      toast.error(res.error || "Failed to send message.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold text-brand-dark uppercase tracking-widest block">
          Get In Touch
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 font-serif">Contact Sugandhika Support</h1>
        <p className="text-xs text-slate-500">
          Have questions about our herbal mosquito sticks or order delivery? We are here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info Sidebar */}
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-soft space-y-6">
            <h3 className="text-lg font-bold text-slate-900 font-serif border-b border-slate-100 pb-3">
              Store Information
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-brand-cream text-brand-dark shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Store Address</h4>
                  <p className="text-slate-500">Lazimpat, Kathmandu, Nepal</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-brand-cream text-brand-dark shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Phone Support</h4>
                  <p className="text-slate-500">+977 9801234567</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-brand-cream text-brand-dark shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Email Inquiry</h4>
                  <p className="text-slate-500">support@sugandhika.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-brand-cream text-brand-dark shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Working Hours</h4>
                  <p className="text-slate-500">Sunday - Friday: 9:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="p-8 bg-white rounded-3xl border border-slate-100 shadow-soft space-y-4">
            <h3 className="text-lg font-bold text-slate-900 font-serif border-b border-slate-100 pb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand-dark" /> Send Us A Message
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Your Name *" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Aarav Sharma" />
              <Input label="Email Address *" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="aarav@example.com" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+977 9841234567" />
              <Input label="Subject *" required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Order Inquiry / Bulk Purchase" />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Your Message *</label>
              <textarea
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message details..."
                className="w-full p-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-brand-dark"
              />
            </div>

            <Button type="submit" variant="primary" size="lg" isLoading={submitting}>
              <Send className="w-4 h-4 mr-2" /> Send Message
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
