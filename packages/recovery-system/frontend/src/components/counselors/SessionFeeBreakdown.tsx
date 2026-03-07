interface SessionFeeBreakdownProps {
  fee: number;
  taxRate?: number;
}

export default function SessionFeeBreakdown({ fee, taxRate = 0.08 }: SessionFeeBreakdownProps) {
  const tax = Math.round(fee * taxRate * 100) / 100;
  const total = fee + tax;

  return (
    <div className="bg-[#F7FBFE] rounded-xl p-4 space-y-2">
      <div className="flex justify-between text-sm text-[#1B2A3D]">
        <span>Session fee</span>
        <span>${fee.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm text-[#1B2A3D]/60">
        <span>Tax ({(taxRate * 100).toFixed(0)}%)</span>
        <span>${tax.toFixed(2)}</span>
      </div>
      <div className="border-t border-[#E8F0F5] pt-2 flex justify-between font-semibold text-[#1B2A3D]">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
    </div>
  );
}
