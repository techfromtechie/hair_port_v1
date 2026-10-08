"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus } from "lucide-react";

import Navbar from "@/app/components/Navbar";
import FormInput from "@/app/components/forms/FormInput";
import FormSelect from "@/app/components/forms/FormSelect";
import FormTextarea from "@/app/components/forms/FormTextarea";
import FormActions from "@/app/components/forms/FormActions";
import { supabase } from "@/app/lib/supabase";
import { toast } from "react-toastify";



// ============================================================
// GENDER
// ============================================================

const genderOptions = [
  {
    label: "Male",
    value: "Male",
  },
  {
    label: "Female",
    value: "Female",
  },
  {
    label: "Other",
    value: "Other",
  },
];

export default function AddEmployeePage() {
  const router = useRouter();
  // ==========================================================
  // FORM STATES
  // ==========================================================

  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [branch, setBranch] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [aadharCard, setAadharCard] = useState("");
  const [gender, setGender] = useState("");
  const [salary, setSalary] = useState("");
  const [address, setAddress] = useState("");

  const [branchOptions, setBranchOptions] = useState<
  { label: string; value: string }[]
>([]);
  // ==========================================================
  // TODAY DATE
  // ==========================================================

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
  const fetchBranches = async () => {
    const { data, error } = await supabase
      .from("branches")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      console.error(error);
      toast.error("Failed to load branches.");
      return;
    }

    setBranchOptions(
      data.map((branch) => ({
        label: branch.name,
        value: branch.name,
      }))
    );
  };

  fetchBranches();
}, []);

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (
  e: React.FormEvent<HTMLFormElement>
) => {
  e.preventDefault();

  try {
    // Find branch UUID from Supabase
    const { data: branchData, error: branchError } =
      await supabase
        .from("branches")
        .select("id")
        .eq("name", branch)
        .single();

    if (branchError) {
      console.error(branchError);

      toast.error("Branch not found.");

      return;
    }

    // Insert employee into Supabase
    const { error } = await supabase
      .from("employees")
      .insert({
        name,
        contact_number: contactNumber,
        branch_id: branchData.id,
        date_of_birth: dateOfBirth || null,
        joining_date: joiningDate,
        aadhar_card: aadharCard,
        gender,
        salary: Number(salary),
        address,
      });

    if (error) {
      console.error(error);

      toast.error(error.message);

      return;
    }

    // Success toast
    toast.success("Employee added successfully!");

    // Redirect to Employees page
    router.push("/management/admin/employees");

  } catch (error) {
    console.error(error);

    toast.error(
      "Something went wrong while adding employee."
    );
  }
};

  // ==========================================================
  // RESET
  // ==========================================================

  const handleReset = () => {
    setName("");
    setContactNumber("");
    setBranch("");
    setDateOfBirth("");
    setJoiningDate("");
    setAadharCard("");
    setGender("");
    setSalary("");
    setAddress("");
  };

  return (
    <main className="min-h-screen bg-[#f5f6f8]">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <div className="relative bg-[#17191d]">
        <Navbar />
        <div className="h-24" />
      </div>

      {/* =====================================================
          PAGE CONTENT
      ===================================================== */}

      <section className="px-5 py-10 md:px-8">
        <div className="mx-auto max-w-5xl">

          {/* =================================================
              BACK BUTTON
          ================================================= */}

          <Link
            href="/management/admin/employees"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-[#a86f00]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Employees
          </Link>

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="mb-8">
            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff9eb] text-[#d59618]">
                <UserPlus className="h-5 w-5" />
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-tight text-[#17191d]">
                  Add Employee
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Add a new employee to the salon.
                </p>
              </div>

            </div>
          </div>

          {/* =================================================
              FORM
          ================================================= */}

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8"
          >

            {/* =================================================
                FORM HEADER
            ================================================= */}

            <div className="mb-8">
              <h2 className="text-lg font-bold text-[#17191d]">
                Employee Information
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Enter the employee's personal and salary details.
              </p>
            </div>

            {/* =================================================
                FORM FIELDS
            ================================================= */}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              {/* NAME */}

              <FormInput
                label="Name"
                type="text"
                placeholder="Enter employee name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              {/* CONTACT NUMBER */}

              <FormInput
                label="Contact Number"
                type="tel"
                placeholder="Enter contact number"
                value={contactNumber}
                onChange={(e) =>
                  setContactNumber(e.target.value)
                }
                required
              />

              {/* BRANCH */}

              <FormSelect
                label="Branch"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                options={[
                  {
                    label: "Select Branch",
                    value: "",
                  },
                  ...branchOptions,
                ]}
                required
              />

              {/* DATE OF BIRTH */}

              <FormInput
                label="Date of Birth"
                type="date"
                value={dateOfBirth}
                onChange={(e) =>
                  setDateOfBirth(e.target.value)
                }
                max={today}
                required
              />

              {/* JOINING DATE */}

              <FormInput
                label="Joining Date"
                type="date"
                value={joiningDate}
                onChange={(e) =>
                  setJoiningDate(e.target.value)
                }
                max={today}
                required
              />

              {/* AADHAR CARD */}

              <FormInput
                label="Aadhar Card"
                type="text"
                placeholder="Enter Aadhar number"
                value={aadharCard}
                onChange={(e) =>
                  setAadharCard(e.target.value)
                }
                required
              />

              {/* GENDER */}

              <FormSelect
                label="Gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                options={[
                  {
                    label: "Select Gender",
                    value: "",
                  },
                  ...genderOptions,
                ]}
                required
              />

              {/* SALARY */}

              <FormInput
                label="Salary"
                type="number"
                placeholder="Enter monthly salary"
                value={salary}
                onChange={(e) =>
                  setSalary(e.target.value)
                }
                min="0"
                required
              />

            </div>

            {/* =================================================
                ADDRESS
            ================================================= */}

            <div className="mt-5">
              <FormTextarea
                label="Address"
                placeholder="Enter employee address"
                value={address}
                onChange={(e) =>
                  setAddress(e.target.value)
                }
                required
              />
            </div>

            {/* =================================================
                ACTIONS
            ================================================= */}
<div className="mt-8 border-t border-gray-100 pt-6">
  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
    <button
      type="button"
      onClick={handleReset}
      className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
    >
      Reset
    </button>

    <button
      type="submit"
      className="rounded-lg bg-[#f5b942] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[#e0a82f]"
    >
      Add Employee
    </button>
  </div>
</div>

          </form>

        </div>
      </section>

    </main>
  );
}