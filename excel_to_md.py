import pandas as pd
import os

# Read Excel file
file_path = '/Users/blackjackei/Documents/Github/mailom/ Doc/ต้นทุนต้นไม้ปี2568.xlsx'
output_path = '/Users/blackjackei/Documents/Github/mailom/ Doc/ต้นทุนต้นไม้ปี2568_summary.md'

try:
    # Get all sheet names
    xl_file = pd.ExcelFile(file_path)
    sheet_names = xl_file.sheet_names
    
    # Create markdown content
    md_content = '# สรุปข้อมูลต้นทุนต้นไม้ปี 2568\n\n'
    md_content += f'**ไฟล์ต้นฉบับ:** {os.path.basename(file_path)}\n\n'
    md_content += f'**จำนวนชีต:** {len(sheet_names)} ชีต\n\n'
    
    md_content += '## รายชื่อชีตในไฟล์\n\n'
    for i, sheet in enumerate(sheet_names, 1):
        md_content += f'{i}. {sheet}\n'
    
    md_content += '\n## สรุปข้อมูลแต่ละชีต\n\n'
    
    # Process each sheet
    for sheet_name in sheet_names:
        try:
            df = pd.read_excel(file_path, sheet_name=sheet_name)
            
            md_content += f'### {sheet_name}\n\n'
            md_content += f'- **จำนวนแถว:** {len(df)}\n'
            md_content += f'- **จำนวนคอลัมน์:** {len(df.columns)}\n'
            
            # Show column names
            md_content += f'- **คอลัมน์:** {list(df.columns)}\n\n'
            
            # Show first few rows if data exists
            if not df.empty:
                md_content += '**ตัวอย่างข้อมูล (5 แถวแรก):**\n\n'
                # Convert to markdown table
                sample_data = df.head(5).fillna('')
                md_content += sample_data.to_markdown(index=False) + '\n\n'
            else:
                md_content += '**ไม่มีข้อมูลในชีตนี้**\n\n'
                
        except Exception as e:
            md_content += f'### {sheet_name}\n\n'
            md_content += f'**ข้อผิดพลาด:** ไม่สามารถอ่านข้อมูลได้ - {str(e)}\n\n'
    
    # Write to markdown file
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(md_content)
    
    print(f'สร้างไฟล์สรุปสำเร็จ: {output_path}')
    
except Exception as e:
    print(f'เกิดข้อผิดพลาด: {str(e)}')