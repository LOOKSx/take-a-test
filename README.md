# 🚀 พร้อมเสมอ (Prom-Samur) — TCAS Quota Interview Assistant & Zoom Teleprompter

เว็บแอปพลิเคชันระบบผู้ช่วยเตรียมสอบสัมภาษณ์อัจฉริยะ (Smart Interview Assistant & Teleprompter) สำหรับการสอบสัมภาษณ์ออนไลน์ผ่าน **Zoom Meeting** รอบโควตา **วศ.บ.วิศวกรรมคอมพิวเตอร์ (โดยวิธีการเทียบโอน) ภาคปกติ** มหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี (มทร.ธัญบุรี คลองหก)

---

## 👤 ข้อมูลผู้เข้าสอบสัมภาษณ์ (Candidate Profile)
- **ชื่อ-นามสกุล:** นายพุฒิพงศ์ ราชรักษ์ (Mr. Puttipong Racharak)
- **รหัสประจำตัวสอบ:** `0312805627` (ลำดับที่ 28)
- **ชื่อใน Zoom Display Name:** `28_0312805627_นายพุฒิพงศ์ ราชรักษ์`
- **สาขาที่สมัคร:** 19104000128 : วิศวกรรมคอมพิวเตอร์ (โดยวิธีการเทียบโอน) ภาคปกติ
- **คณะ / สถาบัน:** คณะวิศวกรรมศาสตร์ มหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี
- **วุฒิเดิม:** ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.) สาขาวิชาเทคโนโลยีสารสนเทศ วิทยาลัยเทคนิคนครศรีธรรมราช
- **สถานที่ฝึกงาน:** บริษัท โปรเกรส เน็ตเวิร์ค คอนซัลท์ จำกัด (Progress Network Consult Co., Ltd.) — แผนก IT Support Technician
- **ผลงานเด่น:**
  - **Todaprime:** Full-Stack Productivity Web App (Angular 19 + Golang REST API + Synthetic Web Audio chime)
  - **Enterprise Network Architecture & Security:** งานวิจัยและคู่มือโครงสร้างเครือข่ายองค์กร (VLAN, Inter-VLAN Routing, DHCP Snooping, Multi-WAN, Firewall)
  - **ระบบจัดการนักศึกษาฝึกงาน:** เชื่อมต่อระบบ Biometrics Face Scan เข้ากับ Server CheckTime และ MIS-School

---

## 🌟 ฟีเจอร์หลัก (Key Features)

### 1. 📹 Zoom Meeting Integration & Split-Screen Teleprompter
- ออกแบบมาให้เปิดใช้งานคู่กับหน้าต่างโปรแกรม Zoom ได้อย่างราบรื่น
- แนะนำการจัดวางหน้าจอแบบ **Split-Screen** วางหน้าต่าง Zoom ไว้ด้านบนจอติดรูกล้อง และวางเว็บ "พร้อมเสมอ" ไว้ด้านล่าง ทำให้สายตาผู้สมัครสบตารูกล้องเสมอ มั่นใจ 100% ไม่ดูเหมือนกำลังอ่านโพย

### 2. 🎤 ระบบดักฟังเสียงคำถาม Real-Time (Voice Interception & VU Meter)
- ใช้ **Web Speech API** ดักจับเสียงคำถามของอาจารย์แบบสด ๆ
- วิเคราะห์คำค้นหาอัตโนมัติ (Auto-Search) เพื่อดึงคำตอบที่เตรียมไว้ขึ้นมาบนหน้าจอทันที
- มี **Web Audio API VU Meter** แสดงคลื่นเสียงสด พร้อมป้ายบอกสถานะ `🟢 อัดเสียงติดแล้ว!` ตรวจจับระดับเดซิเบลแบบ Real-Time ยืนยันว่าไมโครโฟนทำงานจริง
- มี 4 เทคนิคการใช้งานร่วมกับ Zoom: ปล่อยเสียง Zoom ออกลำโพงคอม, ทวนคำถามสั้น ๆ, วางจอใต้กล้อง, และปุ่มลัด 1 คลิก

### 3. ⚡ ปุ่มลัดดึงคำตอบฉุกเฉินในคลิกเดียว (1-Click Emergency Shortcuts)
- ปุ่มชิปด่วนบน HUD สำหรับกดเรียกคำตอบขึ้นมาทันทีใน 0.1 วินาที เช่น `[แนะนำตัว]` `[ทำไมเลือก มทร.]` `[Todaprime]` `[ฝึกงาน]` `[OOP]` ฯลฯ

### 4. 🤖 AI Teleprompter โพยบอกบท 3 ประโยคทอง
- สรุปแนวทางการตอบคำถามตามสูตรลับ 3 สเต็ป:
  1. **ประโยคที่ 1 (ประโยคเปิด):** รับคำถาม แสดงความมั่นใจ
  2. **ประโยคที่ 2 (ประโยคเนื้อหา):** เชื่อมโยงประสบการณ์จริงตอนเรียน ปวส. และการฝึกงาน
  3. **ประโยคที่ 3 (ประโยคปิด):** ตอกย้ำความมุ่งมั่นและการพัฒนาตนเองในระดับปริญญาตรี
- คลังความรู้คอมพิวเตอร์ครอบคลุม: OOP 4 เสาหลัก, SQL vs NoSQL, TCP/UDP & OSI Model, Git/GitHub, RESTful API, Linux/Ubuntu, และการรับมือวิชาคำนวณ

### 5. 📝 ระบบแก้ข้อความคำตอบและบันทึกอัตโนมัติ (Live Editable Cheat Sheet)
- สามารถกดปุ่ม **"✏️ แก้ไขคำตอบ"** เพื่อพิมพ์ปรับแต่งคำพูดให้เข้าปากตัวเองได้สด ๆ
- บันทึกความจำและข้อความลง **LocalStorage (v2)** ทันที ข้อมูลไม่หายเมื่อรีเฟรชหน้าเว็บ

### 6. ⏱️ ซ้อมสอบเสมือนจริง 45 วินาที พร้อมกระจกส่องหน้า (Mock Simulator & Video Mirror)
- ระบบจับเวลา 45 วินาทีเพื่อฝึกพูดให้กระชับ ชัดถ้อยชัดคำ
- สามารถเปิดกล้องหน้า (Webcam Mirror) เพื่อฝึกสบตารูกล้องและตรวจเช็กบุคลิกภาพขณะพูด

### 7. 📋 เช็กลิสต์ Zoom & ข้อมูลทางการ (Official RMUTT Checklist)
- ตารางสรุปขั้นตอนการสอบสัมภาษณ์ผ่าน **Zoom Meeting** จากประกาศมหาวิทยาลัย
- กำหนดเวลาสำคัญ: สแตนด์บายใน Waiting Room 08.30 - 08.45 น., เริ่มสัมภาษณ์ 09.00 น., กฎ 13.00 น., และวันประกาศผล

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)
- **Frontend Framework:** Angular 19 (Standalone Components, Signals, Computed, Effects)
- **Language:** TypeScript 5.x
- **Audio & Media APIs:** Web Speech API (SpeechRecognition), Web Audio API (AudioContext & AnalyserNode), MediaDevices API (getUserMedia)
- **Styling:** Custom Modern CSS Architecture with Responsive Grid/Flexbox, High-Contrast Dark Theme
- **Version Control:** Git & GitHub

---

## 🚀 วิธีการติดตั้งและรันในเครื่อง (Local Setup)

```bash
# โคลนโปรเจกต์
git clone https://github.com/LOOKSx/take-a-test.git
cd take-a-test

# ติดตั้ง dependencies
npm install

# รัน Development Server
npm start
# หรือ
ng serve
```

เปิดบราวเซอร์ไปที่: `http://localhost:4200/`

---

## 📄 ลิขสิทธิ์
จัดทำขึ้นเพื่อการเตรียมความพร้อมในการสอบสัมภาษณ์โดย นายพุฒิพงศ์ ราชรักษ์
