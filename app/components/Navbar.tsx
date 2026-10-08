import Link from "next/link";

export default function Navbar() {
  const userName = "Irfan shaikh";

  return (
    <nav className="absolute left-0 top-0 z-50 w-full">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">

        {/* ================= LOGO ================= */}
        <Link href="/" className="flex items-center gap-3">
          <span className="text-3xl text-[#f5b942]">
            ✂
          </span>

          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
            HairPort <span className="text-[#f5b942]">Salon</span>
          </h1>
        </Link>


        {/* ================= NAVIGATION ================= */}
        <div className="hidden items-center gap-8 md:flex">

          {/* ================= HOME ================= */}
          <Link
            href="/"
            className="text-lg font-medium text-white transition hover:text-[#f5b942]"
          >
            Home
          </Link>


          {/* ================= MANAGEMENT ================= */}
          <Link
            href="/management"
            className="text-lg font-medium text-white transition hover:text-[#f5b942]"
          >
            Management
          </Link>


          {/* ================= TRANSACTION ================= */}
          {/* ================= TRANSACTION ================= */}
<div className="group relative">

  {/* Transaction Menu */}
  <button
    type="button"
    className="flex items-center gap-2 text-lg font-medium text-white transition hover:text-[#f5b942]"
  >
    Transaction
    <span className="text-xs">
      ▼
    </span>
  </button>

  {/* Transaction Dropdown */}
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

    {/* Add Transaction */}
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

    {/* Transaction */}
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


        
         {/* Advance */}
<div className="group relative">
  <button
    type="button"
    className="flex items-center gap-2 text-lg font-medium text-white transition hover:text-[#f5b942]"
  >
    Advance <span className="text-xs">▼</span>
  </button>

  <div className="invisible absolute left-0 top-full z-50 mt-3 w-64 translate-y-2 rounded-xl bg-white p-2 opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">

    {/* Add Advance */}
    <Link
      href="/advance/add"
      className="block w-full rounded-lg px-4 py-3 text-left text-base font-medium text-gray-700 transition hover:bg-gray-100"
    >
      Add Advance
    </Link>

    {/* Advance Payment Report */}
    <Link
      href="/advance"
      className="block w-full rounded-lg px-4 py-3 text-left text-base font-medium text-gray-700 transition hover:bg-gray-100"
    >
      Advance Payment Report
    </Link>

  </div>
</div>


        {/* Leave */}
<div className="group relative">
  <button
    type="button"
    className="flex items-center gap-2 text-lg font-medium text-white transition hover:text-[#f5b942]"
  >
    Leave <span className="text-xs">▼</span>
  </button>

  <div className="invisible absolute left-0 top-full z-50 mt-3 w-56 translate-y-2 rounded-xl bg-white p-2 opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
    <Link
      href="/leave/add"
      className="block w-full rounded-lg px-4 py-3 text-left text-base font-medium text-gray-700 transition hover:bg-gray-100"
    >
      Add Leave
    </Link>

    <Link
      href="/leave"
      className="block w-full rounded-lg px-4 py-3 text-left text-base font-medium text-gray-700 transition hover:bg-gray-100"
    >
      Leave Report
    </Link>
  </div>
</div>
        </div>


        {/* ================= USER PROFILE ================= */}
        <div className="group relative">

          {/* User Button */}
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

            <span className="hidden text-lg font-medium text-white sm:block">
              {userName}
            </span>

            <span className="text-xs text-white">
              ▼
            </span>
          </button>


          {/* User Dropdown */}
          <div
            className="
              invisible absolute right-0 top-full z-50 mt-3
              w-56 translate-y-2
              rounded-xl bg-white p-2
              opacity-0 shadow-xl
              transition-all duration-200
              group-hover:visible
              group-hover:translate-y-0
              group-hover:opacity-100
            "
          >

            {/* User Name */}
            <div className="border-b border-gray-100 px-4 py-3">
              <p className="text-sm text-gray-500">
                Logged in as
              </p>

              <p className="mt-1 text-base font-semibold text-gray-800">
                {userName}
              </p>
            </div>


            {/* Logout */}
            <button
              type="button"
              className="
                mt-1 block w-full rounded-lg
                px-4 py-3 text-left
                text-base font-medium text-red-600
                transition hover:bg-red-50
              "
            >
              Logout
            </button>

          </div>
        </div>

      </div>
    </nav>
  );
}