import Link from "next/link";

const services = [
  {
    title: "Hair Cutting",
    image:
      "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "Face Massage",
    image:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "Products",
    image:
      "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=900&q=85",
  },
];

const branches = [
  {
    name: "Main Branch",
    location: "Indore",
    image:
      "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "City Branch",
    location: "Ujjain",
    image:
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Premium Branch",
    location: "Bhopal",
    image:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=900&q=85",
  },
];

export default function Home() {
  const userName = "Alfez Uddin";

  return (
    <main className="min-h-screen bg-white text-[#17191d]">

      {/* =====================================================
          NAVBAR
          Same style as Management page
      ====================================================== */}
      <div className="relative h-[100px] bg-[#17191d]">

        <nav className="absolute left-0 top-0 z-50 w-full">

          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">

            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3"
            >
              <span className="text-3xl text-[#f5b942]">
                ✂
              </span>

              <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                Royal{" "}
                <span className="text-[#f5b942]">
                  Salon
                </span>
              </h1>
            </Link>


            {/* Navigation */}
            <div className="hidden items-center gap-8 md:flex">

              {/* Home */}
              <Link
                href="/"
                className="text-lg font-medium text-white transition hover:text-[#f5b942]"
              >
                Home
              </Link>


              {/* Management */}
              <Link
                href="/management"
                className="text-lg font-medium text-white transition hover:text-[#f5b942]"
              >
                Management
              </Link>


              {/* Transaction */}
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


                {/* Transaction Dropdown */}
                <div className="invisible absolute left-1/2 top-full z-50 mt-3 w-60 -translate-x-1/2 translate-y-2 rounded-xl bg-white p-2 opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">

                  <button
                    type="button"
                    className="block w-full rounded-lg px-4 py-3 text-left text-base font-medium text-gray-700 transition hover:bg-gray-100"
                  >
                    Add Transaction
                  </button>

                  <button
                    type="button"
                    className="block w-full rounded-lg px-4 py-3 text-left text-base font-medium text-gray-700 transition hover:bg-gray-100"
                  >
                    Transaction
                  </button>

                </div>

              </div>


              {/* Advance */}
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


                {/* Advance Dropdown */}
                <div className="invisible absolute left-1/2 top-full z-50 mt-3 w-64 -translate-x-1/2 translate-y-2 rounded-xl bg-white p-2 opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">

                  <button
                    type="button"
                    className="block w-full rounded-lg px-4 py-3 text-left text-base font-medium text-gray-700 transition hover:bg-gray-100"
                  >
                    Add Advance
                  </button>

                  <button
                    type="button"
                    className="block w-full rounded-lg px-4 py-3 text-left text-base font-medium text-gray-700 transition hover:bg-gray-100"
                  >
                    Advance Payment Report
                  </button>

                </div>

              </div>


              {/* Leave */}
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


                {/* Leave Dropdown */}
                <div className="invisible absolute left-1/2 top-full z-50 mt-3 w-56 -translate-x-1/2 translate-y-2 rounded-xl bg-white p-2 opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">

                  <button
                    type="button"
                    className="block w-full rounded-lg px-4 py-3 text-left text-base font-medium text-gray-700 transition hover:bg-gray-100"
                  >
                    Add Leave
                  </button>

                  <button
                    type="button"
                    className="block w-full rounded-lg px-4 py-3 text-left text-base font-medium text-gray-700 transition hover:bg-gray-100"
                  >
                    Leave Report
                  </button>

                </div>

              </div>


              {/* Logout */}
              <button
                type="button"
                className="text-lg font-medium text-white transition hover:text-red-400"
              >
                Logout
              </button>

            </div>


            {/* User */}
            <div className="flex items-center gap-3 rounded-full border border-white/20 bg-black/40 px-5 py-3 backdrop-blur-md">

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-bold text-gray-800">
                {userName.charAt(0)}
              </div>

              <span className="hidden text-lg font-medium text-white sm:block">
                {userName}
              </span>

              <span className="text-xs text-white">
                ▼
              </span>

            </div>

          </div>

        </nav>

      </div>


      {/* =====================================================
          HERO SECTION
      ====================================================== */}
      <section className="relative min-h-[580px] overflow-hidden">

        {/* Hero Background */}
        <img
          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=2000&q=90"
          alt="Royal Salon"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60" />


        {/* Hero Content */}
        <div className="relative z-10 mx-auto flex min-h-[580px] max-w-7xl items-center px-6 lg:px-10">

          <div className="max-w-2xl">

            <p className="mb-5 text-sm font-semibold uppercase tracking-[5px] text-white">
              Look Good{" "}
              <span className="text-[#f5b942]">
                •
              </span>{" "}
              Feel Great
            </p>


            <h2 className="text-6xl font-bold leading-[1.05] text-white md:text-8xl">
              Royal{" "}
              <span className="text-[#f5b942]">
                Salon
              </span>
            </h2>


            <p className="mt-7 max-w-xl text-lg leading-8 text-white/85 md:text-xl">
              Professional beauty and grooming services
              for a new and confident you.
            </p>


            <button
              type="button"
              className="mt-9 rounded-full bg-[#f5b942] px-7 py-4 font-semibold text-black transition hover:bg-[#ffc95d]"
            >
              Book an Appointment

              <span className="ml-3">
                →
              </span>
            </button>

          </div>

        </div>

      </section>


      {/* =====================================================
          SERVICES
      ====================================================== */}
      <section className="px-6 py-20 md:py-24">

        <div className="mx-auto max-w-7xl">

          <div className="mb-12 text-center">

            <p className="text-sm font-semibold uppercase tracking-[4px] text-[#d59618]">
              Our Services
            </p>

            <h2 className="mt-3 text-4xl font-bold md:text-5xl">
              What We Offer
            </h2>

          </div>


          <div className="grid gap-7 md:grid-cols-3">

            {services.map((service) => (
              <div
                key={service.title}
                className="group overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(0,0,0,0.13)]"
              >

                <div className="h-60 overflow-hidden">

                  <img
                    src={service.image}
                    alt={service.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                </div>


                <div className="flex items-center justify-center px-6 py-7">

                  <h3 className="text-2xl font-bold">
                    {service.title}
                  </h3>

                </div>

              </div>
            ))}

          </div>

        </div>

      </section>


      {/* =====================================================
          ABOUT
      ====================================================== */}
      <section className="bg-[#f8f5ef] px-6 py-20 md:py-24">

        <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">

          {/* About Image */}
          <div className="overflow-hidden rounded-2xl">

            <img
              src="https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?auto=format&fit=crop&w=1200&q=90"
              alt="Inside Royal Salon"
              className="h-[420px] w-full object-cover md:h-[500px]"
            />

          </div>


          {/* About Content */}
          <div>

            <p className="text-sm font-semibold uppercase tracking-[4px] text-[#d59618]">
              About Us
            </p>


            <h2 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
              About Royal Salon
            </h2>


            <p className="mt-7 text-lg leading-8 text-gray-600">
              Royal Salon is dedicated to providing high-quality
              beauty and grooming services in a relaxing and
              comfortable environment.
            </p>


            <p className="mt-4 text-lg leading-8 text-gray-600">
              Our professional team focuses on giving you the
              best experience with modern techniques and
              premium products.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          BRANCHES
      ====================================================== */}
      <section className="px-6 py-20 md:py-24">

        <div className="mx-auto max-w-7xl">

          <div className="mb-12 text-center">

            <p className="text-sm font-semibold uppercase tracking-[4px] text-[#d59618]">
              Our Branches
            </p>

            <h2 className="mt-3 text-4xl font-bold md:text-5xl">
              Our Locations
            </h2>

          </div>


          <div className="grid gap-7 md:grid-cols-3">

            {branches.map((branch) => (
              <div
                key={branch.name}
                className="group overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(0,0,0,0.13)]"
              >

                <div className="h-60 overflow-hidden">

                  <img
                    src={branch.image}
                    alt={branch.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                </div>


                <div className="p-5">

                  <h3 className="text-xl font-bold">
                    {branch.name}
                  </h3>


                  <p className="mt-2 flex items-center gap-2 text-gray-600">

                    <span className="text-[#d59618]">
                      📍
                    </span>

                    {branch.location}

                  </p>

                </div>

              </div>
            ))}

          </div>

        </div>

      </section>


      {/* =====================================================
          FOOTER
      ====================================================== */}
      <footer className="bg-[#17191d] px-6 py-8 text-center">

        <p className="text-sm text-gray-400">
          © 2026 Royal Salon. All rights reserved.
        </p>

      </footer>

    </main>
  );
}