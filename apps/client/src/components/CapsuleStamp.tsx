type CapsuleStampProps = {
  label?: string;
};

export function CapsuleStamp({ label = "<div>a" }: CapsuleStampProps) {
  return (
    <div
      aria-hidden="true"
      className="flex h-12 w-10 rotate-3 items-center justify-center bg-white p-1 shadow-sm outline-dashed outline-2 -outline-offset-[3px] outline-white/90 ring-2 ring-white/70"
    >
      <span className="flex h-full w-full items-center justify-center border border-dotted border-[#ff5a8a] font-mono text-[7px] font-bold leading-none text-[#e3245f]">
        ✦{label}
      </span>
    </div>
  );
}
