import fs from "fs";
import path from "path";

export function appendTransactionData(fileName: string, newData: object) {
  try {
    const dirPath = path.join(__dirname, "../data");
    const filePath = path.join(dirPath, fileName);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    let existingData: any[] = [];

    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      existingData = fileContent ? JSON.parse(fileContent) : [];
    }

    if (!Array.isArray(existingData)) {
      existingData = [];
    }

    existingData.push(newData);

    // 💡 Use replacer to handle BigInt
    fs.writeFileSync(
      filePath,
      JSON.stringify(existingData, (_key, value) =>
        typeof value === "bigint" ? value.toString() : value,
        2
      ),
      "utf-8"
    );

    console.log(`Transaction details appended :.......`);
  } catch (error) {
    console.error("Error saving transaction data:", error);
  }
}
