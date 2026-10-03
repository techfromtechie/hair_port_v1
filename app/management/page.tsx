"use client";

import Link from "next/link";
import Navbar from "../components/Navbar";
import {
  ShieldCheck,
  UserMinus,
  BarChart3,
  ArrowRight,
} from "lucide-react";

const managementItems = [
  {
    title: "Admin",
    description: "Manage users, groups, branches, employees and salon operations.",
    href: "/management/admin",
    icon: ShieldCheck,
  },
  {
    title: "Remove Employee",
    description: "Manage employee records and remove employees from the salon.",
    href: "#",
    icon: UserMinus,
  },
  {
    title: "Customer Report",
    description: "View customer activity and generate customer reports.",
    href: "#",
    icon: BarChart3,
  },
];

export default function ManagementPage() {
  return (
    <main className="min-h-screen bg-[#f8f5ef]">

      {/* ================= NAVBAR ================= */}
      <div className="relative bg-[#17191d]">
        <Navbar />

        <div className="h-24" />
      </div>

      {/* ================= MANAGEMENT ================= */}
      <section className="min-h-[calc(100vh-96px)] px-6 py-14 md:py-16">

        <div className="mx-auto max-w-6xl">

          {/* ================= HEADING ================= */}
          <div className="mb-12">

            <p className="text-sm font-semibold uppercase tracking-[4px] text-[#d59618]">
              Management
            </p>

            <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">

              <div>
                <h1 className="text-4xl font-bold tracking-tight text-[#17191d] md:text-5xl">
                  Management
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 md:text-base">
                  Manage your salon administration, employees and customer
                  reports from one place.
                </p>
              </div>

              {/* Small summary */}
              <div className="rounded-xl border border-[#e5dfd2] bg-white px-5 py-3 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  Total Modules
                </p>

                <p className="mt-1 text-2xl font-bold text-[#17191d]">
                  03
                </p>
              </div>

            </div>
          </div>

          {/* ================= CARDS ================= */}
          <div className="grid gap-6 md:grid-cols-3">

            {managementItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group block"
                >
                  <div className="relative h-full overflow-hidden rounded-2xl border border-[#e5dfd2] bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#d8c8a8] hover:shadow-xl">

                    {/* Top gold line */}
                    <div className="absolute left-0 right-0 top-0 h-1 bg-[#d59618] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    {/* Icon + Arrow */}
                    <div className="flex items-start justify-between">

                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#f5b942]/15 text-[#b87908] transition-colors duration-300 group-hover:bg-[#f5b942]/25">
                        <Icon className="h-7 w-7" strokeWidth={1.8} />
                      </div>

                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-all duration-300 group-hover:bg-[#17191d] group-hover:text-white">
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </div>

                    </div>

                    {/* Content */}
                    <div className="mt-7">

                      <h2 className="text-xl font-bold text-[#17191d]">
                        {item.title}
                      </h2>

                      <p className="mt-2 min-h-[48px] text-sm leading-6 text-gray-500">
                        {item.description}
                      </p>

                    </div>

                    {/* Bottom */}
                    <div className="mt-7 flex items-center gap-2 text-sm font-semibold text-[#b87908]">
                      <span>
                        Open {item.title}
                      </span>

                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>

                  </div>
                </Link>
              );
            })}

          </div>

        </div>

      </section>

    </main>
  );
}