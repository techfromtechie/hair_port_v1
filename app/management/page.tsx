import Navbar from "../components/Navbar";

const managementItems = [
  {
    title: "Admin",
    description: "Admin management",
  },
  {
    title: "Remove Employee",
    description: "Employee management",
  },
  {
    title: "Customer Report",
    description: "View customer reports",
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
      <section className="min-h-[calc(100vh-96px)] px-6 py-16">

        <div className="mx-auto max-w-6xl">

          {/* Heading */}
          <div className="mb-12">

            <p className="text-sm font-semibold uppercase tracking-[4px] text-[#d59618]">
              Management
            </p>

            <h1 className="mt-3 text-4xl font-bold text-[#17191d] md:text-5xl">
              Management
            </h1>

          </div>


          {/* Only 3 Boxes */}
          <div className="grid gap-6 md:grid-cols-3">

            {managementItems.map((item) => (
              <div
                key={item.title}
                className="cursor-pointer rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >

                {/* Icon */}
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-[#f5b942]/15 text-2xl">
                  {item.title === "Admin" && "👤"}
                  {item.title === "Remove Employee" && "👥"}
                  {item.title === "Customer Report" && "📊"}
                </div>


                <h2 className="text-xl font-bold text-[#17191d]">
                  {item.title}
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  {item.description}
                </p>

              </div>
            ))}

          </div>

        </div>

      </section>

    </main>
  );
}