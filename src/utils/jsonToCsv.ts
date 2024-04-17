import fs from "fs";

export const jsonToCsv = (items: any) => {
  const header = Object.keys(items[0]);
  const headerString = header.join(",");

  const replacer = (key: any, value: any) => value ?? "";
  const rowItems = items.map((row: any) =>
    header
      .map((fieldName) => JSON.stringify(row[fieldName], replacer))
      .join(",")
  );

  const csvContent = [headerString, ...rowItems].join("\r\n");
  fs.writeFileSync("allMessages.csv", csvContent);
  console.log(`CSV file "${"allMessages"}" has been exported successfully.`);
  return csvContent;
};
