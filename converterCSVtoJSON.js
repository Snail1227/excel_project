const fs = require('fs');
const path = require('path');
const csv = require('csvtojson');

// Function to convert CSV file to JSON
function convertCsvToJson(filePath) {
    const jsonFilePath = filePath.replace(/\.csv$/i, '.json');
    
    csv()
        .fromFile(filePath)
        .then((jsonObj) => {
            fs.writeFile(jsonFilePath, JSON.stringify(jsonObj, null, 2), (err) => {
                if (err) {
                    console.error(`Error writing JSON for file ${filePath}:`, err);
                } else {
                    console.log(`Converted ${path.basename(filePath)} to JSON.`);
                }
            });
        })
        .catch((error) => {
            console.error(`Error converting ${filePath} to JSON:`, error);
        });
}

// Get the directory where the script is located
const directoryPath = "C:\\Users\\GarriShtyrkin\\Desktop\\Devslopes\\Excel Project\\excel_project";

// Read all files in the directory
fs.readdir(directoryPath, (err, files) => {
    if (err) {
        console.error('Error reading directory:', err);
        return;
    }

    // Filter for CSV files
    const csvFiles = files.filter(file => path.extname(file).toLowerCase() === '.csv');

    // Convert each CSV file to JSON
    csvFiles.forEach(file => {
        const filePath = path.join(directoryPath, file);
        convertCsvToJson(filePath);
    });
});
