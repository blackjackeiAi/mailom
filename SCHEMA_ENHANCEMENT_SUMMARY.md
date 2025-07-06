# Enhanced Prisma Schema for Tree Business Management System

## Overview
This enhanced schema extends the original tree business management system to support comprehensive garden management, detailed cost tracking, purchase history, and financial transaction records based on the Excel data analysis from the Doc folder.

## New Models Added

### 1. Garden Model (สวนต้นไม้)
**Purpose**: Manage different tree sources and locations
```prisma
model Garden {
  id          String        @id @default(cuid())
  name        String        // ชื่อสวน เช่น "ตุ่น อุบล", "เพลงไทยไม้ล้อม"
  location    String?       // ที่อยู่ของสวน
  ownerName   String?       // ชื่อเจ้าของสวน เช่น "พี่ทิต", "พี่หมอก"
  contactInfo String?       // ข้อมูลติดต่อ
  province    String?       // จังหวัด
  district    String?       // อำเภอ
  subDistrict String?       // ตำบล
  isActive    Boolean       @default(true)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  purchases   Purchase[]    // การซื้อจากสวนนี้
  transactions Transaction[] // บันทึกการเงินที่เกี่ยวข้อง
}
```

### 2. CostCategory Model (หมวดหมู่ค่าใช้จ่าย)
**Purpose**: Categorize different types of costs
```prisma
model CostCategory {
  id          String        @id @default(cuid())
  name        String        @unique // ชื่อหมวดหมู่
  nameEn      String?       // ชื่อภาษาอังกฤษ
  description String?       // คำอธิบาย
  isActive    Boolean       @default(true)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  productCosts ProductCost[] // รายการค่าใช้จ่ายในหมวดนี้
}
```

**Pre-defined Categories**:
- ราคาต้นไม้ (Tree Price)
- ค่าขนส่ง (Transport)
- ค่าเครน (Crane)
- เครน/หน้างาน (Crane/Labor)
- ค่าไม้ค้ำ (Support Wood)
- ค่าแพค (Packing)
- ค่ารถเฮียบ (Truck)
- ค่ารถทอย (Trailer)
- ค่าแรง (Labor)
- ค่าอุปกรณ์ (Equipment)
- อื่นๆ (Others)
- เพิ่มทุนไม้ตาย (Dead Tree Fund)

### 3. Purchase Model (การซื้อต้นไม้)
**Purpose**: Track tree purchase records
```prisma
model Purchase {
  id            String        @id @default(cuid())
  purchaseCode  String        @unique // รหัสการซื้อ เช่น "TB68-001", "MP68-001"
  purchaseDate  DateTime      // วันที่ซื้อ
  gardenId      String        // สวนที่ซื้อ
  garden        Garden        @relation(fields: [gardenId], references: [id])
  supplierRef   String?       // รหัสอ้างอิงจากผู้ขาย เช่น "พี่กิจ", "พี่ทิต"
  totalCost     Float         // ต้นทุนรวมทั้งหมด
  status        PurchaseStatus @default(PENDING)
  note          String?       // หมายเหตุ
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  productCosts  ProductCost[] // รายการค่าใช้จ่ายแยกรายการ
  products      Product[]     // ต้นไม้ที่ได้จากการซื้อครั้งนี้
}
```

### 4. ProductCost Model (ค่าใช้จ่ายแยกรายการ)
**Purpose**: Detailed cost breakdown for each purchase
```prisma
model ProductCost {
  id             String       @id @default(cuid())
  purchaseId     String       // การซื้อที่เกี่ยวข้อง
  purchase       Purchase     @relation(fields: [purchaseId], references: [id])
  costCategoryId String       // หมวดหมู่ค่าใช้จ่าย
  costCategory   CostCategory @relation(fields: [costCategoryId], references: [id])
  amount         Float        // จำนวนเงิน
  description    String?      // รายละเอียดเพิ่มเติม
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}
```

### 5. Transaction Model (บันทึกการเงิน)
**Purpose**: Financial transaction records (บัญชีทุนไม้ล้อม)
```prisma
model Transaction {
  id           String          @id @default(cuid())
  date         DateTime        // วันที่ทำรายการ
  description  String          // รายละเอียด
  type         TransactionType // ประเภทรายการ
  amount       Float           // จำนวนเงิน
  balance      Float?          // ยอดคงเหลือ
  referenceId  String?         // อ้างอิงไป Purchase หรือ Sale
  referenceType String?        // ประเภทการอ้างอิง
  gardenId     String?         // สวนที่เกี่ยวข้อง (ถ้ามี)
  garden       Garden?         @relation(fields: [gardenId], references: [id])
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt
}
```

## Enhanced Existing Models

### Updated Product Model
**Changes**:
- Added `purchaseId` field to link products to their purchase records
- Enhanced field descriptions with Thai language comments
- Added relationship to Purchase model

### Updated Enums
**New Enums**:
- `PurchaseStatus`: PENDING, COMPLETED, CANCELLED
- `TransactionType`: INCOME, EXPENSE, TRANSFER

**Enhanced Enums**:
- `ProductStatus`: Added DEAD status for dead trees

## Database Relationships

### Primary Relationships
1. **Garden → Purchase**: One-to-many (one garden can have multiple purchases)
2. **Purchase → ProductCost**: One-to-many (one purchase can have multiple cost items)
3. **Purchase → Product**: One-to-many (one purchase can yield multiple products)
4. **CostCategory → ProductCost**: One-to-many (one category can have multiple cost items)
5. **Garden → Transaction**: One-to-many (one garden can have multiple transactions)

### Data Flow
```
Garden → Purchase → ProductCost (detailed costs)
       ↓
     Product → Sale → Customer
       ↓
   Transaction (financial records)
```

## Key Features

### 1. Garden Management
- Track multiple tree sources/suppliers
- Store detailed location and contact information
- Manage active/inactive gardens
- Link purchases and transactions to specific gardens

### 2. Cost Breakdown
- Categorize all types of costs (transport, crane, labor, etc.)
- Track costs per purchase with detailed breakdown
- Calculate total costs automatically
- Support for additional cost categories

### 3. Purchase History
- Unique purchase codes (TB68-001, MP68-001, etc.)
- Link to specific gardens and suppliers
- Track purchase dates and status
- Store notes and additional information

### 4. Financial Transactions
- Record all income and expenses
- Track balance changes over time
- Link transactions to purchases and sales
- Support for garden-specific financial tracking

## Database Table Mappings

All models use explicit table mapping with `@@map()` directive:
- `Garden` → `gardens`
- `CostCategory` → `cost_categories`
- `Purchase` → `purchases`
- `Product` → `products`
- `ProductCost` → `product_costs`
- `Transaction` → `transactions`
- `Sale` → `sales`
- `Customer` → `customers`
- `ProductImage` → `product_images`

## PostgreSQL Compatibility

The schema is fully compatible with PostgreSQL and includes:
- CUID primary keys for all models
- Proper foreign key constraints
- Appropriate data types for Thai language support
- Optimized indexes through relationships

## Sample Data

The seed file includes comprehensive sample data based on the Excel analysis:
- 5 gardens (ตุ่น อุบล, เพลงไทยไม้ล้อม, สวนพี่ทิต, etc.)
- 12 cost categories
- 2 sample purchases with detailed cost breakdowns
- 2 sample products (ตะแบก, พยอม)
- Financial transactions showing income/expense flow

## Usage Examples

### Query Purchase with Costs
```typescript
const purchaseWithCosts = await prisma.purchase.findUnique({
  where: { purchaseCode: 'TB68-001' },
  include: {
    garden: true,
    productCosts: {
      include: {
        costCategory: true
      }
    },
    products: true
  }
})
```

### Calculate Total Costs by Category
```typescript
const costsByCategory = await prisma.productCost.groupBy({
  by: ['costCategoryId'],
  _sum: {
    amount: true
  },
  include: {
    costCategory: true
  }
})
```

### Track Financial Balance
```typescript
const transactions = await prisma.transaction.findMany({
  orderBy: { date: 'asc' },
  include: {
    garden: true
  }
})
```

This enhanced schema provides a comprehensive foundation for managing all aspects of the tree business, from garden sourcing to detailed cost tracking and financial management.