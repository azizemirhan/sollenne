export const formatCurrency = (val: number) => {
  if (val >= 1000000) return `${(val / 1000000).toFixed(2)}M ₺`;
  if (val >= 1000) return `${(val / 1000).toFixed(1)}K ₺`;
  return `${val.toFixed(0)} ₺`;
};

export const formatFull = (val: number) =>
  new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(
    val
  );
