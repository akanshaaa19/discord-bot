import fs from "fs";
export const jsonToCsv = (items) => {
    const header = Object.keys(items[0]);
    const headerString = header.join(",");
    const replacer = (key, value) => value ?? "";
    const rowItems = items.map((row) => header
        .map((fieldName) => JSON.stringify(row[fieldName], replacer))
        .join(","));
    const csvContent = [headerString, ...rowItems].join("\r\n");
    fs.writeFileSync("allMessages.csv", csvContent);
    console.log(`CSV file "${"allMessages"}" has been exported successfully.`);
    return csvContent;
};
//# sourceMappingURL=jsonToCsv.js.map