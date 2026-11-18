"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { updateWebsiteSettingsAction } from "@/lib/actions/admin.actions";
import { toast } from "sonner";
import {
  QrCode,
  Upload,
  Save,
  Plus,
  Trash2,
} from "lucide-react";

interface SocialLink {
  name: string;
  url: string;
}

interface ExtraContact {
  title: string;
  detail: string;
}

interface ExtraDetail {
  title: string;
  detail: string;
}

interface SettingsFormProps {
  initialSettings?: any;
}

export function SettingsForm({
  initialSettings,
}: SettingsFormProps) {
  const [siteName, setSiteName] = useState(
    initialSettings?.siteName || "Sugandhika"
  );

  const [tagline, setTagline] = useState(
    initialSettings?.tagline || ""
  );

  const [contactEmail, setContactEmail] = useState(
    initialSettings?.contactEmail || "support@sugandhika.com"
  );

  const [contactPhone, setContactPhone] = useState(
    initialSettings?.contactPhone || "+977 9801234567"
  );

  const [address, setAddress] = useState(
    initialSettings?.address || "Lazimpat, Kathmandu, Nepal"
  );

  const [freeShippingThreshold, setFreeShippingThreshold] =
    useState<number>(
      initialSettings?.freeShippingThreshold ?? 1500
    );

  const [shippingFee, setShippingFee] = useState<number>(
    initialSettings?.shippingFee ?? 100
  );

  // IMPORTANT: Plain URL, no Markdown
  const [fonepayQrUrl, setFonepayQrUrl] = useState(
    initialSettings?.fonepayQrUrl ||
      "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=600&q=80"
  );

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(
    Array.isArray(initialSettings?.socialLinks)
      ? initialSettings.socialLinks
      : []
  );

  const [extraContacts, setExtraContacts] =
    useState<ExtraContact[]>(
      Array.isArray(initialSettings?.extraContacts)
        ? initialSettings.extraContacts
        : []
    );

  const [extraDetails, setExtraDetails] =
    useState<ExtraDetail[]>(
      Array.isArray(initialSettings?.extraDetails)
        ? initialSettings.extraDetails
        : []
    );

  const [isSubmitting, setIsSubmitting] = useState(false);

  // =========================================================
  // FONEPAY QR UPLOAD
  // =========================================================

  const handleQrUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      toast.error("QR image must be smaller than 5MB.");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setFonepayQrUrl(reader.result as string);
      toast.success("New Fonepay QR code selected!");
    };

    reader.readAsDataURL(file);
  };

  // =========================================================
  // SOCIAL MEDIA
  // =========================================================

  const addSocialLink = () => {
    setSocialLinks((current) => [
      ...current,
      {
        name: "",
        url: "",
      },
    ]);
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks((current) =>
      current.filter((_, i) => i !== index)
    );
  };

  const updateSocialLink = (
    index: number,
    field: keyof SocialLink,
    value: string
  ) => {
    setSocialLinks((current) =>
      current.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  // =========================================================
  // EXTRA CONTACTS
  // =========================================================

  const addExtraContact = () => {
    setExtraContacts((current) => [
      ...current,
      {
        title: "",
        detail: "",
      },
    ]);
  };

  const removeExtraContact = (index: number) => {
    setExtraContacts((current) =>
      current.filter((_, i) => i !== index)
    );
  };

  const updateExtraContact = (
    index: number,
    field: keyof ExtraContact,
    value: string
  ) => {
    setExtraContacts((current) =>
      current.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  // =========================================================
  // EXTRA DETAILS
  // =========================================================

  const addExtraDetail = () => {
    setExtraDetails((current) => [
      ...current,
      {
        title: "",
        detail: "",
      },
    ]);
  };

  const removeExtraDetail = (index: number) => {
    setExtraDetails((current) =>
      current.filter((_, i) => i !== index)
    );
  };

  const updateExtraDetail = (
    index: number,
    field: keyof ExtraDetail,
    value: string
  ) => {
    setExtraDetails((current) =>
      current.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (Number(freeShippingThreshold) < 0) {
      toast.error(
        "Free shipping threshold cannot be negative."
      );
      return;
    }

    if (Number(shippingFee) < 0) {
      toast.error("Shipping fee cannot be negative.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await updateWebsiteSettingsAction({
        siteName,
        tagline,
        contactEmail,
        contactPhone,
        address,
        freeShippingThreshold:
          Number(freeShippingThreshold),
        shippingFee: Number(shippingFee),
        fonepayQrUrl,

        socialLinks,
        extraContacts,
        extraDetails,
      });

      if (res?.success) {
        toast.success(
          "Settings updated successfully!"
        );
      } else {
        toast.error(
          res?.error ||
            "Failed to update settings."
        );
      }
    } catch (error) {
      console.error(
        "Settings update error:",
        error
      );

      toast.error(
        "Something went wrong while updating settings."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      {/* =====================================================
          STORE BRAND & CONTACT
      ====================================================== */}

      <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-soft space-y-4">
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Store Brand & Contact Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Store Name"
            value={siteName}
            onChange={(e) =>
              setSiteName(e.target.value)
            }
            required
          />

          <Input
            label="Tagline"
            value={tagline}
            onChange={(e) =>
              setTagline(e.target.value)
            }
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Support Email"
            type="email"
            value={contactEmail}
            onChange={(e) =>
              setContactEmail(e.target.value)
            }
            required
          />

          <Input
            label="Support Phone"
            value={contactPhone}
            onChange={(e) =>
              setContactPhone(e.target.value)
            }
            required
          />
        </div>

        <Input
          label="Store Physical Address"
          value={address}
          onChange={(e) =>
            setAddress(e.target.value)
          }
          required
        />
      </div>

      {/* =====================================================
          FONEPAY QR
      ====================================================== */}

      <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-soft space-y-6">
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <QrCode className="w-5 h-5 text-brand-dark" />
          Fonepay Merchant QR Code Settings
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-8">
          <div className="p-4 bg-slate-900 rounded-2xl shrink-0 shadow-lg text-center">
            <img
              src={fonepayQrUrl}
              alt="Fonepay QR"
              className="w-44 h-44 object-contain rounded-xl bg-white"
            />

            <span className="text-[10px] text-brand-light font-bold uppercase tracking-wider block mt-2">
              Active QR Code
            </span>
          </div>

          <div className="space-y-4 flex-1">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Upload New Fonepay QR Image
              </h4>

              <p className="text-xs text-slate-500">
                Upload your official Fonepay Merchant QR
                code. This will display at checkout for
                customer scans.
              </p>
            </div>

            <div className="relative inline-block">
              <input
                type="file"
                accept="image/*"
                onChange={handleQrUpload}
                className="hidden"
                id="admin-qr-upload"
              />

              <label
                htmlFor="admin-qr-upload"
                className="px-4 py-2.5 bg-brand-cream border border-brand-light/30 rounded-xl text-xs font-bold text-brand-dark hover:bg-brand-dark hover:text-white cursor-pointer flex items-center gap-2 transition-all"
              >
                <Upload className="w-4 h-4" />
                Select QR Image File
              </label>
            </div>

            <Input
              label="Or Direct Image URL"
              value={fonepayQrUrl}
              onChange={(e) =>
                setFonepayQrUrl(e.target.value)
              }
              placeholder="https://..."
            />
          </div>
        </div>
      </div>

      {/* =====================================================
          SOCIAL MEDIA
      ====================================================== */}

      <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-soft space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Social Media Links
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              Add Facebook, Instagram, TikTok,
              YouTube, or any other social platform.
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addSocialLink}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Social Media
          </Button>
        </div>

        <div className="space-y-4">
          {socialLinks.map((social, index) => (
            <div
              key={index}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-100"
            >
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_auto] gap-3 items-end">
                <Input
                  label="Platform Name"
                  placeholder="Facebook"
                  value={social.name}
                  onChange={(e) =>
                    updateSocialLink(
                      index,
                      "name",
                      e.target.value
                    )
                  }
                />

                <Input
                  label="Social Media URL"
                  placeholder="https://facebook.com/yourpage"
                  value={social.url}
                  onChange={(e) =>
                    updateSocialLink(
                      index,
                      "url",
                      e.target.value
                    )
                  }
                />

                <button
                  type="button"
                  onClick={() =>
                    removeSocialLink(index)
                  }
                  className="h-10 px-4 rounded-xl bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              </div>
            </div>
          ))}

          {socialLinks.length === 0 && (
            <div className="text-center py-6 text-sm text-slate-400">
              No social media links added yet.
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          EXTRA CONTACT INFORMATION
      ====================================================== */}

      <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-soft space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Additional Contact Information
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              Add extra phone numbers, emails, WhatsApp,
              customer care, sales contacts, etc.
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addExtraContact}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Contact
          </Button>
        </div>

        <div className="space-y-4">
          {extraContacts.map((contact, index) => (
            <div
              key={index}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-100"
            >
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_auto] gap-3 items-end">
                <Input
                  label="Title"
                  placeholder="WhatsApp"
                  value={contact.title}
                  onChange={(e) =>
                    updateExtraContact(
                      index,
                      "title",
                      e.target.value
                    )
                  }
                />

                <Input
                  label="Detail"
                  placeholder="+977 98XXXXXXXX"
                  value={contact.detail}
                  onChange={(e) =>
                    updateExtraContact(
                      index,
                      "detail",
                      e.target.value
                    )
                  }
                />

                <button
                  type="button"
                  onClick={() =>
                    removeExtraContact(index)
                  }
                  className="h-10 px-4 rounded-xl bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              </div>
            </div>
          ))}

          {extraContacts.length === 0 && (
            <div className="text-center py-6 text-sm text-slate-400">
              No additional contact information added yet.
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          EXTRA STORE INFORMATION
      ====================================================== */}

      <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-soft space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Additional Store Information
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              Add location, opening hours, delivery
              information, policies, or other details.
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addExtraDetail}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Information
          </Button>
        </div>

        <div className="space-y-4">
          {extraDetails.map((item, index) => (
            <div
              key={index}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-100"
            >
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_auto] gap-3 items-end">
                <Input
                  label="Title"
                  placeholder="Opening Hours"
                  value={item.title}
                  onChange={(e) =>
                    updateExtraDetail(
                      index,
                      "title",
                      e.target.value
                    )
                  }
                />

                <Input
                  label="Detail"
                  placeholder="Sun - Fri, 10:00 AM - 6:00 PM"
                  value={item.detail}
                  onChange={(e) =>
                    updateExtraDetail(
                      index,
                      "detail",
                      e.target.value
                    )
                  }
                />

                <button
                  type="button"
                  onClick={() =>
                    removeExtraDetail(index)
                  }
                  className="h-10 px-4 rounded-xl bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              </div>
            </div>
          ))}

          {extraDetails.length === 0 && (
            <div className="text-center py-6 text-sm text-slate-400">
              No additional information added yet.
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          SHIPPING
      ====================================================== */}

      <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-soft space-y-4">
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Shipping Fees & Thresholds
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Free Shipping Minimum Order (Rs.)"
            type="number"
            min="0"
            value={freeShippingThreshold}
            onChange={(e) => {
              const value = Math.max(
                0,
                Number(e.target.value)
              );

              setFreeShippingThreshold(value);
            }}
            required
          />

          <Input
            label="Standard Shipping Fee (Rs.)"
            type="number"
            min="0"
            value={shippingFee}
            onChange={(e) => {
              const value = Math.max(
                0,
                Number(e.target.value)
              );

              setShippingFee(value);
            }}
            required
          />
        </div>
      </div>

      {/* =====================================================
          SAVE
      ====================================================== */}

      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
        >
          <Save className="w-4 h-4 mr-2" />
          Save All Settings
        </Button>
      </div>
    </form>
  );
}
