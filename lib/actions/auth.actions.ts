"use me";
"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { RegisterSchema, AddressSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function registerUser(formData: unknown) {
  try {
    const validated = RegisterSchema.parse(formData);

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email.toLowerCase().trim() },
    });

    if (existingUser) {
      return { success: false, error: "An account with this email already exists." };
    }

    const hashedPassword = await bcrypt.hash(validated.password, 10);

    const user = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email.toLowerCase().trim(),
        phone: validated.phone || null,
        passwordHash: hashedPassword,
        role: "CUSTOMER",
      },
    });

    return { success: true, user: { id: user.id, name: user.name, email: user.email } };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to register user." };
  }
}

export async function addCustomerAddress(userId: string, formData: unknown) {
  try {
    const validated = AddressSchema.parse(formData);

    if (validated.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId,
        ...validated,
      },
    });

    revalidatePath("/customer/addresses");
    return { success: true, address };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to add address." };
  }
}

export async function deleteCustomerAddress(addressId: string, userId: string) {
  try {
    await prisma.address.deleteMany({
      where: { id: addressId, userId },
    });
    revalidatePath("/customer/addresses");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete address." };
  }
}

export async function updateProfile(userId: string, data: { name: string; phone?: string }) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        phone: data.phone || null,
      },
    });
    revalidatePath("/customer/profile");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update profile." };
  }
}
