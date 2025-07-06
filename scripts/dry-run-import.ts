import { ExcelImporter, DataMapper, Logger } from './import-excel-data';
import * as path from 'path';
import * as XLSX from 'xlsx';

async function dryRunImport() {
  try {
    const excelFilePath = path.join(__dirname, '../ Doc/ต้นทุนต้นไม้ปี2568.xlsx');
    
    Logger.log('Starting dry run import...');
    Logger.log(`Excel file path: ${excelFilePath}`);
    
    // Read Excel file
    const workbook = XLSX.readFile(excelFilePath);
    const sheetNames = workbook.SheetNames;
    
    Logger.log(`Found ${sheetNames.length} sheets: ${sheetNames.join(', ')}`);
    
    // Preview data from each sheet
    for (const sheetName of sheetNames) {
      Logger.log(`\n=== Processing sheet: ${sheetName} ===`);
      
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      
      Logger.log(`Sheet has ${jsonData.length} rows`);
      
      if (jsonData.length > 0) {
        const firstRow = jsonData[0] as any;
        Logger.log(`First row keys: ${Object.keys(firstRow).join(', ')}`);
        
        // Show first few rows as sample
        const sampleSize = Math.min(3, jsonData.length);
        for (let i = 0; i < sampleSize; i++) {
          const row = jsonData[i];
          Logger.log(`Sample row ${i + 1}: ${JSON.stringify(row, null, 2)}`);
        }
      }
      
      // Try to map data using array-based approach
      const arrayData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
      
      if (sheetName.includes('บัญชี') || sheetName.includes('บัยชี')) {
        Logger.log('This appears to be a transaction sheet');
        const mappedTransactions = DataMapper.mapTransactionDataFromArray(arrayData, sheetName);
        Logger.log(`Mapped ${mappedTransactions.length} transactions`);
        
        if (mappedTransactions.length > 0) {
          Logger.log(`Sample transaction: ${JSON.stringify(mappedTransactions[0], null, 2)}`);
        }
      } else {
        Logger.log('This appears to be a tree data sheet');
        const mappedTrees = DataMapper.mapTreeDataFromArray(arrayData, sheetName);
        Logger.log(`Mapped ${mappedTrees.length} tree records`);
        
        if (mappedTrees.length > 0) {
          Logger.log(`Sample tree data: ${JSON.stringify(mappedTrees[0], null, 2)}`);
        }
      }
    }
    
    Logger.log('\nDry run completed successfully!');
    
  } catch (error) {
    Logger.log(`Dry run failed: ${error}`, 'ERROR');
    console.error(error);
  }
}

// Run the dry run
dryRunImport();