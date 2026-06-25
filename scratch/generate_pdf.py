# -*- coding: utf-8 -*-
import os
import re
from fpdf import FPDF

class UnicodePDF(FPDF):
    def header(self):
        # Draw header on pages after the title page
        if self.page_no() > 1:
            self.set_font('Arial', 'B', 8)
            self.set_text_color(150, 150, 150)
            self.cell(0, 10, 'TÀI LIỆU KIẾN TRÚC VÀ HẠ TẦNG DUOMATH', 0, 0, 'L')
            self.ln(6)
            self.line(10, 18, 200, 18)
            self.ln(5)

    def footer(self):
        if self.page_no() > 1:
            self.set_y(-15)
            self.set_font('Arial', 'I', 8)
            self.set_text_color(150, 150, 150)
            self.cell(0, 10, f'Trang {self.page_no()}', 0, 0, 'C')

def sanitize_text(text: str) -> str:
    # Remove bold syntax
    text = text.replace('**', '')
    # Replace common emojis and symbols that are unsupported in standard PDF fonts
    replacements = {
        '🧠': '[AI]',
        '📈': '[Graph]',
        '📋': '[Map]',
        '🇻🇳': '[VI]',
        '🇬🇧': '[EN]',
        '⚡': '[Fast]',
        '⏱️': '[Time]',
        '⏱': '[Time]',
        '📚': '[Book]',
        '↳': '->',
        '₁': '1',
        '₂': '2',
        '✓': '[OK]',
        '🎁': '[Gacha]',
        '🧊': '[Freeze]',
        '👑': '[Crown]',
        '🔥': '[Streak]',
        '⭐️': '[Star]',
        '⭐': '[Star]',
        '🎓': '[Grad]',
        '🎯': '[Target]',
        '💬': '[Chat]',
        '🖼️': '[Image]',
        '🖼': '[Image]',
        '🔍': '[Search]',
        '🛡️': '[Shield]',
        '🛡': '[Shield]',
        '🔐': '[Lock]',
        '🔑': '[Key]',
        '🌐': '[Web]',
        '📦': '[Pkg]',
        '⚙️': '[Config]',
        '⚙': '[Config]',
        '🔬': '[Research]',
        '🧪': '[Lab]',
        '⚠️': '[Warning]',
        '✅': '[Check]',
        '❌': '[Error]',
        'ℹ️': '[Info]',
        'ℹ': '[Info]',
    }
    for emoji, replacement in replacements.items():
        text = text.replace(emoji, replacement)
    return text

def build_pdf():
    md_path = r'c:\Users\Latitude 7300\OneDrive\Máy tính\duosteam - Copy\duosteam\ARCHITECTURE_AND_INFRASTRUCTURE.md'
    pdf_dir = r'D:\Downloads'
    os.makedirs(pdf_dir, exist_ok=True)
    pdf_path = os.path.join(pdf_dir, 'ARCHITECTURE_AND_INFRASTRUCTURE.pdf')

    pdf = UnicodePDF()
    pdf.set_auto_page_break(auto=True, margin=20)
    
    # Load Unicode Arial fonts for Vietnamese support
    pdf.add_font('Arial', '', r'C:\Windows\Fonts\arial.ttf')
    pdf.add_font('Arial', 'B', r'C:\Windows\Fonts\arialbd.ttf')
    pdf.add_font('Arial', 'I', r'C:\Windows\Fonts\ariali.ttf')
    pdf.add_font('CourierNew', '', r'C:\Windows\Fonts\cour.ttf')

    # TITLE PAGE
    pdf.add_page()
    pdf.set_fill_color(10, 25, 47)  # Dark Premium Navy theme
    pdf.rect(0, 0, 210, 297, 'F')
    
    pdf.set_y(80)
    pdf.set_font('Arial', 'B', 24)
    pdf.set_text_color(34, 211, 238) # Cyan Accent
    pdf.multi_cell(0, 15, 'TÀI LIỆU KIẾN TRÚC\nVÀ HẠ TẦNG DUOMATH', 0, 'C')
    
    pdf.set_y(150)
    pdf.set_font('Arial', '', 14)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(0, 10, 'Nền Tảng Học Toán Song Ngữ Cao Cấp', 0, 0, 'C')
    pdf.ln(10)
    pdf.cell(0, 10, 'Mô hình Gamification, AI Chatbot và Toán Học Tương Tác', 0, 0, 'C')
    pdf.ln(15)
    
    pdf.set_y(230)
    pdf.set_font('Arial', 'I', 10)
    pdf.set_text_color(167, 139, 250) # Purple Accent
    pdf.cell(0, 10, 'Cập nhật nâng cấp hệ thống: Tháng 6, 2026', 0, 0, 'C')
    pdf.ln(8)
    pdf.cell(0, 10, 'Tác giả: Đội ngũ Phát triển DuoMath', 0, 0, 'C')
    pdf.ln(8)

    # READ CONTENT
    with open(md_path, encoding='utf-8') as f:
        lines = f.readlines()

    pdf.add_page()
    pdf.set_text_color(51, 51, 51) # Dark gray body text
    
    in_code_block = False
    code_lines = []

    for line in lines:
        raw_line = line.rstrip('\n')
        
        # Code block boundary
        if raw_line.startswith('```'):
            if in_code_block:
                # Output code block
                pdf.set_font('CourierNew', '', 8.5)
                pdf.set_text_color(30, 41, 59)
                pdf.set_fill_color(248, 250, 252) # Light gray slate for code bg
                
                block_text = sanitize_text('\n'.join(code_lines))
                pdf.multi_cell(0, 4.5, block_text, 1, 'L', fill=True)
                pdf.ln(4)
                
                # Reset fonts
                in_code_block = False
                code_lines = []
            else:
                in_code_block = True
            continue

        if in_code_block:
            code_lines.append(raw_line)
            continue

        # Skip metadata/divider lines
        if raw_line.strip() == '---' or raw_line.startswith('_Cập nhật'):
            continue

        # Headings
        if raw_line.startswith('# '):
            pdf.ln(6)
            pdf.set_font('Arial', 'B', 18)
            pdf.set_text_color(6, 182, 212)
            pdf.cell(0, 12, sanitize_text(raw_line[2:]), 0, 0, 'L')
            pdf.ln(14)
            continue
        elif raw_line.startswith('## '):
            pdf.ln(5)
            pdf.set_font('Arial', 'B', 14)
            pdf.set_text_color(109, 40, 217) # Purple H2
            pdf.cell(0, 10, sanitize_text(raw_line[3:]), 0, 0, 'L')
            pdf.ln(12)
            continue
        elif raw_line.startswith('### '):
            pdf.ln(4)
            pdf.set_font('Arial', 'B', 11.5)
            pdf.set_text_color(30, 41, 59)
            pdf.cell(0, 8, sanitize_text(raw_line[4:]), 0, 0, 'L')
            pdf.ln(10)
            continue
        elif raw_line.startswith('#### '):
            pdf.ln(3)
            pdf.set_font('Arial', 'B', 10)
            pdf.set_text_color(71, 85, 105)
            pdf.cell(0, 6, sanitize_text(raw_line[5:]), 0, 0, 'L')
            pdf.ln(8)
            continue

        # Lists & Items
        if raw_line.startswith('- ') or raw_line.startswith('* '):
            pdf.set_font('Arial', '', 10)
            pdf.set_text_color(51, 51, 51)
            text = sanitize_text(raw_line[2:])
            
            # Draw dot bullet
            current_x = pdf.get_x()
            current_y = pdf.get_y()
            pdf.circle(current_x + 3, current_y + 4, 0.7, 'F')
            pdf.set_x(current_x + 7)
            
            pdf.multi_cell(0, 6, text)
            pdf.ln(1.5)
            continue
        elif re.match(r'^\d+\.', raw_line.strip()):
            # Ordered lists
            pdf.set_font('Arial', '', 10)
            pdf.set_text_color(51, 51, 51)
            pdf.multi_cell(0, 6, sanitize_text(raw_line.strip()))
            pdf.ln(1.5)
            continue

        # Blank lines
        if not raw_line.strip():
            pdf.ln(2.5)
            continue

        # Regular paragraphs
        pdf.set_font('Arial', '', 10)
        pdf.set_text_color(51, 51, 51)
        clean_text = sanitize_text(raw_line)
        pdf.multi_cell(0, 6, clean_text)
        pdf.ln(2.5)

    # SECTION 14: SCREENSHOT APPENDICES (GIAO DIỆN THỰC TẾ)
    pdf.add_page()
    pdf.set_font('Arial', 'B', 16)
    pdf.set_text_color(6, 182, 212)
    pdf.cell(0, 12, 'PHỤ LỤC: HÌNH ẢNH GIAO DIỆN & HOẠT ĐỘNG THỰC TẾ', 0, 0, 'L')
    pdf.ln(14)

    scratch_dir = r'c:\Users\Latitude 7300\OneDrive\Máy tính\duosteam - Copy\duosteam\scratch'
    
    # DuoMCB Chatbot Screenshot Integration
    chat_img = os.path.join(scratch_dir, 'duomcb_chat_page_1782026228425.png')
    if os.path.exists(chat_img):
        pdf.set_font('Arial', 'B', 12)
        pdf.set_text_color(109, 40, 217)
        pdf.cell(0, 8, '1. Giao diện Chatbot AI Gia sư Toán học DuoMCB v2', 0, 0, 'L')
        pdf.ln(10)
        pdf.set_font('Arial', '', 9.5)
        pdf.set_text_color(100, 100, 100)
        pdf.cell(0, 6, 'Khung chat DuoMCB hỗ trợ phương pháp Socratic, hiển thị công thức LaTeX qua KaTeX.', 0, 0, 'L')
        pdf.ln(8)
        pdf.image(chat_img, x=15, w=180, h=100)
        pdf.ln(10)
        pdf.add_page()
    
    # DuoTranslate Screenshot Integration
    dt_img = os.path.join(scratch_dir, 'media_11434a7e-7b89-46c5-956a-7c9f9f1343bc_1782309821822.png')
    if os.path.exists(dt_img):
        pdf.set_font('Arial', 'B', 12)
        pdf.set_text_color(109, 40, 217)
        pdf.cell(0, 8, '2. Giao diện Sidebar DuoTranslate Nâng Cao & Đồ Thị Parabol', 0, 0, 'L')
        pdf.ln(10)
        pdf.set_font('Arial', '', 9.5)
        pdf.set_text_color(100, 100, 100)
        pdf.cell(0, 6, 'Hình ảnh chụp từ màn hình khi học sinh nhấn "Xem thêm" lý thuyết chi tiết và đồ thị hàm số.', 0, 0, 'L')
        pdf.ln(8)
        pdf.image(dt_img, x=15, w=180, h=100)
        pdf.ln(10)
        pdf.add_page()

    # Gamification HUD Screenshot Integration
    hud_img = os.path.join(scratch_dir, 'top_galaxy_hud_1782037905111.png')
    if os.path.exists(hud_img):
        pdf.set_font('Arial', 'B', 12)
        pdf.set_text_color(109, 40, 217)
        pdf.cell(0, 8, '3. Bảng điều khiển Gamification và Daily Mastery Rings', 0, 0, 'L')
        pdf.ln(10)
        pdf.set_font('Arial', '', 9.5)
        pdf.set_text_color(100, 100, 100)
        pdf.cell(0, 6, 'Giao diện trang chủ hiển thị các vòng tròn Daily Mastery Rings và thanh Streak tích hợp.', 0, 0, 'L')
        pdf.ln(8)
        pdf.image(hud_img, x=15, w=180, h=100)
        pdf.ln(10)

    pdf.output(pdf_path)


if __name__ == '__main__':
    build_pdf()
