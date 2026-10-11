
"use client";

import { useCallback, useEffect, useState } from "react";

import Loader from "@/app/components/Loader";

import Link from "next/link";
import Navbar from "../../components/Navbar";
import { supabase } from "@/app/lib/supabase";
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
  ArrowLeft,
  RefreshCw,
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

type DashboardStats = {
  employees: number;
  branches: number;
  todaysTransactions: number;
};

type TransactionRow = {
  amount: number | string | null;
  payment_mode: string | null;
  transaction_date: string | null;
  cash: number | string | null;
  online: number | string | null;
  other: number | string | null;
};

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    employees: 0,
    branches: 0,
    todaysTransactions: 0,
  });

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError("");

      const now = new Date();
      const today = formatDate(now);

      const tomorrowDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
      );

      const tomorrow = formatDate(tomorrowDate);

      const [
        employeeResult,
        branchResult,
        transactionResult,
      ] = await Promise.all([
        supabase
          .from("employees")
          .select("id", { count: "exact", head: true }),

        supabase
          .from("branches")
          .select("id", { count: "exact", head: true }),

        supabase
          .from("transactions")
          .select(
            "amount, payment_mode, transaction_date, cash, online, other"
          )
          .gte("transaction_date", today)
          .lt("transaction_date", tomorrow),
      ]);

      if (employeeResult.error) {
        throw new Error(
          `Employees: ${employeeResult.error.message}`
        );
      }

      if (branchResult.error) {
        throw new Error(
          `Branches: ${branchResult.error.message}`
        );
      }

      if (transactionResult.error) {
        throw new Error(
          `Transactions: ${transactionResult.error.message}`
        );
      }

      const transactions: TransactionRow[] =
        transactionResult.data ?? [];

      const transactionTotal = transactions.reduce(
        (total, transaction) => {
          const cash = Number(transaction.cash) || 0;
          const online = Number(transaction.online) || 0;
          const other = Number(transaction.other) || 0;

          const hasSplitAmounts =
            cash !== 0 || online !== 0 || other !== 0;

          // Supports both split payment columns and amount/payment_mode.
          const rowTotal = hasSplitAmounts
            ? cash + online + other
            : Number(transaction.amount) || 0;

          return total + rowTotal;
        },
        0
      );

      setStats({
        employees: employeeResult.count ?? 0,
        branches: branchResult.count ?? 0,
        todaysTransactions: transactionTotal,
      });
    } catch (error) {
      console.error("Dashboard Supabase error:", error);

      setLoadError(
        error instanceof Error
          ? error.message
          : "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboardData();
  }, [fetchDashboardData]);

  const statCards = [
    {
      title: "Total Employees",
      value: stats.employees.toLocaleString("en-IN"),
      description: "Employee records in Supabase",
      icon: UserCog,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      barColor: "bg-blue-500",
    },
    {
      title: "Total Branches",
      value: stats.branches.toLocaleString("en-IN"),
      description: "Branch records in Supabase",
      icon: Building2,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      barColor: "bg-amber-500",
    },
    {
      title: "Today's Transactions",
      value: formatCurrency(stats.todaysTransactions),
      description: "Total transaction amount today",
      icon: CreditCard,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      barColor: "bg-emerald-500",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      {/* Navbar */}
      <header className="sticky top-0 z-50 h-24 bg-[#17191d]">
        <Navbar />
      </header>

      {/* Sidebar */}
      <aside className="fixed left-0 top-24 z-40 hidden h-[calc(100vh-6rem)] w-64 border-r border-gray-200 bg-white shadow-sm md:block">
        <div className="flex h-full flex-col">
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

          <div className="flex-1 overflow-y-auto px-4 py-5">
            <Link
              href="/management/admin"
              className="flex items-center gap-3 rounded-xl bg-[#17191d] px-4 py-3 text-sm font-semibold text-white shadow-sm"
            >
              <LayoutDashboard className="h-[18px] w-[18px]" />
              <span>Dashboard</span>
            </Link>

            <div className="mt-8">
              <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[1.8px] text-gray-400">
                Admin
              </p>

              <div className="space-y-1">
                <Link
                  href="/management/admin/groups"
                  className="group flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-[#17191d]"
                >
                  <span className="flex items-center gap-3">
                    <UsersRound className="h-[18px] w-[18px] text-gray-400 group-hover:text-[#d59618]" />
                    Groups
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-300 opacity-0 group-hover:opacity-100" />
                </Link>

                <Link
                  href="/management/admin/users"
                  className="group flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-[#17191d]"
                >
                  <span className="flex items-center gap-3">
                    <UserRound className="h-[18px] w-[18px] text-gray-400 group-hover:text-[#d59618]" />
                    Users
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-300 opacity-0 group-hover:opacity-100" />
                </Link>
              </div>
            </div>

            <div className="mt-8">
              <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[1.8px] text-gray-400">
                Management
              </p>

              <div className="space-y-1">
                {managementModules.map((module) => {
                  const Icon = module.icon;

                  return (
                    <Link
                      key={module.title}
                      href={module.href}
                      className="group flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-[#17191d]"
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="h-[18px] w-[18px] text-gray-400 group-hover:text-[#d59618]" />
                        {module.title}
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-300 opacity-0 group-hover:opacity-100" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      {loading ? (
  <Loader text="Loading dashboard..." fullScreen />
) : (
      <main className="min-h-[calc(100vh-6rem)] md:ml-64">
        <div className="px-5 py-8 md:px-8">
          {/* Heading and back button */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/management"
                aria-label="Back to Home"
                title="Back to Home"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:border-[#f5b942] hover:bg-[#fff9eb] hover:text-[#a86f00]"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#17191d] md:text-3xl">
                  Welcome back, Irfan shaikh
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Here&apos;s an overview of your salon operations today.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void fetchDashboardData()}
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          {/* Loading and error states */}
          {loading && (
            <div className="mb-5 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500">
              Loading dashboard data from Supabase...
            </div>
          )}

          {loadError && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-700">
                Failed to load dashboard data
              </p>
              <p className="mt-1 break-words text-sm text-red-600">
                {loadError}
              </p>
              <p className="mt-2 text-xs text-red-600">
                Check your Supabase table columns, SELECT permissions,
                and Row Level Security policies.
              </p>
            </div>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {statCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.title}
                  className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-500">
                        {card.title}
                      </p>

                      <h2 className="mt-3 break-words text-3xl font-bold tracking-tight text-[#17191d]">
                        {loading ? "..." : card.value}
                      </h2>

                      <p className="mt-3 text-xs text-gray-400">
                        {card.description}
                      </p>
                    </div>

                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.iconBg} ${card.iconColor}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <div
                    className={`absolute bottom-0 left-0 h-1 w-full ${card.barColor} opacity-0 transition-opacity group-hover:opacity-100`}
                  />
                </div>
              );
            })}
          </div>

          {/* Quick Management */}
          <section className="mt-10">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-[#17191d]">
                Quick Management
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Access and manage your salon operations.
              </p>
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
                    <div className="absolute left-0 right-0 top-0 h-0.5 bg-[#d59618] opacity-0 transition-opacity group-hover:opacity-100" />

                    <div className="flex items-start justify-between">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${module.iconBg} ${module.iconColor}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-all group-hover:bg-[#17191d] group-hover:text-white">
                        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-base font-bold text-[#17191d]">
                        {module.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-gray-500">
                        {module.description}
                      </p>
                    </div>

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
)}
    </div>
  );
}

