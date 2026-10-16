import { Component, signal, computed, ElementRef, ViewChild, OnDestroy, effect, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface InterviewQuestion {
  id: number;
  category: 'intro' | 'project' | 'skills' | 'readiness' | 'extra';
  categoryLabel: string;
  question: string;
  importance: 'mandatory' | 'high' | 'technical';
  importanceLabel: string;
  keywordHook: string; // สูตรจำ 3 คำ
  punchline: string;   // ประโยคทอง พูดปากเปล่าได้ทันที
  neverSay: string;    // สิ่งที่ห้ามพูดเด็ดขาด
  tags: string[];
  isCustom?: boolean;
}

export interface ChecklistItem {
  id: string;
  category: 'zoom' | 'line' | 'docs' | 'setup';
  title: string;
  description: string;
  urgent?: boolean;
}

const DEFAULT_QUESTIONS: InterviewQuestion[] = [
  // ========================================================
  // หมวดเจอ 100% แน่นอน (ขึ้นก่อนเพื่อนตามสั่ง)
  // ========================================================
  {
    id: 1,
    category: 'intro',
    categoryLabel: 'เปิดตัว (เจอ 100%)',
    question: 'แนะนำตัวสั้น ๆ จบ ปวส. จากไหน สาขาอะไร เกรดเท่าไหร่?',
    importance: 'mandatory',
    importanceLabel: '🔥 เจอแน่นอน 100% (อันดับ 1)',
    keywordHook: 'เอฟ + เทคนิคคอน เกรด 3.61 + Smart Light IoT + ฝึกงาน 2 แห่ง',
    punchline: 'สวัสดีครับอาจารย์ ผมชื่อ นายพุฒิพงศ์ ราชรักษ์ (เอฟ) รหัสสอบ 0312805627 จบ ปวส. เทคโนโลยีสารสนเทศ เทคนิคคอน เกรด 3.61 ครับ ผลงานเด่นคือ Smart Light IoT ควบคุมไฟผ่านเว็บ และฝึกงานด้านไอที 2 แห่ง ตั้งใจมาต่อยอด วศ.บ.คอมฯ เทียบโอน ที่ มทร.ธัญบุรี ครับ',
    neverSay: 'ห้ามเล่าประวัติครอบครัว หรือเรื่องที่ไม่เกี่ยวกับสายการเรียน',
    tags: ['แนะนำตัว', 'พุฒิพงศ์', 'เอฟ', 'เกรด 3.61', 'เทคนิคคอน', 'ปวส.']
  },
  {
    id: 2,
    category: 'intro',
    categoryLabel: 'เปิดตัว (เจอ 100%)',
    question: 'ทำไมถึงเลือก มทร.ธัญบุรี (คลองหก) สาขาวิศวกรรมคอมพิวเตอร์?',
    importance: 'mandatory',
    importanceLabel: '🔥 เจอแน่นอน 100% (อันดับ 2)',
    keywordHook: 'วิศวกรนักปฏิบัติ + เทียบโอนตรงสาย + แล็บฮาร์ดแวร์จริง',
    punchline: 'เพราะ มทร.ธัญบุรี เด่นเรื่อง "วิศวกรนักปฏิบัติ" มีหลักสูตรเทียบโอน วศ.บ.คอมฯ ตรงสาย และมีแล็บฮาร์ดแวร์-เครือข่ายที่พร้อมให้ลงมือทำจริง ตรงกับที่ผมชอบสร้างระบบ IoT ครับ',
    neverSay: 'ห้ามตอบว่า "เพราะใกล้บ้าน" หรือ "เพื่อนชวนมา"',
    tags: ['มทร.ธัญบุรี', 'คลองหก', 'เหตุผลที่เลือก']
  },
  {
    id: 3,
    category: 'intro',
    categoryLabel: 'เปิดตัว (เจอ 100%)',
    question: 'ถ้าติดที่นี่ จะเอาเลยไหม? มีสมัครที่อื่นไว้อีกหรือเปล่า?',
    importance: 'mandatory',
    importanceLabel: '🔥 เจอแน่นอน 100% (อันดับ 3)',
    keywordHook: 'เอา 100% + เป้าหมายอันดับหนึ่ง + ยืนยันสิทธิ์ทันที',
    punchline: 'เอา 100% แน่นอนครับ มทร.ธัญบุรี คลองหก คือเป้าหมายอันดับหนึ่งที่ผมตั้งใจไว้ และพร้อมยืนยันสิทธิ์ทันทีครับ',
    neverSay: 'ห้ามตอบว่า "ขอดูก่อนครับ" หรือ "รอผลอีกที่หนึ่ง"',
    tags: ['ยืนยันสิทธิ์', 'ความมุ่งมั่น', 'เอา 100%']
  },

  // ========================================================
  // หมวดโปรเจกต์ & ฝึกงาน ปวส. (อ้างอิงจากแฟ้มสะสมผลงาน 100%)
  // ========================================================
  {
    id: 4,
    category: 'project',
    categoryLabel: 'โปรเจกต์ ปวส.',
    question: 'โครงงาน / นวัตกรรมในพอร์ตทำอะไร ใช้อะไรทำ และมีประโยชน์อย่างไร?',
    importance: 'high',
    importanceLabel: 'สำคัญมาก',
    keywordHook: 'Smart Light IoT + 3 โหมด (Manual/Timer/LDR) + ESP32 คุมไฟ 220V',
    punchline: 'ทำโปรเจกต์ "Smart Light IoT" (All Light) ครับ เป็นระบบคุมโคมไฟ 3 โหมด: สั่งเปิด-ปิดเอง (Manual), ตั้งเวลา (Timer), และเปิดไฟตามแสงอัตโนมัติ (Auto LDR) ใช้บอร์ด ESP32 คุม Relay 5V ตัดต่อไฟบ้าน 220V สั่งการผ่านหน้าเว็บ PWA ครับ',
    neverSay: 'ห้ามจำชื่อโค้ดหรืออุปกรณ์ที่ตัวเองใช้ไม่ได้',
    tags: ['Smart Light IoT', 'All Light', 'ESP32', 'Relay 220V', 'LDR', 'Web App']
  },
  {
    id: 5,
    category: 'project',
    categoryLabel: 'โปรเจกต์ ปวส.',
    question: 'ในกลุ่มโปรเจกต์มีกี่คน ตัวน้องทำหน้าที่อะไรในงานจริง?',
    importance: 'technical',
    importanceLabel: 'วัดกึ๋น (ห้ามโกหก)',
    keywordHook: 'ทำคนเดียวทั้งหมด + ต่อ Relay 220V + เขียนโค้ด C/C++ & หน้าเว็บ',
    punchline: 'โปรเจกต์นี้ผมทำเองทั้งหมดครับ ตั้งแต่ต่อวงจร Relay แยกไฟ 220V อย่างปลอดภัย, เขียนโค้ด ESP32 ด้วยภาษา C/C++, และพัฒนาหน้าเว็บ PWA ควบคุมอุปกรณ์ครับ',
    neverSay: 'ห้ามพูดคลุมเครือ ต้องระบุหน้าที่วงจรและโค้ดให้ชัดเจน',
    tags: ['หน้าที่', 'ออกแบบวงจร', 'เขียนโปรแกรม', 'Web App']
  },
  {
    id: 6,
    category: 'project',
    categoryLabel: 'โปรเจกต์ ปวส.',
    question: 'ตอน ปวส. ฝึกงานที่ไหนมา ได้ทำอะไร ได้ทักษะอะไรบ้าง?',
    importance: 'high',
    importanceLabel: 'สำคัญมาก',
    keywordHook: 'ฝึก 2 แห่ง + บ.โปรเกรส + ศาลจังหวัดคอน + แก้ปัญหาหน้างานจริง',
    punchline: 'ฝึกงาน 2 แห่งครับ: บริษัท โปรเกรส เน็ตเวิร์ค คอนซัลท์ ดูแลซอฟต์แวร์ประยุกต์ และ ศาลจังหวัดนครศรีธรรมราช ช่วยดูแลระบบสารสนเทศ ได้ทักษะแก้ปัญหาหน้างานจริงและความรอบคอบครับ',
    neverSay: 'ห้ามบ่นว่าที่ฝึกงานไม่ดี หรือให้ทำแต่งานชงกาแฟ',
    tags: ['ฝึกงาน 2 แห่ง', 'โปรเกรสเน็ตเวิร์ค', 'ศาลจังหวัดนครศรีธรรมราช']
  },

  // ========================================================
  // หมวดสกิลคอมพิวเตอร์ & วิชาการ (อ้างอิงจากแฟ้มสะสมผลงาน 100%)
  // ========================================================
  {
    id: 7,
    category: 'skills',
    categoryLabel: 'ทักษะคอมฯ',
    question: 'เขียนโค้ดภาษาอะไรเป็นบ้าง ถนัดภาษาไหนที่สุด?',
    importance: 'technical',
    importanceLabel: 'วัดกึ๋นทางเทคนิค',
    keywordHook: 'Embedded C/C++ (ESP32) + JavaScript (Web App) + อบรมไซเบอร์',
    punchline: 'ถนัด Embedded C/C++ สำหรับเขียนบอร์ด ESP32 และ JavaScript/HTML/CSS สำหรับทำเว็บแอปครับ นอกจากนี้ผ่านการอบรม Cybersecurity และ Cryptography มาด้วยครับ',
    neverSay: 'อย่าร่ายชื่อภาษาเยอะเกินจริงถ้าไม่เคยเขียนจริง',
    tags: ['Coding', 'Embedded C/C++', 'JavaScript', 'Web App', 'IoT']
  },
  {
    id: 8,
    category: 'skills',
    categoryLabel: 'ทักษะคอมฯ',
    question: 'วิศวะคอมฯ คำนวณเยอะ (แคลคูลัส/ฟิสิกส์) คิดว่าจะไหวไหม ปรับตัวยังไง?',
    importance: 'high',
    importanceLabel: 'สำคัญมาก',
    keywordHook: 'เกรด 3.61 มีวินัย + พื้นฐานพร้อม + ทบทวนล่วงหน้า',
    punchline: 'มั่นใจว่าเรียนไหวครับ ตอน ปวส. ผมได้เกรด 3.61 (ปวช. 3.76) แสดงถึงวินัยการเรียน แม้คำนวณวิศวะจะยากขึ้น แต่ผมพร้อมทบทวนล่วงหน้าและตั้งกลุ่มติวกับเพื่อนครับ',
    neverSay: 'ห้ามบอกว่า "เกลียดเลขมาก" หรือ "ไม่ชอบคำนวณเลย"',
    tags: ['แคลคูลัส', 'เกรด 3.61', 'เกรด 3.76', 'ความพร้อมเรียน']
  },

  // ========================================================
  // หมวดความพร้อม & อนาคต
  // ========================================================
  {
    id: 9,
    category: 'readiness',
    categoryLabel: 'ความพร้อม',
    question: 'หลักสูตรเทียบโอนเรียนหนัก 3 ปี มีเวลาทุ่มเทไหม มีทำงานประจำหรือเปล่า?',
    importance: 'mandatory',
    importanceLabel: '🔥 เจอแน่นอน (เช็กดรอป)',
    keywordHook: 'เรียนเต็มเวลา 100% + ไม่มีงานประจำ + ครอบครัวซัพพอร์ต',
    punchline: 'ทุ่มเทให้การเรียนเต็มเวลา 100% ครับ ไม่มีงานประจำ ครอบครัวพร้อมสนับสนุนค่าใช้จ่ายเต็มที่ ตั้งใจมุ่งมั่นจบตามเกณฑ์ 3 ปีแน่นอนครับ',
    neverSay: 'อย่าบอกว่ามีงานประจำเต็มเวลาจนไม่สามารถมาเรียนภาคปกติได้',
    tags: ['เวลาเรียน', 'ภาคปกติ', 'ความพร้อม 100%']
  },
  {
    id: 10,
    category: 'readiness',
    categoryLabel: 'ความพร้อม',
    question: 'เรียนจบ วศ.บ.คอมพิวเตอร์ ไปแล้ว วางแผนอยากทำงานตำแหน่งอะไร?',
    importance: 'high',
    importanceLabel: 'สำคัญมาก',
    keywordHook: 'IoT Engineer / Embedded Developer + Smart Home',
    punchline: 'อยากเป็น IoT Engineer หรือ Embedded Systems Developer ครับ นำความรู้ฮาร์ดแวร์และซอฟต์แวร์ไปพัฒนาระบบ Smart Home และระบบอัตโนมัติครับ',
    neverSay: 'ห้ามตอบว่า "อะไรก็ได้ครับ ขอแค่มีงานทำ"',
    tags: ['เป้าหมาย', 'IoT Engineer', 'Embedded Systems', 'Smart City']
  },

  // ========================================================
  // คำถามเสริม
  // ========================================================
  {
    id: 11,
    category: 'extra',
    categoryLabel: 'คำถามเสริม',
    question: 'ถ้าตอนเรียนต้องเจอวิชาที่ยากมากแล้วติด F หรือแก้ปัญหาโค้ดไม่ออก จะทำอย่างไร?',
    importance: 'high',
    importanceLabel: 'วัดวิธีคิด',
    keywordHook: 'Debug ทีละสเต็ป + ไล่วงจรและโค้ด + ปรึกษาอาจารย์',
    punchline: 'จะไล่ปัญหาทีละจุดเหมือนการ Debug โค้ดและไล่วงจรครับ ค้นคว้าด้วยตัวเองก่อน ถ้ายังติดจะรีบปรึกษาอาจารย์และติวร่วมกับเพื่อนครับ',
    neverSay: 'ห้ามตอบว่า "ทิ้งวิชานั้นไปเลย" หรือ "ช่างมัน"',
    tags: ['แก้ปัญหา', 'ทัศนคติ', 'Debugging']
  },
  {
    id: 12,
    category: 'extra',
    categoryLabel: 'คำถามเสริม',
    question: 'มีคำถามอะไรอยากถามอาจารย์ หรือคณะกรรมการเพิ่มเติมไหม? (คำถามปิดท้าย)',
    importance: 'high',
    importanceLabel: 'โอกาสโชว์ของ',
    keywordHook: 'ถามเรื่องแล็บวิจัย Embedded & IoT ของภาควิชา',
    punchline: 'อยากสอบถามอาจารย์ครับว่า สำหรับเด็กเทียบโอนที่สนใจด้าน Embedded Systems และ IoT ทางภาควิชามีแล็บวิจัยหรือกลุ่มโปรเจกต์ตัวไหนที่สามารถเข้าไปช่วยงานได้ตั้งแต่ปีแรกบ้างครับ',
    neverSay: 'ห้ามตอบว่า "ไม่มีครับ" (การถามคำถามแสดงถึงความสนใจจริง)',
    tags: ['คำถามปิดท้าย', 'การเตรียมตัว', 'แล็บวิจัย', 'IoT']
  },
  {
    id: 13,
    category: 'skills',
    categoryLabel: 'เกียรติบัตร & ใบเซอร์',
    question: 'เกียรติบัตรและใบรับรองในพอร์ต (หน้า 5-6) มีอะไรบ้าง ได้เรียนรู้อะไรมา?',
    importance: 'high',
    importanceLabel: 'สำคัญมาก',
    keywordHook: 'เกียรติบัตร 5 ใบ: ฝึกงาน 2 แห่ง + อบรมไซเบอร์ + การเข้ารหัส ม.เกษตรฯ',
    punchline: 'ในพอร์ตมี 2 ส่วนครับ: ฝึกงาน 2 แห่ง (บ.โปรเกรส ด้านซอฟต์แวร์ และ ศาลจังหวัด ด้านระบบสารสนเทศ) และใบรับรองอบรมออนไลน์ 3 ใบ ด้าน Cybersecurity, ไอทีเพื่อชีวิต และการเข้ารหัสประยุกต์ ม.เกษตรฯ ซึ่งช่วยให้ผมคำนึงถึงความปลอดภัยของข้อมูลในระบบ IoT ครับ',
    neverSay: 'ห้ามจำไม่ได้ว่าตัวเองใส่เกียรติบัตรอะไรไปในพอร์ต',
    tags: ['เกียรติบัตร', 'ใบรับรอง', 'certificate', 'Cybersecurity', 'Cryptography', 'ฝึกงาน', 'KU MOOC']
  }
];

export interface AiSentenceAnswer {
  id: string;
  topic: string;
  category: 'tech' | 'attitude' | 'behavior' | 'rmutt' | 'academic' | 'custom';
  categoryLabel: string;
  keywords: string[];
  sentence1: string; // ประโยคที่ 1 (ประโยคเปิด - สั้นกระชับ)
  sentence2: string; // ประโยคที่ 2 (ประโยคเนื้อหา - ยกประสบการณ์ ปวส.)
  sentence3: string; // ประโยคที่ 3 (ประโยคปิด - ตอกย้ำความมุ่งมั่น)
  quickTips: string;  // ทริก 1 บรรทัดสั้นๆ
}

export const AI_KNOWLEDGE_BANK: AiSentenceAnswer[] = [
  {
    id: 'ai-smart-light',
    topic: 'โครงงาน Smart Light IoT (All Light) มีหลักการทำงานและจุดเด่นอย่างไร?',
    category: 'tech',
    categoryLabel: '💡 โปรเจกต์ All Light',
    keywords: ['smart light', 'all light', 'โคมไฟ', 'หลอดไฟ', 'ไฟอัจฉริยะ', 'โปรเจกต์', 'โครงงาน', 'นวัตกรรม', 'allight'],
    sentence1: 'เป็นระบบควบคุมโคมไฟอัจฉริยะ เชื่อมต่อบอร์ด ESP32 เข้ากับ Web App PWA ครับ',
    sentence2: 'มี 3 โหมด: สั่งเปิด-ปิดเอง (Manual), ตั้งเวลา (Timer), และเปิดไฟตามแสงอัตโนมัติ (Auto LDR) ครับ',
    sentence3: 'จุดเด่นคือทำงานออฟไลน์ได้ และแยกวงจรไฟบ้าน 220V ปลอดภัยในกล่อง Enclosure ครับ',
    quickTips: '3 โหมด: สั่งเอง / ตั้งเวลา / วัดแสง + คุมไฟ 220V ผ่านเว็บ'
  },
  {
    id: 'ai-esp32-iot',
    topic: 'ทำไมเลือกใช้บอร์ด ESP32 ในโปรเจกต์ Smart Light และเขียนโค้ดยังไง?',
    category: 'tech',
    categoryLabel: '💻 เทคนิคฮาร์ดแวร์',
    keywords: ['esp32', 'esp8266', 'ไมโครคอนโทรลเลอร์', 'microcontroller', 'arduino', 'บอร์ด', 'ชิป', 'บอร์ดอะไร'],
    sentence1: 'เลือก ESP32 เพราะมี Wi-Fi และ Bluetooth ในตัว ไม่ต้องต่อชิปเสริมครับ',
    sentence2: 'เขียนโค้ดด้วย Embedded C/C++ สั่งขา GPIO คุม Relay และอ่านค่าแสงจาก ADC ครับ',
    sentence3: 'ทำให้มีพื้นฐานแน่น พร้อมต่อยอดวิชา Microprocessor ที่ มทร.ธัญบุรี ครับ',
    quickTips: 'ESP32 มี Wi-Fi ในตัว + เขียน C/C++ คุม Relay และ ADC'
  },
  {
    id: 'ai-relay-safety',
    topic: 'การใช้ Relay 5V คุมไฟบ้าน 220V AC ออกแบบความปลอดภัยอย่างไร?',
    category: 'tech',
    categoryLabel: '⚡ ความปลอดภัยระบบไฟฟ้า',
    keywords: ['relay', 'รีเลย์', '220v', 'ไฟบ้าน', 'ความปลอดภัย', 'ไฟดูด', 'อันตราย', 'safety', 'กระแสสลับ', 'ไฟฟ้า'],
    sentence1: 'ใช้โมดูล Relay ที่มี Optocoupler ตัดสัญญาณไฟฟ้าแยกฝั่งไฟสูง 220V กับไฟต่ำ DC ครับ',
    sentence2: 'แยกสายไฟ AC กับสายสัญญาณออกจากกัน หุ้มฉนวนท่อหด และลงกล่อง Enclosure ฉนวนกันดูดครับ',
    sentence3: 'ทำให้ระบบปลอดภัย 100% ใช้งานจริงได้ตามมาตรฐานวิศวกรรมครับ',
    quickTips: 'Optocoupler แยกไฟสูง-ต่ำ + หุ้มท่อหด + กล่อง Enclosure'
  },
  {
    id: 'ai-ldr-sensor',
    topic: 'เซนเซอร์วัดแสง LDR ทำงานอย่างไร และแปลงค่าอย่างไร?',
    category: 'tech',
    categoryLabel: '💻 เทคนิคฮาร์ดแวร์',
    keywords: ['ldr', 'แสง', 'วัดแสง', 'เซนเซอร์', 'sensor', 'ambient', 'lux', 'adc', 'อนาล็อก', 'ความสว่าง'],
    sentence1: 'ต่อ LDR ร่วมกับตัวต้านทาน 10k โอห์ม เป็นวงจรแบ่งแรงดัน (Voltage Divider) ครับ',
    sentence2: 'บอร์ด ESP32 แปลงแรงดันอนาล็อกเป็นค่าดิจิทัล 0–4095 ผ่านขา ADC 12-bit ครับ',
    sentence3: 'ใส่ Hysteresis ในโค้ด เพื่อป้องกันหลอดไฟกระพริบตอนความสว่างก้ำกึ่งครับ',
    quickTips: 'Voltage Divider 10k + ADC 0-4095 + ใส่ Hysteresis กันไฟกระพริบ'
  },
  {
    id: 'ai-allight-web',
    topic: 'สถาปัตยกรรม Web App All Light และ Backend ออกแบบอย่างไร?',
    category: 'tech',
    categoryLabel: '🌐 ซอฟต์แวร์ & คลาวด์',
    keywords: ['allight', 'web app', 'เว็บ', 'frontend', 'backend', 'golang', 'pwa', 'service worker', 'vercel'],
    sentence1: 'ทำเป็น Progressive Web App (PWA) ลงมือถือได้ และทำงานออฟไลน์ผ่าน Service Worker ครับ',
    sentence2: 'มี Backend ด้วยภาษา Go รองรับ REST API ซิงก์สถานะไฟแบบ Real-time ครับ',
    sentence3: 'ทำให้เข้าใจการเชื่อมต่อ IoT ครบวงจรตั้งแต่ฮาร์ดแวร์จนถึงคลาวด์บน Vercel ครับ',
    quickTips: 'PWA ทำงานออฟไลน์ + Go REST API + Deploy บน Vercel'
  },
  {
    id: 'ai-internship-2places',
    topic: 'เล่าประสบการณ์ฝึกงาน 2 แห่งให้ฟังหน่อย ได้ทำอะไรบ้าง?',
    category: 'behavior',
    categoryLabel: '🏢 ประสบการณ์ฝึกงาน',
    keywords: ['ฝึกงาน', 'โปรเกรส', 'ศาล', 'ศาลจังหวัด', 'บริษัท', 'ประสบการณ์ทำงาน', 'intern', '2 แห่ง'],
    sentence1: 'แห่งแรกคือ บ.โปรเกรส เน็ตเวิร์ค คอนซัลท์ ดูแลซอฟต์แวร์และการประยุกต์ไอทีครับ',
    sentence2: 'แห่งที่สองคือ ศาลจังหวัดนครศรีธรรมราช ช่วยดูแลสารสนเทศและเน็ตเวิร์กองค์กรครับ',
    sentence3: 'ได้ทักษะการซ่อมบำรุงระบบ ความรอบคอบ และการแก้ปัญหาหน้างานจริงครับ',
    quickTips: 'บ.โปรเกรส (ซอฟต์แวร์/ไอที) + ศาลจังหวัดคอน (สารสนเทศ)'
  },
  {
    id: 'ai-certificates-all',
    topic: 'เกียรติบัตรทั้งหมดในแฟ้มสะสมผลงาน (หน้า 5-6) มีอะไรบ้างและนำมาใช้อย่างไร?',
    category: 'academic',
    categoryLabel: '📜 เกียรติบัตรทั้งหมด',
    keywords: ['เกียรติบัตร', 'ใบเซอร์', 'ใบประกาศ', 'ผลงานที่ได้รับ', 'รางวัล', 'ใบรับรองทั้งหมด', 'เกียรติบัตรทั้งหมด'],
    sentence1: 'ในพอร์ตมี 5 ใบหลักครับ คือ ฝึกงาน 2 แห่ง และอบรมออนไลน์ 3 หลักสูตรครับ',
    sentence2: 'ฝึกงานที่ บ.โปรเกรส (ซอฟต์แวร์) และ ศาลจังหวัด (ระบบสารสนเทศ) ได้ทักษะแก้ปัญหาหน้างานจริงครับ',
    sentence3: 'ส่วนอบรมได้ Cybersecurity และ Cryptography ม.เกษตรฯ ช่วยเสริมเรื่องความปลอดภัยของระบบ IoT ครับ',
    quickTips: 'ฝึกงาน 2 แห่ง + อบรมไซเบอร์ & การเข้ารหัส KU MOOC'
  },
  {
    id: 'ai-cyber-crypto',
    topic: 'ใบรับรอง Cybersecurity และ Cryptography ได้เรียนรู้อะไรมาบ้าง?',
    category: 'academic',
    categoryLabel: '📜 ใบรับรองทางวิชาการ',
    keywords: ['ใบประกาศ', 'ใบรับรอง', 'certificate', 'อบรม', 'cybersecurity', 'ไซเบอร์', 'cryptography', 'การเข้ารหัส', 'thai mooc', 'เกษตร', 'ku mooc', 'ใบเซอร์', 'เกียรติบัตร'],
    sentence1: 'ผ่านอบรม 3 ใบ: ไซเบอร์ Thai MOOC 6 ชม., ไอทีเพื่อชีวิต 24 ชม., และการเข้ารหัส ม.เกษตรฯ ครับ',
    sentence2: 'ได้เรียนรู้การป้องกันภัย Phishing และหลักการเข้ารหัสข้อมูลพื้นฐานครับ',
    sentence3: 'ช่วยให้ผมคำนึงถึงความปลอดภัยของข้อมูลในการพัฒนาระบบ IoT ครับ',
    quickTips: '3 ใบ: Thai MOOC ไซเบอร์ + ไอทีชีวิต + KU MOOC เข้ารหัส'
  },
  {
    id: 'ai-gpa-high',
    topic: 'เกรดเฉลี่ย ปวส. 3.61 และ ปวช. 3.76 สูงมาก มีเคล็ดลับการเรียนอย่างไร?',
    category: 'academic',
    categoryLabel: '📐 ผลการเรียน & วินัย',
    keywords: ['เกรด', '3.61', '3.76', 'เกรดเฉลี่ย', 'เรียนดี', 'ทำไมเกรดดี', 'ผลการเรียน', 'เกรดสูง'],
    sentence1: 'มาจากความมีวินัย เข้าเรียนตรงเวลา และส่งงานครบทุกชิ้นครับ',
    sentence2: 'เน้นลงมือปฏิบัติจริงในแล็บจนเข้าใจ แล้วทฤษฎีจะจำได้ง่ายเองครับ',
    sentence3: 'พร้อมนำวินัยนี้มาทุ่มเทเรียนต่อ วศ.บ.คอมฯ ให้สำเร็จตามเกณฑ์ครับ',
    quickTips: 'มีวินัย + ส่งงานครบ + ปฏิบัติจริงจนเข้าใจทฤษฎี'
  },
  {
    id: 'ai-activities-sports',
    topic: 'กิจกรรมจิตอาสาน้ำท่วมหาดใหญ่ และแข่ง eSports ROV ได้อะไรบ้าง?',
    category: 'behavior',
    categoryLabel: '🤝 กิจกรรม & ทีมเวิร์ก',
    keywords: ['กิจกรรม', 'จิตอาสา', 'น้ำท่วม', 'หาดใหญ่', 'rov', 'esports', 'กีฬาสี', 'เชิดมังกร', 'สันทนาการ'],
    sentence1: 'ช่วยเหลือน้ำท่วมหาดใหญ่ สงขลา ได้ฝึกความเสียสละและการทำงานเป็นทีมครับ',
    sentence2: 'แข่ง eSports ROV ได้รองชนะเลิศ สอนเรื่องการวางแผนกลยุทธ์และการตัดสินใจเร็วครับ',
    sentence3: 'ช่วยให้ผมทำงานร่วมกับผู้อื่นได้ดี และพร้อมปรับตัวเข้ากับสังคมมหาวิทยาลัยครับ',
    quickTips: 'จิตอาสาน้ำท่วม = เสียสละ + eSports = กลยุทธ์และการตัดสินใจ'
  },
  {
    id: 'ai-why-rmutt',
    topic: 'ทำไมถึงเลือก มทร.ธัญบุรี คลองหก ทำไมไม่เลือกที่อื่น?',
    category: 'rmutt',
    categoryLabel: '🏫 มทร.ธัญบุรี คลองหก',
    keywords: ['พระจอม', 'มจพ', 'มทรอื่น', 'เกษตร', 'ทำไมไม่เลือก', 'เปรียบเทียบ', 'คลองหก', 'ทำไมเลือก'],
    sentence1: 'เพราะที่นี่มีชื่อเสียงอันดับหนึ่งเรื่อง "วิศวกรนักปฏิบัติ" ตรงกับเด็ก ปวส. ครับ',
    sentence2: 'มีหลักสูตรเทียบโอน วศ.บ.คอมฯ ตรงสาย และห้องแล็บฮาร์ดแวร์ที่ทันสมัยครับ',
    sentence3: 'เป็นเป้าหมายอันดับหนึ่งที่ผมตั้งใจไว้คนเดียวในใจตั้งแต่แรกครับ',
    quickTips: 'วิศวกรนักปฏิบัติ + เทียบโอนตรงสาย + แล็บฮาร์ดแวร์พร้อม'
  },
  {
    id: 'ai-ce-vs-cs',
    topic: 'วิศวกรรมคอมพิวเตอร์ (CE) ต่างกับ วิทยาการคอมพิวเตอร์ (CS) อย่างไร?',
    category: 'tech',
    categoryLabel: '💻 เทคนิคคอมฯ',
    keywords: ['วิทยาการคอม', 'cs', 'ce ต่าง', 'วิศวะคอมต่าง', 'ความต่าง', 'hardware software'],
    sentence1: 'CS เน้นทฤษฎีการคำนวณ อัลกอริทึม และซอฟต์แวร์ล้วนครับ',
    sentence2: 'ส่วน CE รวม Hardware, วงจรไฟฟ้า, ชิปสมองกลฝังตัว และซอฟต์แวร์เข้าด้วยกันครับ',
    sentence3: 'ตรงกับที่ผมชอบทำ Smart Light ที่ต้องต่อวงจรและเขียนโปรแกรมควบคุมจริงครับ',
    quickTips: 'CS = ซอฟต์แวร์/ทฤษฎีล้วน, CE = Hardware + Firmware + Software'
  },
  {
    id: 'ai-hard-math',
    topic: 'วิศวะคอมฯ มีคำนวณยาก ฟิสิกส์ แคลคูลัส ปวส. จะเรียนไหวไหม?',
    category: 'academic',
    categoryLabel: '📐 วิชาการ & คำนวณ',
    keywords: ['ตามไม่ทัน', 'ไม่ทันเพื่อน', 'คำนวณยาก', 'ฟิสิกส์', 'แคลคูลัส', 'เลข', 'คณิต', 'คำนวณ'],
    sentence1: 'มั่นใจว่าไหวครับ เกรด ปวส. 3.61 และ ปวช. 3.76 ยืนยันถึงวินัยการเรียนครับ',
    sentence2: 'ผมเริ่มดูคลิปทบทวนล่วงหน้า และตั้งใจจับกลุ่มติวแลกเปลี่ยนกับเพื่อนครับ',
    sentence3: 'อาศัยความขยัน ทำโจทย์สม่ำเสมอ และกล้าถามอาจารย์ มั่นใจว่าผ่านได้แน่นอนครับ',
    quickTips: 'เกรด 3.61 ยืนยันวินัย + ทบทวนล่วงหน้า + จับกลุ่มติวกับเพื่อน'
  },
  {
    id: 'ai-work-study',
    topic: 'มีทำงานประจำไหม หรือพร้อมเรียนเต็มเวลา 100% หรือไม่?',
    category: 'behavior',
    categoryLabel: '💼 ความพร้อมเรียน',
    keywords: ['ทำงานไปด้วย', 'งานนอก', 'พาร์ทไทม์', 'part time', 'รับงาน', 'แบ่งเวลาทำงาน', 'งานประจำ'],
    sentence1: 'เรียนภาคปกติ 100% ครับ การเรียนที่ มทร.ธัญบุรี คือเป้าหมายอันดับหนึ่งครับ',
    sentence2: 'ไม่มีงานประจำ ครอบครัวพร้อมสนับสนุนค่าใช้จ่ายเต็มที่ตลอด 3 ปีครับ',
    sentence3: 'พร้อมทุ่มเทเวลาให้กับการเข้าเรียน ทำแล็บ และโปรเจกต์เต็มที่ครับ',
    quickTips: 'เรียนเต็มเวลา 100% ไม่มีงานประจำ ครอบครัวพร้อมซัพพอร์ต'
  },
  {
    id: 'ai-not-accepted',
    topic: 'ถ้าผลสัมภาษณ์รอบโควตานี้ไม่ผ่าน จะทำอย่างไรต่อไป?',
    category: 'attitude',
    categoryLabel: '🧠 ทัศนคติ & แก้ปัญหา',
    keywords: ['ไม่ผ่าน', 'ไม่ติด', 'ไม่ติดโควตา', 'ตกสัมภาษณ์', 'ถ้าไม่ได้', 'สำรอง'],
    sentence1: 'จะนำคำแนะนำของคณะกรรมการไปปรับปรุงและพัฒนาตัวเองทันทีครับ',
    sentence2: 'เพราะเป้าหมายเดียวของผมคือ มทร.ธัญบุรี ผมจะกลับมาสมัครในรอบถัดไปแน่นอนครับ',
    sentence3: 'แต่วันนี้ผมเตรียมตัวมา 100% และหวังว่าจะได้รับโอกาสตั้งแต่รอบนี้ครับ',
    quickTips: 'มุ่งมั่นที่นี่ที่เดียว นำคำแนะนำไปแก้และสู้ต่อรอบหน้า'
  },
  {
    id: 'ai-final-question',
    topic: 'มีคำถามอะไรอยากถามอาจารย์เพิ่มเติมไหม? (คำถามปิดท้าย)',
    category: 'attitude',
    categoryLabel: '🎯 คำถามปิดท้าย',
    keywords: ['มีคำถามไหม', 'ถามอะไรไหม', 'สงสัยอะไร', 'คำถามปิดท้าย', 'ถามอาจารย์'],
    sentence1: 'อยากสอบถามอาจารย์เรื่องแล็บวิจัยหรือกลุ่มโปรเจกต์ด้าน Embedded Systems และ IoT ครับ',
    sentence2: 'อยากรู้ว่านักศึกษาเทียบโอนสามารถเข้าไปช่วยเป็นลูกมือแล็บได้ตั้งแต่ช่วงปีแรกไหมครับ',
    sentence3: 'เพราะผมมีพื้นฐาน Smart Light และอยากมีส่วนร่วมช่วยงานภาควิชาครับ',
    quickTips: 'ถามเรื่องแล็บวิจัย Embedded & IoT ของภาควิชา'
  },
  {
    id: 'ai-git-github',
    topic: 'Git และ GitHub มีประโยชน์อย่างไร และใช้งานอย่างไร?',
    category: 'tech',
    categoryLabel: '💻 เทคนิคคอมฯ',
    keywords: ['git', 'github', 'version control', 'commit', 'branch', 'merge', 'repo', 'ที่เก็บโค้ด'],
    sentence1: 'เป็นระบบ Version Control บันทึกประวัติโค้ด ป้องกันโค้ดหายหรือทับซ้อนกันครับ',
    sentence2: 'ผมใช้คำสั่งพื้นฐาน git add, commit, push เก็บงานบน GitHub (LOOKSx) ประจำครับ',
    sentence3: 'ทำให้ทำงานเป็นระบบ และพร้อมทำงานร่วมกับเพื่อนในแล็บคอมพิวเตอร์ครับ',
    quickTips: 'Version Control ป้องกันโค้ดหาย + บัญชี GitHub: LOOKSx'
  },
  {
    id: 'ai-networking-court',
    topic: 'ระบบ Network ที่ได้สัมผัสตอนฝึกงานเป็นอย่างไร?',
    category: 'tech',
    categoryLabel: '💻 เทคนิคเน็ตเวิร์ก',
    keywords: ['network', 'เน็ตเวิร์ก', 'เครือข่าย', 'ip', 'lan', 'สายแลน', 'router', 'switch', 'cisco', 'dhcp'],
    sentence1: 'ได้สัมผัสระบบเครือข่ายองค์กร มีการแบ่ง Subnet และความปลอดภัยของระบบราชการครับ',
    sentence2: 'ได้เข้าหัวสาย LAN CAT6, ตรวจเช็กสายสัญญาณ และแก้ปัญหา IP ให้เครื่องลูกข่ายครับ',
    sentence3: 'ทำให้เข้าใจการเชื่อมโยงระบบจริง และพร้อมต่อยอดวิชา Network ที่ มทร.ธัญบุรี ครับ',
    quickTips: 'เข้าหัวสาย LAN + ตรวจเช็ก IP/DHCP + เน็ตเวิร์กระดับองค์กร'
  },
  {
    id: 'ai-future-career',
    topic: 'เรียนจบ วศ.บ.คอมพิวเตอร์ ไปแล้ว อยากทำงานตำแหน่งอะไร?',
    category: 'behavior',
    categoryLabel: '🎯 อาชีพเป้าหมาย',
    keywords: ['อาชีพ', 'อนาคต', 'อยากเป็นอะไร', 'ตำแหน่ง', 'ทำงานอะไร', 'เรียนจบ', 'เป้าหมาย'],
    sentence1: 'เป้าหมายคือเป็น IoT Engineer หรือ Embedded Systems Developer ครับ',
    sentence2: 'นำความรู้ฮาร์ดแวร์และซอฟต์แวร์ไปพัฒนาระบบ Smart Home และ Smart Factory ครับ',
    sentence3: 'เป็นสายงานที่กำลังเติบโตสูง และสามารถนำความรู้มาสร้างคุณค่าได้จริงครับ',
    quickTips: 'ตำแหน่ง: IoT Engineer / Embedded Systems Developer'
  }
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnDestroy {
  private ngZone = inject(NgZone);

  // Theme Mode (Dark Theme as primary request)
  isDarkMode = signal<boolean>(true);
  showUrgentBanner = signal<boolean>(true);

  // Navigation & View Mode
  activeTab = signal<'cheat' | 'ai-assistant' | 'checklist' | 'mock' | 'official'>('cheat');
  selectedCategory = signal<string>('all');
  searchQuery = signal<string>('');
  copiedQuestionId = signal<number | null>(null);

  // Dynamic Editable Questions Signal
  questions = signal<InterviewQuestion[]>([]);

  // Authentic Candidate Profile Info ( strictly aligned with 8-page portfolio PDF )
  candidateProfile = {
    name: 'นายพุฒิพงศ์ ราชรักษ์ (เอฟ)',
    nameEn: 'Mr. Puttipong Racharak',
    examId: '0312805627',
    orderNum: 28,
    majorCode: '19104000128',
    majorName: 'วิศวกรรมคอมพิวเตอร์ (โดยวิธีการเทียบโอน) ภาคปกติ',
    faculty: 'คณะวิศวกรรมศาสตร์ มหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี (มทร.ธัญบุรี คลองหก)',
    prevCollege: 'วิทยาลัยเทคนิคนครศรีธรรมราช',
    prevMajor: 'สาขาวิชาเทคโนโลยีสารสนเทศ (ปวส.) เกรดสะสม 3.61',
    phone: '098-017-8005',
    email: 'cenbu20@gmail.com',
    github: 'LOOKSx',
    githubRepo: 'https://github.com/LOOKSx/take-a-test.git',
    internship: 'บริษัท โปรเกรส เน็ตเวิร์ค คอนซัลท์ จำกัด & ศาลจังหวัดนครศรีธรรมราช',
    featuredProjects: 'Smart Light IoT Project (All Light) — ระบบควบคุมหลอดไฟอัจฉริยะ (allight-psi.vercel.app)',
    interviewDate: 'วันเสาร์ที่ 17 ตุลาคม 2569 (Zoom สัมภาษณ์ 09.00 น.)',
  };

  // Speech Recognition & Live Audio Monitor
  isListening = signal<boolean>(false);
  speechTranscript = signal<string>('');
  speechMatchedQuestion = signal<InterviewQuestion | null>(null);
  speechAiAnswer = signal<AiSentenceAnswer | null>(null);
  speechSupported = signal<boolean>(true);
  speechStatusMessage = signal<string>('พร้อมฟังเสียง (กดปุ่มไมโครโฟนเพื่อเริ่ม)');
  speechError = signal<string | null>(null);
  private recognition: any = null;

  // Real-time Sound Detection Signals (ยืนยันว่าอัดเสียงติดจริง)
  isSoundDetected = signal<boolean>(false);
  micVolumeLevel = signal<number>(0);
  lastSoundTime = signal<string>('');
  showHowItWorks = signal<boolean>(false);

  // AI Assistant Search & Teleprompter
  aiSearchQuery = signal<string>('');
  selectedAiCategory = signal<string>('all');
  activeAiAnswer = signal<AiSentenceAnswer | null>(null);
  copiedSentenceIndex = signal<number | null>(null);

  // Audio Context & Analyser for real-time volume detection
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private animFrameId: number | null = null;

  // Edit Modal/Form State
  editingQuestionId = signal<number | null>(null);
  editForm = signal<{
    question: string;
    keywordHook: string;
    punchline: string;
    neverSay: string;
  }>({
    question: '',
    keywordHook: '',
    punchline: '',
    neverSay: '',
  });

  // User Progress Signals (Saved to localStorage)
  preparedQuestionIds = signal<Set<number>>(new Set<number>());
  completedChecklistIds = signal<Set<string>>(new Set<string>());

  // Mock Interview State
  @ViewChild('webcamVideo') webcamVideoRef?: ElementRef<HTMLVideoElement>;
  mockQuestionIndex = signal<number>(0);
  timerSeconds = signal<number>(45);
  timerMaxSeconds = signal<number>(45);
  isTimerRunning = signal<boolean>(false);
  private timerInterval: any = null;
  webcamActive = signal<boolean>(false);
  private mediaStream: MediaStream | null = null;
  webcamError = signal<string | null>(null);

  // Checklist Items
  readonly officialChecklist: ChecklistItem[] = [
    {
      id: 'zoom-name',
      category: 'zoom',
      title: 'ตั้งชื่อ Display Name ใน Zoom: "28_0312805627_นายพุฒิพงศ์ ราชรักษ์"',
      description: 'รูปแบบ: ลำดับ_รหัสประจำตัวสอบ_ชื่อ-นามสกุล เพื่อให้อาจารย์กดรับจาก Waiting Room เข้าสัมภาษณ์ได้ตรงคิว',
      urgent: true
    },
    {
      id: 'zoom-test-av',
      category: 'zoom',
      title: 'ทดสอบกล้อง Webcam และไมโครโฟนใน Zoom Settings',
      description: 'กด Test Speaker & Microphone ในหน้าตั้งค่า Zoom และตรวจสอบให้แน่ใจว่าได้ยินเสียงชัดเจนและภาพไม่มืด',
      urgent: true
    },
    {
      id: 'line-zoom-link',
      category: 'line',
      title: 'รับลิงก์ Zoom / Meeting ID & Passcode ในกลุ่ม LINE "04 สัมภาษณ์ โควตา 70"',
      description: 'สแตนด์บายติดตามประกาศในกลุ่มไลน์ช่วงเช้า อาจารย์จะส่งลิงก์ Zoom เข้าห้องสัมภาษณ์ให้',
      urgent: true
    },
    {
      id: 'zoom-waiting',
      category: 'zoom',
      title: 'เข้าห้อง Zoom Waiting Room สแตนด์บายล่วงหน้า (08.30 - 08.45 น.)',
      description: 'กรรมการจะเริ่มรันคิวสัมภาษณ์ทีละคนตั้งแต่ 09.00 น. เป็นต้นไป ห้ามเข้าสายเด็ดขาด',
      urgent: true
    },
    {
      id: 'docs-id',
      category: 'docs',
      title: 'บัตรประชาชนตัวจริง (ยังไม่หมดอายุ)',
      description: 'วางไว้ข้างตัวเพื่อยกโชว์หน้ากล้อง Zoom ยืนยันตัวตนกับคณะกรรมการ',
      urgent: true
    },
    {
      id: 'docs-grade',
      category: 'docs',
      title: 'สำเนาใบแสดงผลการเรียน (Transcript ปวส.) สาขาเทคโนโลยีสารสนเทศ',
      description: 'เตรียมไว้ดูเกรดเฉลี่ยหรือสาขาวิชาหากกรรมการสอบถามเรื่องรายวิชาที่เรียนมา',
      urgent: false
    },
    {
      id: 'docs-port',
      category: 'docs',
      title: 'เว็บ Smart Light IoT (All Light) & แฟ้มสะสมผลงาน 8 หน้า (เตรียมไว้เผื่อแชร์หน้าจอ)',
      description: 'เปิดเว็บ allight-psi.vercel.app และไฟล์ PDF แฟ้มสะสมผลงาน 8 หน้าสแตนด์บายไว้ เผื่อกรรมการขอให้ Share Screen',
      urgent: false
    },
    {
      id: 'setup-dress',
      category: 'setup',
      title: 'แต่งกายชุดนักเรียน/นักศึกษาเดิม หรือชุดเชิ้ตสุภาพ',
      description: 'ประกาศระบุชัดเจน: **ห้ามใส่เสื้อยืด กางเกงยีนส์** เด็ดขาด!',
      urgent: true
    },
    {
      id: 'setup-quiet',
      category: 'setup',
      title: 'จัดมุมกล้องระดับสายตา แสงสว่างส่องใบหน้า และห้องเงียบไม่มีเสียงแทรก',
      description: 'ตั้งหน้าต่าง Zoom ไว้ด้านบนใกล้รูกล้อง และเปิดเว็บ "พร้อมเสมอ" ไว้ด้านล่างเพื่ออ่านโพยได้อย่างเป็นธรรมชาติ',
      urgent: false
    },
    {
      id: 'line-missed',
      category: 'line',
      title: 'หากถึง 13.00 น. ยังไม่ได้รับการเรียกสัมภาษณ์ ให้ติดต่ออาจารย์ทันที',
      description: 'ตามเอกสารระบุ: ถ้าถึงบ่ายโมงยังไม่ได้รับการสัมภาษณ์ ให้รีบพิมพ์แจ้งในกลุ่มไลน์ทันที',
      urgent: true
    }
  ];

  constructor() {
    this.loadTheme();
    this.loadQuestions();
    this.loadProgress();

    // Auto-save questions changes
    effect(() => {
      const qs = this.questions();
      try {
        localStorage.setItem('prom_samur_custom_questions_v5', JSON.stringify(qs));
      } catch (e) {}
    });

    // Auto-save progress
    effect(() => {
      const qIds = Array.from(this.preparedQuestionIds());
      const cIds = Array.from(this.completedChecklistIds());
      try {
        localStorage.setItem('prom_samur_q_progress', JSON.stringify(qIds));
        localStorage.setItem('prom_samur_c_progress', JSON.stringify(cIds));
      } catch (e) {}
    });

    // Auto-apply & save theme globally to document
    effect(() => {
      const isDark = this.isDarkMode();
      if (typeof document !== 'undefined') {
        if (isDark) {
          document.documentElement.classList.add('dark-theme');
          document.body.classList.add('dark-theme');
        } else {
          document.documentElement.classList.remove('dark-theme');
          document.body.classList.remove('dark-theme');
        }
      }
      try {
        localStorage.setItem('prom_samur_dark_mode', isDark ? 'true' : 'false');
      } catch (e) {}
    });
  }

  // Computed Values
  preparedQuestionsCount = computed(() => this.preparedQuestionIds().size);
  totalQuestionsCount = computed(() => this.questions().length);

  completedChecklistCount = computed(() => this.completedChecklistIds().size);
  totalChecklistCount = computed(() => this.officialChecklist.length);

  overallReadinessPercent = computed(() => {
    const total = this.totalQuestionsCount() + this.totalChecklistCount();
    if (total === 0) return 0;
    const earned = this.preparedQuestionsCount() + this.completedChecklistCount();
    return Math.round((earned / total) * 100);
  });

  filteredQuestions = computed(() => {
    const category = this.selectedCategory();
    const query = this.searchQuery().trim().toLowerCase();

    return this.questions().filter(q => {
      const matchCategory = category === 'all' || q.category === category;
      const matchQuery = !query ||
        q.question.toLowerCase().includes(query) ||
        q.punchline.toLowerCase().includes(query) ||
        q.keywordHook.toLowerCase().includes(query) ||
        q.tags.some(t => t.toLowerCase().includes(query));
      return matchCategory && matchQuery;
    });
  });

  currentMockQuestion = computed(() => {
    const idx = this.mockQuestionIndex();
    const list = this.questions();
    return list[idx] || list[0] || DEFAULT_QUESTIONS[0];
  });

  filteredAiKnowledge = computed(() => {
    const cat = this.selectedAiCategory();
    const query = this.aiSearchQuery().trim().toLowerCase();

    return AI_KNOWLEDGE_BANK.filter(item => {
      const matchCat = cat === 'all' || item.category === cat;
      const matchQuery = !query ||
        item.topic.toLowerCase().includes(query) ||
        item.sentence1.toLowerCase().includes(query) ||
        item.sentence2.toLowerCase().includes(query) ||
        item.sentence3.toLowerCase().includes(query) ||
        item.keywords.some(k => k.toLowerCase().includes(query));
      return matchCat && matchQuery;
    });
  });

  // Action Methods
  toggleTheme() {
    this.isDarkMode.update(dark => !dark);
  }

  setActiveTab(tab: 'cheat' | 'ai-assistant' | 'checklist' | 'mock' | 'official') {
    this.activeTab.set(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  setCategory(cat: string) {
    this.selectedCategory.set(cat);
  }

  toggleQuestionPrepared(id: number) {
    const set = new Set(this.preparedQuestionIds());
    if (set.has(id)) {
      set.delete(id);
    } else {
      set.add(id);
    }
    this.preparedQuestionIds.set(set);
  }

  isQuestionPrepared(id: number): boolean {
    return this.preparedQuestionIds().has(id);
  }

  toggleChecklist(id: string) {
    const set = new Set(this.completedChecklistIds());
    if (set.has(id)) {
      set.delete(id);
    } else {
      set.add(id);
    }
    this.completedChecklistIds.set(set);
  }

  isChecklistCompleted(id: string): boolean {
    return this.completedChecklistIds().has(id);
  }

  copyPunchline(q: InterviewQuestion) {
    const textToCopy = `คำถาม: ${q.question}\nสูตรจำ: ${q.keywordHook}\nประโยคตอบ: ${q.punchline}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      this.copiedQuestionId.set(q.id);
      setTimeout(() => {
        if (this.copiedQuestionId() === q.id) {
          this.copiedQuestionId.set(null);
        }
      }, 1500);
    });
  }

  // =========================================================================
  // SPEECH RECOGNITION (ระบบจับเสียงอาจารย์ & ค้นหาคำตอบอัตโนมัติ)
  // =========================================================================
  private ensureSpeechRecognition() {
    if (this.recognition) return true;
    if (typeof window === 'undefined') return false;

    const SpeechAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechAPI) {
      this.speechSupported.set(false);
      this.speechError.set('เบราว์เซอร์นี้ไม่รองรับระบบดักฟังเสียง (แนะนำให้ใช้ Google Chrome หรือ Microsoft Edge)');
      return false;
    }

    try {
      this.recognition = new SpeechAPI();
      this.recognition.lang = 'th-TH'; // ภาษาไทย
      this.recognition.continuous = true;
      this.recognition.interimResults = true;

      this.recognition.onstart = () => {
        this.ngZone.run(() => {
          this.isListening.set(true);
          this.speechError.set(null);
          this.speechStatusMessage.set('🎤 กำลังดักฟังเสียงคำถาม (ไทย)... ระบบจะดึงคำตอบขึ้นมาให้อัตโนมัติทันที');
        });
      };

      this.recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        const text = (final || interim).trim();
        if (text) {
          this.ngZone.run(() => {
            this.speechTranscript.set(text);
            this.isSoundDetected.set(true);
            this.lastSoundTime.set(new Date().toLocaleTimeString('th-TH'));
            this.matchQuestionFromSpeech(text);
          });
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('Speech error event:', event.error);
        this.ngZone.run(() => {
          if (event.error === 'not-allowed') {
            this.speechError.set('⚠️ ไมโครโฟนถูกบล็อก! กรุณากดไอคอนแม่กุญแจ 🔒 หรือไมค์ที่แถบ URL บนสุด แล้วกด "อนุญาต (Allow)" การใช้ไมโครโฟน');
            this.isListening.set(false);
            this.stopAudioMeter();
          } else if (event.error === 'network') {
            this.speechError.set('⚠️ ไม่สามารถเชื่อมต่อระบบเสียง Google ได้ (กรุณาใช้ปุ่มลัดคีย์เวิร์ดคลิกเดียวแทน)');
            this.isListening.set(false);
            this.stopAudioMeter();
          } else if (event.error !== 'no-speech') {
            this.speechError.set(`สถานะเสียง: ${event.error}`);
          }
        });
      };

      this.recognition.onend = () => {
        this.ngZone.run(() => {
          if (this.isListening()) {
            try {
              this.recognition.start();
            } catch (e) {
              this.isListening.set(false);
              this.stopAudioMeter();
            }
          }
        });
      };
      return true;
    } catch (e: any) {
      console.warn('Init speech exception:', e);
      this.speechSupported.set(false);
      this.speechError.set('ไม่สามารถเริ่มต้นระบบรับเสียงได้');
      return false;
    }
  }

  // Real-time Web Audio Volume Analyser (พิสูจน์ว่าไมค์จับเสียงได้จริง)
  private async startAudioMeter() {
    try {
      if (typeof window === 'undefined' || !navigator?.mediaDevices?.getUserMedia) return;
      this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.audioContext = new AudioCtx();
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      const source = this.audioContext.createMediaStreamSource(this.micStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        if (!this.isListening() || !this.analyser) return;
        this.analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const vol = Math.min(100, Math.round((avg / 128) * 100));

        this.ngZone.run(() => {
          this.micVolumeLevel.set(vol);
          if (vol > 6) {
            this.isSoundDetected.set(true);
            this.lastSoundTime.set(new Date().toLocaleTimeString('th-TH'));
          }
        });

        this.animFrameId = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (e) {
      console.warn('Audio meter initialization notice (mic permission):', e);
    }
  }

  private stopAudioMeter() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach(t => t.stop());
      this.micStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch (e) {}
      this.audioContext = null;
    }
    this.micVolumeLevel.set(0);
  }

  toggleSpeechListening() {
    const ready = this.ensureSpeechRecognition();
    if (!ready) return;

    if (this.isListening()) {
      this.isListening.set(false);
      try {
        this.recognition.stop();
      } catch (e) {}
      this.stopAudioMeter();
      this.speechStatusMessage.set('หยุดดักฟังเสียงแล้ว');
    } else {
      this.isListening.set(true);
      this.speechTranscript.set('');
      this.speechMatchedQuestion.set(null);
      this.speechAiAnswer.set(null);
      this.speechError.set(null);
      this.isSoundDetected.set(false);
      this.startAudioMeter();
      try {
        this.recognition.start();
        this.speechStatusMessage.set('🎤 ไมค์กำลังทำงานสด... ได้ยินเสียงแล้วจะดึงคำตอบขึ้นมาทันที');
      } catch (e: any) {
        console.warn('Start recognition error:', e);
        this.isListening.set(false);
        this.stopAudioMeter();
        this.speechError.set('เกิดข้อผิดพลาดในการเปิดไมโครโฟน: ' + (e.message || ''));
      }
    }
  }

  clearSpeechData() {
    this.speechTranscript.set('');
    this.speechMatchedQuestion.set(null);
    this.speechAiAnswer.set(null);
    this.isSoundDetected.set(false);
    this.speechStatusMessage.set('ล้างข้อมูลเสียงแล้ว พร้อมจับคำถามใหม่');
  }

  // 1-Click Fast Emergency Keyword Chip
  selectQuickKeyword(qId: number) {
    const target = this.questions().find(q => q.id === qId);
    if (target) {
      this.speechMatchedQuestion.set(target);
      this.speechAiAnswer.set(null);
      this.speechTranscript.set(target.keywordHook);
    }
  }

  private matchQuestionFromSpeech(text: string) {
    const lower = text.toLowerCase();
    const list = this.questions();

    let matched: InterviewQuestion | undefined;

    if (lower.includes('แนะนำ') || lower.includes('ชื่อ') || lower.includes('จบจาก') || lower.includes('เกรด') || lower.includes('gpax') || lower.includes('ปวส') || lower.includes('แนะนำตัว')) {
      matched = list.find(q => q.id === 1);
    } else if (lower.includes('ทำไม') || lower.includes('มทร') || lower.includes('ธัญบุรี') || lower.includes('คลองหก') || lower.includes('เลือก') || lower.includes('สถาบัน')) {
      matched = list.find(q => q.id === 2);
    } else if (lower.includes('เอาไหม') || lower.includes('เอาเลย') || lower.includes('ยืนยัน') || lower.includes('สละสิทธิ์') || lower.includes('ที่อื่น') || lower.includes('ติด')) {
      matched = list.find(q => q.id === 3);
    } else if (lower.includes('โปรเจกต์') || lower.includes('โครงการ') || lower.includes('บอร์ด') || lower.includes('esp') || lower.includes('เซนเซอร์') || lower.includes('ฮาร์ดแวร์') || lower.includes('ระบบ') || lower.includes('smart light') || lower.includes('allight') || lower.includes('หลอดไฟ') || lower.includes('โคมไฟ') || lower.includes('relay') || lower.includes('ldr')) {
      matched = list.find(q => q.id === 4);
    } else if (lower.includes('กี่คน') || lower.includes('หน้าที่') || lower.includes('รับผิดชอบ') || lower.includes('กลุ่ม') || lower.includes('ทำคนเดียว') || lower.includes('ทำเอง')) {
      matched = list.find(q => q.id === 5);
    } else if (lower.includes('ฝึกงาน') || lower.includes('บริษัท') || lower.includes('สถานประกอบการ') || lower.includes('ทำงาน') || lower.includes('โปรเกรส') || lower.includes('ศาล')) {
      matched = list.find(q => q.id === 6);
    } else if (lower.includes('โค้ด') || lower.includes('ภาษา') || lower.includes('เขียนโปรแกรม') || lower.includes('python') || lower.includes('c++') || lower.includes('c') || lower.includes('embedded') || lower.includes('javascript') || lower.includes('ถนัด')) {
      matched = list.find(q => q.id === 7);
    } else if (lower.includes('คำนวณ') || lower.includes('คณิต') || lower.includes('แคล') || lower.includes('ฟิสิกส์') || lower.includes('เลข') || lower.includes('ไหวไหม')) {
      matched = list.find(q => q.id === 8);
    } else if (lower.includes('เวลา') || lower.includes('หนัก') || lower.includes('งานประจำ') || lower.includes('3 ปี') || lower.includes('ทุ่มเท') || lower.includes('ดรอป')) {
      matched = list.find(q => q.id === 9);
    } else if (lower.includes('จบไป') || lower.includes('อนาคต') || lower.includes('ตำแหน่ง') || lower.includes('อยากเป็น') || lower.includes('อาชีพ')) {
      matched = list.find(q => q.id === 10);
    } else if (lower.includes('ตก') || lower.includes('ติด f') || lower.includes('แก้ปัญหา') || lower.includes('ยาก')) {
      matched = list.find(q => q.id === 11);
    } else if (lower.includes('ถามอะไร') || lower.includes('สงสัย') || lower.includes('เพิ่มเติม') || lower.includes('ปิดท้าย')) {
      matched = list.find(q => q.id === 12);
    } else if (lower.includes('เกียรติบัตร') || lower.includes('ใบประกาศ') || lower.includes('ใบรับรอง') || lower.includes('certificate') || lower.includes('ใบเซอร์') || lower.includes('ไซเบอร์') || lower.includes('cryptography') || lower.includes('เข้ารหัส') || lower.includes('mooc')) {
      matched = list.find(q => q.id === 13);
    } else {
      matched = list.find(q =>
        lower.split(' ').some(w => w.length > 2 && (q.question.toLowerCase().includes(w) || q.keywordHook.toLowerCase().includes(w)))
      );
    }

    if (matched) {
      this.speechMatchedQuestion.set(matched);
      this.speechAiAnswer.set(null);
      this.speechStatusMessage.set(`🎯 ตรวจพบคำถามเตรียมพร้อม: "${matched.question.substring(0, 32)}..."`);
    } else {
      // Find in AI Knowledge Bank or dynamically generate sentence-by-sentence response!
      const aiResponse = this.findOrGenerateAiAnswer(text);
      this.speechMatchedQuestion.set(null);
      this.speechAiAnswer.set(aiResponse);
      this.speechStatusMessage.set(`🤖 ผู้ช่วย AI สร้างบทตอบ 3 ประโยคสำหรับ: "${text.substring(0, 25)}..."`);
    }
  }

  // =========================================================================
  // AI ASSISTANT ENGINE (บอกคำตอบทีละประโยคสำหรับคำถามนอกเหนือ)
  // =========================================================================
  findOrGenerateAiAnswer(query: string): AiSentenceAnswer {
    const q = query.trim().toLowerCase();
    if (!q) {
      return AI_KNOWLEDGE_BANK[0];
    }

    // Match keywords or topic in AI_KNOWLEDGE_BANK
    const found = AI_KNOWLEDGE_BANK.find(item =>
      item.keywords.some(k => q.includes(k.toLowerCase())) ||
      item.topic.toLowerCase().includes(q)
    );
    if (found) {
      return found;
    }

    // Dynamic AI Fallback 3-sentence script generator
    const cleanTopic = query.replace(/[?？.,!]/g, '').trim();
    return {
      id: 'dynamic-' + Date.now(),
      topic: cleanTopic || 'คำถามสัมภาษณ์เฉพาะทาง',
      category: 'custom',
      categoryLabel: '🤖 AI วิเคราะห์คำถามสด',
      keywords: [cleanTopic],
      sentence1: `สำหรับประเด็นเรื่อง "${cleanTopic}" นี้ เป็นหัวข้อที่มีความสำคัญและผมให้ความสนใจอย่างมากครับอาจารย์`,
      sentence2: `จากพื้นฐานระดับ ปวส. ที่ผมเคยได้ลงมือปฏิบัติจริง ผมมองว่าหัวใจหลักคือการเข้าใจกระบวนการทำงาน การแก้ไขปัญหาตามสถานการณ์จริง และการไม่หยุดเรียนรู้สิ่งใหม่ครับ`,
      sentence3: `และหากได้รับโอกาสเข้าศึกษาต่อ วศ.บ.คอมพิวเตอร์ ที่ มทร.ธัญบุรี ผมพร้อมจะนำความรู้ส่วนนี้ไปต่อยอดทำแล็บและโปรเจกต์ระดับสูงอย่างเต็มที่แน่นอนครับ`,
      quickTips: 'ตอบด้วยน้ำเสียงหนักแน่น สบตากรรมการ ไม่ลังเล แสดงความกระตือรือร้น'
    };
  }

  selectAiTopic(item: AiSentenceAnswer) {
    this.speechAiAnswer.set(item);
    this.speechMatchedQuestion.set(null);
    this.speechTranscript.set(item.topic);
  }

  askAiAssistant(customQuery?: string) {
    const query = customQuery || this.aiSearchQuery();
    if (!query.trim()) return;
    const result = this.findOrGenerateAiAnswer(query);
    this.activeAiAnswer.set(result);
    this.speechAiAnswer.set(result);
    this.speechMatchedQuestion.set(null);
  }

  copySentence(text: string, index: number) {
    navigator.clipboard.writeText(text).then(() => {
      this.copiedSentenceIndex.set(index);
      setTimeout(() => {
        if (this.copiedSentenceIndex() === index) {
          this.copiedSentenceIndex.set(null);
        }
      }, 1500);
    });
  }

  copyFullAiAnswer(item: AiSentenceAnswer) {
    const full = `หัวข้อ: ${item.topic}\nประโยคที่ 1: ${item.sentence1}\nประโยคที่ 2: ${item.sentence2}\nประโยคที่ 3: ${item.sentence3}`;
    navigator.clipboard.writeText(full).then(() => {
      this.copiedSentenceIndex.set(999);
      setTimeout(() => {
        if (this.copiedSentenceIndex() === 999) {
          this.copiedSentenceIndex.set(null);
        }
      }, 1500);
    });
  }

  toggleHowItWorks() {
    this.showHowItWorks.update(v => !v);
  }

  // =========================================================================
  // EDITING CAPABILITIES
  // =========================================================================
  startEditing(q: InterviewQuestion) {
    this.editingQuestionId.set(q.id);
    this.editForm.set({
      question: q.question,
      keywordHook: q.keywordHook,
      punchline: q.punchline,
      neverSay: q.neverSay,
    });
  }

  cancelEditing() {
    this.editingQuestionId.set(null);
  }

  saveEditing(id: number) {
    const form = this.editForm();
    this.questions.update(list =>
      list.map(q => {
        if (q.id === id) {
          return {
            ...q,
            question: form.question.trim() || q.question,
            keywordHook: form.keywordHook.trim() || q.keywordHook,
            punchline: form.punchline.trim() || q.punchline,
            neverSay: form.neverSay.trim() || q.neverSay,
          };
        }
        return q;
      })
    );
    this.editingQuestionId.set(null);
  }

  resetSingleQuestion(id: number) {
    const defaultQ = DEFAULT_QUESTIONS.find(dq => dq.id === id);
    if (!defaultQ) return;
    this.questions.update(list =>
      list.map(q => (q.id === id ? { ...defaultQ } : q))
    );
    if (this.editingQuestionId() === id) {
      this.editForm.set({
        question: defaultQ.question,
        keywordHook: defaultQ.keywordHook,
        punchline: defaultQ.punchline,
        neverSay: defaultQ.neverSay,
      });
    }
  }

  resetAllToDefault() {
    if (confirm('ต้องการรีเซ็ตคำถามและข้อความทั้งหมดกลับเป็นค่าเริ่มต้นใช่หรือไม่?')) {
      this.questions.set(JSON.parse(JSON.stringify(DEFAULT_QUESTIONS)));
      try {
        localStorage.removeItem('prom_samur_custom_questions');
        localStorage.removeItem('prom_samur_custom_questions_v2');
        localStorage.removeItem('prom_samur_custom_questions_v3');
        localStorage.removeItem('prom_samur_custom_questions_v4');
      } catch (e) {}
    }
  }

  addNewQuestion() {
    const newId = Date.now();
    const newQ: InterviewQuestion = {
      id: newId,
      category: 'extra',
      categoryLabel: 'คำถามที่ฉันเพิ่มเอง',
      question: 'คำถามใหม่ที่ฉันต้องการเตรียม...',
      importance: 'high',
      importanceLabel: 'คำถามของฉัน',
      keywordHook: 'คีย์เวิร์ดจำ 3 คำ',
      punchline: 'ประโยคตอบที่ฉันเตรียมไว้...',
      neverSay: 'สิ่งที่ไม่ควรตอบ...',
      tags: ['กำหนดเอง'],
      isCustom: true
    };
    this.questions.update(list => [...list, newQ]);
    this.startEditing(newQ);
  }

  deleteQuestion(id: number) {
    if (confirm('ต้องการลบคำถามนี้ใช่หรือไม่?')) {
      this.questions.update(list => list.filter(q => q.id !== id));
      if (this.editingQuestionId() === id) {
        this.editingQuestionId.set(null);
      }
    }
  }

  resetAllProgress() {
    if (confirm('รีเซ็ตความคืบหน้าการจำใช่หรือไม่?')) {
      this.preparedQuestionIds.set(new Set<number>());
      this.completedChecklistIds.set(new Set<string>());
      try {
        localStorage.removeItem('prom_samur_q_progress');
        localStorage.removeItem('prom_samur_c_progress');
      } catch (e) {}
    }
  }

  // Mock Simulator Methods
  nextMockQuestion() {
    this.mockQuestionIndex.update(idx => (idx + 1) % this.questions().length);
    this.resetTimer();
  }

  prevMockQuestion() {
    const len = this.questions().length;
    this.mockQuestionIndex.update(idx => (idx - 1 + len) % len);
    this.resetTimer();
  }

  randomizeMockQuestion() {
    const len = this.questions().length;
    if (len <= 1) return;
    let newIdx = Math.floor(Math.random() * len);
    if (newIdx === this.mockQuestionIndex()) {
      newIdx = (newIdx + 1) % len;
    }
    this.mockQuestionIndex.set(newIdx);
    this.resetTimer();
  }

  setTimerDuration(seconds: number) {
    this.timerMaxSeconds.set(seconds);
    this.resetTimer();
  }

  toggleTimer() {
    if (this.isTimerRunning()) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer() {
    if (this.timerSeconds() <= 0) {
      this.timerSeconds.set(this.timerMaxSeconds());
    }
    this.isTimerRunning.set(true);
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timerSeconds.update(s => {
        if (s <= 1) {
          this.pauseTimer();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  pauseTimer() {
    this.isTimerRunning.set(false);
    clearInterval(this.timerInterval);
  }

  resetTimer() {
    this.pauseTimer();
    this.timerSeconds.set(this.timerMaxSeconds());
  }

  formatTime(totalSec: number): string {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  async toggleWebcam() {
    if (this.webcamActive()) {
      this.stopWebcam();
    } else {
      await this.startWebcam();
    }
  }

  async startWebcam() {
    this.webcamError.set(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false
        });
        this.webcamActive.set(true);
        setTimeout(() => {
          if (this.webcamVideoRef?.nativeElement && this.mediaStream) {
            this.webcamVideoRef.nativeElement.srcObject = this.mediaStream;
            this.webcamVideoRef.nativeElement.play().catch(e => console.warn('Play error:', e));
          }
        }, 100);
      } else {
        this.webcamError.set('เบราว์เซอร์นี้ไม่รองรับการเปิดกล้อง');
      }
    } catch (err: any) {
      this.webcamError.set('กรุณากดอนุญาตให้ใช้กล้องในเบราว์เซอร์');
      this.webcamActive.set(false);
    }
  }

  stopWebcam() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.webcamVideoRef?.nativeElement) {
      this.webcamVideoRef.nativeElement.srcObject = null;
    }
    this.webcamActive.set(false);
  }

  ngOnDestroy() {
    clearInterval(this.timerInterval);
    this.stopWebcam();
    this.stopAudioMeter();
    try {
      this.recognition?.stop();
    } catch (e) {}
  }

  private loadTheme() {
    try {
      const savedTheme = localStorage.getItem('prom_samur_dark_mode');
      if (savedTheme !== null) {
        this.isDarkMode.set(savedTheme === 'true');
      } else {
        this.isDarkMode.set(true); // default to dark theme as requested
      }
    } catch (e) {}
  }

  private loadQuestions() {
    try {
      // Clear legacy storage v1, v2, v3, v4 so concise portfolio questions take precedence
      localStorage.removeItem('prom_samur_custom_questions');
      localStorage.removeItem('prom_samur_custom_questions_v2');
      localStorage.removeItem('prom_samur_custom_questions_v3');
      localStorage.removeItem('prom_samur_custom_questions_v4');

      const saved = localStorage.getItem('prom_samur_custom_questions_v5');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.questions.set(parsed);
          return;
        }
      }
    } catch (e) {}
    this.questions.set(JSON.parse(JSON.stringify(DEFAULT_QUESTIONS)));
  }

  private loadProgress() {
    try {
      const qData = localStorage.getItem('prom_samur_q_progress');
      if (qData) {
        const arr = JSON.parse(qData);
        if (Array.isArray(arr)) this.preparedQuestionIds.set(new Set(arr));
      }
      const cData = localStorage.getItem('prom_samur_c_progress');
      if (cData) {
        const arr = JSON.parse(cData);
        if (Array.isArray(arr)) this.completedChecklistIds.set(new Set(arr));
      }
    } catch (e) {}
  }
}
