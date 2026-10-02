type FormInputProps = {
  label: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
  required?: boolean;
};

export default function FormInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  readOnly = false,
  required = false,
}: FormInputProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        required={required}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 outline-none transition focus:border-[#f5b942] focus:ring-2 focus:ring-[#f5b942]/20"
      />
    </div>
  );
}