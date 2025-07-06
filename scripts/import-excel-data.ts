import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';

const prisma = new PrismaClient();

// Types for Excel data
interface ExcelTreeData {
  sequence?: number;
  code?: string;
  date?: string;
  treeName?: string;
  faceWood?: number;
  height?: number;
  potWidth?: number;
  potHeight?: number;
  price?: number;
  transportCost?: number;
  craneCost?: number;
  supportWoodCost?: number;
  packCost?: number;
  craneCost2?: number;
  truckCost?: number;
  equipmentCost?: number;
  laborCost?: number;
  otherCost?: number;
  deadTreeCost?: number;
  totalCost?: number;
  salePrice?: number;
  gardenName?: string;
  note?: string;
}

interface TransactionData {
  date?: string;
  description?: string;
  income?: number;
  expense?: number;
  balance?: number;
}

// Logging utility
class Logger {
  private static logs: string[] = [];

  static log(message: string, level: 'INFO' | 'WARN' | 'ERROR' = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${level}: ${message}`;
    console.log(logMessage);
    this.logs.push(logMessage);
  }

  static getLogs() {
    return this.logs;
  }

  static saveLogs() {
    const logFile = path.join(__dirname, '../logs', `import-${Date.now()}.log`);
    const logDir = path.dirname(logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    fs.writeFileSync(logFile, this.logs.join('\n'));
    Logger.log(`Logs saved to: ${logFile}`);
  }
}

// Data validation utilities
class DataValidator {
  static isValidDate(dateStr: string): boolean {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return !isNaN(date.getTime()) && date.getFullYear() > 1900;
  }

  static parseDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      if (this.isValidDate(dateStr)) {
        return date;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  static parseNumber(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const num = parseFloat(value.replace(/[^\d.-]/g, ''));
      return isNaN(num) ? 0 : num;
    }
    return 0;
  }

  static sanitizeString(value: any): string {
    if (!value) return '';
    return String(value).trim();
  }
}

// Excel file reader
class ExcelReader {
  private workbook: XLSX.WorkBook;
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
    if (!fs.existsSync(filePath)) {
      throw new Error(`Excel file not found: ${filePath}`);
    }
    this.workbook = XLSX.readFile(filePath);
    Logger.log(`Excel file loaded: ${filePath}`);
  }

  getSheetNames(): string[] {
    return this.workbook.SheetNames;
  }

  readSheet(sheetName: string): any[][] {
    const sheet = this.workbook.Sheets[sheetName];
    if (!sheet) {
      throw new Error(`Sheet not found: ${sheetName}`);
    }
    return XLSX.utils.sheet_to_json(sheet, { header: 1 });
  }

  readSheetAsJson(sheetName: string): any[] {
    const sheet = this.workbook.Sheets[sheetName];
    if (!sheet) {
      throw new Error(`Sheet not found: ${sheetName}`);
    }
    return XLSX.utils.sheet_to_json(sheet);
  }

  readSheetAsArray(sheetName: string): any[][] {
    const sheet = this.workbook.Sheets[sheetName];
    if (!sheet) {
      throw new Error(`Sheet not found: ${sheetName}`);
    }
    return XLSX.utils.sheet_to_json(sheet, { header: 1 });
  }
}

// Data mapping functions
class DataMapper {
  // Map sheet data to standardized tree data format using array-based approach
  static mapTreeDataFromArray(rawData: any[][], sheetName: string): ExcelTreeData[] {
    const mappedData: ExcelTreeData[] = [];
    
    // Find header row by looking for key field names
    let headerRowIndex = -1;
    let headerRow: any[] = [];
    
    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      if (row && this.isHeaderRow(row)) {
        headerRowIndex = i;
        headerRow = row;
        break;
      }
    }

    if (headerRowIndex === -1) {
      Logger.log(`No header row found in sheet: ${sheetName}`, 'WARN');
      return [];
    }

    Logger.log(`Found header row at index ${headerRowIndex} in sheet: ${sheetName}`);
    Logger.log(`Header columns: ${headerRow.join(', ')}`);

    // Process data rows
    for (let i = headerRowIndex + 1; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row || !this.isDataRowArray(row)) continue;

      const mappedRow = this.mapArrayRowToTreeData(row, headerRow, sheetName);
      if (mappedRow) {
        mappedData.push(mappedRow);
      }
    }

    Logger.log(`Mapped ${mappedData.length} tree records from sheet: ${sheetName}`);
    return mappedData;
  }

  // Map sheet data to standardized tree data format
  static mapTreeData(rawData: any[], sheetName: string): ExcelTreeData[] {
    const mappedData: ExcelTreeData[] = [];
    
    // Skip header rows and find data start
    let dataStartRow = 0;
    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      if (row && typeof row === 'object' && this.isDataRow(row)) {
        dataStartRow = i;
        break;
      }
    }

    for (let i = dataStartRow; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row || !this.isDataRow(row)) continue;

      const mappedRow = this.mapRowToTreeData(row, sheetName);
      if (mappedRow) {
        mappedData.push(mappedRow);
      }
    }

    Logger.log(`Mapped ${mappedData.length} tree records from sheet: ${sheetName}`);
    return mappedData;
  }

  // Check if row is a header row (contains Thai field names)
  private static isHeaderRow(row: any[]): boolean {
    if (!row || !Array.isArray(row)) return false;
    
    const headerIndicators = [
      'ลำดับที่', 'รหัส', 'วันลงไม้', 'ชื่อต้นไม้', 'หน้าไม้', 'ความสูงต้น',
      'ตุ้มกว้าง', 'ตุ้มสูง', 'ราคา', 'ค่าขนส่ง', 'ค่าเครน', 'ค่าไม้ค้ำ',
      'ค่าแพค', 'ค่าแรง', 'อื่นๆ', 'ต้นทุน/ต้น', 'ราคาขาย', 'ชื่อสวน',
      'วันที่', 'รายการ', 'ยอดรับเข้า', 'ยอดจ่าย'
    ];
    
    return row.some(cell => 
      cell && typeof cell === 'string' && 
      headerIndicators.some(indicator => cell.includes(indicator))
    );
  }

  // Check if array row contains data
  private static isDataRowArray(row: any[]): boolean {
    if (!row || !Array.isArray(row)) return false;
    
    // Check if row has meaningful data (numbers, dates, or meaningful text)
    return row.some(cell => {
      if (typeof cell === 'number' && cell > 0) return true;
      if (typeof cell === 'string') {
        const trimmed = cell.trim();
        if (trimmed.length === 0) return false;
        // Check for dates, codes, or tree names
        return /\d/.test(trimmed) || trimmed.length > 2;
      }
      return false;
    });
  }

  private static isDataRow(row: any): boolean {
    // Check if row contains actual data (not empty, not header)
    if (!row || typeof row !== 'object') return false;
    
    // Look for numeric values or dates that indicate data rows
    const values = Object.values(row);
    return values.some(value => 
      (typeof value === 'number' && value > 0) ||
      (typeof value === 'string' && (
        value.includes('/') || 
        value.includes('-') || 
        !isNaN(parseFloat(value))
      ))
    );
  }

  // Map array row to tree data using header positions
  private static mapArrayRowToTreeData(row: any[], headerRow: any[], sheetName: string): ExcelTreeData | null {
    try {
      const gardenName = this.extractGardenName(sheetName);
      const treeData: ExcelTreeData = { gardenName };

      // Create column mapping
      const columnMap: { [key: string]: number } = {};
      headerRow.forEach((header, index) => {
        if (header && typeof header === 'string') {
          columnMap[header] = index;
        }
      });

      // Map data based on column positions
      this.mapColumnValue(treeData, 'sequence', row, columnMap, ['ลำดับที่', 'ลำดับ']);
      this.mapColumnValue(treeData, 'code', row, columnMap, ['รหัส']);
      this.mapColumnValue(treeData, 'date', row, columnMap, ['วันลงไม้'], 'string');
      this.mapColumnValue(treeData, 'treeName', row, columnMap, ['ชื่อต้นไม้'], 'string');
      this.mapColumnValue(treeData, 'faceWood', row, columnMap, ['หน้าไม้']);
      this.mapColumnValue(treeData, 'height', row, columnMap, ['ความสูงต้น']);
      this.mapColumnValue(treeData, 'potWidth', row, columnMap, ['ตุ้มกว้าง']);
      this.mapColumnValue(treeData, 'potHeight', row, columnMap, ['ตุ้มสูง']);
      this.mapColumnValue(treeData, 'price', row, columnMap, ['ราคา']);
      this.mapColumnValue(treeData, 'transportCost', row, columnMap, ['ค่าขนส่ง']);
      this.mapColumnValue(treeData, 'craneCost', row, columnMap, ['ค่าเครน', 'เครน/หน้างาน', 'เครน/เฮียบหน้างาน']);
      this.mapColumnValue(treeData, 'supportWoodCost', row, columnMap, ['ค่าไม้ค้ำ']);
      this.mapColumnValue(treeData, 'packCost', row, columnMap, ['ค่าแพค']);
      this.mapColumnValue(treeData, 'truckCost', row, columnMap, ['ค่ารถเฮียบ', 'ค่ารถทอย']);
      this.mapColumnValue(treeData, 'equipmentCost', row, columnMap, ['ค่าอุปกรณ์']);
      this.mapColumnValue(treeData, 'laborCost', row, columnMap, ['ค่าแรง']);
      this.mapColumnValue(treeData, 'otherCost', row, columnMap, ['อื่นๆ']);
      this.mapColumnValue(treeData, 'deadTreeCost', row, columnMap, ['เพิ่มทุนไม้ตาย']);
      this.mapColumnValue(treeData, 'totalCost', row, columnMap, ['ต้นทุน/ต้น']);
      this.mapColumnValue(treeData, 'salePrice', row, columnMap, ['ราคาขาย']);
      this.mapColumnValue(treeData, 'note', row, columnMap, ['หมายเหตุ'], 'string');

      // Also check explicit garden name column
      if (columnMap['ชื่อสวน'] !== undefined) {
        const gardenValue = row[columnMap['ชื่อสวน']];
        if (gardenValue && typeof gardenValue === 'string') {
          treeData.gardenName = gardenValue.trim();
        }
      }

      // Validate that we have minimum required data
      if (treeData.treeName && (treeData.price || treeData.totalCost)) {
        return treeData;
      }

      return null;
    } catch (error) {
      Logger.log(`Error mapping array row: ${error}`, 'ERROR');
      return null;
    }
  }

  // Helper method to map column values
  private static mapColumnValue(
    treeData: any, 
    property: string, 
    row: any[], 
    columnMap: { [key: string]: number }, 
    headerNames: string[], 
    type: 'number' | 'string' = 'number'
  ) {
    for (const headerName of headerNames) {
      const columnIndex = columnMap[headerName];
      if (columnIndex !== undefined && row[columnIndex] !== undefined) {
        const value = row[columnIndex];
        if (type === 'string') {
          treeData[property] = DataValidator.sanitizeString(value);
        } else {
          treeData[property] = DataValidator.parseNumber(value);
        }
        break;
      }
    }
  }

  private static mapRowToTreeData(row: any, sheetName: string): ExcelTreeData | null {
    try {
      const keys = Object.keys(row);
      const values = Object.values(row);
      
      // Extract garden name from sheet name
      const gardenName = this.extractGardenName(sheetName);
      
      const treeData: ExcelTreeData = {
        gardenName: gardenName
      };

      // Map based on common patterns in the data
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = values[i];
        
        if (!value) continue;

        // Map fields based on content patterns
        if (this.isSequenceField(key, value)) {
          treeData.sequence = DataValidator.parseNumber(value);
        } else if (this.isCodeField(key, value)) {
          treeData.code = DataValidator.sanitizeString(value);
        } else if (this.isDateField(key, value)) {
          treeData.date = DataValidator.sanitizeString(value);
        } else if (this.isTreeNameField(key, value)) {
          treeData.treeName = DataValidator.sanitizeString(value);
        } else if (this.isFaceWoodField(key)) {
          treeData.faceWood = DataValidator.parseNumber(value);
        } else if (this.isHeightField(key)) {
          treeData.height = DataValidator.parseNumber(value);
        } else if (this.isPotWidthField(key)) {
          treeData.potWidth = DataValidator.parseNumber(value);
        } else if (this.isPotHeightField(key)) {
          treeData.potHeight = DataValidator.parseNumber(value);
        } else if (this.isPriceField(key)) {
          treeData.price = DataValidator.parseNumber(value);
        } else if (this.isTransportCostField(key)) {
          treeData.transportCost = DataValidator.parseNumber(value);
        } else if (this.isCraneCostField(key)) {
          treeData.craneCost = DataValidator.parseNumber(value);
        } else if (this.isSupportWoodCostField(key)) {
          treeData.supportWoodCost = DataValidator.parseNumber(value);
        } else if (this.isPackCostField(key)) {
          treeData.packCost = DataValidator.parseNumber(value);
        } else if (this.isTruckCostField(key)) {
          treeData.truckCost = DataValidator.parseNumber(value);
        } else if (this.isEquipmentCostField(key)) {
          treeData.equipmentCost = DataValidator.parseNumber(value);
        } else if (this.isLaborCostField(key)) {
          treeData.laborCost = DataValidator.parseNumber(value);
        } else if (this.isOtherCostField(key)) {
          treeData.otherCost = DataValidator.parseNumber(value);
        } else if (this.isDeadTreeCostField(key)) {
          treeData.deadTreeCost = DataValidator.parseNumber(value);
        } else if (this.isTotalCostField(key)) {
          treeData.totalCost = DataValidator.parseNumber(value);
        } else if (this.isSalePriceField(key)) {
          treeData.salePrice = DataValidator.parseNumber(value);
        } else if (this.isNoteField(key)) {
          treeData.note = DataValidator.sanitizeString(value);
        }
      }

      // Validate that we have minimum required data
      if (treeData.treeName && (treeData.price || treeData.totalCost)) {
        return treeData;
      }

      return null;
    } catch (error) {
      Logger.log(`Error mapping row: ${error}`, 'ERROR');
      return null;
    }
  }

  // Field identification helpers
  private static isSequenceField(key: string, value: any): boolean {
    return key.includes('ลำดับ') || (typeof value === 'number' && value > 0 && value < 1000);
  }

  private static isCodeField(key: string, value: any): boolean {
    return key.includes('รหัส') || (typeof value === 'string' && /^[A-Z]{2}\d{2}-\d{3}$/.test(value));
  }

  private static isDateField(key: string, value: any): boolean {
    return key.includes('วัน') || key.includes('date') || 
           (typeof value === 'string' && value.includes('/'));
  }

  private static isTreeNameField(key: string, value: any): boolean {
    return key.includes('ชื่อต้นไม้') || key.includes('ต้นไม้');
  }

  private static isFaceWoodField(key: string): boolean {
    return key.includes('หน้าไม้');
  }

  private static isHeightField(key: string): boolean {
    return key.includes('ความสูง');
  }

  private static isPotWidthField(key: string): boolean {
    return key.includes('ตุ้มกว้าง');
  }

  private static isPotHeightField(key: string): boolean {
    return key.includes('ตุ้มสูง');
  }

  private static isPriceField(key: string): boolean {
    return key.includes('ราคา') && !key.includes('ขาย');
  }

  private static isTransportCostField(key: string): boolean {
    return key.includes('ขนส่ง');
  }

  private static isCraneCostField(key: string): boolean {
    return key.includes('เครน');
  }

  private static isSupportWoodCostField(key: string): boolean {
    return key.includes('ไม้ค้ำ');
  }

  private static isPackCostField(key: string): boolean {
    return key.includes('แพค');
  }

  private static isTruckCostField(key: string): boolean {
    return key.includes('รถ') || key.includes('เฮียบ');
  }

  private static isEquipmentCostField(key: string): boolean {
    return key.includes('อุปกรณ์');
  }

  private static isLaborCostField(key: string): boolean {
    return key.includes('แรง');
  }

  private static isOtherCostField(key: string): boolean {
    return key.includes('อื่น');
  }

  private static isDeadTreeCostField(key: string): boolean {
    return key.includes('ไม้ตาย');
  }

  private static isTotalCostField(key: string): boolean {
    return key.includes('ต้นทุน');
  }

  private static isSalePriceField(key: string): boolean {
    return key.includes('ราคาขาย');
  }

  private static isNoteField(key: string): boolean {
    return key.includes('หมายเหตุ');
  }

  private static extractGardenName(sheetName: string): string {
    // Extract garden name from sheet name
    if (sheetName.includes('ตุ่น')) return 'ตุ่น อุบล';
    if (sheetName.includes('เพลงไทย')) return 'เพลงไทยไม้ล้อม';
    if (sheetName.includes('ทิต')) return 'สวนพี่ทิต';
    if (sheetName.includes('หมอก')) return 'สวนพี่หมอก';
    if (sheetName.includes('ไม้ล้อม')) return 'ไม้ล้อมปี68';
    if (sheetName.includes('มีสุข')) return 'สวนมีสุข';
    return sheetName;
  }

  // Map transaction data from array
  static mapTransactionDataFromArray(rawData: any[][], sheetName: string): TransactionData[] {
    const mappedData: TransactionData[] = [];
    
    // Find header row for transaction data
    let headerRowIndex = -1;
    let headerRow: any[] = [];
    
    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      if (row && this.isTransactionHeaderRow(row)) {
        headerRowIndex = i;
        headerRow = row;
        break;
      }
    }

    if (headerRowIndex === -1) {
      Logger.log(`No transaction header row found in sheet: ${sheetName}`, 'WARN');
      return [];
    }

    Logger.log(`Found transaction header row at index ${headerRowIndex} in sheet: ${sheetName}`);

    // Create column mapping
    const columnMap: { [key: string]: number } = {};
    headerRow.forEach((header, index) => {
      if (header && typeof header === 'string') {
        columnMap[header] = index;
      }
    });

    // Process data rows
    for (let i = headerRowIndex + 1; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row || !this.isDataRowArray(row)) continue;

      const transactionData: TransactionData = {};
      
      // Map transaction fields
      if (columnMap['วันที่'] !== undefined) {
        const dateValue = row[columnMap['วันที่']];
        if (dateValue) {
          transactionData.date = DataValidator.sanitizeString(dateValue);
        }
      }
      
      if (columnMap['รายการ'] !== undefined) {
        const descValue = row[columnMap['รายการ']];
        if (descValue) {
          transactionData.description = DataValidator.sanitizeString(descValue);
        }
      }
      
      if (columnMap['ยอดรับเข้า'] !== undefined) {
        const incomeValue = row[columnMap['ยอดรับเข้า']];
        if (incomeValue) {
          transactionData.income = DataValidator.parseNumber(incomeValue);
        }
      }
      
      if (columnMap['ยอดจ่าย'] !== undefined) {
        const expenseValue = row[columnMap['ยอดจ่าย']];
        if (expenseValue) {
          transactionData.expense = DataValidator.parseNumber(expenseValue);
        }
      }

      if (transactionData.date && transactionData.description) {
        mappedData.push(transactionData);
      }
    }

    Logger.log(`Mapped ${mappedData.length} transaction records from sheet: ${sheetName}`);
    return mappedData;
  }

  // Check if row is a transaction header row
  private static isTransactionHeaderRow(row: any[]): boolean {
    if (!row || !Array.isArray(row)) return false;
    
    const transactionHeaders = ['วันที่', 'รายการ', 'ยอดรับเข้า', 'ยอดจ่าย'];
    
    return transactionHeaders.some(header => 
      row.some(cell => cell && typeof cell === 'string' && cell.includes(header))
    );
  }

  // Map transaction data from account sheet
  static mapTransactionData(rawData: any[]): TransactionData[] {
    const mappedData: TransactionData[] = [];
    
    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row || typeof row !== 'object') continue;

      const keys = Object.keys(row);
      const values = Object.values(row);
      
      const transactionData: TransactionData = {};
      
      for (let j = 0; j < keys.length; j++) {
        const key = keys[j];
        const value = values[j];
        
        if (!value) continue;

        if (key.includes('วันที่') || key.includes('date')) {
          transactionData.date = DataValidator.sanitizeString(value);
        } else if (key.includes('รายการ') || key.includes('description')) {
          transactionData.description = DataValidator.sanitizeString(value);
        } else if (key.includes('รับเข้า') || key.includes('income')) {
          transactionData.income = DataValidator.parseNumber(value);
        } else if (key.includes('จ่าย') || key.includes('expense')) {
          transactionData.expense = DataValidator.parseNumber(value);
        } else if (key.includes('ยอด') || key.includes('balance')) {
          transactionData.balance = DataValidator.parseNumber(value);
        }
      }

      if (transactionData.date && transactionData.description) {
        mappedData.push(transactionData);
      }
    }

    Logger.log(`Mapped ${mappedData.length} transaction records`);
    return mappedData;
  }
}

// Database operations
class DatabaseSeeder {
  // Seed cost categories
  static async seedCostCategories() {
    Logger.log('Seeding cost categories...');
    
    const categories = [
      { name: 'ค่าขนส่ง', nameEn: 'Transport Cost', description: 'ค่าใช้จ่ายในการขนส่งต้นไม้' },
      { name: 'ค่าเครน', nameEn: 'Crane Cost', description: 'ค่าใช้จ่ายเครนและอุปกรณ์ยก' },
      { name: 'ค่าไม้ค้ำ', nameEn: 'Support Wood Cost', description: 'ค่าไม้ค้ำและอุปกรณ์ค้ำจุน' },
      { name: 'ค่าแพค', nameEn: 'Packaging Cost', description: 'ค่าบรรจุหีบห่อ' },
      { name: 'ค่ารถเฮียบ', nameEn: 'Truck Cost', description: 'ค่าเช่ารถเฮียบ' },
      { name: 'ค่าอุปกรณ์', nameEn: 'Equipment Cost', description: 'ค่าอุปกรณ์เสริม' },
      { name: 'ค่าแรง', nameEn: 'Labor Cost', description: 'ค่าแรงงาน' },
      { name: 'ค่าอื่นๆ', nameEn: 'Other Cost', description: 'ค่าใช้จ่ายอื่นๆ' },
      { name: 'ค่าทดแทนไม้ตาย', nameEn: 'Dead Tree Cost', description: 'ค่าทดแทนไม้ตาย' },
      { name: 'ราคาซื้อต้นไม้', nameEn: 'Tree Purchase Price', description: 'ราคาซื้อต้นไม้จากสวน' }
    ];

    const results = [];
    for (const category of categories) {
      try {
        const existing = await prisma.costCategory.findFirst({
          where: { name: category.name }
        });

        if (!existing) {
          const created = await prisma.costCategory.create({
            data: category
          });
          results.push(created);
          Logger.log(`Created cost category: ${category.name}`);
        } else {
          results.push(existing);
        }
      } catch (error) {
        Logger.log(`Error creating cost category ${category.name}: ${error}`, 'ERROR');
      }
    }

    return results;
  }

  // Seed gardens
  static async seedGardens(treeData: ExcelTreeData[]) {
    Logger.log('Seeding gardens...');
    
    const uniqueGardens = new Set<string>();
    treeData.forEach(data => {
      if (data.gardenName) {
        uniqueGardens.add(data.gardenName);
      }
    });

    const results = [];
    for (const gardenName of uniqueGardens) {
      try {
        const existing = await prisma.garden.findFirst({
          where: { name: gardenName }
        });

        if (!existing) {
          const created = await prisma.garden.create({
            data: {
              name: gardenName,
              location: this.getGardenLocation(gardenName),
              ownerName: this.getGardenOwner(gardenName),
              province: this.getGardenProvince(gardenName)
            }
          });
          results.push(created);
          Logger.log(`Created garden: ${gardenName}`);
        } else {
          results.push(existing);
        }
      } catch (error) {
        Logger.log(`Error creating garden ${gardenName}: ${error}`, 'ERROR');
      }
    }

    return results;
  }

  private static getGardenLocation(gardenName: string): string {
    // Map garden names to locations based on the data
    const locationMap: { [key: string]: string } = {
      'ตุ่น อุบล': 'อุบลราชธานี',
      'เพลงไทยไม้ล้อม': 'ร้อยเอ็ด',
      'สวนพี่ทิต': 'อุบลราชธานี',
      'สวนพี่หมอก': 'อำเภอชำนาญ',
      'ไม้ล้อมปี68': 'รุ้งละดา',
      'สวนมีสุข': 'เพลงไทย'
    };
    return locationMap[gardenName] || '';
  }

  private static getGardenOwner(gardenName: string): string {
    // Map garden names to owners based on the data
    const ownerMap: { [key: string]: string } = {
      'ตุ่น อุบล': 'พี่กิจ',
      'เพลงไทยไม้ล้อม': 'พี่กิจ',
      'สวนพี่ทิต': 'พี่ทิต',
      'สวนพี่หมอก': 'พี่หมอก',
      'ไม้ล้อมปี68': '',
      'สวนมีสุข': ''
    };
    return ownerMap[gardenName] || '';
  }

  private static getGardenProvince(gardenName: string): string {
    // Map garden names to provinces
    const provinceMap: { [key: string]: string } = {
      'ตุ่น อุบล': 'อุบลราชธานี',
      'เพลงไทยไม้ล้อม': 'ร้อยเอ็ด',
      'สวนพี่ทิต': 'อุบลราชธานี',
      'สวนพี่หมอก': 'อุบลราชธานี',
      'ไม้ล้อมปี68': 'อุบลราชธานี',
      'สวนมีสุข': 'ร้อยเอ็ด'
    };
    return provinceMap[gardenName] || '';
  }

  // Seed purchases and related data
  static async seedPurchases(treeData: ExcelTreeData[]) {
    Logger.log('Seeding purchases...');
    
    const gardens = await prisma.garden.findMany();
    const costCategories = await prisma.costCategory.findMany();
    
    const gardenMap = new Map(gardens.map(g => [g.name, g.id]));
    const costCategoryMap = new Map(costCategories.map(c => [c.name, c.id]));

    // Group tree data by garden and approximate date for purchase records
    const purchaseGroups = this.groupTreeDataForPurchases(treeData);
    
    let purchaseResults = [];
    let productResults = [];
    let productCostResults = [];

    for (const group of purchaseGroups) {
      try {
        const gardenId = gardenMap.get(group.gardenName);
        if (!gardenId) {
          Logger.log(`Garden not found: ${group.gardenName}`, 'WARN');
          continue;
        }

        // Create purchase record
        const purchaseCode = this.generatePurchaseCode(group.gardenName, group.date);
        const totalCost = group.trees.reduce((sum: number, tree: ExcelTreeData) => sum + (tree.totalCost || 0), 0);
        
        const purchase = await prisma.purchase.create({
          data: {
            purchaseCode,
            purchaseDate: DataValidator.parseDate(group.date) || new Date(),
            gardenId,
            supplierRef: group.supplierRef,
            totalCost,
            status: 'COMPLETED'
          }
        });

        purchaseResults.push(purchase);
        Logger.log(`Created purchase: ${purchaseCode}`);

        // Create product costs for this purchase
        const costSummary = this.summarizeCosts(group.trees);
        for (const [costType, amount] of Object.entries(costSummary)) {
          if (amount > 0) {
            const categoryId = costCategoryMap.get(costType);
            if (categoryId) {
              const productCost = await prisma.productCost.create({
                data: {
                  purchaseId: purchase.id,
                  costCategoryId: categoryId,
                  amount,
                  description: `${costType} สำหรับการซื้อ ${purchaseCode}`
                }
              });
              productCostResults.push(productCost);
            }
          }
        }

        // Create products for this purchase
        for (const tree of group.trees) {
          const productCode = this.generateProductCode(tree, purchase.purchaseCode);
          const cost = tree.totalCost || tree.price || 0;
          
          const product = await prisma.product.create({
            data: {
              code: productCode,
              name: tree.treeName || 'ต้นไม้',
              description: tree.note || '',
              height: tree.height,
              width: tree.faceWood,
              potHeight: tree.potHeight,
              potWidth: tree.potWidth,
              cost,
              price: tree.salePrice || cost * 1.3, // Default 30% markup
              purchaseId: purchase.id,
              status: 'AVAILABLE'
            }
          });
          
          productResults.push(product);
        }

      } catch (error) {
        Logger.log(`Error creating purchase group: ${error}`, 'ERROR');
      }
    }

    Logger.log(`Created ${purchaseResults.length} purchases, ${productResults.length} products, ${productCostResults.length} product costs`);
    return { purchaseResults, productResults, productCostResults };
  }

  private static groupTreeDataForPurchases(treeData: ExcelTreeData[]): Array<{
    gardenName: string;
    date: string;
    supplierRef: string;
    trees: ExcelTreeData[];
  }> {
    const groups: { [key: string]: {
      gardenName: string;
      date: string;
      supplierRef: string;
      trees: ExcelTreeData[];
    } } = {};
    
    for (const tree of treeData) {
      if (!tree.gardenName) continue;
      
      const date = tree.date || '2568-01-01';
      const key = `${tree.gardenName}-${date}`;
      
      if (!groups[key]) {
        groups[key] = {
          gardenName: tree.gardenName,
          date: date,
          supplierRef: tree.code || tree.gardenName,
          trees: []
        };
      }
      
      groups[key].trees.push(tree);
    }
    
    return Object.values(groups);
  }

  private static generatePurchaseCode(gardenName: string, date: string): string {
    const prefix = this.getGardenPrefix(gardenName);
    const year = '68'; // Buddhist year
    const sequence = Math.floor(Math.random() * 999) + 1;
    return `${prefix}${year}-${sequence.toString().padStart(3, '0')}`;
  }

  private static getGardenPrefix(gardenName: string): string {
    if (gardenName.includes('ตุ่น')) return 'TN';
    if (gardenName.includes('เพลงไทย')) return 'PT';
    if (gardenName.includes('ทิต')) return 'TT';
    if (gardenName.includes('หมอก')) return 'MK';
    if (gardenName.includes('ไม้ล้อม')) return 'ML';
    if (gardenName.includes('มีสุข')) return 'MS';
    return 'GN';
  }

  private static generateProductCode(tree: ExcelTreeData, purchaseCode: string): string {
    const treeName = tree.treeName || 'TREE';
    const prefix = treeName.substring(0, 2).toUpperCase();
    const sequence = Math.floor(Math.random() * 999) + 1;
    return `${prefix}-${purchaseCode}-${sequence.toString().padStart(3, '0')}`;
  }

  private static summarizeCosts(trees: ExcelTreeData[]): { [key: string]: number } {
    const summary: { [key: string]: number } = {};
    
    trees.forEach(tree => {
      if (tree.price) summary['ราคาซื้อต้นไม้'] = (summary['ราคาซื้อต้นไม้'] || 0) + tree.price;
      if (tree.transportCost) summary['ค่าขนส่ง'] = (summary['ค่าขนส่ง'] || 0) + tree.transportCost;
      if (tree.craneCost) summary['ค่าเครน'] = (summary['ค่าเครน'] || 0) + tree.craneCost;
      if (tree.supportWoodCost) summary['ค่าไม้ค้ำ'] = (summary['ค่าไม้ค้ำ'] || 0) + tree.supportWoodCost;
      if (tree.packCost) summary['ค่าแพค'] = (summary['ค่าแพค'] || 0) + tree.packCost;
      if (tree.truckCost) summary['ค่ารถเฮียบ'] = (summary['ค่ารถเฮียบ'] || 0) + tree.truckCost;
      if (tree.equipmentCost) summary['ค่าอุปกรณ์'] = (summary['ค่าอุปกรณ์'] || 0) + tree.equipmentCost;
      if (tree.laborCost) summary['ค่าแรง'] = (summary['ค่าแรง'] || 0) + tree.laborCost;
      if (tree.otherCost) summary['ค่าอื่นๆ'] = (summary['ค่าอื่นๆ'] || 0) + tree.otherCost;
      if (tree.deadTreeCost) summary['ค่าทดแทนไม้ตาย'] = (summary['ค่าทดแทนไม้ตาย'] || 0) + tree.deadTreeCost;
    });
    
    return summary;
  }

  // Seed transactions
  static async seedTransactions(transactionData: TransactionData[]) {
    Logger.log('Seeding transactions...');
    
    const results = [];
    for (const transaction of transactionData) {
      try {
        const date = DataValidator.parseDate(transaction.date || '');
        if (!date) continue;

        const amount = transaction.income || transaction.expense || 0;
        const type = transaction.income ? 'INCOME' : 'EXPENSE';
        
        const created = await prisma.transaction.create({
          data: {
            date,
            description: transaction.description || '',
            type,
            amount,
            balance: transaction.balance
          }
        });
        
        results.push(created);
      } catch (error) {
        Logger.log(`Error creating transaction: ${error}`, 'ERROR');
      }
    }
    
    Logger.log(`Created ${results.length} transactions`);
    return results;
  }
}

// Main import class
class ExcelImporter {
  private excelReader: ExcelReader;
  
  constructor(filePath: string) {
    this.excelReader = new ExcelReader(filePath);
  }

  async importData(): Promise<void> {
    try {
      Logger.log('Starting Excel data import...');
      
      // Get all sheet names
      const sheetNames = this.excelReader.getSheetNames();
      Logger.log(`Found ${sheetNames.length} sheets: ${sheetNames.join(', ')}`);

      // Collect all tree data from relevant sheets
      const allTreeData: ExcelTreeData[] = [];
      const transactionData: TransactionData[] = [];

      for (const sheetName of sheetNames) {
        try {
          Logger.log(`Processing sheet: ${sheetName}`);
          
          if (sheetName.includes('บัญชี') || sheetName.includes('บัยชี')) {
            // Transaction sheet - use array-based approach
            const rawData = this.excelReader.readSheetAsArray(sheetName);
            const mappedTransactions = DataMapper.mapTransactionDataFromArray(rawData, sheetName);
            transactionData.push(...mappedTransactions);
          } else {
            // Tree data sheet - use array-based approach
            const rawData = this.excelReader.readSheetAsArray(sheetName);
            const mappedTrees = DataMapper.mapTreeDataFromArray(rawData, sheetName);
            allTreeData.push(...mappedTrees);
          }
        } catch (error) {
          Logger.log(`Error processing sheet ${sheetName}: ${error}`, 'ERROR');
          continue;
        }
      }

      Logger.log(`Total tree records: ${allTreeData.length}`);
      Logger.log(`Total transaction records: ${transactionData.length}`);

      // Seed database
      await this.seedDatabase(allTreeData, transactionData);
      
      Logger.log('Excel import completed successfully!');
    } catch (error) {
      Logger.log(`Import failed: ${error}`, 'ERROR');
      throw error;
    }
  }

  private async seedDatabase(treeData: ExcelTreeData[], transactionData: TransactionData[]): Promise<void> {
    try {
      // Seed in order of dependencies
      await DatabaseSeeder.seedCostCategories();
      await DatabaseSeeder.seedGardens(treeData);
      await DatabaseSeeder.seedPurchases(treeData);
      await DatabaseSeeder.seedTransactions(transactionData);
      
      Logger.log('Database seeding completed');
    } catch (error) {
      Logger.log(`Database seeding failed: ${error}`, 'ERROR');
      throw error;
    }
  }
}

// Main execution
async function main() {
  try {
    const excelFilePath = path.join(__dirname, '../ Doc/ต้นทุนต้นไม้ปี2568.xlsx');
    
    Logger.log('Starting Excel import process...');
    Logger.log(`Excel file path: ${excelFilePath}`);
    
    const importer = new ExcelImporter(excelFilePath);
    await importer.importData();
    
    Logger.log('Import process completed successfully!');
    
  } catch (error) {
    Logger.log(`Import process failed: ${error}`, 'ERROR');
    process.exit(1);
  } finally {
    Logger.saveLogs();
    await prisma.$disconnect();
  }
}

// Run the import if this file is executed directly
if (require.main === module) {
  main();
}

export { ExcelImporter, DataMapper, DatabaseSeeder, Logger };