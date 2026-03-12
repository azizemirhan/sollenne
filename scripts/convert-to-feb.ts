import fs from "fs";
import path from "path";

const targetDir = path.join(process.cwd(), "veriler", "2026-02");

if (!fs.existsSync(targetDir)) {
    console.error("Directory not found:", targetDir);
    process.exit(1);
}

const files = fs.readdirSync(targetDir);

files.forEach(file => {
    if (!file.endsWith(".csv")) return;

    // 1. Rename file
    // ocak_ayi_rapor -> subat_ayi_rapor
    // ocak -> subat
    const newName = file.replace(/ocak/gi, "subat");

    const oldPath = path.join(targetDir, file);
    const newPath = path.join(targetDir, newName);

    // 2. Read content
    let content = fs.readFileSync(oldPath, "utf-8");

    // 3. Replace dates
    // 09.01.2026 -> 09.02.2026
    // .01.2026 -> .02.2026
    // /01/2026 -> /02/2026
    content = content.replace(/\.01\.2026/g, ".02.2026");
    content = content.replace(/\/01\/2026/g, "/02/2026");
    content = content.replace(/-01-2026/g, "-02-2026");

    // Replace "Ocak" literal if exists in metadata rows
    content = content.replace(/Ocak/g, "Şubat");
    content = content.replace(/OCAK/g, "ŞUBAT");

    // Write to new path (or overwrite if same name, but here name changes)
    fs.writeFileSync(newPath, content, "utf-8");

    // Delete old file if name is different
    if (oldPath !== newPath) {
        fs.unlinkSync(oldPath);
        console.log(`Renamed and updated: ${file} -> ${newName}`);
    } else {
        console.log(`Updated content: ${file}`);
    }
});

console.log("Conversion complete.");
