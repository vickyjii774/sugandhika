import React from "react";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { revalidatePath } from "next/cache";

export const revalidate = 0;

/* =========================================================
   ADD CUSTOMER
========================================================= */

async function addCustomer(formData: FormData) {
  "use server";

  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const phone = formData.get("phone")?.toString().trim();
  const password = formData.get("password")?.toString();

  // Basic validation
  if (!name || !email || !password) {
    return;
  }

  if (password.length < 6) {
    return;
  }

  try {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create customer
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        phone: phone || null,

        // IMPORTANT:
        // New users created from this page
        // are ALWAYS customers.
        role: "CUSTOMER",
      },
    });

    // Refresh page
    revalidatePath("/admin/customers");
  } catch (error) {
    console.error("Error creating customer:", error);
  }
}

/* =========================================================
   DELETE CUSTOMER
========================================================= */

async function deleteCustomer(formData: FormData) {
  "use server";

  const customerId = formData.get("customerId")?.toString();

  if (!customerId) {
    return;
  }

  try {
    // Find the user before deleting
    const customer = await prisma.user.findUnique({
      where: {
        id: customerId,
      },
      select: {
        role: true,
      },
    });

    // User doesn't exist
    if (!customer) {
      return;
    }

    // IMPORTANT:
    // ADMIN USERS CAN NEVER BE DELETED
    if (customer.role === "ADMIN") {
      console.log("Attempted to delete an admin. Action blocked.");
      return;
    }

    // Delete customer
    //
    // Your Prisma schema uses onDelete: Cascade
    // for the customer's related records.
    await prisma.user.delete({
      where: {
        id: customerId,
      },
    });

    // Refresh customer page
    revalidatePath("/admin/customers");
  } catch (error) {
    console.error("Error deleting customer:", error);
  }
}

/* =========================================================
   CUSTOMER PAGE
========================================================= */

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },

    include: {
      _count: {
        select: {
          orders: true,
          reviews: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-serif">
          Customer Directory
        </h1>

        <p className="text-xs text-slate-500">
          Registered users, accounts and order activity
        </p>
      </div>


      {/* =====================================================
          ADD CUSTOMER
      ===================================================== */}

      <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-6">

        <div className="mb-5">
          <h2 className="text-lg font-extrabold text-slate-900">
            Add New Customer
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            Create a customer account from the admin panel.
          </p>
        </div>


        <form
          action={addCustomer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >

          {/* NAME */}
          <div>
            <label
              htmlFor="name"
              className="block text-xs font-bold text-slate-600 mb-2"
            >
              Full Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Enter customer name"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>


          {/* EMAIL */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-bold text-slate-600 mb-2"
            >
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="customer@example.com"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>


          {/* PHONE */}
          <div>
            <label
              htmlFor="phone"
              className="block text-xs font-bold text-slate-600 mb-2"
            >
              Phone
            </label>

            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="98XXXXXXXX"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>


          {/* PASSWORD */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-bold text-slate-600 mb-2"
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="Minimum 6 characters"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>


          {/* BUTTON */}
          <div className="md:col-span-2 lg:col-span-4 flex items-center gap-3">

            <button
              type="submit"
              className="rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white hover:bg-green-700 transition-colors shadow-sm"
            >
              + Add Customer
            </button>

            <span className="text-xs text-slate-400">
              New accounts are automatically assigned the CUSTOMER role.
            </span>

          </div>

        </form>
      </div>


      {/* =====================================================
          CUSTOMER TABLE
      ===================================================== */}

      <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full text-left text-xs">

            {/* TABLE HEADER */}
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">

              <tr>

                <th className="p-4">
                  Customer
                </th>

                <th className="p-4">
                  Email
                </th>

                <th className="p-4">
                  Phone
                </th>

                <th className="p-4">
                  Role
                </th>

                <th className="p-4">
                  Orders
                </th>

                <th className="p-4">
                  Joined Date
                </th>

                <th className="p-4">
                  Actions
                </th>

              </tr>

            </thead>


            {/* TABLE BODY */}
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">

              {customers.map((c) => (

                <tr
                  key={c.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >

                  {/* CUSTOMER */}
                  <td className="p-4">

                    <div className="font-bold text-slate-900">
                      {c.name}
                    </div>

                  </td>


                  {/* EMAIL */}
                  <td className="p-4 text-slate-600">
                    {c.email}
                  </td>


                  {/* PHONE */}
                  <td className="p-4">
                    {c.phone || "N/A"}
                  </td>


                  {/* ROLE */}
                  <td className="p-4">

                    <Badge
                      variant={
                        c.role === "ADMIN"
                          ? "brand"
                          : "outline"
                      }
                    >
                      {c.role}
                    </Badge>

                  </td>


                  {/* ORDERS */}
                  <td className="p-4 font-bold">
                    {c._count.orders} orders
                  </td>


                  {/* JOINED DATE */}
                  <td className="p-4">
                    {formatDate(c.createdAt)}
                  </td>


                  {/* ACTIONS */}
                  <td className="p-4">

                    {c.role === "ADMIN" ? (

                      /* ADMIN PROTECTED */
                      <span className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-400">
                        🔒 Protected
                      </span>

                    ) : (

                      /* CUSTOMER DELETE */
                      <form action={deleteCustomer}>

                        <input
                          type="hidden"
                          name="customerId"
                          value={c.id}
                        />

                        <button
                          type="submit"
                          className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
                        >
                          Delete
                        </button>

                      </form>

                    )}

                  </td>

                </tr>

              ))}


              {/* NO CUSTOMERS */}
              {customers.length === 0 && (

                <tr>

                  <td
                    colSpan={7}
                    className="p-10 text-center text-slate-400"
                  >
                    No customers found.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}


