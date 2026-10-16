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
    keywordHook: 'พุฒิพงศ์ + เทคนิคคอน + Full-Stack & Network + มทร.ธัญบุรี',
    punchline: 'สวัสดีครับอาจารย์ ผมชื่อ นายพุฒิพงศ์ ราชรักษ์ รหัสประจำตัวสอบ 0312805627 จบ ปวส. สาขาวิชาเทคโนโลยีสารสนเทศ จากวิทยาลัยเทคนิคนครศรีธรรมราช ครับ ผมมีความสนใจและเชี่ยวชาญด้าน Full-Stack Development และระบบ Computer Network & Infrastructure โดยมีผลงานพัฒนาเว็บแอป Todaprime ด้วย Angular และ Golang รวมถึงประสบการณ์ฝึกงานด้านระบบเครือข่ายและ Biometric ในสถานประกอบการจริง จึงตั้งใจอย่างยิ่งที่จะมาต่อยอดระดับปริญญาตรี วศ.บ.วิศวกรรมคอมพิวเตอร์ (เทียบโอน) ที่ มทร.ธัญบุรี ครับ',
    neverSay: 'ห้ามเล่าประวัติครอบครัว หรือเรื่องที่ไม่เกี่ยวกับสายการเรียน',
    tags: ['แนะนำตัว', 'พุฒิพงศ์', 'เทคนิคคอน', 'ปวส.']
  },
  {
    id: 2,
    category: 'intro',
    categoryLabel: 'เปิดตัว (เจอ 100%)',
    question: 'ทำไมถึงเลือก มทร.ธัญบุรี (คลองหก) สาขาวิศวกรรมคอมพิวเตอร์?',
    importance: 'mandatory',
    importanceLabel: '🔥 เจอแน่นอน 100% (อันดับ 2)',
    keywordHook: 'วิศวกรนักปฏิบัติ + หลักสูตรเทียบโอนเข้มข้น + อุปกรณ์แล็บจริง',
    punchline: 'เพราะ มทร.ธัญบุรี โดดเด่นระดับประเทศในเรื่อง "วิศวกรนักปฏิบัติ" มีหลักสูตรเทียบโอน วศ.บ.คอมพิวเตอร์ ที่แข็งแกร่งและออกแบบมาให้เด็ก ปวส. เทคโนโลยีสารสนเทศได้ต่อยอดตรงสายที่สุด ทั้งยังเปิดโอกาสให้ลงมือทำจริงกับห้องแล็บระบบเครือข่ายและฮาร์ดแวร์ที่ทันสมัยครับ',
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
    keywordHook: 'เอา 100% + มทร.ธัญบุรี คืออันดับหนึ่งในใจ',
    punchline: 'เอา 100% แน่นอนครับอาจารย์ มทร.ธัญบุรี คลองหก คือเป้าหมายอันดับหนึ่งที่ผมตั้งใจไว้คนเดียวในใจตั้งแต่แรก และพร้อมยืนยันสิทธิ์ทันทีโดยไม่ลังเลครับ',
    neverSay: 'ห้ามตอบว่า "ขอดูก่อนครับ" หรือ "รอผลอีกที่หนึ่ง"',
    tags: ['ยืนยันสิทธิ์', 'ความมุ่งมั่น', 'เอา 100%']
  },

  // ========================================================
  // หมวดโปรเจกต์ & ฝึกงาน ปวส.
  // ========================================================
  {
    id: 4,
    category: 'project',
    categoryLabel: 'โปรเจกต์ ปวส.',
    question: 'โปรเจกต์จบ / ผลงานเด่น ปวส. ทำอะไร ใช้อะไรทำ และมีประโยชน์อย่างไร?',
    importance: 'high',
    importanceLabel: 'สำคัญมาก',
    keywordHook: 'Todaprime (Angular 19 + Go) + Enterprise Network Research',
    punchline: 'ผลงานหลักของผมคือ "Todaprime" ระบบจัดการภารกิจและเตือนความจำอัจฉริยะแบบ Full-Stack ครับ โดย Frontend สร้างด้วย Angular 19 ร่วมกับ Web Audio API สังเคราะห์เสียงเตือน Pomodoro และ Backend พัฒนาด้วย Golang REST API สำหรับประมวลผลข้อมูลความเร็วสูง และมีงานวิจัย Enterprise Network Architecture ศึกษาการจัดสรร VLAN, Inter-VLAN Routing, DHCP Snooping และ Firewall ครับ',
    neverSay: 'ห้ามจำชื่อโค้ดหรืออุปกรณ์ที่ตัวเองใช้ไม่ได้',
    tags: ['โปรเจกต์ ปวส.', 'Todaprime', 'Angular', 'Golang', 'Network']
  },
  {
    id: 5,
    category: 'project',
    categoryLabel: 'โปรเจกต์ ปวส.',
    question: 'ในกลุ่มโปรเจกต์มีกี่คน ตัวน้องทำหน้าที่อะไรในงานจริง?',
    importance: 'technical',
    importanceLabel: 'วัดกึ๋น (ห้ามโกหก)',
    keywordHook: 'Full-Stack Lead + สถาปัตยกรรมระบบ + ทดสอบจริง',
    punchline: 'โปรเจกต์ Todaprime ผมออกแบบสถาปัตยกรรมและเขียนโค้ดทั้ง Full-Stack ด้วยตนเองครับ ส่วนงานโปรเจกต์ส่งมอบตอนฝึกงานและงานกลุ่มร่วมกับเพื่อนอีก 1 คน ผมรับหน้าที่หลักเป็น Lead Developer และ System Integrator ในการเชื่อมต่อ API, ฐานข้อมูล และการทดสอบเชื่อมโยงเครือข่ายหน้างานจริงครับ',
    neverSay: 'ห้ามบอกว่า "ทำคนเดียวหมดเลย" ในงานที่เป็นกลุ่ม หรือ "ช่วย ๆ กันทำ"',
    tags: ['หน้าที่', 'Full-Stack Lead', 'การทำงานเป็นทีม']
  },
  {
    id: 6,
    category: 'project',
    categoryLabel: 'โปรเจกต์ ปวส.',
    question: 'ตอน ปวส. ฝึกงานที่ไหนมา ได้ทำอะไร ได้ทักษะอะไรบ้าง?',
    importance: 'high',
    importanceLabel: 'สำคัญมาก',
    keywordHook: 'Progress Network Consult + Face Scan & CheckTime + Cat6 & Firewall',
    punchline: 'ผมฝึกงานที่ บริษัท โปรเกรส เน็ตเวิร์ค คอนซัลท์ จำกัด ในตำแหน่ง IT Support Technician ครับ ได้ทำงานจริงในการติดตั้งและตั้งค่าเครื่องสแกนใบหน้า Face Scan บันทึกเวลาเข้ากับ Server CheckTime และ MIS-School, ตรวจสอบและปลดล็อก Firewall TCP Port 4370 สำหรับ Auto Time Sync, เข้าหัวสายแลน Cat6 และติดตั้ง Computer Lab เครื่อง ThinkCentre ในสถานศึกษาจริงครับ',
    neverSay: 'ห้ามบ่นว่าที่ฝึกงานไม่ดี หรือให้ทำแต่งานชงกาแฟ',
    tags: ['ฝึกงาน', 'โปรเกรสเน็ตเวิร์ค', 'Face Scan', 'Network Cat6']
  },

  // ========================================================
  // หมวดสกิลคอมพิวเตอร์ & วิชาการ
  // ========================================================
  {
    id: 7,
    category: 'skills',
    categoryLabel: 'ทักษะคอมฯ',
    question: 'เขียนโค้ดภาษาอะไรเป็นบ้าง ถนัดภาษาไหนที่สุด?',
    importance: 'technical',
    importanceLabel: 'วัดกึ๋นทางเทคนิค',
    keywordHook: 'TypeScript/Angular + Golang REST API + Python & SQL',
    punchline: 'ภาษาที่ผมถนัดและใช้งานหลักคือ TypeScript บน Angular Framework สำหรับฝั่ง Frontend และภาษา Go (Golang) สำหรับพัฒนา REST API ฝั่ง Backend ครับ นอกจากนี้ยังมีพื้นฐานภาษา Python สำหรับการสคริปต์, C/C++ สำหรับไมโครคอนโทรลเลอร์ และภาษา SQL สำหรับจัดการฐานข้อมูลเชิงสัมพันธ์ครับ',
    neverSay: 'อย่าร่ายชื่อภาษาเยอะเกินจริงถ้าไม่เคยเขียนจริง',
    tags: ['Coding', 'Angular', 'Golang', 'TypeScript', 'SQL']
  },
  {
    id: 8,
    category: 'skills',
    categoryLabel: 'ทักษะคอมฯ',
    question: 'วิศวะคอมฯ คำนวณเยอะ (แคลคูลัส/ฟิสิกส์) คิดว่าจะไหวไหม ปรับตัวยังไง?',
    importance: 'high',
    importanceLabel: 'สำคัญมาก',
    keywordHook: 'ยอมรับตรงๆ + ติวปรับพื้นฐานล่วงหน้า + ขยันไม่ยอมแพ้',
    punchline: 'ยอมรับว่าพื้นฐานคณิตศาสตร์ของสายอาชีพอาจไม่แน่นเท่า ม.ปลาย แต่ผมไม่ย่อท้อครับ ผมได้เริ่มศึกษาคลิปติวปรับพื้นฐานแคลคูลัสและทฤษฎีคำนวณล่วงหน้าแล้ว และด้วยทักษะการปฏิบัติที่แน่นจากการเรียน ปวส. ผมมั่นใจว่าจะแบ่งเวลาทบทวนและผ่านพ้นทุกวิชาไปได้อย่างแน่นอนครับ',
    neverSay: 'ห้ามบอกว่า "เกลียดเลขมาก" หรือ "ไม่ชอบคำนวณเลย"',
    tags: ['แคลคูลัส', 'การปรับตัว', 'ความพร้อมเรียน']
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
    keywordHook: 'เรียนเต็มเวลา 100% + ทางบ้านพร้อมซัพพอร์ต + มุ่งมั่นจบ 3 ปี',
    punchline: 'ผมให้การเรียนภาคปกติเป็นอันดับหนึ่ง 100% ครับ ไม่มีภาระงานประจำที่กระทบเวลาเรียน และทางครอบครัวสนับสนุนค่าใช้จ่ายเต็มที่ตลอดหลักสูตร ผมพร้อมทุ่มเททำแล็บและโปรเจกต์วิจัยให้จบตามเกณฑ์ 3 ปีอย่างมีคุณภาพครับ',
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
    keywordHook: 'Software Engineer / Full-Stack + Cloud & Network + Certifications',
    punchline: 'เป้าหมายในสายอาชีพของผมคือ Software Engineer หรือ Full-Stack Developer ที่มีความเชี่ยวชาญด้าน Cloud & Network Infrastructure ครับ และระหว่างเรียนที่ มทร.ธัญบุรี ผมตั้งเป้าหมายจะสอบใบรับรองวิชาชีพมาตรฐานสากล เช่น Cisco หรือ Cloud Certificates เพิ่มเติมด้วยครับ',
    neverSay: 'ห้ามตอบว่า "อะไรก็ได้ครับ ขอแค่มีงานทำ"',
    tags: ['เป้าหมาย', 'Software Engineer', 'Full-Stack', 'Network']
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
    keywordHook: 'Systematic Debugging + Documentation + ขอคำปรึกษาอาจารย์',
    punchline: 'ผมจะใช้กระบวนการวิเคราะห์และ Debugging อย่างเป็นระบบ ค้นคว้า Technical Documentation และกรณีศึกษาในชุมชนนักพัฒนาก่อนครับ หากยังไม่ลุล่วงจะรีบขอคำชี้แนะจากอาจารย์ประจำวิชาและปรึกษาแลกเปลี่ยนกับเพื่อนในกลุ่ม เพื่อร่วมกันหาทางออกที่ถูกต้องครับ',
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
    keywordHook: 'ถามเรื่องงานวิจัย/แล็บภาควิชา + แสดงความกระตือรือร้น',
    punchline: 'อยากสอบถามอาจารย์ครับว่า สำหรับนักศึกษาเทียบโอน ปวส. ทางภาควิชาวิศวกรรมคอมพิวเตอร์มีแล็บวิจัยหรือกลุ่มโปรเจกต์นวัตกรรมด้าน Software & Network ตัวไหนที่สามารถเข้าไปช่วยเป็นผู้ช่วยวิจัยหรือร่วมทีมได้ตั้งแต่ช่วงปีแรกบ้างครับ?',
    neverSay: 'ห้ามตอบว่า "ไม่มีครับ" (การถามคำถามแสดงถึงความสนใจจริง)',
    tags: ['คำถามปิดท้าย', 'การเตรียมตัว', 'แล็บวิจัย']
  }
];

export interface AiSentenceAnswer {
  id: string;
  topic: string;
  category: 'tech' | 'attitude' | 'behavior' | 'rmutt' | 'academic' | 'custom';
  categoryLabel: string;
  keywords: string[];
  sentence1: string; // ประโยคที่ 1 (ประโยคเปิด - รับคำถาม & สร้างความมั่นใจ)
  sentence2: string; // ประโยคที่ 2 (ประโยคเนื้อหา - เชื่อมโยงประสบการณ์ ปวส. / ทฤษฎี)
  sentence3: string; // ประโยคที่ 3 (ประโยคปิด - ตอกย้ำความมุ่งมั่น & การพัฒนาตนเอง)
  quickTips: string;  // ทริก 1 บรรทัด
}

export const AI_KNOWLEDGE_BANK: AiSentenceAnswer[] = [
  {
    id: 'ai-oop',
    topic: 'OOP (Object-Oriented Programming) คืออะไร มีหัวใจสำคัญอะไรบ้าง?',
    category: 'tech',
    categoryLabel: '💻 เทคนิคคอมฯ',
    keywords: ['oop', 'object oriented', 'คลาส', 'class', 'วัตถุ', 'encapsulation', 'inheritance', 'polymorphism', 'abstraction'],
    sentence1: 'OOP คือการเขียนโปรแกรมเชิงวัตถุที่มองฟังก์ชันและข้อมูลรวมกันเป็น Object เพื่อให้โค้ดเป็นระบบและนำกลับมาใช้ซ้ำได้ง่ายครับ',
    sentence2: 'โดยมี 4 เสาหลักคือ Encapsulation ซ่อนข้อมูล, Inheritance สืบทอดคุณสมบัติ, Polymorphism หลากหลายรูปแบบ, และ Abstraction ย่อส่วนแสดงเฉพาะสิ่งสำคัญครับ',
    sentence3: 'ในโปรเจกต์ ปวส. ผมนำ OOP มาสร้างคลาสจัดการฐานข้อมูล ทำให้เวลาแก้ระบบโค้ดอื่นไม่พัง และพร้อมต่อยอดโครงสร้างซอฟต์แวร์ระดับสูงที่ มทร.ธัญบุรี ครับ',
    quickTips: 'จำ 4 เสา: ซ่อนรูป สืบทอด แปลงร่าง และย่อส่วน'
  },
  {
    id: 'ai-db',
    topic: 'ฐานข้อมูล SQL กับ NoSQL ต่างกันอย่างไร และเลือกใช้อย่างไร?',
    category: 'tech',
    categoryLabel: '💻 เทคนิคคอมฯ',
    keywords: ['database', 'ฐานข้อมูล', 'sql', 'nosql', 'mysql', 'mongodb', 'relational', 'query'],
    sentence1: 'SQL เป็นฐานข้อมูลเชิงสัมพันธ์แบบมีโครงสร้างตารางชัดเจน ส่วน NoSQL เป็นแบบไม่มีตารางตายตัว เน้นความยืดหยุ่นและรองรับข้อมูลขนาดใหญ่ครับ',
    sentence2: 'ตอนทำโปรเจกต์ ปวส. ผมเลือกใช้ MySQL เพราะข้อมูลมีความสัมพันธ์กันแน่นอน เช่น ประวัติผู้ใช้และรายการอุปกรณ์ที่ต้องเชื่อมโยงกันอย่างแม่นยำครับ',
    sentence3: 'แต่ผมก็ตื่นเต้นที่จะได้ศึกษา NoSQL เช่น MongoDB เพิ่มเติม เพื่อรองรับการออกแบบ Big Data และ Cloud Architecture ในระดับ ป.ตรี ครับ',
    quickTips: 'บอกว่า SQL เน้นความแม่นยำ ส่วน NoSQL เน้นความยืดหยุ่น'
  },
  {
    id: 'ai-network',
    topic: 'ระบบ Network: TCP ต่างจาก UDP อย่างไร หรือเล่าเรื่อง OSI 7 Layer?',
    category: 'tech',
    categoryLabel: '💻 เทคนิคคอมฯ',
    keywords: ['network', 'เน็ตเวิร์ก', 'เครือข่าย', 'tcp', 'udp', 'osi', 'lan', 'router', 'ip'],
    sentence1: 'TCP เน้นความถูกต้องของข้อมูลแบบ Connection-Oriented มี 3-Way Handshake ส่วน UDP เน้นความเร็วสูงสุดโดยไม่รอตอบรับ เช่น วิดีโอสตรีมมิ่งครับ',
    sentence2: 'ตอนฝึกงาน ปวส. ผมเคยได้เข้าหัวสาย LAN คอนฟิก Router และตั้งค่า Static IP / Subnet Mask ให้แผนกต่าง ๆ ทำให้เข้าใจการทำงานจริงใน Layer 2 และ 3 ครับ',
    sentence3: 'ผมจึงตั้งใจมาเรียนต่อ วศ.บ.คอมฯ ที่นี่เพื่อลงแล็บอุปกรณ์ Cisco และตั้งเป้าหมายจะสอบใบรับรอง CCNA ให้ได้ก่อนเรียนจบครับ',
    quickTips: 'ยกตัวอย่าง TCP = ส่งไฟล์, UDP = สตรีมมิ่ง/VDO Call'
  },
  {
    id: 'ai-git',
    topic: 'Git และ GitHub คืออะไร เคยใช้ในการพัฒนาโปรเจกต์ไหม?',
    category: 'tech',
    categoryLabel: '💻 เทคนิคคอมฯ',
    keywords: ['git', 'github', 'version control', 'commit', 'branch', 'merge', 'repo'],
    sentence1: 'Git คือระบบ Version Control ที่คอยบันทึกประวัติการเปลี่ยนแปลงโค้ด ช่วยให้การทำงานร่วมกันเป็นทีมเป็นระเบียบและไม่ทับซ้อนกันครับ',
    sentence2: 'ผมใช้คำสั่งพื้นฐานอย่าง git clone, add, commit, push และฝึกแตก branch เพื่อทดลองเขียนโมดูลใหม่โดยไม่กระทบโค้ดหลักของทีมครับ',
    sentence3: 'การใช้ Git เป็นประจำตั้งแต่ ปวส. ทำให้ผมมั่นใจว่าสามารถปรับตัวเข้ากับการพัฒนาซอฟต์แวร์มาตรฐานในห้องแล็บของมหาวิทยาลัยได้อย่างรวดเร็วครับ',
    quickTips: 'เน้นย้ำเรื่องการแตก Branch เพื่อทดลองฟีเจอร์ใหม่'
  },
  {
    id: 'ai-docker',
    topic: 'Docker และ Container คืออะไร มีประโยชน์อย่างไรในงานคอมฯ?',
    category: 'tech',
    categoryLabel: '💻 เทคนิคคอมฯ',
    keywords: ['docker', 'container', 'คอนเทนเนอร์', 'virtualization', 'vm', 'devops', 'cloud'],
    sentence1: 'Docker คือเครื่องมือจำลองสภาพแวดล้อมระบบ (Container) ที่แพ็กเกจแอปพลิเคชันพร้อม Dependencies ให้รันได้เหมือนกันทุกเครื่องครับ',
    sentence2: 'ประโยชน์สูงสุดคือการตัดปัญหา "โค้ดรันผ่านบนเครื่องผมแต่รันไม่ได้บนเซิร์ฟเวอร์" และใช้ทรัพยากรเบากว่า Virtual Machine แบบดั้งเดิมมากครับ',
    sentence3: 'ผมได้ศึกษาคำสั่ง Dockerfile เบื้องต้น และมุ่งมั่นที่จะมาเรียนรู้การทำ CI/CD และการ Deploy ระบบ Cloud อย่างเข้มข้นในหลักสูตรนี้ครับ',
    quickTips: 'พูดคำสำคัญ: ตัดปัญหา Environment ไม่ตรงกัน'
  },
  {
    id: 'ai-low-grade',
    topic: 'ทำไมเกรดเฉลี่ย ปวส. ถึงได้น้อย หรือมีวิชาที่ได้เกรดไม่ดี?',
    category: 'attitude',
    categoryLabel: '🧠 ทัศนคติ & แก้ปัญหา',
    keywords: ['เกรดน้อย', 'เกรดต่ำ', 'ติด f', 'เกรดตก', 'คะแนนน้อย', 'ทำไมเกรด', 'ได้น้อย'],
    sentence1: 'ยอมรับตามตรงครับอาจารย์ว่าเกรดของผมอาจไม่ได้อยู่ในกลุ่มสูงสุด เพราะช่วงต้น ปวส. ผมปรับตัวและทุ่มเทเวลากับการลงมือทำแล็บโปรเจกต์เป็นหลักครับ',
    sentence2: 'แต่เกรดนี้แลกมาด้วยทักษะการปฏิบัติจริง การแก้ปัญหาเฉพาะหน้า และการเขียนโค้ดที่ผมลงมือทำเองทุกขั้นตอน ไม่เคยละทิ้งงานครับ',
    sentence3: 'บทเรียนนี้ทำให้ผมจัดสรรเวลาได้ดีขึ้นมาก และพร้อมทุ่มเททบทวนทฤษฎีควบคู่ปฏิบัติเพื่อพัฒนาเกรดให้ดียิ่งขึ้นในระดับ ป.ตรี ครับ',
    quickTips: 'ยอมรับตรงๆ ไม่โทษคนอื่น เน้นชูทักษะการปฏิบัติจริง'
  },
  {
    id: 'ai-team-conflict',
    topic: 'เคยมีความขัดแย้ง หรือทะเลาะกับเพื่อนในกลุ่มโปรเจกต์ไหม จัดการอย่างไร?',
    category: 'attitude',
    categoryLabel: '🧠 ทัศนคติ & แก้ปัญหา',
    keywords: ['ทะเลาะ', 'ขัดแย้ง', 'เพื่อนไม่ช่วย', 'มีปัญหาในทีม', 'ความเห็นไม่ตรงกัน', 'กลุ่ม'],
    sentence1: 'เคยมีแน่นอนครับอาจารย์ โดยเฉพาะเรื่องแนวคิดการเลือกเทคโนโลยีและกำหนดการส่งงานที่ไม่ตรงกันในตอนทำโปรเจกต์จบ ปวส. ครับ',
    sentence2: 'วิธีแก้ของผมคือ ดึงทุกคนมาคุยกันด้วยเหตุผล ยึดความสำเร็จของโปรเจกต์เป็นหลัก และแบ่งหน้าที่ใหม่ตามความถนัดของแต่ละคนอย่างชัดเจนครับ',
    sentence3: 'เหตุการณ์นั้นสอนให้ผมเข้าใจว่า การสื่อสารที่โปร่งใสและการรับฟัง คือหัวใจสำคัญที่สุดของการทำงานร่วมกันของวิศวกรครับ',
    quickTips: 'อย่าโยนความผิดให้เพื่อน ให้เล่าว่าคุยด้วยเหตุผลและแบ่งงานใหม่'
  },
  {
    id: 'ai-work-study',
    topic: 'มีแพลนจะทำงานไปด้วยเรียนไปด้วยไหม หรือมีงานนอกที่กระทบเวลาเรียนไหม?',
    category: 'behavior',
    categoryLabel: '💼 ความพร้อมเรียน',
    keywords: ['ทำงานไปด้วย', 'งานนอก', 'พาร์ทไทม์', 'part time', 'รับงาน', 'แบ่งเวลาทำงาน'],
    sentence1: 'ผมขอเรียนยืนยันว่า สำหรับหลักสูตรนี้ "การเรียนปริญญาตรีที่ มทร.ธัญบุรี คือเป้าหมายอันดับหนึ่ง" ของผมครับ',
    sentence2: 'ผมไม่มีภาระงานประจำใด ๆ และทางบ้านสนับสนุนค่าใช้จ่ายเต็มที่ ทำให้สามารถทุ่มเวลาให้กับการเข้าเรียนและทำแล็บภาคปกติได้ 100% ครับ',
    sentence3: 'หากมีงานเสริม จะเป็นเพียงโปรเจกต์เขียนโค้ดฝึกฝีมือสั้น ๆ ในวันหยุดที่ไม่กระทบเวลาเรียนอย่างแน่นอนครับ',
    quickTips: 'ย้ำคำว่า: การเรียนภาคปกติมาเป็นอันดับ 1 เสมอ'
  },
  {
    id: 'ai-hard-math',
    topic: 'วิศวะคอมฯ มีวิชาคำนวณยากมาก (แคลคูลัส/สถิติ/ฟิสิกส์) คิดว่าจะเรียนไหวไหม?',
    category: 'academic',
    categoryLabel: '📐 วิชาการ & คำนวณ',
    keywords: ['ตามไม่ทัน', 'ไม่ทันเพื่อน', 'คำนวณยาก', 'ฟิสิกส์', 'แคลคูลัส', 'เลข', 'คณิต'],
    sentence1: 'ผมยอมรับว่าเด็ก ปวส. พื้นฐานทฤษฎีคำนวณอาจไม่แน่นเท่า ม.ปลาย แต่ผมมีใจสู้และเตรียมพร้อมรับมือไว้แล้วครับ',
    sentence2: 'ผมได้เริ่มดูคลิปติวปรับพื้นฐานแคลคูลัสล่วงหน้า และตั้งใจจะจับคู่แลกเปลี่ยนความรู้กับเพื่อน โดยผมช่วยด้านแล็บปฏิบัติและขอคำแนะนำด้านทฤษฎีครับ',
    sentence3: 'ผมเชื่อมั่นว่าความขยัน การทำการบ้านสม่ำเสมอ และการกล้าเข้าหาอาจารย์ผู้สอน จะทำให้ผมผ่านพ้นทุกวิชาได้อย่างแน่นอนครับ',
    quickTips: 'จุดยืนคือ: ยอมรับจุดอ่อน แต่โชว์แผนเตรียมตัวล่วงหน้าชัดเจน'
  },
  {
    id: 'ai-not-accepted',
    topic: 'ถ้าผลสัมภาษณ์รอบโควตานี้ไม่ผ่าน หรือไม่ได้รับการคัดเลือก จะทำอย่างไร?',
    category: 'attitude',
    categoryLabel: '🧠 ทัศนคติ & แก้ปัญหา',
    keywords: ['ไม่ผ่าน', 'ไม่ติด', 'ไม่ติดโควตา', 'ตกสัมภาษณ์', 'ถ้าไม่ได้', 'สำรอง'],
    sentence1: 'ถ้าเป็นเช่นนั้นจริง ผมจะนำคำแนะนำของคณะกรรมการในวันนี้ไปทบทวนและพัฒนาจุดบกพร่องของตัวเองทันทีครับ',
    sentence2: 'เพราะเป้าหมายเดียวในใจของผมคือการเข้าศึกษา วศ.บ.คอมพิวเตอร์ ที่ มทร.ธัญบุรี ผมจะกลับมาสมัครในรอบถัดไปอย่างแน่นอนครับ',
    sentence3: 'แต่วันนี้ผมเตรียมตัวมาอย่างดีที่สุด 100% และหวังเป็นอย่างยิ่งว่าจะได้รับความไว้วางใจให้เข้าเรียนตั้งแต่รอบโควตานี้ครับ',
    quickTips: 'แสดงความมุ่งมั่นว่ายังไงก็เลือกที่นี่ ไม่เปลี่ยนใจไปที่อื่น'
  },
  {
    id: 'ai-tuition',
    topic: 'เรื่องค่าเทอมและค่าใช้จ่ายตลอดหลักสูตร มีความพร้อมหรือไม่?',
    category: 'behavior',
    categoryLabel: '💼 ความพร้อมเรียน',
    keywords: ['ค่าเทอม', 'ค่าใช้จ่าย', 'กู้', 'กยศ', 'เงิน', 'ทางบ้าน', 'สนับสนุน'],
    sentence1: 'เรื่องค่าใช้จ่ายทางการศึกษา ทางครอบครัวและตัวผมได้เตรียมการวางแผนไว้อย่างพร้อมเพรียงและรอบคอบครับ',
    sentence2: 'ผมได้ตรวจสอบโครงสร้างค่าธรรมเนียมการศึกษาของคณะวิศวกรรมศาสตร์แล้ว และทางบ้านพร้อมสนับสนุนการเรียนเต็มที่ตลอด 3 ปีครับ',
    sentence3: 'นอกจากนี้ผมยังมีแผนศึกษาเรื่องทุนการศึกษาของมหาวิทยาลัยและกองทุน กยศ. ควบคู่ไปด้วย เพื่อแบ่งเบาภาระครอบครัวครับ',
    quickTips: 'ตอบให้มั่นใจว่า ไม่มีปัญหาเรื่องค่าใช้จ่ายจนต้องดรอปเรียน'
  },
  {
    id: 'ai-why-rmutt-diff',
    topic: 'ทำไมถึงเลือก มทร.ธัญบุรี (คลองหก) ทำไมไม่เลือกพระจอมเกล้า หรือ มทร.อื่น?',
    category: 'rmutt',
    categoryLabel: '🏫 มทร.ธัญบุรี',
    keywords: ['พระจอม', 'มจพ', 'มทรอื่น', 'เกษตร', 'ทำไมไม่เลือก', 'เปรียบเทียบ', 'คลองหก'],
    sentence1: 'เพราะ มทร.ธัญบุรี คลองหก มีชื่อเสียงระดับแถวหน้าในเรื่อง "วิศวกรนักปฏิบัติ" ที่ตรงกับจุดแข็งของเด็กสายช่าง ปวส. มากที่สุดครับ',
    sentence2: 'หลักสูตรเทียบโอนที่นี่เปิดกว้าง มีความต่อเนื่องชัดเจน มีแล็บและเครื่องมือที่ทันสมัยเชื่อมโยงกับภาคอุตสาหกรรมจริงครับ',
    sentence3: 'ผมศึกษาผลงานรุ่นพี่ที่จบจากที่นี่พบว่าเป็นที่ยอมรับของตลาดแรงงานสูงมาก ที่นี่จึงเป็นเป้าหมายอันดับหนึ่งที่ผมตั้งใจมาตั้งแต่แรกครับ',
    quickTips: 'จุดขาย: วิศวกรนักปฏิบัติ + หลักสูตรเทียบโอนเข้มแข็งที่สุด'
  },
  {
    id: 'ai-ce-vs-cs',
    topic: 'วิศวกรรมคอมพิวเตอร์ (CE) แตกต่างจาก วิทยาการคอมพิวเตอร์ (CS) อย่างไร?',
    category: 'tech',
    categoryLabel: '💻 เทคนิคคอมฯ',
    keywords: ['วิทยาการคอม', 'cs', 'ce ต่าง', 'วิศวะคอมต่าง', 'ความต่าง', 'hardware software'],
    sentence1: 'CS จะมุ่งเน้นไปที่ทฤษฎีการคำนวณ อัลกอริทึม และซอฟต์แวร์แอปพลิเคชันเป็นหลักครับ',
    sentence2: 'แต่วิศวกรรมคอมพิวเตอร์ (CE) คือการบูรณาการระหว่าง Hardware, วงจรอิเล็กทรอนิกส์, ระบบสมองกลฝังตัว และซอฟต์แวร์เข้าด้วยกันทั้งระบบครับ',
    sentence3: 'ซึ่งตรงกับความถนัดของผมที่ชอบทั้งการเขียนโปรแกรมและการต่ออุปกรณ์จริง จึงมั่นใจว่าสายวิศวกรรมคอมพิวเตอร์คือคำตอบที่ใช่ที่สุดครับ',
    quickTips: 'สรุปสั้น: CS เน้นซอฟต์แวร์/ทฤษฎีล้วน, CE รวม Hardware + Software + Embedded'
  },
  {
    id: 'ai-hobbies',
    topic: 'เวลาว่าง หรือวันหยุด ชอบทำกิจกรรมอะไรที่เกี่ยวกับคอมพิวเตอร์?',
    category: 'behavior',
    categoryLabel: '💼 กิจกรรม & ทักษะ',
    keywords: ['งานอดิเรก', 'เวลาว่าง', 'ชอบทำอะไร', 'กิจกรรมว่าง', 'วันหยุด', 'ทำอะไรยามว่าง'],
    sentence1: 'เวลาว่างผมชอบติดตามข่าวสารเทคโนโลยี อัปเดตเครื่องมือพัฒนาซอฟต์แวร์ใหม่ ๆ และฝึกแก้โจทย์โค้ดดิ้งสั้น ๆ ครับ',
    sentence2: 'นอกจากนี้ผมยังชอบแกะประกอบคอมพิวเตอร์ และทดลองต่อวงจรไมโครคอนโทรลเลอร์เล่นเพื่อทดสอบเซนเซอร์ต่าง ๆ ครับ',
    sentence3: 'ทำให้การเรียนรู้ของผมเป็นเรื่องสนุก และทำให้ผมมีพื้นฐานพร้อมหยิบจับเทคโนโลยีใหม่ ๆ ได้อย่างมั่นใจเสมอครับ',
    quickTips: 'ตอบกิจกรรมที่เชื่อมโยงกับความกระตือรือร้นด้านคอมพิวเตอร์'
  },
  {
    id: 'ai-stress',
    topic: 'ถ้ามีงานโปรเจกต์ด่วน หรือเดดไลน์กระชั้นชิด จะรับมือกับความเครียดอย่างไร?',
    category: 'attitude',
    categoryLabel: '🧠 ทัศนคติ & แก้ปัญหา',
    keywords: ['งานด่วน', 'งานยาก', 'กดดัน', 'ความเครียด', 'เดดไลน์', 'deadline', 'ส่งไม่ทัน'],
    sentence1: 'เมื่อเจองานด่วน ผมจะเริ่มจากการตั้งสติและจัดลำดับความสำคัญของงาน (Priority) เพื่อโฟกัสชิ้นส่วนที่วิกฤตที่สุดก่อนครับ',
    sentence2: 'ผมจะแบ่งงานเป็นขั้นตอนย่อย กำหนดเป้าหมายรายชั่วโมง และหากพบอุปสรรคที่ไม่สามารถแก้ได้คนเดียว จะรีบขอคำปรึกษาจากทีมหรืออาจารย์ทันทีครับ',
    sentence3: 'ผมมองว่าความกดดันคือโอกาสฝึกฝนความเป็นมืออาชีพ และผมมุ่งมั่นส่งมอบผลงานที่มีคุณภาพตามกำหนดเวลาเสมอครับ',
    quickTips: 'คีย์เวิร์ด: ตั้งสติ, จัดลำดับความสำคัญ (Priority), สื่อสารเร็ว'
  },
  {
    id: 'ai-strength-weakness',
    topic: 'จุดแข็ง (ข้อดี) และจุดอ่อน (ข้อเสีย) ของตัวเองคืออะไร?',
    category: 'attitude',
    categoryLabel: '🧠 ทัศนคติ & แก้ปัญหา',
    keywords: ['ข้อดี', 'ข้อเสีย', 'จุดแข็ง', 'จุดอ่อน', 'ตัวเอง', 'นิสัย'],
    sentence1: 'จุดแข็งของผมคือ "ความอดทนและไม่ยอมแพ้ต่อปัญหา" เมื่อเจอบั๊กหรือระบบทำงานผิดพลาด ผมจะค้นคว้าจนกว่าจะหาสาเหตุและแก้ได้สำเร็จครับ',
    sentence2: 'ส่วนจุดอ่อนคือ ในอดีตผมอาจจะมัวแต่ลงลึกในรายละเอียดเล็ก ๆ จนใช้เวลามากเกินไปครับ',
    sentence3: 'ซึ่งปัจจุบันผมปรับปรุงโดยการกำหนดกรอบเวลาชัดเจน (Time-boxing) และมองภาพรวมก่อนลงมือ ทำให้ทำงานได้รวดเร็วและมีประสิทธิภาพยิ่งขึ้นครับ',
    quickTips: 'จุดอ่อนต้องบอกวิธีแก้ไขให้เห็นว่าเราปรับปรุงแล้ว'
  },
  {
    id: 'ai-api',
    topic: 'API หรือ RESTful API คืออะไร มีบทบาทอย่างไรในการสร้างระบบ?',
    category: 'tech',
    categoryLabel: '💻 เทคนิคคอมฯ',
    keywords: ['api', 'rest', 'restful', 'json', 'http', 'endpoint', 'เชื่อมต่อ'],
    sentence1: 'API คือตัวกลางที่เปิดให้โปรแกรมหรือระบบที่ต่างกันสามารถสื่อสารและแลกเปลี่ยนข้อมูลกันได้อย่างเป็นมาตรฐานครับ',
    sentence2: 'โดย RESTful API ใช้เมธอด HTTP เช่น GET, POST, PUT, DELETE และส่งข้อมูลในรูปแบบ JSON ซึ่งทำให้ Frontend เชื่อมต่อกับ Backend ได้อย่างอิสระครับ',
    sentence3: 'ในโปรเจกต์ ปวส. ผมเคยเขียน API ดึงข้อมูลจากเซนเซอร์ส่งไปบันทึกลงฐานข้อมูล จึงเข้าใจการทำงานของ Request และ Response เป็นอย่างดีครับ',
    quickTips: 'บอกว่า API เหมือนตัวกลางส่งสารระหว่าง Frontend และ Backend'
  },
  {
    id: 'ai-linux',
    topic: 'เคยใช้งานระบบปฏิบัติการ Linux หรือ Command Line มาบ้างไหม?',
    category: 'tech',
    categoryLabel: '💻 เทคนิคคอมฯ',
    keywords: ['linux', 'ubuntu', 'command line', 'terminal', 'shell', 'os', 'ระบบปฏิบัติการ'],
    sentence1: 'เคยใช้งานครับ โดยเฉพาะการใช้งานระบบปฏิบัติการ Ubuntu สำหรับรันโปรเจกต์และทดลองติดตั้ง Web Server ครับ',
    sentence2: 'ผมคุ้นเคยกับคำสั่งพื้นฐานใน Terminal เช่น การจัดการไฟล์ cd, ls, nano, การตั้งสิทธิ์ chmod, และการติดตั้งแพ็กเกจด้วย apt ครับ',
    sentence3: 'การมีพื้นฐาน Linux ทำให้ผมมั่นใจว่าจะสามารถเรียนรู้วิชาสถาปัตยกรรมระบบคอมพิวเตอร์และระบบเครือข่ายที่ มทร.ธัญบุรี ได้อย่างราบรื่นครับ',
    quickTips: 'ระบุชื่อ Distro ที่เคยใช้ เช่น Ubuntu และคำสั่งพื้นฐาน'
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

  // Navigation & View Mode
  activeTab = signal<'cheat' | 'ai-assistant' | 'checklist' | 'mock' | 'official'>('cheat');
  selectedCategory = signal<string>('all');
  searchQuery = signal<string>('');
  copiedQuestionId = signal<number | null>(null);

  // Dynamic Editable Questions Signal
  questions = signal<InterviewQuestion[]>([]);

  // Authentic Candidate Profile Info
  candidateProfile = {
    name: 'นายพุฒิพงศ์ ราชรักษ์',
    nameEn: 'Mr. Puttipong Racharak',
    examId: '0312805627',
    orderNum: 28,
    majorCode: '19104000128',
    majorName: 'วิศวกรรมคอมพิวเตอร์ (โดยวิธีการเทียบโอน) ภาคปกติ',
    faculty: 'คณะวิศวกรรมศาสตร์ มหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี (มทร.ธัญบุรี คลองหก)',
    prevCollege: 'วิทยาลัยเทคนิคนครศรีธรรมราช',
    prevMajor: 'สาขาวิชาเทคโนโลยีสารสนเทศ (ปวส.)',
    phone: '098-017-8005',
    email: 'cenbu20@gmail.com',
    github: 'LOOKSx',
    githubRepo: 'https://github.com/LOOKSx/take-a-test.git',
    internship: 'บริษัท โปรเกรส เน็ตเวิร์ค คอนซัลท์ จำกัด (IT Support Technician)',
    featuredProjects: 'Todaprime (Angular 19 + Golang REST API) & Enterprise Network Architecture',
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
      title: 'โปรเจกต์ Todaprime & ผลงานฝึกงาน (เตรียมไว้เผื่อแชร์หน้าจอ)',
      description: 'เปิดเว็บ Todaprime หรือสไลด์นำเสนอผลการฝึกงานสแตนด์บายไว้ เผื่อกรรมการขอให้ Share Screen',
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
        localStorage.setItem('prom_samur_custom_questions_v2', JSON.stringify(qs));
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
    } else if (lower.includes('โปรเจกต์') || lower.includes('โครงการ') || lower.includes('บอร์ด') || lower.includes('esp') || lower.includes('เซนเซอร์') || lower.includes('ฮาร์ดแวร์') || lower.includes('ระบบ')) {
      matched = list.find(q => q.id === 4);
    } else if (lower.includes('กี่คน') || lower.includes('หน้าที่') || lower.includes('รับผิดชอบ') || lower.includes('กลุ่ม') || lower.includes('ทำคนเดียว')) {
      matched = list.find(q => q.id === 5);
    } else if (lower.includes('ฝึกงาน') || lower.includes('บริษัท') || lower.includes('สถานประกอบการ') || lower.includes('ทำงาน')) {
      matched = list.find(q => q.id === 6);
    } else if (lower.includes('โค้ด') || lower.includes('ภาษา') || lower.includes('เขียนโปรแกรม') || lower.includes('python') || lower.includes('c++') || lower.includes('java') || lower.includes('sql') || lower.includes('ถนัด')) {
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
        localStorage.removeItem('prom_samur_custom_questions_v2');
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
      const saved = localStorage.getItem('prom_samur_custom_questions_v2');
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
