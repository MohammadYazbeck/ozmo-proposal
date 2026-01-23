const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const enData = {
  hero: {
    title: "Social Media Growth Proposal",
    subtitle: "Ozmo Agency",
    introduction:
      "This proposal outlines a focused 90-day plan to elevate your brand presence, grow engagement, and turn social attention into qualified leads."
  },
  visionHtml:
    "<p>We see social as your most valuable brand touchpoint. Our vision is to shape a consistent voice, design a scroll-stopping feed, and build a high-performing content engine.</p>",
  goals: [
    "Increase audience growth across key platforms",
    "Lift engagement rate with stronger storytelling",
    "Generate inbound inquiries from qualified leads"
  ],
  workPlan: [
    {
      number: 1,
      heading: "Discovery & Audit",
      leadText: "We start by mapping the current performance baseline.",
      bullets: [
        { text: "Account audit and competitor scan", highlightColor: "#FED7AA" },
        { text: "Define brand voice and content pillars" }
      ]
    },
    {
      number: 2,
      heading: "Content Strategy",
      leadText: "A clear content system to keep momentum.",
      bullets: [
        { text: "Monthly content calendar with themes" },
        { text: "Creative direction and visual moodboard" }
      ]
    },
    {
      number: 3,
      heading: "Production",
      leadText: "We craft assets that feel premium and native.",
      bullets: [
        { text: "Short-form video concepts and scripts", highlightColor: "#FDBA74" },
        { text: "Design templates for consistent branding" }
      ]
    },
    {
      number: 4,
      heading: "Publishing & Community",
      leadText: "Always-on publishing with strong engagement.",
      bullets: [
        { text: "Post scheduling and caption writing" },
        { text: "Comment moderation and community prompts" }
      ]
    },
    {
      number: 5,
      heading: "Optimization",
      leadText: "Weekly reporting and iteration.",
      bullets: [
        { text: "Analytics review and best-performer remixing" },
        { text: "A/B tests on hooks and formats" }
      ]
    },
    {
      number: 6,
      heading: "Growth Experiments",
      leadText: "Targeted growth experiments to scale.",
      bullets: [
        { text: "Creator collaborations shortlist" },
        { text: "Paid boost recommendations" }
      ]
    }
  ],
  pricing: [
    {
      name: "Starter",
      price: "$1,200 / month",
      points: ["12 posts", "2 reels", "Monthly report"]
    },
    {
      name: "Growth",
      price: "$2,500 / month",
      points: ["20 posts", "6 reels", "Bi-weekly reporting"]
    },
    {
      name: "Signature",
      price: "$4,000 / month",
      points: ["30 posts", "10 reels", "Weekly insights + strategy"]
    }
  ],
  notesHtml:
    "<p>Timeline starts within 7 business days of approval. Custom add-ons are available for influencer shoots and paid ads management.</p>"
};

const arData = {
  hero: {
    title: "عرض نمو السوشيال ميديا",
    subtitle: "وكالة أوزمو",
    introduction:
      "هذا العرض يوضح خطة مركزة لمدة 90 يومًا لرفع حضور العلامة، وزيادة التفاعل، وتحويل الاهتمام إلى عملاء محتملين."
  },
  visionHtml:
    "<p>رؤيتنا هي بناء صوت ثابت للعلامة، وتصميم محتوى جذاب، وإنشاء منظومة محتوى عالية الأداء تدعم النمو المستدام.</p>",
  goals: ["رفع الوعي بالعلامة التجارية", "زيادة معدل التفاعل", "تحسين التحويلات"],
  workPlan: [
    {
      number: 1,
      heading: "تحليل الوضع الحالي",
      leadText: "نحدد نقطة البداية ونقارن المنافسين.",
      bullets: [
        { text: "تدقيق الحسابات الحالية", highlightColor: "#FED7AA" },
        { text: "تحديد صوت العلامة وأعمدتها" }
      ]
    },
    {
      number: 2,
      heading: "استراتيجية المحتوى",
      leadText: "خارطة محتوى واضحة للشهر بالكامل.",
      bullets: [
        { text: "تقويم محتوى شهري" },
        { text: "اتجاه بصري وهوية موحدة" }
      ]
    },
    {
      number: 3,
      heading: "الإنتاج",
      leadText: "نصمم محتوى احترافي يناسب المنصة.",
      bullets: [
        { text: "أفكار ريلز وسكربتات", highlightColor: "#FDBA74" },
        { text: "قوالب تصميم متسقة" }
      ]
    },
    {
      number: 4,
      heading: "النشر والتفاعل",
      leadText: "نشر مستمر وتفاعل قوي مع الجمهور.",
      bullets: [
        { text: "جدولة النشر وكتابة الوصف" },
        { text: "إدارة التعليقات والرسائل" }
      ]
    },
    {
      number: 5,
      heading: "التحسين",
      leadText: "تقارير أسبوعية مع تحسينات مستمرة.",
      bullets: [
        { text: "تحليل الأداء وإعادة توظيف الأفضل" },
        { text: "اختبارات للعناوين والأنماط" }
      ]
    },
    {
      number: 6,
      heading: "تجارب النمو",
      leadText: "مبادرات نمو لزيادة الوصول.",
      bullets: [
        { text: "قائمة تعاونات مع صناع محتوى" },
        { text: "توصيات للترويج المدفوع" }
      ]
    }
  ],
  pricing: [
    {
      name: "باقة البداية",
      price: "٤,٥٠٠ ر.س / شهريًا",
      points: ["١٢ منشور", "٢ ريلز", "تقرير شهري"]
    },
    {
      name: "باقة النمو",
      price: "٧,٥٠٠ ر.س / شهريًا",
      points: ["٢٠ منشور", "٦ ريلز", "تقارير نصف شهرية"]
    },
    {
      name: "باقة الريادة",
      price: "١٢,٠٠٠ ر.س / شهريًا",
      points: ["٣٠ منشور", "١٠ ريلز", "استراتيجية وتقارير أسبوعية"]
    }
  ],
  notesHtml:
    "<p>يبدأ التنفيذ خلال ٧ أيام عمل من اعتماد العرض. تتوفر إضافات اختيارية للتصوير والإعلانات المدفوعة.</p>"
};

async function main() {
  await prisma.proposal.deleteMany();

  await prisma.proposal.create({
    data: {
      slug: "ozmo-growth-en",
      status: "PUBLISHED",
      showVision: true,
      showGoals: true,
      showWorkPlan: true,
      showPricing: true,
      showNotes: true,
      expiresAt: null,
      dataEn: JSON.stringify(enData),
      dataAr: null
    }
  });

  await prisma.proposal.create({
    data: {
      slug: "ozmo-growth-ar",
      status: "PUBLISHED",
      showVision: true,
      showGoals: true,
      showWorkPlan: true,
      showPricing: true,
      showNotes: true,
      expiresAt: null,
      dataEn: null,
      dataAr: JSON.stringify(arData)
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
