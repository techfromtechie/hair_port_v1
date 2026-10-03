"use client";

import Link from "next/link";
import Navbar from "../../components/Navbar";

import {
  LayoutDashboard,
  UsersRound,
  UserRound,
  Wallet,
  Building2,
  CreditCard,
  UserCog,
  Gift,
  SlidersHorizontal,
  CalendarDays,
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

const managementModules = [
  {
    title: "Advance Payments",
    description: "Manage employee advance payments",
    href: "/management/admin/advance-payments",
    icon: Wallet,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    title: "Branches",
    description: "Manage and monitor salon branches",
    href: "/management/admin/branches",
    icon: Building2,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    title: "Daily Transactions",
    description: "View and manage daily transactions",
    href: "/management/admin/daily-transactions",
    icon: CreditCard,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    title: "Employees",
    description: "Manage salon employee records",
    href: "/management/admin/employees",
    icon: UserCog,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    title: "Incentive Employees",
    description: "Manage employee incentives",
    href: "/management/admin/incentive-employees",
    icon: Gift,
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
  },
  {
    title: "Incentive Rules",
    description: "Configure employee incentive rules",
    href: "/management/admin/incentive-rules",
    icon: SlidersHorizontal,
    iconBg: "bg-cyan-50",
    iconColor: "text-cyan-600",
  },
  {
    title: "Leaves",
    description: "Manage employee leave records",
    href: "/management/admin/leaves",
    icon: CalendarDays,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
  },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#f7f7f5]">

      {/* =========================================================
          COMMON NAVBAR
      ========================================================= */}
      <header className="sticky top-0 z-50 h-24 bg-[#17191d]">
        <Navbar />
      </header>

      {/* =========================================================
          SIDEBAR
      ========================================================= */}
      <aside className="fixed left-0 top-24 z-40 h-[calc(100vh-6rem)] w-64 border-r border-gray-200 bg-white shadow-sm">

        <div className="flex h-full flex-col">

          {/* Logo */}
          <div className="flex h-[76px] shrink-0 items-center border-b border-gray-200 px-6">
            <div>
              <h1 className="text-[22px] font-bold tracking-tight text-[#17191d]">
                HairPort
              </h1>

              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[2px] text-[#d59618]">
                Salon Management
              </p>
            </div>
          </div>

          {/* Sidebar Scroll Area */}
          <div className="flex-1 overflow-y-auto px-4 py-5">

            {/* Dashboard */}
            <Link
              href="/management/admin"
              className="flex items-center gap-3 rounded-xl bg-[#17191d] px-4 py-3 text-sm font-semibold text-white shadow-sm"
            >
              <LayoutDashboard className="h-[18px] w-[18px]" />
              <span>Dashboard</span>
            </Link>

            {/* ADMIN */}
            <div className="mt-8">

              <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[1.8px] text-gray-400">
                Admin
              </p>

              <div className="space-y-1">

                <Link
                  href="/management/admin/groups"
                  className="group flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-[#17191d]"
                >
                  <div className="flex items-center gap-3">
                    <UsersRound className="h-[18px] w-[18px] text-gray-400 group-hover:text-[#d59618]" />
                    <span>Groups</span>
                  </div>

                  <ChevronRight className="h-4 w-4 text-gray-300 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                </Link>

                <Link
                  href="/management/admin/users"
                  className="group flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-[#17191d]"
                >
                  <div className="flex items-center gap-3">
                    <UserRound className="h-[18px] w-[18px] text-gray-400 group-hover:text-[#d59618]" />
                    <span>Users</span>
                  </div>

                  <ChevronRight className="h-4 w-4 text-gray-300 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                </Link>

              </div>
            </div>

            {/* MANAGEMENT */}
            <div className="mt-8">

              <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[1.8px] text-gray-400">
                Management
              </p>

              <div className="space-y-1">

                <Link
                  href="/management/admin/advance-payments"
                  className="group flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-[#17191d]"
                >
                  <div className="flex items-center gap-3">
                    <Wallet className="h-[18px] w-[18px] text-gray-400 group-hover:text-[#d59618]" />
                    <span>Advance Payments</span>
                  </div>

                  <ChevronRight className="h-4 w-4 text-gray-300 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                </Link>

                <Link
                  href="/management/admin/branches"
                  className="group flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-[#17191d]"
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="h-[18px] w-[18px] text-gray-400 group-hover:text-[#d59618]" />
                    <span>Branches</span>
                  </div>

                  <ChevronRight className="h-4 w-4 text-gray-300 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                </Link>

                <Link
                  href="/management/admin/daily-transactions"
                  className="group flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-[#17191d]"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-[18px] w-[18px] text-gray-400 group-hover:text-[#d59618]" />
                    <span>Daily Transactions</span>
                  </div>

                  <ChevronRight className="h-4 w-4 text-gray-300 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                </Link>

                <Link
                  href="/management/admin/employees"
                  className="group flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-[#17191d]"
                >
                  <div className="flex items-center gap-3">
                    <UserCog className="h-[18px] w-[18px] text-gray-400 group-hover:text-[#d59618]" />
                    <span>Employees</span>
                  </div>

                  <ChevronRight className="h-4 w-4 text-gray-300 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                </Link>

                <Link
                  href="/management/admin/incentive-employees"
                  className="group flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-[#17191d]"
                >
                  <div className="flex items-center gap-3">
                    <Gift className="h-[18px] w-[18px] text-gray-400 group-hover:text-[#d59618]" />
                    <span>Incentive Employees</span>
                  </div>

                  <ChevronRight className="h-4 w-4 text-gray-300 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                </Link>

                <Link
                  href="/management/admin/incentive-rules"
                  className="group flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-[#17191d]"
                >
                  <div className="flex items-center gap-3">
                    <SlidersHorizontal className="h-[18px] w-[18px] text-gray-400 group-hover:text-[#d59618]" />
                    <span>Incentive Rules</span>
                  </div>

                  <ChevronRight className="h-4 w-4 text-gray-300 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                </Link>

                <Link
                  href="/management/admin/leaves"
                  className="group flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-[#17191d]"
                >
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-[18px] w-[18px] text-gray-400 group-hover:text-[#d59618]" />
                    <span>Leaves</span>
                  </div>

                  <ChevronRight className="h-4 w-4 text-gray-300 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                </Link>

              </div>
            </div>

          </div>
        </div>
      </aside>


      {/* =========================================================
          MAIN CONTENT
      ========================================================= */}
      <main className="ml-64 min-h-[calc(100vh-6rem)]">

        {/* ================= PAGE CONTENT ================= */}
        <div className="px-6 py-8 md:px-8">

          {/* Welcome */}
          <div className="mb-8">

            <h1 className="text-2xl font-bold tracking-tight text-[#17191d]">
              Welcome back, Alfez
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Here&apos;s an overview of your salon operations today.
            </p>

          </div>


          {/* =====================================================
              STATISTICS
          ===================================================== */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

            {/* Employees */}
            <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Employees
                  </p>

                  <h3 className="mt-3 text-3xl font-bold tracking-tight text-[#17191d]">
                    124
                  </h3>

                  <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
                    <UserCog className="h-3.5 w-3.5" />
                    <span>Active employees</span>
                  </div>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <UserCog className="h-5 w-5" />
                </div>

              </div>

              <div className="absolute bottom-0 left-0 h-1 w-full bg-blue-500 opacity-0 transition-opacity group-hover:opacity-100" />

            </div>


            {/* Branches */}
            <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Branches
                  </p>

                  <h3 className="mt-3 text-3xl font-bold tracking-tight text-[#17191d]">
                    8
                  </h3>

                  <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>Active salon branches</span>
                  </div>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Building2 className="h-5 w-5" />
                </div>

              </div>

              <div className="absolute bottom-0 left-0 h-1 w-full bg-amber-500 opacity-0 transition-opacity group-hover:opacity-100" />

            </div>


            {/* Today's Transactions */}
            <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Today&apos;s Transactions
                  </p>

                  <h3 className="mt-3 text-3xl font-bold tracking-tight text-[#17191d]">
                    ₹24,500
                  </h3>

                  <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>All branches · Today</span>
                  </div>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CreditCard className="h-5 w-5" />
                </div>

              </div>

              <div className="absolute bottom-0 left-0 h-1 w-full bg-emerald-500 opacity-0 transition-opacity group-hover:opacity-100" />

            </div>

          </div>


          {/* =====================================================
              QUICK MANAGEMENT
          ===================================================== */}
          <section className="mt-10">

            <div className="mb-5 flex items-end justify-between">

              <div>
                <h2 className="text-lg font-bold text-[#17191d]">
                  Quick Management
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Access and manage your salon operations
                </p>
              </div>

            </div>


            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

              {managementModules.map((module) => {

                const Icon = module.icon;

                return (
                  <Link
                    key={module.title}
                    href={module.href}
                    className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-lg"
                  >

                    {/* Top Accent */}
                    <div className="absolute left-0 right-0 top-0 h-0.5 bg-[#d59618] opacity-0 transition-opacity group-hover:opacity-100" />

                    {/* Icon + Arrow */}
                    <div className="flex items-start justify-between">

                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${module.iconBg} ${module.iconColor}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-all duration-300 group-hover:bg-[#17191d] group-hover:text-white">
                        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>

                    </div>


                    {/* Text */}
                    <div className="mt-6">

                      <h3 className="text-base font-bold text-[#17191d]">
                        {module.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-gray-500">
                        {module.description}
                      </p>

                    </div>


                    {/* Bottom Link */}
                    <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-[#b87908]">
                      <span>Open module</span>

                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5" />
                    </div>

                  </Link>
                );

              })}

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}