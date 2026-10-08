"use client";

type LoaderProps = {
  text?: string;
  fullScreen?: boolean;
};

export default function Loader({
  text = "Loading...",
  fullScreen = false,
}: LoaderProps) {
  return (
    <div
      className={
        fullScreen
          ? "flex min-h-[60vh] w-full items-center justify-center"
          : "flex w-full items-center justify-center py-12"
      }
    >
      <div className="flex flex-col items-center justify-center gap-4">
        {/* Spinner */}
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>

          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[#f5b942]"></div>
        </div>

        {/* Loading text */}
        <p className="text-sm font-medium text-gray-500">
          {text}
        </p>
      </div>
    </div>
  );
}