"use client";

import Link from "next/link";
import { Edit3 } from "lucide-react";

type EditButtonProps = {
  href: string;
};

export default function EditButton({ href }: EditButtonProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-lg border border-[#f5b942] bg-[#fff9eb] px-3 py-2 text-sm font-semibold text-[#8a6200] transition hover:bg-[#f5b942] hover:text-black"
    >
      <Edit3 className="h-4 w-4" />
      Edit
    </Link>
  );
}