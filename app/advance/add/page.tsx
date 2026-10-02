"use client";

import { useState } from "react";
import FormInput from "../../components/forms/FormInput";
import FormSelect from "../../components/forms/FormSelect";
import FormTextarea from "../../components/forms/FormTextarea";
import FormActions from "../../components/forms/FormActions";
import Navbar from "@/app/components/Navbar";

const employees = [
  {
    label: "Rahul Sharma",
    value: "rahul",
  },
  {
    label: "Amit Verma",
    value: "amit",
  },
  {
    label: "Neha Singh",
    value: "neha",
  },
  {
    label: "Pooja Sharma",
    value: "pooja",
  },
  {
    label: "Riya Patel",
    value: "riya",
  },
  {
    label: "Vikas Jain",
    value: "vikas",
  },
];

const paymentModes = [
  {
    label: "Cash",
    value: "cash",
  },
  {
    label: "Online",
    value: "online",
  },
];

export default function AddAdvancePage() {
  const [employee, setEmployee] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("Advance submitted");
  };

  return (
    <main className="min-h-screen bg-gray-100">

      {/* ================= NAVBAR ================= */}
      <div className="relative bg-[#17191d]">
        <Navbar />

        <div className="h-24" />
      </div>

      {/* ================= PAGE ================= */}
      <section className="px-5 py-10 md:px-8">
        <div className="mx-auto max-w-5xl">

          {/* ================= HEADING ================= */}
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 rounded-full bg-[#f5b942]" />

              <h1 className="text-3xl font-bold tracking-tight text-[#17191d] md:text-4xl">
                Add Advance
              </h1>
            </div>

            <p className="mt-3 ml-4 text-base text-gray-500">
              Create a new advance payment by entering the details below.
            </p>
          </div>

          {/* ================= FORM CARD ================= */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8 lg:p-10">

            <form
              onSubmit={handleSubmit}
              className="space-y-7"
            >

              {/* ================= ROW 1 ================= */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                {/* Employee Name */}
                <FormSelect
                  label="Employee Name"
                  placeholder="Select Employee"
                  options={employees}
                  value={employee}
                  onChange={(e) => setEmployee(e.target.value)}
                  required
                />

                {/* Advance Amount */}
                <FormInput
                  label="Advance Amount"
                  type="number"
                  placeholder="Enter advance amount"
                  required
                />

              </div>

              {/* ================= ROW 2 ================= */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                {/* Payment Mode */}
                <FormSelect
                  label="Payment Mode"
                  placeholder="Select Payment Mode"
                  options={paymentModes}
                  required
                />

                {/* Description */}
                <FormTextarea
                  label="Description"
                  placeholder="Enter advance description..."
                  rows={1}
                />

              </div>

              {/* ================= ACTIONS ================= */}
              <FormActions
                submitText="Add Advance"
                cancelHref="/"
              />

            </form>

          </div>

        </div>
      </section>
    </main>
  );
}