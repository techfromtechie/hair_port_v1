"use client";


"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";



export default function Navbar() {
  
const router = useRouter();

const [userName, setUserName] = useState("Loading...");
const [loggingOut, setLoggingOut] = useState(false);

const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
const [openMobileMenu, setOpenMobileMenu] = useState<string | null>(null);
const [userRole, setUserRole] = useState<string | null>(null);

useEffect(() => {
  let active = true;

  async function loadUserName() {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (!active) return;

    if (authError || !user) {
      router.replace("/login");
      return;
    }

    const { data: roles, error: roleError } =
      await supabase.rpc("get_my_role");

    if (!active) return;

    if (roleError || !roles?.length) {
      setUserName(user.email ?? "User");
      return;
    }

    const profile = roles[0];
    setUserRole(profile.role);

    if (profile.role === "branch_manager" && profile.employee_id) {
      const { data: employee, error } = await supabase
        .from("employees")
        .select("name")
        .eq("id", profile.employee_id)
        .single();

      if (!active) return;

      setUserName(
        !error && employee?.name
          ? employee.name
          : user.email ?? "Branch Manager"
      );
    } else if (profile.role === "admin") {
      setUserName(
        user.user_metadata?.full_name ?? user.email ?? "Admin"
      );
    } else {
      setUserName(user.email ?? "User");
    }
  }

  loadUserName();

  return () => {
    active = false;
  };
}, [router]);

const handleLogout = async () => {
  if (loggingOut) return;

  setLoggingOut(true);

  const { error } = await supabase.auth.signOut();

  if (error) {
    setLoggingOut(false);
    alert("Logout failed. Please try again.");
    return;
  }

  router.replace("/login");
  router.refresh();
};


  

  const toggleMobileMenu = (menu: string) => {
    setOpenMobileMenu(
      openMobileMenu === menu ? null : menu
    );
  };

  return (
    <nav className="absolute left-0 top-0 z-50 w-full">
      <div className="mx-auto max-w-7xl px-6 py-5 lg:px-10">

        {/* ================= TOP NAVBAR ================= */}
        <div className="flex items-center justify-between">

          {/* ================= LOGO ================= */}
          <Link
            href="/"
            className="flex items-center gap-3"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="text-3xl text-[#f5b942]">
              ✂
            </span>

            <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
              HairPort{" "}
              <span className="text-[#f5b942]">
                Salon
              </span>
            </h1>
          </Link>

          {/* ================= DESKTOP NAVIGATION ================= */}
          <div className="hidden items-center gap-8 md:flex">

            {/* HOME */}
            <Link
              href="/"
              className="text-lg font-medium text-white transition hover:text-[#f5b942]"
            >
              Home
            </Link>

            {/* MANAGEMENT */}
           
{/* MANAGEMENT - ADMIN ONLY */}
{userRole === "admin" && (
  <Link
    href="/management"
    className="text-lg font-medium text-white transition hover:text-[#f5b942]"
  >
    Management
  </Link>
)}


            {/* TRANSACTION */}
            <div className="group relative">

              <button
                type="button"
                className="flex items-center gap-2 text-lg font-medium text-white transition hover:text-[#f5b942]"
              >
                Transaction
                <span className="text-xs">
                  ▼
                </span>
              </button>

              <div
                className="
                  invisible absolute left-0 top-full z-50 mt-3
                  w-60 translate-y-2 rounded-xl bg-white p-2
                  opacity-0 shadow-xl
                  transition-all duration-200
                  group-hover:visible
                  group-hover:translate-y-0
                  group-hover:opacity-100
                "
              >
                <Link
                  href="/transaction/add"
                  className="
                    block w-full rounded-lg px-4 py-3
                    text-left text-base font-medium text-gray-700
                    transition hover:bg-gray-100
                  "
                >
                  Add Transaction
                </Link>

                <Link
                  href="/transaction"
                  className="
                    block w-full rounded-lg px-4 py-3
                    text-left text-base font-medium text-gray-700
                    transition hover:bg-gray-100
                  "
                >
                  Transaction Report
                </Link>
              </div>
            </div>

            {/* ADVANCE */}
            <div className="group relative">

              <button
                type="button"
                className="flex items-center gap-2 text-lg font-medium text-white transition hover:text-[#f5b942]"
              >
                Advance
                <span className="text-xs">
                  ▼
                </span>
              </button>

              <div
                className="
                  invisible absolute left-0 top-full z-50 mt-3
                  w-64 translate-y-2 rounded-xl bg-white p-2
                  opacity-0 shadow-xl
                  transition-all duration-200
                  group-hover:visible
                  group-hover:translate-y-0
                  group-hover:opacity-100
                "
              >
                <Link
                  href="/advance/add"
                  className="
                    block w-full rounded-lg px-4 py-3
                    text-left text-base font-medium text-gray-700
                    transition hover:bg-gray-100
                  "
                >
                  Add Advance
                </Link>

                <Link
                  href="/advance"
                  className="
                    block w-full rounded-lg px-4 py-3
                    text-left text-base font-medium text-gray-700
                    transition hover:bg-gray-100
                  "
                >
                  Advance Payment Report
                </Link>
              </div>
            </div>

            {/* LEAVE */}
            <div className="group relative">

              <button
                type="button"
                className="flex items-center gap-2 text-lg font-medium text-white transition hover:text-[#f5b942]"
              >
                Leave
                <span className="text-xs">
                  ▼
                </span>
              </button>

              <div
                className="
                  invisible absolute left-0 top-full z-50 mt-3
                  w-56 translate-y-2 rounded-xl bg-white p-2
                  opacity-0 shadow-xl
                  transition-all duration-200
                  group-hover:visible
                  group-hover:translate-y-0
                  group-hover:opacity-100
                "
              >
                <Link
                  href="/leave/add"
                  className="
                    block w-full rounded-lg px-4 py-3
                    text-left text-base font-medium text-gray-700
                    transition hover:bg-gray-100
                  "
                >
                  Add Leave
                </Link>

                <Link
                  href="/leave"
                  className="
                    block w-full rounded-lg px-4 py-3
                    text-left text-base font-medium text-gray-700
                    transition hover:bg-gray-100
                  "
                >
                  Leave Report
                </Link>
              </div>
            </div>
          </div>

          {/* ================= DESKTOP USER PROFILE ================= */}
          <div className="hidden md:block">

            <div className="group relative">

              <button
                type="button"
                className="
                  flex items-center gap-3
                  rounded-full border border-white/20
                  bg-black/40 px-5 py-3
                  backdrop-blur-md
                  transition hover:bg-black/60
                "
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-bold text-gray-800">
                  {userName.charAt(0)}
                </div>

                <span className="text-lg font-medium text-white">
                  {userName}
                </span>

                <span className="text-xs text-white">
                  ▼
                </span>
              </button>

              {/* USER DROPDOWN */}
              <div
                className="
                  invisible absolute right-0 top-full z-50 mt-3
                  w-56 translate-y-2 rounded-xl bg-white p-2
                  opacity-0 shadow-xl
                  transition-all duration-200
                  group-hover:visible
                  group-hover:translate-y-0
                  group-hover:opacity-100
                "
              >
                <div className="border-b border-gray-100 px-4 py-3">
                  <p className="text-sm text-gray-500">
                    Logged in as
                  </p>

                  <p className="mt-1 text-base font-semibold text-gray-800">
                    {userName}
                  </p>
                </div>

                
<button
  type="button"
  onClick={handleLogout}
  disabled={loggingOut}
  className="
    mt-1 block w-full rounded-lg
    px-4 py-3 text-left
    text-base font-medium text-red-600
    transition hover:bg-red-50
    disabled:opacity-60
  "
>
  {loggingOut ? "Logging out..." : "Logout"}
</button>

              </div>

            </div>
          </div>

          {/* ================= MOBILE MENU BUTTON ================= */}
          <div className="flex items-center gap-3 md:hidden">

            {/* USER INITIAL */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-bold text-gray-800">
              {userName.charAt(0)}
            </div>

            {/* HAMBURGER */}
            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen(!mobileMenuOpen)
              }
              className="
                flex h-10 w-10 items-center justify-center
                rounded-lg border border-white/20
                bg-black/40 text-2xl text-white
                backdrop-blur-md
                transition hover:bg-black/60
              "
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>

          </div>

        </div>

        {/* ================= MOBILE NAVIGATION ================= */}
        {mobileMenuOpen && (
          <div
            className="
              mt-4 rounded-2xl border border-white/10
              bg-[#17191d]/95 p-4 shadow-2xl
              backdrop-blur-md md:hidden
            "
          >

            {/* USER INFO */}
            <div className="mb-3 rounded-xl bg-white/5 px-4 py-3">
              <p className="text-xs text-gray-400">
                Logged in as
              </p>

              <p className="mt-1 text-base font-semibold text-white">
                {userName}
              </p>
            </div>

            {/* HOME */}
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="
                block rounded-lg px-4 py-3
                text-base font-medium text-white
                transition hover:bg-white/10
                hover:text-[#f5b942]
              "
            >
              Home
            </Link>

            
{/* MANAGEMENT - ADMIN ONLY */}
{userRole === "admin" && (
  <Link
    href="/management"
    onClick={() => setMobileMenuOpen(false)}
    className="
      block rounded-lg px-4 py-3
      text-base font-medium text-white
      transition hover:bg-white/10
      hover:text-[#f5b942]
    "
  >
    Management
  </Link>
)}


            {/* TRANSACTION */}
            <div className="border-t border-white/10">

              <button
                type="button"
                onClick={() =>
                  toggleMobileMenu("transaction")
                }
                className="
                  flex w-full items-center justify-between
                  rounded-lg px-4 py-3
                  text-left text-base font-medium text-white
                  transition hover:bg-white/10
                "
              >
                <span>Transaction</span>

                <span className="text-xs">
                  {openMobileMenu === "transaction"
                    ? "▲"
                    : "▼"}
                </span>
              </button>

              {openMobileMenu === "transaction" && (
                <div className="ml-4 space-y-1 pb-2">

                  <Link
                    href="/transaction/add"
                    onClick={() =>
                      setMobileMenuOpen(false)
                    }
                    className="
                      block rounded-lg px-4 py-2.5
                      text-sm text-gray-300
                      transition hover:bg-white/10
                      hover:text-[#f5b942]
                    "
                  >
                    Add Transaction
                  </Link>

                  <Link
                    href="/transaction"
                    onClick={() =>
                      setMobileMenuOpen(false)
                    }
                    className="
                      block rounded-lg px-4 py-2.5
                      text-sm text-gray-300
                      transition hover:bg-white/10
                      hover:text-[#f5b942]
                    "
                  >
                    Transaction Report
                  </Link>

                </div>
              )}
            </div>

            {/* ADVANCE */}
            <div className="border-t border-white/10">

              <button
                type="button"
                onClick={() =>
                  toggleMobileMenu("advance")
                }
                className="
                  flex w-full items-center justify-between
                  rounded-lg px-4 py-3
                  text-left text-base font-medium text-white
                  transition hover:bg-white/10
                "
              >
                <span>Advance</span>

                <span className="text-xs">
                  {openMobileMenu === "advance"
                    ? "▲"
                    : "▼"}
                </span>
              </button>

              {openMobileMenu === "advance" && (
                <div className="ml-4 space-y-1 pb-2">

                  <Link
                    href="/advance/add"
                    onClick={() =>
                      setMobileMenuOpen(false)
                    }
                    className="
                      block rounded-lg px-4 py-2.5
                      text-sm text-gray-300
                      transition hover:bg-white/10
                      hover:text-[#f5b942]
                    "
                  >
                    Add Advance
                  </Link>

                  <Link
                    href="/advance"
                    onClick={() =>
                      setMobileMenuOpen(false)
                    }
                    className="
                      block rounded-lg px-4 py-2.5
                      text-sm text-gray-300
                      transition hover:bg-white/10
                      hover:text-[#f5b942]
                    "
                  >
                    Advance Payment Report
                  </Link>

                </div>
              )}
            </div>

            {/* LEAVE */}
            <div className="border-t border-white/10">

              <button
                type="button"
                onClick={() =>
                  toggleMobileMenu("leave")
                }
                className="
                  flex w-full items-center justify-between
                  rounded-lg px-4 py-3
                  text-left text-base font-medium text-white
                  transition hover:bg-white/10
                "
              >
                <span>Leave</span>

                <span className="text-xs">
                  {openMobileMenu === "leave"
                    ? "▲"
                    : "▼"}
                </span>
              </button>

              {openMobileMenu === "leave" && (
                <div className="ml-4 space-y-1 pb-2">

                  <Link
                    href="/leave/add"
                    onClick={() =>
                      setMobileMenuOpen(false)
                    }
                    className="
                      block rounded-lg px-4 py-2.5
                      text-sm text-gray-300
                      transition hover:bg-white/10
                      hover:text-[#f5b942]
                    "
                  >
                    Add Leave
                  </Link>

                  <Link
                    href="/leave"
                    onClick={() =>
                      setMobileMenuOpen(false)
                    }
                    className="
                      block rounded-lg px-4 py-2.5
                      text-sm text-gray-300
                      transition hover:bg-white/10
                      hover:text-[#f5b942]
                    "
                  >
                    Leave Report
                  </Link>

                </div>
              )}
            </div>

            {/* LOGOUT */}
            <div className="border-t border-white/10 pt-2">

              
<button
  type="button"
  onClick={handleLogout}
  disabled={loggingOut}
  className="
    block w-full rounded-lg
    px-4 py-3 text-left
    text-base font-medium text-red-400
    transition hover:bg-red-500/10
    disabled:opacity-60
  "
>
  {loggingOut ? "Logging out..." : "Logout"}
</button>

            </div>

          </div>
        )}

      </div>
    </nav>
  );
}