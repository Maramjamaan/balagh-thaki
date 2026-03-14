<div align="center">

# 🚧 أولى | Awla

**نظام ذكي لإدارة بلاغات الحفريات وحساب أولوياتها في الرياض**  
**AI-powered excavation permit reporting & priority scoring system for Riyadh**

🔗 **[عرض مباشر | Live Demo](https://awla1.replit.app/)**

</div>

-----

## 📌 عن المشروع | About

**بالعربي:**  
أولى هو إضافة مقترحة لتطبيق **مدينتي** التابع لأمانة الرياض، متخصصة في رصد بلاغات الحفريات وحساب أولوياتها تلقائياً — لضمان معالجة الحفريات الأكثر تأثيراً على المواطن أولاً.

**In English:**  
Awla is a proposed feature extension for **Mdinatyapp** by Amanah Riyadh, focused specifically on excavation monitoring. It automatically scores and ranks excavation reports by priority, ensuring the highest-impact cases are addressed first.

-----

## ✨ المميزات | Features

|الميزة                                |Feature                                              |
|--------------------------------------|-----------------------------------------------------|
|رفع بلاغات الحفريات مع الموقع والتصنيف|Excavation report submission with location & category|
|حساب أولوية كل حفرية تلقائياً          |Automatic AI priority scoring per excavation         |
|متابعة حالة البلاغ بعد الرفع          |Real-time status tracking                            |
|لوحة تحكم مرتبة حسب الأولوية          |Priority-ranked dashboard view                       |
|واجهة تعمل على الجوال والكمبيوتر      |Fully responsive UI                                  |

-----

## 🧠 آلية حساب الأولوية | Priority Score Logic

كل بلاغ حفرية يحصل على نقاط بناءً على:  
Each excavation report is scored based on:

1. **نوع الحفرية | Excavation Type** — بعض الأنواع تأخذ وزناً أعلى بناءً على خطورتها | Some types carry higher base weights based on risk level
1. **الكثافة الجغرافية | Geographic Density** — الحفريات المتكررة في نفس المنطقة ترفع الأولوية | Clustered excavations in the same area boost priority
1. **التكرار | Recurrence** — كلما تكرر البلاغ، ارتفعت درجته | Repeated reports increase the score over time

-----

## 🛠️ التقنيات | Tech Stack

|الطبقة  |التقنية |
|--------|--------|
|Frontend|React.js|
|Hosting |Replit  |

-----

## 🚀 تشغيل المشروع | Getting Started

```bash
# استنساخ المستودع | Clone the repository
git clone https://github.com/Maramjamaan/balagh-thaki.git

# تثبيت المكتبات | Install dependencies
cd balagh-thaki
npm install

# تشغيل الخادم المحلي | Run the development server
npm start
```

-----

## 👥 الفريق | Team

**فريق أولى | Team Awla**  
بُني بشغف خلال هاكاثون Vibe Coding 2026 من تنظيم أكاديمية طويق.  
Built during Vibe Coding Hackathon 2026, hosted by Tuwaiq Academy.

-----

## 📄 الترخيص | License

تم تطوير هذا المشروع في إطار هاكاثون. يسعدنا أي مساهمة أو بناء عليه.  
Developed as part of a hackathon. Feel free to explore and build on it.