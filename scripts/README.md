# Excel Import Script

This script imports tree cost data from Excel files into the MySQL database.

## Features

- **Excel File Reading**: Reads Excel files using the `xlsx` library
- **Data Mapping**: Maps Excel data to database models (Garden, Purchase, ProductCost, CostCategory, Product)
- **Thai Language Support**: Properly handles Thai language data
- **Error Handling**: Validates data and handles errors gracefully
- **Logging**: Comprehensive logging of import progress and errors
- **Database Seeding**: Creates all necessary database records

## Usage

### Prerequisites

1. Ensure your database is set up and accessible
2. Make sure Prisma is configured with the correct database connection
3. Run `npm install` to install dependencies

### Running the Import

```bash
# Run the full import
npm run import-excel

# Or run directly with ts-node
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/import-excel-data.ts
```

### Testing

```bash
# Test the import script
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/test-import.ts
```

## Data Structure

The script processes the following sheets from the Excel file:

### Tree Data Sheets
- `รายการซื้อต้นไม้68` - Main purchase list
- `ต้นไม้สวนพี่ทิต` - Trees from Tit's garden
- `ต้นไม้ สวนพี่หมอก68` - Trees from Mok's garden
- `ต้นไม้ ไม้ล้อมปี68` - Trees from Mailom 2568
- `ต้นไม้ สวนมีสุขปี68` - Trees from Mee Suk garden
- Other copy sheets with similar data

### Transaction Sheet
- `บัยชีทุนไม้ล้อมพี่ยม` - Account ledger for tree capital

## Database Models

The script creates/updates the following database tables:

### Gardens
- Garden information including name, location, owner, and province
- Extracted from sheet names and data

### Cost Categories
- Standard cost categories like transport, crane, labor, etc.
- Thai and English names

### Purchases
- Purchase records grouped by garden and date
- Generated purchase codes following the pattern: `[PREFIX][YEAR]-[SEQUENCE]`

### Products
- Individual tree records with specifications
- Linked to purchase records
- Includes cost and pricing information

### Product Costs
- Detailed cost breakdown for each purchase
- Linked to cost categories and purchases

### Transactions
- Financial transaction records from the account ledger
- Income and expense tracking

## Data Mapping

The script intelligently maps Excel columns to database fields:

### Tree Data Fields
- `ลำดับที่` → sequence number
- `รหัส` → supplier reference code
- `วันลงไม้` → planting/purchase date
- `ชื่อต้นไม้` → tree name
- `หน้าไม้` → face wood measurement
- `ความสูงต้น` → tree height
- `ตุ้มกว้าง` → pot width
- `ตุ้มสูง` → pot height
- `ราคา` → purchase price
- `ค่าขนส่ง` → transport cost
- `ค่าเครน` → crane cost
- `ค่าไม้ค้ำ` → support wood cost
- `ค่าแพค` → packaging cost
- `ค่าแรง` → labor cost
- `อื่นๆ` → other costs
- `ต้นทุน/ต้น` → total cost per tree
- `ชื่อสวน` → garden name

### Transaction Fields
- `วันที่` → transaction date
- `รายการ` → transaction description
- `ยอดรับเข้า` → income amount
- `ยอดจ่าย` → expense amount

## Error Handling

The script includes comprehensive error handling:

- **Data Validation**: Validates dates, numbers, and required fields
- **Missing Data**: Handles missing or invalid data gracefully
- **Database Errors**: Catches and logs database operation errors
- **File Errors**: Handles file access and format errors

## Logging

All import activities are logged with timestamps and severity levels:

- **INFO**: General information about progress
- **WARN**: Warnings about data issues
- **ERROR**: Errors that don't stop the import
- **FATAL**: Critical errors that stop the import

Logs are saved to the `logs/` directory with timestamped filenames.

## Output

After successful import, the script will have created:

1. **Gardens**: One record for each unique garden mentioned in the data
2. **Cost Categories**: Standard cost categories for tree operations
3. **Purchases**: Purchase records grouped by garden and approximate date
4. **Products**: Individual tree records with full specifications
5. **Product Costs**: Detailed cost breakdown for each purchase
6. **Transactions**: Financial transaction records from the ledger

## Troubleshooting

### Common Issues

1. **File Not Found**: Ensure the Excel file is in the correct location (`Doc/ต้นทุนต้นไม้ปี2568.xlsx`)
2. **Database Connection**: Check your `DATABASE_URL` environment variable
3. **Permission Errors**: Ensure the script has read access to the Excel file
4. **Memory Issues**: Large Excel files may require more memory allocation

### Debug Mode

To enable verbose logging, modify the Logger class in the script to include debug messages.

## Dependencies

- `xlsx`: Excel file parsing
- `@types/xlsx`: TypeScript types for xlsx
- `@prisma/client`: Database client
- `ts-node`: TypeScript execution for Node.js

## License

This script is part of the Mailom Tree Business project.