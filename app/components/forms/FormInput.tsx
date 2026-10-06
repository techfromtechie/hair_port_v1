type FormInputProps = {
  label: string;
  type?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
  required?: boolean;
  min?: string;
  max?: string;
  name?: string;
};

export default function FormInput({
  label,
  type = "text",
  placeholder,
  value,
  defaultValue,
  onChange,
  readOnly = false,
  required = false,
  min,
  max,
  name,
}: FormInputProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        required={required}
        min={min}
        max={max}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 outline-none transition focus:border-[#f5b942] focus:ring-2 focus:ring-[#f5b942]/20"
      />
    </div>
  );
}