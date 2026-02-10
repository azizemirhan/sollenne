/**
 * Maps category slugs (from CSV filename) to display labels.
 * Filename pattern: "ocak ayı rapor.XLS - <slug>.csv"
 */
export const CATEGORY_LABELS: Record<string, string> = {
  "sunta&mdf-kontra-pvc": "Sunta & MDF & PVC",
  "metal bölm.": "Metal Bölümü",
  "metal bölm": "Metal Bölümü",
  "cam&ayna grubu": "Cam & Ayna",
  "cam&ayna": "Cam & Ayna",
  kumaş: "Kumaş",
  "sünger&döşeme malz": "Sünger & Döşeme",
  "sünger&döşeme": "Sünger & Döşeme",
  "hırdavat&elektrik&civata-vida": "Hırdavat & Elektrik",
  "hırdavat&elektrik": "Hırdavat & Elektrik",
  "boya grubu": "Boya Grubu",
  boya: "Boya Grubu",
  "ambalaj ürünleri": "Ambalaj",
  ambalaj: "Ambalaj",
  "statik boya işçiliği": "Statik Boya İşçiliği",
  "statik boya": "Statik Boya İşçiliği",
  "fab.bakım&onarım-isg": "Fabrika Bakım & Onarım",
  "fabrika bakım": "Fabrika Bakım & Onarım",
  "fason üretim": "Fason Üretim",
  "kargo giderleri": "Kargo Giderleri",
  tümü: "Tümü",
};

export function getCategoryLabel(slug: string): string {
  const normalized = slug.trim().toLowerCase();
  return CATEGORY_LABELS[normalized] ?? slug;
}
