import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string().min(6, "Confirm password must match."),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

export const ResetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string().min(6, "Confirm password must match."),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

export const AddressSchema = z.object({
  title: z.string().min(1, "Title is required (e.g. Home, Office)."),
  fullName: z.string().min(2, "Full name is required."),
  phone: z.string().min(7, "Valid phone number is required."),
  street: z.string().min(3, "Street address is required."),
  city: z.string().min(2, "City is required."),
  state: z.string().min(2, "State/Province is required."),
  postalCode: z.string().min(3, "Postal code is required."),
  country: z.string().default("Nepal"),
  isDefault: z.boolean().default(false),
});

export const CheckoutSchema = z.object({
  addressId: z.string().optional(),
  fullName: z.string().min(2, "Full name is required."),
  phone: z.string().min(7, "Phone number is required."),
  email: z.string().email("Valid email is required."),
  street: z.string().min(3, "Street address is required."),
  city: z.string().min(2, "City is required."),
  state: z.string().min(2, "State is required."),
  postalCode: z.string().min(3, "Postal code is required."),
  paymentMethod: z.enum(["COD", "FONEPAY_QR"]),
  transactionId: z.string().optional(),
  paymentScreenshot: z.string().optional(),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
});

export const ProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Product name is required."),
  slug: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters."),
  shortDescription: z.string().optional(),
  price: z.number().positive("Price must be greater than 0."),
  compareAtPrice: z.number().optional().nullable(),
  stock: z.number().int().min(0, "Stock cannot be negative."),
  categoryId: z.string().min(1, "Category is required."),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  tags: z.string().optional(),
  images: z.array(z.string()).min(1, "At least one product image is required."),
});

export const CategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Category name is required."),
  description: z.string().optional(),
  image: z.string().optional(),
  sortOrder: z.number().int().default(0),
});

export const CouponSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(3, "Coupon code must be at least 3 characters."),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().positive("Discount value must be greater than 0."),
  minOrderAmount: z.number().min(0).default(0),
  maxDiscount: z.number().optional().nullable(),
  validUntil: z.string(),
  usageLimit: z.number().int().positive().default(100),
  isActive: z.boolean().default(true),
});

export const ReviewSchema = z.object({
  productId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(5, "Comment must be at least 5 characters."),
});

export const FAQSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(5, "Question is required."),
  answer: z.string().min(5, "Answer is required."),
  category: z.string().default("General"),
  isPublished: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const BannerSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, "Title is required."),
  subtitle: z.string().optional(),
  imageUrl: z.string().url("Valid image URL required."),
  linkUrl: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const WebsiteSettingsSchema = z.object({
  siteName: z.string().min(2),
  tagline: z.string(),
  contactEmail: z.string().email(),
  contactPhone: z.string(),
  address: z.string(),
  facebookUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  whatsappNumber: z.string().optional(),
  freeShippingThreshold: z.number().min(0),
  shippingFee: z.number().min(0),
  fonepayQrUrl: z.string().optional(),
});
