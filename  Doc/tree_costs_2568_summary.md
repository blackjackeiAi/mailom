**สรุปข้อมูลต้นทุนต้นไม้ปี 2568 และโครงสร้างฐานข้อมูล MySQL**

---

### ✨ ภาพรวมของข้อมูลในไฟล์

ไฟล์ Excel "ต้นทุนต้นไม้ปี 2568" ประกอบด้วยชีตเกือบ 8 ชีต โดยแต่ละชีตประกอบถ้าเหมือนรวมถึงต้นไม้ที่ๆ ตั้งแต่:

| ชื่อชีต                                | รายละเอียด                                   |
| -------------------------------------- | -------------------------------------------- |
| รายการซื้อต้นไม้ 68                    | เก็บบันทึกการซื้อและต้นทุนต่นไม้             |
| ต้นไม้สวนพี่ทิต, พี่หมอก, พี่ยม, มีสุข | แยกตามสวน และราคาต่างๆ                       |
| บัญชีทุนไม้ล้อมพี่ยม                   | รายรับ-รายจ่ายของทุนที่เกี่ยวกับการขายต้นไม้ |

**Field สำคัญที่พบบ่อย่างสำคัญ:**

- รหัส / ระหัส
- วันที่ลงไม้
- ชื่อต้นไม้
- หน้าไม้, ความสูง, ตุ้มกว้าง/ตุ้มสูง
- รายจ่ายสินค้า: ค่าเจ้าหน้างาน, เครน, ค่าแรง, ค่าแพ็ค, ค่าอุปกรณ์ และอื่นๆ
- ต้นทุน/ต้น
- ราคาขาย (บางต้นไม้)
- ชื่อสวน
- หมายเหตุ

---

### 🔢 โครงสร้าง MySQL

#### 1. `tree_purchases` — ข้อมูลต้นไม้

```sql
CREATE TABLE tree_purchases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ref_code VARCHAR(50),
  purchase_date DATE,
  tree_name VARCHAR(100),
  diameter_cm FLOAT,
  height_m FLOAT,
  root_width_cm FLOAT,
  root_height_cm FLOAT,
  garden_id INT,
  note TEXT
);
```

#### 2. `gardens` — รายชื่อสวน

```sql
CREATE TABLE gardens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  location VARCHAR(255)
);
```

#### 3. `tree_costs` — รายการค่าใช้จ่ายแยกตามประเภท

```sql
CREATE TABLE tree_costs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  purchase_id INT,
  item_name VARCHAR(100),
  amount DECIMAL(10,2),
  FOREIGN KEY (purchase_id) REFERENCES tree_purchases(id)
);
```

#### 4. `tree_total_costs` — ต้นทุนรวม

```sql
CREATE TABLE tree_total_costs (
  purchase_id INT PRIMARY KEY,
  total_cost DECIMAL(10,2),
  sale_price DECIMAL(10,2),
  FOREIGN KEY (purchase_id) REFERENCES tree_purchases(id)
);
```

#### 5. `fund_account` — บัญชีการเงิน (เช่นเพาะพี่ยม)

```sql
CREATE TABLE fund_account (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE,
  description TEXT,
  credit DECIMAL(10,2),
  debit DECIMAL(10,2),
  balance DECIMAL(10,2)
);
```

---

### 📉 แผนภาพความสัมพัน (Relationships)

- `tree_purchases.garden_id` → `gardens.id`
- `tree_costs.purchase_id` → `tree_purchases.id`
- `tree_total_costs.purchase_id` → `tree_purchases.id`
- `fund_account` โดยพึงสามารถึงไม่เกี่ยวกับต้น เว้นจะเชื่อมโดยเพิ่ม garden\_id เพิ่มในภายหลัก

---

หากต้องการ export ส่วนนี้ไปเป็น MySQL สามารถ์ ผมสามารถช่วยแปลง Script ได้เช่นกับ csv/ระบบ SQL ได้ทันที่

