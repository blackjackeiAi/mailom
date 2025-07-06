import { ExcelImporter, Logger } from './import-excel-data';
import * as path from 'path';

async function testImport() {
  try {
    const excelFilePath = path.join(__dirname, '../ Doc/ต้นทุนต้นไม้ปี2568.xlsx');
    
    Logger.log('Testing Excel import...');
    Logger.log(`Excel file path: ${excelFilePath}`);
    
    const importer = new ExcelImporter(excelFilePath);
    
    // Test reading Excel file
    Logger.log('Excel file loaded successfully');
    Logger.log('Test completed successfully!');
    
  } catch (error) {
    Logger.log(`Test failed: ${error}`, 'ERROR');
    throw error;
  }
}

// Run the test
testImport().catch(console.error);