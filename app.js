// Straw Hat Quiz - local quiz generator with Bangladesh board support

let quiz = [];
let currentIndex = 0;
let correctCount = 0;
let wrongCount = 0;
let userAnswers = [];
let currentTopic = "";
let answered = false;
let historyFallbackUsed = false;
let questionTransitionTimer = null;
let questionTimerInterval = null;
let questionTimeLeft = 15;
let leaderboardSavedForCurrentQuiz = false;
let selectedQuizCategoryKey = null;

const QUESTION_TIME_LIMIT = 15;

const HISTORY_STORAGE_KEY = "quiz_seen_history_v1";
const THEME_STORAGE_KEY = "quiz_theme_preference_v1";
const LEADERBOARD_STORAGE_KEY = "quiz_leaderboard_top_scores_v1";
const PLAYER_NAME_STORAGE_KEY = "quiz_player_name_v1";
const USE_OPEN_TRIVIA_API = true;

const QUIZ_CATEGORY_OPTIONS = {
  science: { topic: "Science", apiCategoryId: 17, icon: "🔬" },
  programming: { topic: "Programming", apiCategoryId: 18, icon: "💻" },
  history: { topic: "History", apiCategoryId: 23, icon: "🏛️" },
  general: { topic: "General Knowledge", apiCategoryId: 9, icon: "🌍" }
};

const CATEGORY_TOPIC_CHIPS = {
  science: [
    "Physics",
    "Chemistry",
    "Biology",
    "Astronomy",
    "Earth Science",
    "Human Anatomy"
  ],
  programming: [
    "JavaScript fundamentals",
    "Python programming",
    "Data Structures",
    "Algorithms",
    "Web Development",
    "Databases"
  ],
  history: [
    "World History",
    "Ancient Civilizations",
    "Modern History",
    "World War II",
    "Renaissance",
    "South Asian History"
  ],
  general: [
    "General Knowledge",
    "World Geography",
    "Global Culture",
    "Current Affairs",
    "Famous Inventions",
    "Sports Facts"
  ]
};

const STATUSES = {
  en: [
    "Researching topic...",
    "Crafting questions...",
    "Building answer choices...",
    "Balancing difficulty...",
    "Final quality check...",
    "Almost ready..."
  ],
  bn: [
    "বিষয় বিশ্লেষণ করা হচ্ছে...",
    "প্রশ্ন তৈরি করা হচ্ছে...",
    "উত্তরের অপশন সাজানো হচ্ছে...",
    "কঠিনতা ভারসাম্য করা হচ্ছে...",
    "চূড়ান্ত মান যাচাই চলছে...",
    "প্রায় প্রস্তুত..."
  ]
};

let statusInterval;

const UI_LABELS = {
  en: {
    score: "Score:",
    heroLabel: "✦ Straw Hat Quiz Engine",
    heroTitle: "Generate quizzes on<br><em>anything, instantly</em>",
    heroDesc: "Type any topic and get a professionally crafted, adaptive quiz — complete with explanations.",
    cardTitle: "Create your quiz",
    chipsLabel: "Popular topics",
    labelQuestions: "Questions",
    labelDifficulty: "Difficulty",
    labelStyle: "Style",
    labelBoardLevel: "Board Level",
    labelChapter: "Chapter",
    labelLanguage: "Language",
    chapterChipLabel: "Quick chapter select",
    generateBtnText: "Generate Quiz",
    exportBtnText: "Export Filtered Set",
    errorTitle: "Failed to generate quiz",
    errorDefault: "Please try again.",
    loadingTitle: "Crafting your quiz...",
    correctLabel: "correct",
    wrongLabel: "wrong",
    reviewTitle: "Question Review",
    questionSheetBtn: "📝 Question Sheet PDF",
    answerKeyBtn: "🔑 Answer Key PDF",
    answerSheetBtn: "📄 Answer Sheet",
    newTopicBtn: "🏠 New Topic",
    retryBtn: "↺ Retry Same Quiz",
    questionWord: "Question",
    timerLabel: "Time left",
    nextBtn: "Next ->",
    resultsBtn: "See Results ->",
    skipBtn: "Skip ->",
    explanation: "Explanation",
    correctToast: "Correct",
    wrongToast: "Incorrect",
    keepGoing: "Keep going",
    keepGoingMsg: "Review the explanations and retry for a higher score.",
    perfect: "Perfect Score",
    perfectMsg: "Outstanding performance. Every answer was correct.",
    excellent: "Excellent",
    excellentMsg: "Strong mastery. You handled this topic very well.",
    great: "Great Work",
    greatMsg: "Good understanding with room to sharpen a few concepts.",
    solid: "Solid Start",
    solidMsg: "You are building momentum. Focus on missed questions.",
    correctWord: "Correct",
    yourAnswer: "Your answer",
    skipped: "Skipped",
    allChapters: "All Chapters",
    allLevels: "All",
    english: "English",
    bangla: "Bangla",
    darkMode: "🌙 Dark",
    lightMode: "☀️ Light",
    factual: "Factual",
    conceptual: "Conceptual",
    scenario: "Scenario-based",
    tricky: "Tricky",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    mixed: "Mixed",
    exportSuccess: "Filtered quiz set exported",
    answerSheetSuccess: "Answer sheet exported",
    questionSheetSuccess: "Question sheet PDF exported",
    answerKeySuccess: "Answer key PDF exported",
    answerSheetEmpty: "No completed quiz attempt to export",
    pdfNotReady: "PDF engine not loaded yet. Please try again.",
    historyRepeatNotice: "Some repeated questions were used (question bank exhausted for selected filters)",
    exportEmpty: "No questions found for this filter",
    noTopic: "Please enter a topic first.",
    topicPlaceholder: "e.g. SSC Math Bangladesh, HSC Physics...",
    apiPowered: "Powered by Open Trivia DB",
    categoryHeroLabel: "✦ Quiz Category",
    categoryHeroTitle: "Choose a category<br><em>before you start</em>",
    categoryHeroDesc: "Pick one category to shape your quiz question set.",
    categorySelectTitle: "Select category",
    categoryContinueText: "Continue",
    categoryScienceTitle: "Science",
    categoryScienceDesc: "Physics, chemistry, biology, and more",
    categoryProgrammingTitle: "Programming",
    categoryProgrammingDesc: "Code, computing, and software concepts",
    categoryHistoryTitle: "History",
    categoryHistoryDesc: "Ancient to modern historical knowledge",
    categoryGeneralTitle: "General Knowledge",
    categoryGeneralDesc: "Mixed facts across broad domains"
  },
  bn: {
    score: "স্কোর:",
    heroLabel: "✦ স্ট্র হ্যাট কুইজ ইঞ্জিন",
    heroTitle: "যেকোনো বিষয়ে কুইজ তৈরি করো<br><em>একদম মুহূর্তেই</em>",
    heroDesc: "বিষয় লিখলেই মানসম্মত ও ব্যাখ্যাসহ কুইজ পেয়ে যাবে।",
    cardTitle: "তোমার কুইজ তৈরি করো",
    chipsLabel: "জনপ্রিয় বিষয়",
    labelQuestions: "প্রশ্ন সংখ্যা",
    labelDifficulty: "কঠিনতা",
    labelStyle: "ধরণ",
    labelBoardLevel: "বোর্ড লেভেল",
    labelChapter: "অধ্যায়",
    labelLanguage: "ভাষা",
    chapterChipLabel: "দ্রুত অধ্যায় নির্বাচন",
    generateBtnText: "কুইজ তৈরি করো",
    exportBtnText: "ফিল্টার করা সেট এক্সপোর্ট",
    errorTitle: "কুইজ তৈরি করা যায়নি",
    errorDefault: "আবার চেষ্টা করো।",
    loadingTitle: "তোমার কুইজ তৈরি হচ্ছে...",
    correctLabel: "সঠিক",
    wrongLabel: "ভুল",
    reviewTitle: "প্রশ্ন পর্যালোচনা",
    questionSheetBtn: "📝 প্রশ্নপত্র PDF",
    answerKeyBtn: "🔑 উত্তরপত্র PDF",
    answerSheetBtn: "📄 উত্তর শিট",
    newTopicBtn: "🏠 নতুন বিষয়",
    retryBtn: "↺ একই কুইজ আবার",
    questionWord: "প্রশ্ন",
    timerLabel: "সময় বাকি",
    nextBtn: "পরেরটি ->",
    resultsBtn: "ফলাফল দেখো ->",
    skipBtn: "এড়িয়ে যাও ->",
    explanation: "ব্যাখ্যা",
    correctToast: "সঠিক",
    wrongToast: "ভুল",
    keepGoing: "চলতে থাকো",
    keepGoingMsg: "ব্যাখ্যাগুলো দেখে আবার চেষ্টা করো।",
    perfect: "পারফেক্ট স্কোর",
    perfectMsg: "দারুণ! সব উত্তর সঠিক হয়েছে।",
    excellent: "চমৎকার",
    excellentMsg: "খুব ভালো দক্ষতা দেখিয়েছো।",
    great: "খুব ভালো",
    greatMsg: "ভালো হয়েছে, আর একটু অনুশীলনে আরও ভালো হবে।",
    solid: "ভালো শুরু",
    solidMsg: "আরও কিছু প্র্যাকটিস করলে স্কোর বাড়বে।",
    correctWord: "সঠিক",
    yourAnswer: "তোমার উত্তর",
    skipped: "এড়িয়ে গেছো",
    allChapters: "সব অধ্যায়",
    allLevels: "সব",
    english: "ইংরেজি",
    bangla: "বাংলা",
    darkMode: "🌙 ডার্ক",
    lightMode: "☀️ লাইট",
    factual: "তথ্যভিত্তিক",
    conceptual: "ধারণাভিত্তিক",
    scenario: "পরিস্থিতিভিত্তিক",
    tricky: "ট্রিকি",
    easy: "সহজ",
    medium: "মাঝারি",
    hard: "কঠিন",
    mixed: "মিশ্র",
    exportSuccess: "ফিল্টার করা কুইজ সেট এক্সপোর্ট হয়েছে",
    answerSheetSuccess: "উত্তর শিট এক্সপোর্ট হয়েছে",
    questionSheetSuccess: "প্রশ্নপত্র PDF এক্সপোর্ট হয়েছে",
    answerKeySuccess: "উত্তরপত্র PDF এক্সপোর্ট হয়েছে",
    answerSheetEmpty: "এক্সপোর্ট করার মতো সম্পন্ন কুইজ নেই",
    pdfNotReady: "PDF ব্যবস্থা এখনও প্রস্তুত হয়নি। আবার চেষ্টা করো।",
    historyRepeatNotice: "নির্বাচিত ফিল্টারে প্রশ্ন শেষ হওয়ায় কিছু পুনরাবৃত্ত প্রশ্ন এসেছে",
    exportEmpty: "এই ফিল্টারে কোনো প্রশ্ন পাওয়া যায়নি",
    noTopic: "আগে একটি বিষয় লিখো।",
    topicPlaceholder: "যেমন: SSC Math Bangladesh, HSC Physics...",
    apiPowered: "Open Trivia DB দ্বারা চালিত",
    categoryHeroLabel: "✦ কুইজ ক্যাটাগরি",
    categoryHeroTitle: "শুরু করার আগে<br><em>একটি ক্যাটাগরি বেছে নাও</em>",
    categoryHeroDesc: "একটি ক্যাটাগরি বেছে নিলে প্রশ্ন সেই অনুযায়ী আসবে।",
    categorySelectTitle: "ক্যাটাগরি নির্বাচন",
    categoryContinueText: "চালিয়ে যাও",
    categoryScienceTitle: "বিজ্ঞান",
    categoryScienceDesc: "পদার্থ, রসায়ন, জীববিজ্ঞানসহ আরও বিষয়",
    categoryProgrammingTitle: "প্রোগ্রামিং",
    categoryProgrammingDesc: "কোড, কম্পিউটিং ও সফটওয়্যার ধারণা",
    categoryHistoryTitle: "ইতিহাস",
    categoryHistoryDesc: "প্রাচীন থেকে আধুনিক ইতিহাসভিত্তিক প্রশ্ন",
    categoryGeneralTitle: "সাধারণ জ্ঞান",
    categoryGeneralDesc: "বিভিন্ন বিষয়ের মিশ্র জ্ঞানভিত্তিক প্রশ্ন"
  }
};

const BASE_TOPICS = [
  {
    key: "history",
    aliases: ["history", "revolution", "war", "empire", "civilization", "historical"],
    questions: [
      {
        question: "Which factor most often triggers major political revolutions?",
        options: [
          "A persistent legitimacy crisis combined with economic stress",
          "A temporary change in weather",
          "A short-term rise in crop output",
          "A sudden increase in luxury imports"
        ],
        correct: 0,
        explanation: "Revolutions usually emerge when governments lose legitimacy while economic and social pressures intensify.",
        difficulty: "medium",
        category: "Political change"
      },
      {
        question: "Why do historians cross-check multiple primary sources?",
        options: [
          "To reduce bias and reconstruct events more accurately",
          "To make narratives longer",
          "To avoid chronology entirely",
          "To replace evidence with opinion"
        ],
        correct: 0,
        explanation: "Each source has limits, so corroboration helps improve accuracy and reduce one-sided interpretations.",
        difficulty: "easy",
        category: "Historical method"
      },
      {
        question: "What is a common consequence of rapid industrialization in 19th-century states?",
        options: [
          "Urbanization and labor reorganization",
          "The end of all social classes",
          "Immediate global equality",
          "A complete decline in trade networks"
        ],
        correct: 0,
        explanation: "Industrialization tends to pull populations into cities and transforms labor structures.",
        difficulty: "easy",
        category: "Industrial era"
      },
      {
        question: "In geopolitical history, what does a balance-of-power system aim to do?",
        options: [
          "Prevent one state from dominating others",
          "Eliminate diplomacy",
          "Replace alliances with isolation",
          "Ensure every war has equal losses"
        ],
        correct: 0,
        explanation: "Balance-of-power strategies distribute power to discourage hegemony and preserve stability.",
        difficulty: "medium",
        category: "International relations"
      },
      {
        question: "Which interpretation best fits the term 'historical contingency'?",
        options: [
          "Outcomes depend on specific events and choices, not inevitability",
          "History follows one fixed path",
          "Only economic causes matter",
          "Individuals never influence outcomes"
        ],
        correct: 0,
        explanation: "Contingency means alternative outcomes were possible depending on events and decisions.",
        difficulty: "hard",
        category: "Historiography"
      },
      {
        question: "Why do empires often invest in roads, ports, and communication systems?",
        options: [
          "To improve administration, military movement, and trade",
          "To reduce contact among regions",
          "To eliminate taxation",
          "To weaken central control"
        ],
        correct: 0,
        explanation: "Infrastructure helps rulers project power and connect economic flows across large territories.",
        difficulty: "easy",
        category: "Empires"
      }
    ]
  },
  {
    key: "javascript",
    aliases: ["javascript", "js", "ecmascript", "frontend", "node", "web development"],
    questions: [
      {
        question: "What does 'const' guarantee in JavaScript?",
        options: [
          "The binding cannot be reassigned",
          "The value is deeply immutable",
          "The variable is block-ignored",
          "The variable is hoisted without a temporal dead zone"
        ],
        correct: 0,
        explanation: "const prevents reassignment of the variable binding, but object contents can still mutate unless frozen.",
        difficulty: "easy",
        category: "Language basics"
      },
      {
        question: "Why is event delegation useful in dynamic UIs?",
        options: [
          "One parent listener can handle current and future child elements",
          "It disables bubbling for all events",
          "It makes all handlers synchronous",
          "It removes the need for selectors"
        ],
        correct: 0,
        explanation: "Delegation uses bubbling, so a parent can respond to events from children added later.",
        difficulty: "medium",
        category: "DOM events"
      },
      {
        question: "What is the primary purpose of async/await?",
        options: [
          "To write asynchronous code in a readable sequential style",
          "To make network requests synchronous",
          "To replace promises entirely",
          "To guarantee no runtime errors"
        ],
        correct: 0,
        explanation: "async/await is syntax over promises that improves readability while preserving non-blocking behavior.",
        difficulty: "easy",
        category: "Async programming"
      },
      {
        question: "Which issue does strict equality (===) avoid compared to ==?",
        options: [
          "Unexpected type coercion",
          "All NaN comparisons",
          "Reference comparison for objects",
          "Lexical scoping bugs"
        ],
        correct: 0,
        explanation: "=== compares value and type directly, reducing coercion surprises common with ==.",
        difficulty: "easy",
        category: "Operators"
      },
      {
        question: "In closures, what is captured by an inner function?",
        options: [
          "References to variables in its lexical scope",
          "Only current primitive values",
          "DOM nodes only",
          "Global scope variables exclusively"
        ],
        correct: 0,
        explanation: "Closures keep access to variables from the surrounding lexical environment.",
        difficulty: "medium",
        category: "Functions"
      },
      {
        question: "When optimizing browser rendering, which strategy is generally best?",
        options: [
          "Batch DOM reads and writes to reduce layout thrashing",
          "Force synchronous reflow after each style update",
          "Use setInterval for all animations",
          "Recreate full trees on each keystroke"
        ],
        correct: 0,
        explanation: "Grouping reads/writes minimizes repeated layout calculations and improves performance.",
        difficulty: "hard",
        category: "Performance"
      }
    ]
  }
];

const BD_SUBJECTS = [
  {
    key: "bangladesh-affairs",
    aliases: ["bangladesh affairs", "bd affairs", "bangladesh gk", "bcs bangladesh", "bangladesh"],
    chapters: [
      { id: "bd-history", en: "History & Liberation", bn: "ইতিহাস ও মুক্তিযুদ্ধ", levels: ["ssc", "hsc"] },
      { id: "bd-constitution", en: "Constitution & Governance", bn: "সংবিধান ও শাসনব্যবস্থা", levels: ["hsc"] },
      { id: "bd-geography", en: "Geography & Climate", bn: "ভূগোল ও জলবায়ু", levels: ["ssc", "hsc"] },
      { id: "bd-economy", en: "Economy & Development", bn: "অর্থনীতি ও উন্নয়ন", levels: ["hsc"] },
      { id: "bd-culture", en: "Culture & Heritage", bn: "সংস্কৃতি ও ঐতিহ্য", levels: ["ssc", "hsc"] },
      { id: "bd-current", en: "Contemporary Bangladesh", bn: "সমসাময়িক বাংলাদেশ", levels: ["hsc"] }
    ]
  },
  {
    key: "bd-math",
    aliases: ["ssc math", "hsc math", "bangladesh math", "board math", "nctb math", "math bangladesh", "math", "mathematics", "গণিত"],
    chapters: [
      { id: "math-algebra", en: "Algebra", bn: "বীজগণিত", levels: ["ssc"] },
      { id: "math-geometry", en: "Geometry", bn: "জ্যামিতি", levels: ["ssc"] },
      { id: "math-statistics", en: "Statistics", bn: "পরিসংখ্যান", levels: ["ssc"] },
      { id: "math-trigonometry", en: "Trigonometry", bn: "ত্রিকোণমিতি", levels: ["hsc"] },
      { id: "math-functions", en: "Functions", bn: "ফাংশন", levels: ["hsc"] },
      { id: "math-calculus", en: "Calculus", bn: "ক্যালকুলাস", levels: ["hsc"] }
    ]
  },
  {
    key: "bd-physics",
    aliases: ["ssc physics", "hsc physics", "bangladesh physics", "board physics", "nctb physics", "physics", "পদার্থবিজ্ঞান"],
    chapters: [
      { id: "phy-motion", en: "Motion & Force", bn: "গতি ও বল", levels: ["ssc"] },
      { id: "phy-work", en: "Work, Energy, Power", bn: "কাজ, শক্তি ও ক্ষমতা", levels: ["ssc"] },
      { id: "phy-electricity", en: "Current Electricity", bn: "তড়িৎ প্রবাহ", levels: ["ssc", "hsc"] },
      { id: "phy-wave", en: "Waves & Sound", bn: "তরঙ্গ ও শব্দ", levels: ["ssc", "hsc"] },
      { id: "phy-optics", en: "Optics", bn: "আলোকবিজ্ঞান", levels: ["hsc"] },
      { id: "phy-modern", en: "Modern Physics", bn: "আধুনিক পদার্থবিজ্ঞান", levels: ["hsc"] }
    ]
  },
  {
    key: "bd-chemistry",
    aliases: ["ssc chemistry", "hsc chemistry", "bangladesh chemistry", "board chemistry", "nctb chemistry", "chemistry", "chem", "রসায়ন"],
    chapters: [
      { id: "chem-atomic", en: "Atomic Structure", bn: "পরমাণুর গঠন", levels: ["ssc"] },
      { id: "chem-bond", en: "Chemical Bonding", bn: "রাসায়নিক বন্ধন", levels: ["ssc", "hsc"] },
      { id: "chem-acid", en: "Acid, Base, Salt", bn: "অম্ল, ক্ষার ও লবণ", levels: ["ssc"] },
      { id: "chem-stoich", en: "Stoichiometry", bn: "স্টইকিওমেট্রি", levels: ["hsc"] },
      { id: "chem-organic", en: "Organic Chemistry", bn: "জৈব রসায়ন", levels: ["hsc"] },
      { id: "chem-electro", en: "Electrochemistry", bn: "তড়িৎ রসায়ন", levels: ["hsc"] }
    ]
  },
  {
    key: "bd-biology",
    aliases: ["ssc biology", "hsc biology", "bangladesh biology", "board biology", "nctb biology", "biology", "bio", "জীববিজ্ঞান"],
    chapters: [
      { id: "bio-cell", en: "Cell & Tissue", bn: "কোষ ও টিস্যু", levels: ["ssc"] },
      { id: "bio-plant", en: "Plant Physiology", bn: "উদ্ভিদ শারীরবিজ্ঞান", levels: ["ssc"] },
      { id: "bio-human", en: "Human Physiology", bn: "মানব শারীরবিজ্ঞান", levels: ["ssc", "hsc"] },
      { id: "bio-genetics", en: "Genetics", bn: "বংশগতি", levels: ["hsc"] },
      { id: "bio-ecology", en: "Ecology", bn: "বাস্তুতন্ত্র", levels: ["hsc"] },
      { id: "bio-micro", en: "Microbiology", bn: "অণুজীববিজ্ঞান", levels: ["hsc"] }
    ]
  },
  {
    key: "bd-ict",
    aliases: ["ssc ict", "hsc ict", "bangladesh ict", "board ict", "ict nctb", "hsc ict bangladesh", "ict", "information technology", "আইসিটি"],
    chapters: [
      { id: "ict-computer", en: "Computer Fundamentals", bn: "কম্পিউটার ভিত্তি", levels: ["ssc"] },
      { id: "ict-number", en: "Number Systems", bn: "সংখ্যা পদ্ধতি", levels: ["ssc", "hsc"] },
      { id: "ict-network", en: "Networking", bn: "নেটওয়ার্কিং", levels: ["ssc", "hsc"] },
      { id: "ict-programming", en: "Programming Basics", bn: "প্রোগ্রামিং ভিত্তি", levels: ["hsc"] },
      { id: "ict-database", en: "Database", bn: "ডাটাবেজ", levels: ["hsc"] },
      { id: "ict-security", en: "Cyber Security", bn: "সাইবার নিরাপত্তা", levels: ["hsc"] }
    ]
  }
];

const FACT_BANK = {
  "bangladesh-affairs": [
    { c: "bd-history", lv: "ssc", d: "easy", en: "The Language Movement of 1952 is linked to International Mother Language Day.", bn: "১৯৫২ সালের ভাষা আন্দোলন আন্তর্জাতিক মাতৃভাষা দিবসের সাথে সম্পর্কিত।" },
    { c: "bd-history", lv: "hsc", d: "medium", en: "The Liberation War of 1971 led to Bangladesh's independence.", bn: "১৯৭১ সালের মুক্তিযুদ্ধ বাংলাদেশের স্বাধীনতা এনে দেয়।" },
    { c: "bd-history", lv: "hsc", d: "medium", en: "The six-point demand is a major milestone in Bangladesh's autonomy movement.", bn: "ছয় দফা দাবি বাংলাদেশের স্বায়ত্তশাসন আন্দোলনের গুরুত্বপূর্ণ মাইলফলক।" },
    { c: "bd-constitution", lv: "hsc", d: "medium", en: "Bangladesh is governed by a written constitution.", bn: "বাংলাদেশ একটি লিখিত সংবিধান দ্বারা পরিচালিত।" },
    { c: "bd-constitution", lv: "hsc", d: "hard", en: "Fundamental rights in Bangladesh are protected through constitutional provisions.", bn: "বাংলাদেশে মৌলিক অধিকার সংবিধানের বিধানের মাধ্যমে সুরক্ষিত।" },
    { c: "bd-geography", lv: "ssc", d: "easy", en: "Bangladesh is a deltaic country shaped by major rivers.", bn: "বাংলাদেশ প্রধান নদী দ্বারা গঠিত একটি বদ্বীপ দেশ।" },
    { c: "bd-geography", lv: "hsc", d: "medium", en: "The Sundarbans is the world's largest mangrove forest.", bn: "সুন্দরবন বিশ্বের বৃহত্তম ম্যানগ্রোভ বন।" },
    { c: "bd-geography", lv: "hsc", d: "medium", en: "Cyclone preparedness programs improve disaster resilience in coastal Bangladesh.", bn: "ঘূর্ণিঝড় প্রস্তুতি কর্মসূচি উপকূলীয় বাংলাদেশের দুর্যোগ সহনশীলতা বাড়ায়।" },
    { c: "bd-economy", lv: "hsc", d: "easy", en: "Ready-made garments is a key export sector for Bangladesh.", bn: "রেডিমেড গার্মেন্টস বাংলাদেশে একটি প্রধান রপ্তানি খাত।" },
    { c: "bd-economy", lv: "hsc", d: "medium", en: "Remittances support both household spending and foreign exchange reserves.", bn: "রেমিট্যান্স পারিবারিক ব্যয় ও বৈদেশিক মুদ্রার রিজার্ভ উভয়কেই সহায়তা করে।" },
    { c: "bd-economy", lv: "hsc", d: "hard", en: "Infrastructure investment improves long-term productivity and trade efficiency.", bn: "অবকাঠামো বিনিয়োগ দীর্ঘমেয়াদে উৎপাদনশীলতা ও বাণিজ্য দক্ষতা বাড়ায়।" },
    { c: "bd-culture", lv: "ssc", d: "easy", en: "Pahela Boishakh is a major cultural celebration in Bangladesh.", bn: "পহেলা বৈশাখ বাংলাদেশের একটি প্রধান সাংস্কৃতিক উৎসব।" },
    { c: "bd-culture", lv: "ssc", d: "easy", en: "Folk music and literature are integral parts of Bangladeshi heritage.", bn: "লোকসংগীত ও সাহিত্য বাংলাদেশের ঐতিহ্যের অবিচ্ছেদ্য অংশ।" },
    { c: "bd-current", lv: "hsc", d: "medium", en: "Digital public services help improve governance efficiency.", bn: "ডিজিটাল জনসেবা শাসনব্যবস্থার দক্ষতা বাড়াতে সহায়তা করে।" },
    { c: "bd-current", lv: "hsc", d: "medium", en: "Climate adaptation is central to Bangladesh's development planning.", bn: "জলবায়ু অভিযোজন বাংলাদেশের উন্নয়ন পরিকল্পনার কেন্দ্রীয় বিষয়।" }
  ],
  "bd-biology": [
    { c: "bio-cell", lv: "ssc", d: "easy", en: "The nucleus regulates key cellular activities.", bn: "কোষের গুরুত্বপূর্ণ কার্যক্রম নিয়ন্ত্রণ করে নিউক্লিয়াস।" },
    { c: "bio-cell", lv: "ssc", d: "easy", en: "Cell membrane controls movement of substances into and out of the cell.", bn: "কোষঝিল্লি কোষে পদার্থ প্রবেশ ও নির্গমন নিয়ন্ত্রণ করে।" },
    { c: "bio-plant", lv: "ssc", d: "easy", en: "Photosynthesis converts light energy into chemical energy.", bn: "প্রকাশ-সংশ্লেষণ আলোকশক্তিকে রাসায়নিক শক্তিতে রূপান্তর করে।" },
    { c: "bio-plant", lv: "ssc", d: "medium", en: "Stomata regulate gas exchange and water loss in leaves.", bn: "পাতার রন্ধ্র গ্যাস বিনিময় ও পানি ক্ষয় নিয়ন্ত্রণ করে।" },
    { c: "bio-human", lv: "ssc", d: "easy", en: "Red blood cells primarily carry oxygen using hemoglobin.", bn: "লোহিত রক্তকণিকা হিমোগ্লোবিনের মাধ্যমে অক্সিজেন বহন করে।" },
    { c: "bio-human", lv: "hsc", d: "medium", en: "The nephron is the functional unit of the kidney.", bn: "নেফ্রন কিডনির কার্যকরী একক।" },
    { c: "bio-human", lv: "hsc", d: "medium", en: "Enzymes speed up metabolic reactions by lowering activation energy.", bn: "এনজাইম সক্রিয়করণ শক্তি কমিয়ে বিপাকীয় বিক্রিয়া ত্বরান্বিত করে।" },
    { c: "bio-genetics", lv: "hsc", d: "medium", en: "Genes are segments of DNA that carry hereditary information.", bn: "জিন হলো DNA-এর অংশ যা বংশগত তথ্য বহন করে।" },
    { c: "bio-genetics", lv: "hsc", d: "hard", en: "Phenotype results from interaction between genotype and environment.", bn: "ফেনোটাইপ জিনোটাইপ ও পরিবেশের পারস্পরিক প্রভাবের ফল।" },
    { c: "bio-ecology", lv: "hsc", d: "medium", en: "Food chains show directional transfer of energy across trophic levels.", bn: "খাদ্য শৃঙ্খল ট্রফিক স্তরে শক্তির প্রবাহের দিক নির্দেশ করে।" },
    { c: "bio-ecology", lv: "hsc", d: "hard", en: "Carrying capacity limits population growth in an ecosystem.", bn: "বাস্তুতন্ত্রে ধারণ ক্ষমতা জনসংখ্যা বৃদ্ধিকে সীমাবদ্ধ করে।" },
    { c: "bio-micro", lv: "hsc", d: "medium", en: "Many bacteria are beneficial in nutrient cycling and fermentation.", bn: "অনেক ব্যাকটেরিয়া পুষ্টিচক্র ও ফারমেন্টেশনে উপকারী ভূমিকা রাখে।" },
    { c: "bio-micro", lv: "hsc", d: "hard", en: "Vaccination builds adaptive immunity by training immune memory.", bn: "টিকাদান প্রতিরোধ স্মৃতি তৈরি করে অভিযোজিত রোগপ্রতিরোধ ক্ষমতা গড়ে তোলে।" }
  ],
  "bd-ict": [
    { c: "ict-computer", lv: "ssc", d: "easy", en: "CPU stands for Central Processing Unit.", bn: "CPU এর পূর্ণরূপ Central Processing Unit।" },
    { c: "ict-computer", lv: "ssc", d: "easy", en: "RAM is volatile memory used during active processing.", bn: "RAM হলো ভোলাটাইল মেমোরি, যা সক্রিয় প্রসেসিংয়ে ব্যবহৃত হয়।" },
    { c: "ict-number", lv: "ssc", d: "easy", en: "Binary is a base-2 number system.", bn: "বাইনারি একটি ভিত্তি-২ সংখ্যা পদ্ধতি।" },
    { c: "ict-number", lv: "hsc", d: "medium", en: "Hexadecimal makes compact representation of binary data easier.", bn: "হেক্সাডেসিমাল বাইনারি ডেটার সংক্ষিপ্ত উপস্থাপন সহজ করে।" },
    { c: "ict-network", lv: "ssc", d: "easy", en: "LAN connects devices within a limited geographical area.", bn: "LAN সীমিত ভৌগোলিক এলাকায় ডিভাইস সংযুক্ত করে।" },
    { c: "ict-network", lv: "hsc", d: "medium", en: "IP addressing enables unique identification of devices on networks.", bn: "IP ঠিকানা নেটওয়ার্কে ডিভাইসকে স্বতন্ত্রভাবে শনাক্ত করে।" },
    { c: "ict-programming", lv: "hsc", d: "medium", en: "An algorithm is a step-by-step method to solve a problem.", bn: "অ্যালগরিদম হলো সমস্যা সমাধানের ধাপে ধাপে পদ্ধতি।" },
    { c: "ict-programming", lv: "hsc", d: "medium", en: "A loop helps execute repeated instructions efficiently.", bn: "লুপ পুনরাবৃত্ত নির্দেশনা দক্ষভাবে সম্পাদনে সাহায্য করে।" },
    { c: "ict-database", lv: "hsc", d: "medium", en: "A primary key uniquely identifies each record in a table.", bn: "প্রাইমারি কী টেবিলের প্রতিটি রেকর্ডকে স্বতন্ত্রভাবে শনাক্ত করে।" },
    { c: "ict-database", lv: "hsc", d: "hard", en: "Normalization reduces data redundancy in relational databases.", bn: "নরমালাইজেশন রিলেশনাল ডাটাবেজে ডেটা পুনরাবৃত্তি কমায়।" },
    { c: "ict-security", lv: "hsc", d: "medium", en: "Phishing attacks commonly use deceptive links to steal credentials.", bn: "ফিশিং আক্রমণে প্রতারণামূলক লিংক ব্যবহার করে তথ্য চুরি করা হয়।" },
    { c: "ict-security", lv: "hsc", d: "hard", en: "Strong passwords and multi-factor authentication improve account security.", bn: "শক্তিশালী পাসওয়ার্ড ও বহুস্তর যাচাইকরণ অ্যাকাউন্ট নিরাপত্তা বাড়ায়।" }
  ]
};

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((screen) => screen.classList.remove("active"));
  document.getElementById("screen-" + id).classList.add("active");
}

function startLoadingCycle() {
  const messages = STATUSES[getCurrentLanguage()] || STATUSES.en;
  let i = 0;
  document.getElementById("loadingStatus").textContent = messages[0];
  statusInterval = setInterval(() => {
    i = (i + 1) % messages.length;
    document.getElementById("loadingStatus").textContent = messages[i];
  }, 1200);
}

function stopLoadingCycle() {
  clearInterval(statusInterval);
}

function getCurrentLanguage() {
  const langSelect = document.getElementById("languageSelect");
  return langSelect ? langSelect.value : "en";
}

function t(key) {
  const lang = getCurrentLanguage();
  return (UI_LABELS[lang] && UI_LABELS[lang][key]) || UI_LABELS.en[key] || key;
}

function setText(id, value, isHtml = false) {
  const el = document.getElementById(id);
  if (!el) {
    return;
  }
  if (isHtml) {
    el.innerHTML = value;
  } else {
    el.textContent = value;
  }
}

function getSavedTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch (error) {
    return null;
  }
}

function updateThemeToggleText() {
  const btn = document.getElementById("themeToggleBtn");
  if (!btn) {
    return;
  }
  const isDark = document.body.getAttribute("data-theme") === "dark";
  btn.textContent = isDark ? t("lightMode") : t("darkMode");
}

function applyTheme(theme, persist = true) {
  const finalTheme = theme === "dark" ? "dark" : "light";
  document.body.setAttribute("data-theme", finalTheme);

  if (persist) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, finalTheme);
    } catch (error) {
      // Ignore storage errors.
    }
  }

  updateThemeToggleText();
}

function initThemePreference() {
  const saved = getSavedTheme();
  if (saved === "dark" || saved === "light") {
    applyTheme(saved, false);
    return;
  }

  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(prefersDark ? "dark" : "light", false);
}

function applyLanguageToUI() {
  const language = getCurrentLanguage();
  document.documentElement.lang = language;

  setText("categoryHeroLabel", t("categoryHeroLabel"));
  setText("categoryHeroTitle", t("categoryHeroTitle"), true);
  setText("categoryHeroDesc", t("categoryHeroDesc"));
  setText("categorySelectTitle", t("categorySelectTitle"));
  setText("categoryContinueText", t("categoryContinueText"));

  setText("headerScoreLabel", t("score"));
  setText("heroLabel", t("heroLabel"));
  setText("heroTitle", t("heroTitle"), true);
  setText("heroDesc", t("heroDesc"));
  setText("cardTitle", t("cardTitle"));
  setText("chipsLabel", t("chipsLabel"));
  setText("labelQuestions", t("labelQuestions"));
  setText("labelDifficulty", t("labelDifficulty"));
  setText("labelStyle", t("labelStyle"));
  setText("labelBoardLevel", t("labelBoardLevel"));
  setText("labelChapter", t("labelChapter"));
  setText("labelLanguage", t("labelLanguage"));
  setText("chapterChipLabel", t("chapterChipLabel"));
  setText("generateBtnText", t("generateBtnText"));
  setText("exportBtn", t("exportBtnText"));
  setText("errorTitle", t("errorTitle"));
  setText("loadingTitle", t("loadingTitle"));
  setText("apiPoweredLoading", t("apiPowered"));
  setText("apiPoweredResults", t("apiPowered"));
  setText("correctStatLabel", t("correctLabel"));
  setText("wrongStatLabel", t("wrongLabel"));
  setText("reviewTitle", t("reviewTitle"));
  setText("questionSheetBtn", t("questionSheetBtn"));
  setText("answerKeyBtn", t("answerKeyBtn"));
  setText("answerSheetBtn", t("answerSheetBtn"));
  setText("newTopicBtn", t("newTopicBtn"));
  setText("retryBtn", t("retryBtn"));
  setText("skipBtn", t("skipBtn"));

  const topicInput = document.getElementById("topicInput");
  if (topicInput) {
    topicInput.placeholder = t("topicPlaceholder");
  }

  const numQuestions = document.getElementById("numQuestions");
  if (numQuestions) {
    Array.from(numQuestions.options).forEach((opt) => {
      opt.textContent = language === "bn" ? `${opt.value} টি প্রশ্ন` : `${opt.value} questions`;
    });
  }

  const difficulty = document.getElementById("difficulty");
  if (difficulty) {
    const map = { easy: t("easy"), medium: t("medium"), hard: t("hard"), mixed: t("mixed") };
    Array.from(difficulty.options).forEach((opt) => {
      opt.textContent = map[opt.value] || opt.value;
    });
  }

  const style = document.getElementById("quizStyle");
  if (style) {
    const map = { factual: t("factual"), conceptual: t("conceptual"), scenario: t("scenario"), tricky: t("tricky") };
    Array.from(style.options).forEach((opt) => {
      opt.textContent = map[opt.value] || opt.value;
    });
  }

  const boardLevel = document.getElementById("boardLevel");
  if (boardLevel) {
    const map = { all: t("allLevels"), ssc: "SSC", hsc: "HSC" };
    Array.from(boardLevel.options).forEach((opt) => {
      opt.textContent = map[opt.value] || opt.value;
    });
  }

  const languageSelect = document.getElementById("languageSelect");
  if (languageSelect) {
    Array.from(languageSelect.options).forEach((opt) => {
      opt.textContent = opt.value === "bn" ? t("bangla") : t("english");
    });
  }

  if (document.getElementById("errorMsg").textContent.trim() === "Please try again.") {
    setText("errorMsg", t("errorDefault"));
  }

  updateThemeToggleText();

  const leaderboardNameInput = document.getElementById("leaderboardNameInput");
  if (leaderboardNameInput) {
    leaderboardNameInput.placeholder = "Enter your name";
  }

  const saveScoreBtn = document.getElementById("saveScoreBtn");
  if (saveScoreBtn) {
    saveScoreBtn.textContent = "Save Score";
  }

  const leaderboardEmpty = document.getElementById("leaderboardEmpty");
  if (leaderboardEmpty && !leaderboardEmpty.dataset.hasScores) {
    leaderboardEmpty.textContent = "No scores saved yet.";
  }

  applyCategoryLabels();
  applyApiModeUiConstraints();
}

function selectedCategoryOption() {
  return selectedQuizCategoryKey ? QUIZ_CATEGORY_OPTIONS[selectedQuizCategoryKey] : null;
}

function applyCategoryLabels() {
  const labelMap = {
    science: { title: t("categoryScienceTitle"), desc: t("categoryScienceDesc") },
    programming: { title: t("categoryProgrammingTitle"), desc: t("categoryProgrammingDesc") },
    history: { title: t("categoryHistoryTitle"), desc: t("categoryHistoryDesc") },
    general: { title: t("categoryGeneralTitle"), desc: t("categoryGeneralDesc") }
  };

  document.querySelectorAll(".category-choice").forEach((card) => {
    const key = card.dataset.category;
    const labels = labelMap[key];
    if (!labels) {
      return;
    }
    const title = card.querySelector(".category-choice-title");
    const desc = card.querySelector(".category-choice-desc");
    if (title) {
      title.textContent = labels.title;
    }
    if (desc) {
      desc.textContent = labels.desc;
    }
  });
}

function renderTopicChipsForSelectedCategory() {
  const topicChips = document.getElementById("topicChips");
  if (!topicChips) {
    return;
  }

  const topics = CATEGORY_TOPIC_CHIPS[selectedQuizCategoryKey] || [];
  topicChips.innerHTML = topics.map((topic) => (
    `<button class="chip" type="button" data-topic="${escHtml(topic)}">${escHtml(topic)}</button>`
  )).join("");
}

function selectQuizCategory(key) {
  if (!QUIZ_CATEGORY_OPTIONS[key]) {
    return;
  }
  selectedQuizCategoryKey = key;

  const option = selectedCategoryOption();
  const topicInput = document.getElementById("topicInput");
  if (topicInput && option) {
    topicInput.value = option.topic;
  }

  renderTopicChipsForSelectedCategory();

  document.querySelectorAll(".category-choice").forEach((card) => {
    card.classList.toggle("active", card.dataset.category === key);
  });

  const continueBtn = document.getElementById("categoryContinueBtn");
  if (continueBtn) {
    continueBtn.disabled = false;
  }
}

function applyApiModeUiConstraints() {
  const boardLevel = document.getElementById("boardLevel");
  const chapterSelect = document.getElementById("chapterSelect");
  const chapterChipBlock = document.getElementById("chapterChipBlock");

  if (!boardLevel || !chapterSelect) {
    return;
  }

  const boardGroup = boardLevel.closest(".config-group");
  const chapterGroup = chapterSelect.closest(".config-group");

  if (!USE_OPEN_TRIVIA_API) {
    boardLevel.disabled = false;
    chapterSelect.disabled = false;
    if (boardGroup) {
      boardGroup.style.display = "";
    }
    if (chapterGroup) {
      chapterGroup.style.display = "";
    }
    return;
  }

  boardLevel.value = "all";
  boardLevel.disabled = true;

  chapterSelect.innerHTML = `<option value="all" selected>${t("allChapters")}</option>`;
  chapterSelect.value = "all";
  chapterSelect.disabled = true;

  if (boardGroup) {
    boardGroup.style.display = "none";
  }
  if (chapterGroup) {
    chapterGroup.style.display = "none";
  }
  if (chapterChipBlock) {
    chapterChipBlock.style.display = "none";
  }
}


function sanitizePlayerName(name) {
  const cleaned = String(name || "").trim().replace(/\s+/g, " ");
  if (!cleaned) {
    return "Anonymous";
  }
  return cleaned.slice(0, 32);
}

function getStoredPlayerName() {
  try {
    return localStorage.getItem(PLAYER_NAME_STORAGE_KEY) || "";
  } catch (error) {
    return "";
  }
}

function setStoredPlayerName(name) {
  try {
    localStorage.setItem(PLAYER_NAME_STORAGE_KEY, sanitizePlayerName(name));
  } catch (error) {
    // Ignore storage failures.
  }
}

function getLeaderboardEntries() {
  try {
    const raw = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function saveLeaderboardEntries(entries) {
  try {
    localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    // Ignore storage failures.
  }
}

function sortLeaderboard(entries) {
  return entries.slice().sort((a, b) => {
    if ((b.pct || 0) !== (a.pct || 0)) {
      return (b.pct || 0) - (a.pct || 0);
    }
    if ((b.correct || 0) !== (a.correct || 0)) {
      return (b.correct || 0) - (a.correct || 0);
    }
    return (a.ts || 0) - (b.ts || 0);
  });
}

function renderLeaderboard() {
  const listEl = document.getElementById("leaderboardList");
  const emptyEl = document.getElementById("leaderboardEmpty");
  if (!listEl || !emptyEl) {
    return;
  }

  const entries = sortLeaderboard(getLeaderboardEntries()).slice(0, 5);
  listEl.innerHTML = "";

  if (!entries.length) {
    emptyEl.dataset.hasScores = "false";
    emptyEl.style.display = "block";
    emptyEl.textContent = "No scores saved yet.";
    return;
  }

  emptyEl.dataset.hasScores = "true";
  emptyEl.style.display = "none";

  entries.forEach((entry, idx) => {
    const item = document.createElement("div");
    item.className = "leaderboard-item";
    item.innerHTML = `
      <div class="leaderboard-rank">${idx + 1}</div>
      <div class="leaderboard-name">${escHtml(entry.name)}</div>
      <div class="leaderboard-score">${entry.correct}/${entry.total} (${entry.pct}%)</div>
    `;
    listEl.appendChild(item);
  });
}

function saveCurrentScoreToLeaderboard() {
  if (!quiz.length || leaderboardSavedForCurrentQuiz) {
    return;
  }

  const nameInput = document.getElementById("leaderboardNameInput");
  const saveScoreBtn = document.getElementById("saveScoreBtn");
  const name = sanitizePlayerName(nameInput ? nameInput.value : "");
  const total = quiz.length;
  const correct = correctCount;
  const pct = total ? Math.round((correct / total) * 100) : 0;

  setStoredPlayerName(name);
  if (nameInput) {
    nameInput.value = name;
  }

  const entries = getLeaderboardEntries();
  entries.push({
    name,
    correct,
    total,
    pct,
    topic: currentTopic,
    ts: Date.now()
  });

  const topEntries = sortLeaderboard(entries).slice(0, 5);
  saveLeaderboardEntries(topEntries);
  renderLeaderboard();

  leaderboardSavedForCurrentQuiz = true;
  if (saveScoreBtn) {
    saveScoreBtn.disabled = true;
  }

  const flash = document.getElementById("feedbackFlash");
  flash.textContent = "Score saved to leaderboard";
  flash.className = "feedback-flash correct show";
  setTimeout(() => {
    flash.classList.remove("show");
  }, 1600);
}
function normalizeTopic(topic) {
  return String(topic || "").toLowerCase().trim();
}

function getHistoryStore() {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    return {};
  }
}

function saveHistoryStore(store) {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(store));
  } catch (error) {
    // Ignore storage write failures silently.
  }
}

function questionSignature(q) {
  return normalizeTopic(q.questionEn || q.question || "");
}

function buildHistoryKey(topic, boardLevel, chapterId, language) {
  return `${normalizeTopic(topic)}|${boardLevel}|${chapterId}|${language}`;
}

function pickQuestionsWithHistory(pool, numQuestions, historyKey, randomFn) {
  const store = getHistoryStore();
  const seen = Array.isArray(store[historyKey]) ? store[historyKey] : [];
  const seenSet = new Set(seen);

  const shuffled = shuffleArray(pool, randomFn);
  const unseen = shuffled.filter((q) => !seenSet.has(questionSignature(q)));

  let picked = unseen.slice(0, numQuestions);
  let fallbackUsed = false;

  if (picked.length < numQuestions) {
    const pickedSet = new Set(picked.map((q) => questionSignature(q)));
    const remaining = shuffled.filter((q) => !pickedSet.has(questionSignature(q)));
    picked = picked.concat(remaining.slice(0, numQuestions - picked.length));
    fallbackUsed = true;
  }

  const merged = seen.slice();
  const mergedSet = new Set(merged);
  picked.forEach((q) => {
    const sig = questionSignature(q);
    if (!mergedSet.has(sig)) {
      merged.push(sig);
      mergedSet.add(sig);
    }
  });
  store[historyKey] = merged.slice(-3000);
  saveHistoryStore(store);

  return { picked, fallbackUsed };
}

function seededRandom(seedInput) {
  let seed = 0;
  const s = String(seedInput);
  for (let i = 0; i < s.length; i += 1) {
    seed = (seed * 31 + s.charCodeAt(i)) >>> 0;
  }
  return function next() {
    seed += 0x6d2b79f5;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleArray(arr, randomFn) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(randomFn() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickN(arr, n, randomFn, excludeIdx) {
  const filtered = arr
    .map((v, idx) => ({ v, idx }))
    .filter((item) => item.idx !== excludeIdx)
    .map((item) => item.v);
  return shuffleArray(filtered, randomFn).slice(0, n);
}

function findBaseProfile(topic) {
  const normalized = normalizeTopic(topic);
  return BASE_TOPICS.find((profile) => profile.aliases.some((a) => normalized.includes(a)));
}

function findBdSubject(topic) {
  const normalized = normalizeTopic(topic);
  return BD_SUBJECTS.find((subject) => subject.aliases.some((a) => normalized.includes(a)));
}

function chapterById(subject, chapterId) {
  return subject.chapters.find((c) => c.id === chapterId);
}

function levelAllowed(chapter, boardLevel) {
  if (!chapter || boardLevel === "all") {
    return true;
  }
  return chapter.levels.includes(boardLevel);
}

function diffByIndex(i) {
  return ["easy", "medium", "hard"][i % 3];
}

function asLocalizedQuestion(data) {
  return {
    questionEn: data.questionEn,
    questionBn: data.questionBn,
    options: data.options,
    explanationEn: data.explanationEn,
    explanationBn: data.explanationBn,
    difficulty: data.difficulty,
    categoryEn: data.categoryEn,
    categoryBn: data.categoryBn,
    level: data.level,
    chapterId: data.chapterId
  };
}

function makeLocalizedMcq({
  questionEn,
  questionBn,
  correctEn,
  correctBn,
  wrongEn,
  wrongBn,
  explanationEn,
  explanationBn,
  difficulty,
  categoryEn,
  categoryBn,
  level,
  chapterId,
  randomFn
}) {
  const options = [
    { en: correctEn, bn: correctBn, isCorrect: true },
    { en: wrongEn[0], bn: wrongBn[0], isCorrect: false },
    { en: wrongEn[1], bn: wrongBn[1], isCorrect: false },
    { en: wrongEn[2], bn: wrongBn[2], isCorrect: false }
  ];
  const mixed = shuffleArray(options, randomFn);

  return asLocalizedQuestion({
    questionEn,
    questionBn,
    options: mixed,
    explanationEn,
    explanationBn,
    difficulty,
    categoryEn,
    categoryBn,
    level,
    chapterId
  });
}

function localizeQuestion(q, language) {
  const options = q.options.map((o) => (language === "bn" ? o.bn : o.en));
  const correct = q.options.findIndex((o) => o.isCorrect);

  return {
    question: language === "bn" ? (q.questionBn || q.questionEn) : q.questionEn,
    options,
    correct,
    explanation: language === "bn" ? (q.explanationBn || q.explanationEn) : q.explanationEn,
    difficulty: q.difficulty,
    category: language === "bn" ? (q.categoryBn || q.categoryEn) : q.categoryEn
  };
}

function normalizeBaseQuestion(q, forcedDifficulty) {
  return {
    questionEn: q.question,
    questionBn: q.question,
    options: q.options.map((opt, idx) => ({ en: opt, bn: opt, isCorrect: idx === q.correct })),
    explanationEn: q.explanation || "Review this concept and compare each option carefully.",
    explanationBn: q.explanation || "এই ধারণাটি আবার দেখো এবং সব অপশন তুলনা করো।",
    difficulty: forcedDifficulty === "mixed" ? (q.difficulty || "medium") : forcedDifficulty,
    categoryEn: q.category || "Core concepts",
    categoryBn: q.category || "Core concepts",
    level: "all",
    chapterId: "all"
  };
}

function buildTemplateQuestions(topic, count, difficulty, style, randomFn) {
  const styleWord = {
    factual: "factually strongest",
    conceptual: "most conceptually accurate",
    scenario: "best practical response",
    tricky: "most defensible under scrutiny"
  }[style] || "most accurate";

  const templates = [
    {
      q: `Which statement is the ${styleWord} description of ${topic}?`,
      c: `${topic} is best understood through clear definitions, key principles, and evidence-based examples.`,
      w: [
        `${topic} is only a disconnected list of facts.`,
        `${topic} can be mastered without understanding relationships.`,
        `${topic} has no practical relevance outside exams.`
      ],
      cat: "Foundations"
    },
    {
      q: `When learning ${topic}, which approach usually improves retention the most?`,
      c: "Practice retrieval and apply concepts to varied examples over time.",
      w: [
        "Read once quickly and avoid revisiting the topic.",
        "Focus only on difficult details and skip core ideas.",
        "Use passive highlighting without self-testing."
      ],
      cat: "Learning strategy"
    },
    {
      q: `In a real-world scenario involving ${topic}, what is the best first step?`,
      c: "Clarify objective, constraints, and assumptions before selecting a method.",
      w: [
        "Choose a method immediately without checking context.",
        "Ignore trade-offs and optimize one metric blindly.",
        "Use the most complex method by default."
      ],
      cat: "Application"
    }
  ];

  const output = [];
  for (let i = 0; i < count; i += 1) {
    const t = templates[i % templates.length];
    output.push(makeLocalizedMcq({
      questionEn: t.q,
      questionBn: t.q,
      correctEn: t.c,
      correctBn: t.c,
      wrongEn: t.w,
      wrongBn: t.w,
      explanationEn: `The strongest choice reflects structured reasoning for ${topic}.`,
      explanationBn: `${topic} বিষয়ে শক্তিশালী উত্তরে কাঠামোবদ্ধ যুক্তি থাকে।`,
      difficulty: difficulty === "mixed" ? diffByIndex(i) : difficulty,
      categoryEn: t.cat,
      categoryBn: t.cat,
      level: "all",
      chapterId: "all",
      randomFn
    }));
  }

  return output;
}

function generateMathBank(subject, targetCount, randomFn) {
  const out = [];

  for (let i = 0; i < targetCount; i += 1) {
    const chapter = subject.chapters[i % subject.chapters.length];
    const level = chapter.levels.includes("hsc") && !chapter.levels.includes("ssc") ? "hsc" : (chapter.levels.includes("ssc") ? "ssc" : "all");
    const d = diffByIndex(i);

    if (chapter.id === "math-algebra") {
      const a = (i % 5) + 2;
      const b = (i % 7) + 3;
      const c = a * b;
      const qEn = `If ${a}x = ${c}, what is x?`;
      const qBn = `${a}x = ${c} হলে, x এর মান কত?`;
      const ans = String(b);
      const wrong = [String(b + 1), String(b - 1 > 0 ? b - 1 : b + 2), String(a)];
      out.push(makeLocalizedMcq({
        questionEn: qEn,
        questionBn: qBn,
        correctEn: ans,
        correctBn: ans,
        wrongEn: wrong,
        wrongBn: wrong,
        explanationEn: `Divide both sides by ${a} to get x = ${b}.`,
        explanationBn: `উভয় পাশে ${a} দিয়ে ভাগ করলে x = ${b} পাওয়া যায়।`,
        difficulty: d,
        categoryEn: chapter.en,
        categoryBn: chapter.bn,
        level,
        chapterId: chapter.id,
        randomFn
      }));
    } else if (chapter.id === "math-geometry") {
      const base = 8 + (i % 9);
      const h = 4 + (i % 6);
      const area = Math.round((base * h) / 2);
      out.push(makeLocalizedMcq({
        questionEn: `What is the area of a triangle with base ${base} cm and height ${h} cm?`,
        questionBn: `ভিত্তি ${base} সেমি এবং উচ্চতা ${h} সেমি হলে ত্রিভুজের ক্ষেত্রফল কত?`,
        correctEn: `${area} sq cm`,
        correctBn: `${area} বর্গ সেমি`,
        wrongEn: [`${base * h} sq cm`, `${base + h} sq cm`, `${Math.abs(base - h)} sq cm`],
        wrongBn: [`${base * h} বর্গ সেমি`, `${base + h} বর্গ সেমি`, `${Math.abs(base - h)} বর্গ সেমি`],
        explanationEn: "Area of triangle = 1/2 x base x height.",
        explanationBn: "ত্রিভুজের ক্ষেত্রফল = 1/2 x ভিত্তি x উচ্চতা।",
        difficulty: d,
        categoryEn: chapter.en,
        categoryBn: chapter.bn,
        level,
        chapterId: chapter.id,
        randomFn
      }));
    } else if (chapter.id === "math-statistics") {
      const n1 = 2 + (i % 6);
      const n2 = 4 + (i % 7);
      const n3 = 6 + (i % 8);
      const n4 = 8 + (i % 9);
      const mean = ((n1 + n2 + n3 + n4) / 4).toFixed(1);
      out.push(makeLocalizedMcq({
        questionEn: `Find the mean of ${n1}, ${n2}, ${n3}, ${n4}.`,
        questionBn: `${n1}, ${n2}, ${n3}, ${n4} এর গড় নির্ণয় করো।`,
        correctEn: String(mean),
        correctBn: String(mean),
        wrongEn: [String((n1 + n2 + n3 + n4) / 2), String((n1 + n4) / 2), String(n2)],
        wrongBn: [String((n1 + n2 + n3 + n4) / 2), String((n1 + n4) / 2), String(n2)],
        explanationEn: "Mean = sum of observations divided by number of observations.",
        explanationBn: "গড় = মোট মানের যোগফল / মোট মানের সংখ্যা।",
        difficulty: d,
        categoryEn: chapter.en,
        categoryBn: chapter.bn,
        level,
        chapterId: chapter.id,
        randomFn
      }));
    } else if (chapter.id === "math-trigonometry") {
      const qType = i % 2;
      if (qType === 0) {
        out.push(makeLocalizedMcq({
          questionEn: "What is the value of sin^2(theta) + cos^2(theta)?",
          questionBn: "sin^2(theta) + cos^2(theta) এর মান কত?",
          correctEn: "1",
          correctBn: "1",
          wrongEn: ["0", "2", "tan(theta)"],
          wrongBn: ["0", "2", "tan(theta)"],
          explanationEn: "This is a fundamental trigonometric identity.",
          explanationBn: "এটি ত্রিকোণমিতির একটি মৌলিক পরিচিতি।",
          difficulty: d,
          categoryEn: chapter.en,
          categoryBn: chapter.bn,
          level,
          chapterId: chapter.id,
          randomFn
        }));
      } else {
        out.push(makeLocalizedMcq({
          questionEn: "Which relation is always true?",
          questionBn: "নিচের কোন সম্পর্কটি সর্বদা সত্য?",
          correctEn: "tan(theta) = sin(theta)/cos(theta)",
          correctBn: "tan(theta) = sin(theta)/cos(theta)",
          wrongEn: ["sin(theta) = cos(theta)", "tan(theta) = cos(theta)/sin(theta)", "sin(theta)+cos(theta)=1"],
          wrongBn: ["sin(theta) = cos(theta)", "tan(theta) = cos(theta)/sin(theta)", "sin(theta)+cos(theta)=1"],
          explanationEn: "tan(theta) is defined as sin(theta)/cos(theta).",
          explanationBn: "tan(theta) এর সংজ্ঞা sin(theta)/cos(theta)।",
          difficulty: d,
          categoryEn: chapter.en,
          categoryBn: chapter.bn,
          level,
          chapterId: chapter.id,
          randomFn
        }));
      }
    } else if (chapter.id === "math-functions") {
      const m = 2 + (i % 5);
      const c0 = 1 + (i % 4);
      const x = 2 + (i % 6);
      const y = m * x + c0;
      out.push(makeLocalizedMcq({
        questionEn: `For f(x) = ${m}x + ${c0}, what is f(${x})?`,
        questionBn: `f(x) = ${m}x + ${c0} হলে, f(${x}) কত?`,
        correctEn: String(y),
        correctBn: String(y),
        wrongEn: [String(y + 1), String(y - 1), String(m + c0)],
        wrongBn: [String(y + 1), String(y - 1), String(m + c0)],
        explanationEn: `Substitute x = ${x} in f(x).`,
        explanationBn: `f(x) এ x = ${x} বসাও।`,
        difficulty: d,
        categoryEn: chapter.en,
        categoryBn: chapter.bn,
        level,
        chapterId: chapter.id,
        randomFn
      }));
    } else {
      const n = 2 + (i % 7);
      const k = 1 + (i % 4);
      const deriv = n * k;
      out.push(makeLocalizedMcq({
        questionEn: `If y = ${n}x^${k}, what is dy/dx?`,
        questionBn: `y = ${n}x^${k} হলে, dy/dx কত?`,
        correctEn: `${deriv}x^${k - 1}`,
        correctBn: `${deriv}x^${k - 1}`,
        wrongEn: [`${n + k}x^${k}`, `${n}x^${k - 1}`, `${deriv}x^${k}`],
        wrongBn: [`${n + k}x^${k}`, `${n}x^${k - 1}`, `${deriv}x^${k}`],
        explanationEn: "Use the power rule: d(ax^n)/dx = a*n*x^(n-1).",
        explanationBn: "পাওয়ার রুল: d(ax^n)/dx = a*n*x^(n-1)।",
        difficulty: d,
        categoryEn: chapter.en,
        categoryBn: chapter.bn,
        level,
        chapterId: chapter.id,
        randomFn
      }));
    }
  }

  return out;
}

function generatePhysicsBank(subject, targetCount, randomFn) {
  const out = [];

  for (let i = 0; i < targetCount; i += 1) {
    const chapter = subject.chapters[i % subject.chapters.length];
    const level = chapter.levels.includes("hsc") && !chapter.levels.includes("ssc") ? "hsc" : (chapter.levels.includes("ssc") ? "ssc" : "all");
    const d = diffByIndex(i);

    if (chapter.id === "phy-motion") {
      const m = 2 + (i % 8);
      const a = 3 + (i % 6);
      const f = m * a;
      out.push(makeLocalizedMcq({
        questionEn: `A body of mass ${m} kg accelerates at ${a} m/s^2. What is the force?`,
        questionBn: `${m} কেজি ভর ${a} m/s^2 ত্বরণে চললে বল কত হবে?`,
        correctEn: `${f} N`,
        correctBn: `${f} N`,
        wrongEn: [`${m + a} N`, `${f + a} N`, `${f - a} N`],
        wrongBn: [`${m + a} N`, `${f + a} N`, `${f - a} N`],
        explanationEn: "Newton's second law: F = ma.",
        explanationBn: "নিউটনের দ্বিতীয় সূত্র: F = ma।",
        difficulty: d,
        categoryEn: chapter.en,
        categoryBn: chapter.bn,
        level,
        chapterId: chapter.id,
        randomFn
      }));
    } else if (chapter.id === "phy-work") {
      const force = 10 + (i % 15);
      const distance = 2 + (i % 7);
      const work = force * distance;
      out.push(makeLocalizedMcq({
        questionEn: `If force is ${force} N and displacement is ${distance} m, work done is?`,
        questionBn: `বল ${force} N এবং সরণ ${distance} m হলে, কাজের মান কত?`,
        correctEn: `${work} J`,
        correctBn: `${work} J`,
        wrongEn: [`${force + distance} J`, `${Math.round(work / 2)} J`, `${work + 10} J`],
        wrongBn: [`${force + distance} J`, `${Math.round(work / 2)} J`, `${work + 10} J`],
        explanationEn: "Work = Force x displacement in direction of force.",
        explanationBn: "কাজ = বল x বলের দিকে সরণ।",
        difficulty: d,
        categoryEn: chapter.en,
        categoryBn: chapter.bn,
        level,
        chapterId: chapter.id,
        randomFn
      }));
    } else if (chapter.id === "phy-electricity") {
      const v = 6 + (i % 12);
      const r = 2 + (i % 6);
      const curr = (v / r).toFixed(2);
      out.push(makeLocalizedMcq({
        questionEn: `In a resistor of ${r} ohm with potential difference ${v} V, current is?`,
        questionBn: `${r} ওহম রোধে বিভব পার্থক্য ${v} V হলে, প্রবাহ কত?`,
        correctEn: `${curr} A`,
        correctBn: `${curr} A`,
        wrongEn: [`${v * r} A`, `${r / v} A`, `${(v - r).toFixed(2)} A`],
        wrongBn: [`${v * r} A`, `${r / v} A`, `${(v - r).toFixed(2)} A`],
        explanationEn: "Ohm's law gives I = V/R.",
        explanationBn: "ওহমের সূত্র অনুযায়ী I = V/R।",
        difficulty: d,
        categoryEn: chapter.en,
        categoryBn: chapter.bn,
        level,
        chapterId: chapter.id,
        randomFn
      }));
    } else if (chapter.id === "phy-wave") {
      out.push(makeLocalizedMcq({
        questionEn: "Which quantity mainly determines the pitch of sound?",
        questionBn: "শব্দের তীক্ষ্ণতা (Pitch) প্রধানত কোন রাশির উপর নির্ভর করে?",
        correctEn: "Frequency",
        correctBn: "কম্পাঙ্ক",
        wrongEn: ["Amplitude", "Speed in vacuum only", "Energy loss"],
        wrongBn: ["প্রশস্ততা", "শুধু শূন্যে বেগ", "শক্তি ক্ষয়"],
        explanationEn: "Higher frequency corresponds to higher pitch.",
        explanationBn: "বেশি কম্পাঙ্ক হলে পিচ বেশি হয়।",
        difficulty: d,
        categoryEn: chapter.en,
        categoryBn: chapter.bn,
        level,
        chapterId: chapter.id,
        randomFn
      }));
    } else if (chapter.id === "phy-optics") {
      out.push(makeLocalizedMcq({
        questionEn: "For an object placed beyond 2F in a convex lens, image forms where?",
        questionBn: "উত্তল লেন্সে বস্তু 2F এর বাইরে থাকলে প্রতিচ্ছবি কোথায় গঠিত হয়?",
        correctEn: "Between F and 2F on the opposite side",
        correctBn: "বিপরীত পাশে F ও 2F এর মধ্যে",
        wrongEn: ["At infinity", "At optical center", "On the same side as a virtual image"],
        wrongBn: ["অসীমে", "অপটিক্যাল কেন্দ্রে", "একই পাশে কাল্পনিক প্রতিচ্ছবি হিসেবে"],
        explanationEn: "Lens rules: object beyond 2F gives real inverted image between F and 2F.",
        explanationBn: "লেন্সের নিয়ম অনুযায়ী 2F এর বাইরে বস্তু হলে প্রতিচ্ছবি F ও 2F এর মধ্যে হয়।",
        difficulty: d,
        categoryEn: chapter.en,
        categoryBn: chapter.bn,
        level,
        chapterId: chapter.id,
        randomFn
      }));
    } else {
      out.push(makeLocalizedMcq({
        questionEn: "Which statement about Einstein's photoelectric effect is correct?",
        questionBn: "আইনস্টাইনের ফটোইলেকট্রিক প্রভাব সম্পর্কে কোন বক্তব্যটি সঠিক?",
        correctEn: "Light behaves as photons carrying quantized energy.",
        correctBn: "আলো ফোটন আকারে কুয়ান্টাইজড শক্তি বহন করে।",
        wrongEn: ["Only wave amplitude controls electron emission", "Frequency has no role", "All metals emit at any frequency"],
        wrongBn: ["শুধু তরঙ্গের প্রশস্ততা ইলেকট্রন নির্গমন নিয়ন্ত্রণ করে", "কম্পাঙ্কের কোনো ভূমিকা নেই", "সব ধাতু যেকোনো কম্পাঙ্কে ইলেকট্রন নির্গত করে"],
        explanationEn: "Photon model explains threshold frequency in photoelectric effect.",
        explanationBn: "ফোটন মডেল থ্রেশহোল্ড কম্পাঙ্ক ব্যাখ্যা করে।",
        difficulty: d,
        categoryEn: chapter.en,
        categoryBn: chapter.bn,
        level,
        chapterId: chapter.id,
        randomFn
      }));
    }
  }

  return out;
}

function generateChemistryBank(subject, targetCount, randomFn) {
  const compounds = [
    { f: "H2O", m: 18 },
    { f: "CO2", m: 44 },
    { f: "NH3", m: 17 },
    { f: "CH4", m: 16 },
    { f: "NaCl", m: 58.5 }
  ];
  const out = [];

  for (let i = 0; i < targetCount; i += 1) {
    const chapter = subject.chapters[i % subject.chapters.length];
    const level = chapter.levels.includes("hsc") && !chapter.levels.includes("ssc") ? "hsc" : (chapter.levels.includes("ssc") ? "ssc" : "all");
    const d = diffByIndex(i);

    if (chapter.id === "chem-atomic") {
      out.push(makeLocalizedMcq({
        questionEn: "Which particle determines atomic number?",
        questionBn: "পারমাণবিক সংখ্যা কোন কণা দ্বারা নির্ধারিত হয়?",
        correctEn: "Proton",
        correctBn: "প্রোটন",
        wrongEn: ["Neutron", "Electron", "Molecule"],
        wrongBn: ["নিউট্রন", "ইলেকট্রন", "অণু"],
        explanationEn: "Atomic number equals number of protons in the nucleus.",
        explanationBn: "পারমাণবিক সংখ্যা = নিউক্লিয়াসে প্রোটনের সংখ্যা।",
        difficulty: d,
        categoryEn: chapter.en,
        categoryBn: chapter.bn,
        level,
        chapterId: chapter.id,
        randomFn
      }));
    } else if (chapter.id === "chem-bond") {
      out.push(makeLocalizedMcq({
        questionEn: "Which bond forms by sharing electron pairs?",
        questionBn: "ইলেকট্রন জোড়া ভাগাভাগির মাধ্যমে কোন বন্ধন গঠিত হয়?",
        correctEn: "Covalent bond",
        correctBn: "সমযোজী বন্ধন",
        wrongEn: ["Ionic bond", "Metallic bond", "Hydrogen bond"],
        wrongBn: ["আয়নিক বন্ধন", "ধাতব বন্ধন", "হাইড্রোজেন বন্ধন"],
        explanationEn: "Covalent bonds are formed by sharing electrons.",
        explanationBn: "ইলেকট্রন ভাগাভাগির মাধ্যমে সমযোজী বন্ধন গঠিত হয়।",
        difficulty: d,
        categoryEn: chapter.en,
        categoryBn: chapter.bn,
        level,
        chapterId: chapter.id,
        randomFn
      }));
    } else if (chapter.id === "chem-acid") {
      const pH = i % 2 === 0 ? "7" : "less than 7";
      out.push(makeLocalizedMcq({
        questionEn: "At room temperature, pH of a neutral solution is?",
        questionBn: "কক্ষ তাপমাত্রায় নিরপেক্ষ দ্রবণের pH কত?",
        correctEn: "7",
        correctBn: "7",
        wrongEn: ["1", "14", pH],
        wrongBn: ["1", "14", pH],
        explanationEn: "Neutral aqueous solution has pH around 7.",
        explanationBn: "নিরপেক্ষ জলীয় দ্রবণের pH প্রায় 7।",
        difficulty: d,
        categoryEn: chapter.en,
        categoryBn: chapter.bn,
        level,
        chapterId: chapter.id,
        randomFn
      }));
    } else if (chapter.id === "chem-stoich") {
      const cmp = compounds[i % compounds.length];
      out.push(makeLocalizedMcq({
        questionEn: `What is the molar mass of ${cmp.f}?`,
        questionBn: `${cmp.f} এর মোলার ভর কত?`,
        correctEn: `${cmp.m} g/mol`,
        correctBn: `${cmp.m} g/mol`,
        wrongEn: [`${cmp.m + 2} g/mol`, `${cmp.m - 2} g/mol`, `${cmp.m + 10} g/mol`],
        wrongBn: [`${cmp.m + 2} g/mol`, `${cmp.m - 2} g/mol`, `${cmp.m + 10} g/mol`],
        explanationEn: "Molar mass is the sum of atomic masses in the chemical formula.",
        explanationBn: "রাসায়নিক সংকেতে সব পরমাণুর ভর যোগ করলে মোলার ভর পাওয়া যায়।",
        difficulty: d,
        categoryEn: chapter.en,
        categoryBn: chapter.bn,
        level,
        chapterId: chapter.id,
        randomFn
      }));
    } else if (chapter.id === "chem-organic") {
      out.push(makeLocalizedMcq({
        questionEn: "Which functional group is present in alcohols?",
        questionBn: "অ্যালকোহলে কোন ফাংশনাল গ্রুপ থাকে?",
        correctEn: "-OH (hydroxyl)",
        correctBn: "-OH (হাইড্রক্সিল)",
        wrongEn: ["-CHO", "-COOH", "-NH2"],
        wrongBn: ["-CHO", "-COOH", "-NH2"],
        explanationEn: "Alcohols are characterized by hydroxyl (-OH) functional group.",
        explanationBn: "অ্যালকোহলের বৈশিষ্ট্যসূচক গ্রুপ হলো -OH।",
        difficulty: d,
        categoryEn: chapter.en,
        categoryBn: chapter.bn,
        level,
        chapterId: chapter.id,
        randomFn
      }));
    } else {
      out.push(makeLocalizedMcq({
        questionEn: "Why does electrolysis require an external source of electrical energy?",
        questionBn: "ইলেকট্রোলাইসিসে বাহ্যিক বৈদ্যুতিক শক্তি কেন প্রয়োজন?",
        correctEn: "To drive a non-spontaneous chemical reaction",
        correctBn: "অ-স্বতঃস্ফূর্ত রাসায়নিক বিক্রিয়া চালাতে",
        wrongEn: ["To reduce all electrode mass", "To convert all ions into gas", "To eliminate oxidation"],
        wrongBn: ["সব ইলেক্ট্রোডের ভর কমাতে", "সব আয়নকে গ্যাসে রূপান্তর করতে", "জারণ সম্পূর্ণ বন্ধ করতে"],
        explanationEn: "Electrolysis uses electrical energy to force non-spontaneous reactions.",
        explanationBn: "ইলেকট্রোলাইসিসে বিদ্যুৎ শক্তি দিয়ে অ-স্বতঃস্ফূর্ত বিক্রিয়া ঘটানো হয়।",
        difficulty: d,
        categoryEn: chapter.en,
        categoryBn: chapter.bn,
        level,
        chapterId: chapter.id,
        randomFn
      }));
    }
  }

  return out;
}

function generateFactBasedBank(subject, targetCount, randomFn) {
  const facts = FACT_BANK[subject.key] || [];
  const out = [];
  const templates = [
    {
      en: (chapter) => `In ${chapter.en}, which statement is correct?`,
      bn: (chapter) => `${chapter.bn} অধ্যায়ে কোন বক্তব্যটি সঠিক?`
    },
    {
      en: (chapter) => `Choose the accurate concept from ${chapter.en}.`,
      bn: (chapter) => `${chapter.bn} থেকে সঠিক ধারণাটি নির্বাচন করো।`
    },
    {
      en: (chapter) => `Which option best matches ${chapter.en}?`,
      bn: (chapter) => `${chapter.bn} এর সাথে সবচেয়ে বেশি মিল কোন অপশনের?`
    }
  ];

  if (facts.length < 4) {
    return out;
  }

  for (let i = 0; i < targetCount; i += 1) {
    const chapter = subject.chapters[i % subject.chapters.length];
    const pool = facts.filter((f) => f.c === chapter.id);
    if (pool.length < 1) {
      continue;
    }

    const correctIdx = Math.floor(randomFn() * pool.length);
    const correct = pool[correctIdx];
    const allWrongCandidates = facts.filter((f) => f !== correct);
    const wrongs = shuffleArray(allWrongCandidates, randomFn).slice(0, 3);
    const t = templates[i % templates.length];

    out.push(makeLocalizedMcq({
      questionEn: t.en(chapter),
      questionBn: t.bn(chapter),
      correctEn: correct.en,
      correctBn: correct.bn,
      wrongEn: wrongs.map((w) => w.en),
      wrongBn: wrongs.map((w) => w.bn),
      explanationEn: `Correct concept: ${correct.en}`,
      explanationBn: `সঠিক ধারণা: ${correct.bn}`,
      difficulty: correct.d || diffByIndex(i),
      categoryEn: chapter.en,
      categoryBn: chapter.bn,
      level: correct.lv || "all",
      chapterId: chapter.id,
      randomFn
    }));
  }

  return out;
}

function generateBangladeshSubjectBank(subject, randomFn) {
  const targetCount = 140;

  if (subject.key === "bd-math") {
    return generateMathBank(subject, targetCount, randomFn);
  }
  if (subject.key === "bd-physics") {
    return generatePhysicsBank(subject, targetCount, randomFn);
  }
  if (subject.key === "bd-chemistry") {
    return generateChemistryBank(subject, targetCount, randomFn);
  }

  // Conceptual banks still generate 100+ unique questions by rotating facts and templates.
  return generateFactBasedBank(subject, targetCount, randomFn);
}

function applyFilters(pool, difficulty, boardLevel, chapterId) {
  let filtered = pool.slice();

  if (boardLevel !== "all") {
    filtered = filtered.filter((q) => q.level === boardLevel || q.level === "all");
  }

  if (chapterId !== "all") {
    filtered = filtered.filter((q) => q.chapterId === chapterId);
  }

  if (difficulty !== "mixed") {
    const strict = filtered.filter((q) => q.difficulty === difficulty);
    if (strict.length > 0) {
      filtered = strict;
    }
  }

  return filtered;
}

function buildQuiz(topic, numQuestions, difficulty, style, boardLevel, chapterId, language) {
  historyFallbackUsed = false;
  const randomFn = seededRandom(`${topic}|${numQuestions}|${difficulty}|${style}|${boardLevel}|${chapterId}|${language}`);
  const historyKey = buildHistoryKey(topic, boardLevel, chapterId, language);

  const bdSubject = findBdSubject(topic);
  if (bdSubject) {
    const strictChemistry = bdSubject.key === "bd-chemistry";
    let pool = generateBangladeshSubjectBank(bdSubject, randomFn);
    pool = applyFilters(pool, difficulty, boardLevel, chapterId);

    if (!strictChemistry && pool.length < numQuestions) {
      // Relax difficulty first, then chapter filter if needed.
      pool = generateBangladeshSubjectBank(bdSubject, randomFn);
      pool = applyFilters(pool, "mixed", boardLevel, chapterId);
    }

    if (!strictChemistry && pool.length < numQuestions) {
      pool = generateBangladeshSubjectBank(bdSubject, randomFn);
      pool = applyFilters(pool, "mixed", boardLevel, "all");
    }

    const selected = pickQuestionsWithHistory(pool, numQuestions, historyKey, randomFn);
    historyFallbackUsed = selected.fallbackUsed;
    return selected.picked.map((q) => localizeQuestion(q, language));
  }

  const baseProfile = findBaseProfile(topic);
  let pool = [];
  if (baseProfile) {
    pool = baseProfile.questions.map((q) => normalizeBaseQuestion(q, difficulty));
  }

  const targetPoolSize = Math.max(numQuestions, 14);
  if (pool.length < targetPoolSize) {
    pool = pool.concat(buildTemplateQuestions(topic, targetPoolSize - pool.length, difficulty, style, randomFn));
  }

  pool = applyFilters(pool, difficulty, "all", "all");
  const selected = pickQuestionsWithHistory(pool, numQuestions, historyKey, randomFn);
  historyFallbackUsed = selected.fallbackUsed;
  return selected.picked.map((q) => localizeQuestion(q, language));
}

function buildFilteredPoolStrict(topic, difficulty, style, boardLevel, chapterId, language) {
  const randomFn = seededRandom(`${topic}|strict|${difficulty}|${style}|${boardLevel}|${chapterId}|${language}`);

  const bdSubject = findBdSubject(topic);
  if (bdSubject) {
    let pool = generateBangladeshSubjectBank(bdSubject, randomFn);
    pool = applyFilters(pool, difficulty, boardLevel, chapterId);
    return shuffleArray(pool, randomFn).map((q) => localizeQuestion(q, language));
  }

  const baseProfile = findBaseProfile(topic);
  let pool = [];
  if (baseProfile) {
    pool = baseProfile.questions.map((q) => normalizeBaseQuestion(q, difficulty));
  }

  const targetPoolSize = 40;
  if (pool.length < targetPoolSize) {
    pool = pool.concat(buildTemplateQuestions(topic, targetPoolSize - pool.length, difficulty, style, randomFn));
  }

  pool = applyFilters(pool, difficulty, "all", "all");
  return shuffleArray(pool, randomFn).map((q) => localizeQuestion(q, language));
}

function getCurrentBdSubject() {
  const topic = document.getElementById("topicInput").value.trim();
  return findBdSubject(topic);
}

function updateChapterOptions() {
  if (USE_OPEN_TRIVIA_API) {
    applyApiModeUiConstraints();
    return;
  }

  const chapterSelect = document.getElementById("chapterSelect");
  const boardLevelSelect = document.getElementById("boardLevel");
  const language = document.getElementById("languageSelect").value;
  const boardLevel = boardLevelSelect.value;
  const subject = getCurrentBdSubject();
  const previousValue = chapterSelect.value;

  chapterSelect.innerHTML = "";

  if (!subject) {
    chapterSelect.innerHTML = `<option value="all" selected>${t("allChapters")}</option>`;
    chapterSelect.disabled = true;
    boardLevelSelect.disabled = true;
    renderChapterChips(null, [], language);
    return;
  }

  boardLevelSelect.disabled = false;
  chapterSelect.disabled = false;

  const allLabel = t("allChapters");
  chapterSelect.innerHTML = `<option value="all" selected>${allLabel}</option>`;

  const chapters = subject.chapters.filter((chapter) => levelAllowed(chapter, boardLevel));
  chapters.forEach((chapter) => {
      const opt = document.createElement("option");
      opt.value = chapter.id;
      opt.textContent = language === "bn" ? chapter.bn : chapter.en;
      chapterSelect.appendChild(opt);
  });

  if (chapters.some((chapter) => chapter.id === previousValue)) {
    chapterSelect.value = previousValue;
  }

  renderChapterChips(subject, chapters, language);
  syncChapterChipSelection();
}

function renderChapterChips(subject, chapters, language) {
  const chipBlock = document.getElementById("chapterChipBlock");
  const chipWrap = document.getElementById("chapterChips");
  if (!chipBlock || !chipWrap) {
    return;
  }

  chipWrap.innerHTML = "";
  if (!subject || chapters.length === 0) {
    chipBlock.style.display = "none";
    return;
  }

  chipBlock.style.display = "block";

  const allChip = document.createElement("button");
  allChip.className = "chip chapter-chip active";
  allChip.type = "button";
  allChip.dataset.chapter = "all";
  allChip.textContent = t("allChapters");
  chipWrap.appendChild(allChip);

  chapters.forEach((chapter) => {
    const chip = document.createElement("button");
    chip.className = "chip chapter-chip";
    chip.type = "button";
    chip.dataset.chapter = chapter.id;
    chip.textContent = language === "bn" ? chapter.bn : chapter.en;
    chipWrap.appendChild(chip);
  });
}

function syncChapterChipSelection() {
  const chapterSelect = document.getElementById("chapterSelect");
  const selected = chapterSelect.value || "all";
  document.querySelectorAll(".chapter-chip").forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.chapter === selected);
  });
}

function getQuizConfig() {
  const selectedCategory = selectedCategoryOption();
  return {
    topic: document.getElementById("topicInput").value.trim() || (selectedCategory ? selectedCategory.topic : ""),
    numQ: parseInt(document.getElementById("numQuestions").value, 10),
    difficulty: document.getElementById("difficulty").value,
    style: document.getElementById("quizStyle").value,
    boardLevel: document.getElementById("boardLevel").value,
    chapterId: document.getElementById("chapterSelect").value,
    language: document.getElementById("languageSelect").value,
    selectedCategoryKey: selectedQuizCategoryKey,
    selectedCategoryId: selectedCategory ? selectedCategory.apiCategoryId : null
  };
}

const OPEN_TRIVIA_API_BASE = "https://opentdb.com";
let triviaCategoryCache = null;

function decodeUrl3986(value) {
  try {
    return decodeURIComponent(String(value || ""));
  } catch (error) {
    return String(value || "");
  }
}

function normalizeTopicKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function getTriviaCategories() {
  if (Array.isArray(triviaCategoryCache)) {
    return triviaCategoryCache;
  }

  const response = await fetch(`${OPEN_TRIVIA_API_BASE}/api_category.php`);
  if (!response.ok) {
    throw new Error("Failed to load quiz categories.");
  }

  const data = await response.json();
  triviaCategoryCache = Array.isArray(data.trivia_categories) ? data.trivia_categories : [];
  return triviaCategoryCache;
}

async function resolveTriviaCategoryId(topic) {
  const normalizedTopic = normalizeTopicKey(topic);
  if (!normalizedTopic) {
    return null;
  }

  const categories = await getTriviaCategories();
  const topicWords = normalizedTopic.split(" ").filter(Boolean);
  if (!topicWords.length) {
    return null;
  }

  let bestMatch = null;
  let bestScore = 0;

  categories.forEach((category) => {
    const categoryName = normalizeTopicKey(category.name);
    let score = 0;

    topicWords.forEach((word) => {
      if (categoryName.includes(word)) {
        score += 1;
      }
    });

    if (categoryName.includes(normalizedTopic)) {
      score += 4;
    }
    if (normalizedTopic.includes(categoryName)) {
      score += 2;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = category;
    }
  });

  return bestScore > 0 ? bestMatch.id : null;
}

function mapTriviaDifficulty(level) {
  const normalized = String(level || "").toLowerCase();
  if (normalized === "easy" || normalized === "medium" || normalized === "hard") {
    return normalized;
  }
  return "medium";
}

function mapTriviaResultsToQuiz(results) {
  return results.map((item) => {
    const question = decodeUrl3986(item.question);
    const correctAnswer = decodeUrl3986(item.correct_answer);
    const incorrectAnswers = Array.isArray(item.incorrect_answers)
      ? item.incorrect_answers.map((ans) => decodeUrl3986(ans))
      : [];

    const options = shuffleArray([correctAnswer].concat(incorrectAnswers), Math.random);
    const correctIndex = options.indexOf(correctAnswer);

    return {
      question,
      options,
      correct: correctIndex < 0 ? 0 : correctIndex,
      explanation: "Source: Open Trivia Database",
      difficulty: mapTriviaDifficulty(item.difficulty),
      category: decodeUrl3986(item.category || "General"),
      level: "all",
      chapterId: "all"
    };
  });
}

async function fetchQuizFromOpenTrivia(cfg) {
  async function requestAttempt(amount, includeCategory, includeDifficulty, categoryId) {
    const params = new URLSearchParams();
    params.set("amount", String(amount));
    params.set("type", "multiple");
    params.set("encode", "url3986");

    if (includeDifficulty && cfg.difficulty !== "mixed") {
      params.set("difficulty", cfg.difficulty);
    }

    if (includeCategory && categoryId) {
      params.set("category", String(categoryId));
    }

    const endpoint = `${OPEN_TRIVIA_API_BASE}/api.php?${params.toString()}`;
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error("Could not fetch quiz questions from Open Trivia DB.");
    }

    const data = await response.json();
    if (data.response_code !== 0 || !Array.isArray(data.results)) {
      return [];
    }
    return data.results;
  }

  const categoryId = cfg.selectedCategoryId || await resolveTriviaCategoryId(cfg.topic);
  const attempts = [
    { includeCategory: true, includeDifficulty: true },
    { includeCategory: true, includeDifficulty: false },
    { includeCategory: false, includeDifficulty: true },
    { includeCategory: false, includeDifficulty: false }
  ];

  const seenQuestions = new Set();
  const mergedResults = [];

  for (const attempt of attempts) {
    if (attempt.includeCategory && !categoryId) {
      continue;
    }
    if (!attempt.includeCategory && cfg.selectedCategoryId) {
      continue;
    }
    if (attempt.includeDifficulty && cfg.difficulty === "mixed") {
      continue;
    }

    const results = await requestAttempt(cfg.numQ, attempt.includeCategory, attempt.includeDifficulty, categoryId);
    results.forEach((item) => {
      const key = String(item.question || "");
      if (!seenQuestions.has(key)) {
        seenQuestions.add(key);
        mergedResults.push(item);
      }
    });

    if (mergedResults.length >= cfg.numQ) {
      return mapTriviaResultsToQuiz(mergedResults.slice(0, cfg.numQ));
    }
  }

  // Final wide retry: ask for a larger set with no category/difficulty, then trim.
  const wideResults = await requestAttempt(
    Math.max(cfg.numQ, 50),
    Boolean(cfg.selectedCategoryId),
    false,
    categoryId
  );
  wideResults.forEach((item) => {
    const key = String(item.question || "");
    if (!seenQuestions.has(key)) {
      seenQuestions.add(key);
      mergedResults.push(item);
    }
  });

  if (mergedResults.length >= cfg.numQ) {
    return mapTriviaResultsToQuiz(mergedResults.slice(0, cfg.numQ));
  }

  throw new Error(getCurrentLanguage() === "bn"
    ? "Open Trivia DB থেকে যথেষ্ট প্রশ্ন পাওয়া যায়নি।"
    : "Open Trivia DB could not return enough questions after fallback retries.");
}

function csvEscape(value) {
  const s = String(value == null ? "" : value);
  return `"${s.replace(/"/g, '""')}"`;
}

function exportFilteredSet() {
  const cfg = getQuizConfig();
  if (!cfg.topic) {
    document.getElementById("errorBox").classList.add("show");
    document.getElementById("errorMsg").textContent = t("noTopic");
    document.getElementById("topicInput").focus();
    return;
  }

  const pool = buildFilteredPoolStrict(
    cfg.topic,
    cfg.difficulty,
    cfg.style,
    cfg.boardLevel,
    cfg.chapterId,
    cfg.language
  );

  if (!pool.length) {
    document.getElementById("errorBox").classList.add("show");
    document.getElementById("errorMsg").textContent = t("exportEmpty");
    return;
  }

  const rows = [[
    "topic",
    "board_level",
    "chapter",
    "difficulty",
    "question",
    "option_a",
    "option_b",
    "option_c",
    "option_d",
    "correct_option",
    "explanation",
    "category",
    "language"
  ]];

  const chapterName = (() => {
    const bd = findBdSubject(cfg.topic);
    if (!bd || cfg.chapterId === "all") {
      return t("allChapters");
    }
    const ch = chapterById(bd, cfg.chapterId);
    if (!ch) {
      return t("allChapters");
    }
    return cfg.language === "bn" ? ch.bn : ch.en;
  })();

  pool.forEach((q) => {
    rows.push([
      cfg.topic,
      cfg.boardLevel,
      chapterName,
      q.difficulty,
      q.question,
      q.options[0] || "",
      q.options[1] || "",
      q.options[2] || "",
      q.options[3] || "",
      ["A", "B", "C", "D"][q.correct] || "A",
      q.explanation,
      q.category,
      cfg.language
    ]);
  });

  const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safeTopic = cfg.topic.replace(/[^a-zA-Z0-9_-]+/g, "_");
  a.href = url;
  a.download = `${safeTopic || "quiz"}_${cfg.boardLevel}_${cfg.chapterId}_${cfg.language}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  const flash = document.getElementById("feedbackFlash");
  flash.textContent = `${t("exportSuccess")} (${pool.length})`;
  flash.className = "feedback-flash correct show";
  setTimeout(() => {
    flash.classList.remove("show");
  }, 1800);
}

function exportAnswerSheet() {
  if (!quiz.length || userAnswers.length !== quiz.length) {
    document.getElementById("errorBox").classList.add("show");
    document.getElementById("errorMsg").textContent = t("answerSheetEmpty");
    return;
  }

  const rows = [[
    "topic",
    "question_no",
    "question",
    "option_a",
    "option_b",
    "option_c",
    "option_d",
    "your_answer",
    "correct_answer",
    "result",
    "explanation"
  ]];

  quiz.forEach((q, i) => {
    const userIdx = userAnswers[i];
    const userLetter = userIdx === -1 || userIdx == null ? "SKIPPED" : (["A", "B", "C", "D"][userIdx] || "-");
    const correctLetter = ["A", "B", "C", "D"][q.correct] || "A";
    const result = userIdx === q.correct ? "Correct" : "Incorrect";

    rows.push([
      currentTopic,
      String(i + 1),
      q.question,
      q.options[0] || "",
      q.options[1] || "",
      q.options[2] || "",
      q.options[3] || "",
      userLetter,
      correctLetter,
      result,
      q.explanation || ""
    ]);
  });

  const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safeTopic = String(currentTopic || "quiz").replace(/[^a-zA-Z0-9_-]+/g, "_");
  a.href = url;
  a.download = `${safeTopic}_answer_sheet.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  const flash = document.getElementById("feedbackFlash");
  flash.textContent = t("answerSheetSuccess");
  flash.className = "feedback-flash correct show";
  setTimeout(() => {
    flash.classList.remove("show");
  }, 1800);
}

function createPdfMarkup(mode) {
  const lang = getCurrentLanguage();
  const isBn = lang === "bn";
  const titleMap = {
    questions: isBn ? "প্রশ্নপত্র" : "Question Sheet",
    key: isBn ? "উত্তরপত্র" : "Answer Key",
    full: isBn ? "উত্তরসহ প্রশ্নপত্র" : "Answer Sheet"
  };
  const title = titleMap[mode] || titleMap.full;

  let body = `
    <div style="font-family: Arial, sans-serif; color: #111; padding: 20px;">
      <h1 style="margin:0 0 8px 0; font-size: 22px;">${escHtml(title)}</h1>
      <p style="margin:0 0 18px 0; font-size: 12px; color:#555;">${escHtml(currentTopic)} | ${new Date().toLocaleString()}</p>
  `;

  if (mode === "key") {
    body += "<ol style='padding-left:20px;'>";
    quiz.forEach((q, i) => {
      const correctLetter = ["A", "B", "C", "D"][q.correct] || "A";
      body += `<li style="margin-bottom:10px;"><strong>${correctLetter}</strong> - ${escHtml(q.options[q.correct] || "")}</li>`;
    });
    body += "</ol>";
  } else {
    body += "<ol style='padding-left:20px;'>";
    quiz.forEach((q, i) => {
      const correctLetter = ["A", "B", "C", "D"][q.correct] || "A";
      const userIdx = userAnswers[i];
      const userLetter = userIdx === -1 || userIdx == null ? "-" : (["A", "B", "C", "D"][userIdx] || "-");
      body += `
        <li style="margin-bottom:16px; break-inside: avoid;">
          <div style="font-weight:600; margin-bottom:6px;">${escHtml(q.question)}</div>
          <div style="margin-left:8px; line-height:1.55;">
            <div>A. ${escHtml(q.options[0] || "")}</div>
            <div>B. ${escHtml(q.options[1] || "")}</div>
            <div>C. ${escHtml(q.options[2] || "")}</div>
            <div>D. ${escHtml(q.options[3] || "")}</div>
          </div>
      `;
      if (mode === "full") {
        body += `
          <div style="margin-top:8px; font-size:12px; color:#333;">
            <div><strong>${escHtml(t("yourAnswer"))}:</strong> ${escHtml(userLetter)}</div>
            <div><strong>${escHtml(t("correctWord"))}:</strong> ${escHtml(correctLetter)}</div>
            <div style="margin-top:4px;"><strong>${escHtml(t("explanation"))}:</strong> ${escHtml(q.explanation || "")}</div>
          </div>
        `;
      }
      body += "</li>";
    });
    body += "</ol>";
  }

  body += "</div>";
  return { title, html: body };
}

function exportPdf(mode) {
  if (!quiz.length || userAnswers.length !== quiz.length) {
    document.getElementById("errorBox").classList.add("show");
    document.getElementById("errorMsg").textContent = t("answerSheetEmpty");
    return;
  }

  if (typeof window.html2pdf === "undefined") {
    document.getElementById("errorBox").classList.add("show");
    document.getElementById("errorMsg").textContent = t("pdfNotReady");
    return;
  }

  const { html } = createPdfMarkup(mode);
  const node = document.createElement("div");
  node.innerHTML = html;
  node.style.background = "#fff";
  node.style.width = "800px";
  node.style.position = "fixed";
  node.style.left = "-99999px";
  node.style.top = "0";
  document.body.appendChild(node);

  const safeTopic = String(currentTopic || "quiz").replace(/[^a-zA-Z0-9_-]+/g, "_");
  const suffix = mode === "questions" ? "question_sheet" : (mode === "key" ? "answer_key" : "answer_sheet");

  window.html2pdf()
    .set({
      margin: [10, 10, 12, 10],
      filename: `${safeTopic}_${suffix}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"] }
    })
    .from(node)
    .save()
    .then(() => {
      node.remove();
      const flash = document.getElementById("feedbackFlash");
      flash.textContent = mode === "questions"
        ? t("questionSheetSuccess")
        : (mode === "key" ? t("answerKeySuccess") : t("answerSheetSuccess"));
      flash.className = "feedback-flash correct show";
      setTimeout(() => {
        flash.classList.remove("show");
      }, 1800);
    })
    .catch(() => {
      node.remove();
      document.getElementById("errorBox").classList.add("show");
      document.getElementById("errorMsg").textContent = t("pdfNotReady");
    });
}

async function generateQuiz() {
  const topicInput = document.getElementById("topicInput");
  const cfg = getQuizConfig();
  const topic = cfg.topic;

  if (!topic) {
    topicInput.focus();
    topicInput.style.borderColor = "var(--red)";
    document.getElementById("errorBox").classList.add("show");
    document.getElementById("errorMsg").textContent = t("noTopic");
    setTimeout(() => {
      topicInput.style.borderColor = "";
    }, 1500);
    return;
  }

  currentTopic = topic;
  document.getElementById("errorBox").classList.remove("show");
  document.getElementById("generateBtn").disabled = true;

  showScreen("loading");
  startLoadingCycle();

  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    quiz = await fetchQuizFromOpenTrivia(cfg);
    historyFallbackUsed = false;

    if (!Array.isArray(quiz) || quiz.length !== cfg.numQ) {
      throw new Error(getCurrentLanguage() === "bn"
        ? "এই বিষয়ের জন্য যথেষ্ট প্রশ্ন তৈরি করা যায়নি।"
        : "Could not generate enough questions for this topic.");
    }

    stopLoadingCycle();
    startQuiz();

    if (historyFallbackUsed) {
      const flash = document.getElementById("feedbackFlash");
      flash.textContent = t("historyRepeatNotice");
      flash.className = "feedback-flash incorrect show";
      setTimeout(() => {
        flash.classList.remove("show");
      }, 2200);
    }
  } catch (error) {
    stopLoadingCycle();
    showScreen("home");
    document.getElementById("generateBtn").disabled = false;
    document.getElementById("errorBox").classList.add("show");
    document.getElementById("errorMsg").textContent = error.message || t("errorDefault");
  }
}

function startQuiz() {
  randomizeQuizForAttempt();

  currentIndex = 0;
  correctCount = 0;
  wrongCount = 0;
  userAnswers = new Array(quiz.length).fill(null);
  answered = false;
  leaderboardSavedForCurrentQuiz = false;

  const nameInput = document.getElementById("leaderboardNameInput");
  if (nameInput) {
    nameInput.value = getStoredPlayerName();
  }
  const saveBtn = document.getElementById("saveScoreBtn");
  if (saveBtn) {
    saveBtn.disabled = false;
  }

  const language = getCurrentLanguage();
  document.getElementById("quizTopicLabel").textContent = language === "bn" ? "বিষয়" : "TOPIC";
  document.getElementById("quizTitleMain").textContent = `${currentTopic} Quiz`;
  document.getElementById("headerStat").style.display = "flex";

  ensureQuestionTimerBadge();
  updateStats();
  updateProgressUI();
  showScreen("quiz");
  renderQuestion();
}

function randomizeQuizForAttempt() {
  if (!Array.isArray(quiz) || quiz.length === 0) {
    return;
  }

  quiz = shuffleArray(quiz, Math.random).map((q) => {
    const indexedOptions = q.options.map((opt, idx) => ({ opt, idx }));
    const shuffledOptions = shuffleArray(indexedOptions, Math.random);
    const newCorrect = shuffledOptions.findIndex((item) => item.idx === q.correct);

    return {
      ...q,
      options: shuffledOptions.map((item) => item.opt),
      correct: newCorrect
    };
  });
}

function renderQuestion() {
  const q = quiz[currentIndex];
  answered = false;
  const questionArea = document.getElementById("questionArea");

  updateProgressUI();

  const nextBtn = document.getElementById("nextBtn");
  nextBtn.disabled = true;
  nextBtn.textContent = currentIndex + 1 < quiz.length ? t("nextBtn") : t("resultsBtn");

  const diffLabel = q.difficulty || "medium";
  const diffMap = { easy: t("easy"), medium: t("medium"), hard: t("hard") };

  const renderMarkup = () => {
    questionArea.innerHTML = `
    <div class="question-card" id="qCard">
      <div class="q-indicator">
        <span>Q${currentIndex + 1}</span>
        ${q.category ? `<span class="q-category-tag">${escHtml(q.category)}</span>` : ""}
        <span class="diff-badge ${diffLabel}">${escHtml(diffMap[diffLabel] || diffLabel)}</span>
      </div>
      <div class="q-text">${escHtml(q.question)}</div>
      <div class="options" id="optionsList">
        ${["A", "B", "C", "D"].map((letter, i) => `
          <button class="option-btn" data-idx="${i}">
            <span class="option-letter">${letter}</span>
            <span class="option-text">${escHtml(q.options[i] || "")}</span>
            <span class="option-icon" id="icon-${i}"></span>
          </button>
        `).join("")}
      </div>
      <div class="explanation-box" id="explanationBox">
        <div class="explanation-label">${escHtml(t("explanation"))}</div>
        <div>${escHtml(q.explanation || "No explanation provided.")}</div>
      </div>
    </div>
  `;
    questionArea.classList.add("question-enter");
    requestAnimationFrame(() => {
      questionArea.classList.add("question-enter-active");
    });

    setTimeout(() => {
      questionArea.classList.remove("question-enter", "question-enter-active", "question-exit");
    }, 360);

    document.querySelectorAll(".option-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        handleAnswer(parseInt(btn.dataset.idx, 10));
      });
    });

    startQuestionTimer();
  };

  const hasExistingQuestion = questionArea.children.length > 0;
  clearTimeout(questionTransitionTimer);

  if (!hasExistingQuestion) {
    renderMarkup();
    return;
  }

  questionArea.classList.add("question-exit");
  questionTransitionTimer = setTimeout(renderMarkup, 160);
}

function handleAnswer(chosen) {
  if (answered) {
    return;
  }

  answered = true;
  stopQuestionTimer();
  const q = quiz[currentIndex];
  const isCorrect = chosen === q.correct;
  userAnswers[currentIndex] = chosen;

  if (isCorrect) {
    correctCount += 1;
  } else {
    wrongCount += 1;
  }
  updateStats();
  updateProgressUI();

  document.querySelectorAll(".option-btn").forEach((btn) => {
    const idx = parseInt(btn.dataset.idx, 10);
    const icon = document.getElementById(`icon-${idx}`);
    btn.classList.add("disabled");

    if (idx === q.correct) {
      btn.classList.add("correct");
      if (icon) {
        icon.textContent = "OK";
      }
    } else if (idx === chosen && !isCorrect) {
      btn.classList.add("incorrect");
      if (icon) {
        icon.textContent = "X";
      }
    }
  });

  document.getElementById("explanationBox").classList.add("show");
  document.getElementById("qCard").classList.add("answered");
  showFeedback(isCorrect);
  document.getElementById("nextBtn").disabled = false;
}

function showFeedback(isCorrect) {
  const flash = document.getElementById("feedbackFlash");
  flash.textContent = isCorrect ? t("correctToast") : t("wrongToast");
  flash.className = `feedback-flash ${isCorrect ? "correct" : "incorrect"} show`;
  setTimeout(() => {
    flash.classList.remove("show");
  }, 1500);
}

function updateStats() {
  document.getElementById("correctCount").textContent = correctCount;
  document.getElementById("wrongCount").textContent = wrongCount;
  document.getElementById("headerScore").textContent = `${correctCount}/${quiz.length || 0}`;
}

function updateProgressUI() {
  const total = quiz.length || 0;
  const completed = userAnswers.filter((ans) => ans !== null).length;
  const progressPct = total ? Math.round((completed / total) * 100) : 0;
  const language = getCurrentLanguage();
  const currentQuestion = total ? Math.min(currentIndex + 1, total) : 0;

  document.getElementById("progressText").textContent = language === "bn"
    ? `প্রশ্ন ${currentQuestion} / ${total}`
    : `${t("questionWord")} ${currentQuestion} of ${total}`;

  document.getElementById("progressPct").textContent = `${progressPct}%`;
  document.getElementById("progressFill").style.width = `${progressPct}%`;
}

function ensureQuestionTimerBadge() {
  const progressTop = document.querySelector(".progress-top");
  if (!progressTop) {
    return null;
  }

  let badge = document.getElementById("questionTimer");
  if (badge) {
    return badge;
  }

  badge = document.createElement("div");
  badge.id = "questionTimer";
  badge.style.fontSize = "0.78rem";
  badge.style.fontWeight = "700";
  badge.style.padding = "0.22rem 0.62rem";
  badge.style.borderRadius = "999px";
  badge.style.border = "1px solid #ccd8f4";
  badge.style.background = "#ffffff";
  badge.style.color = "#3556b2";
  badge.style.transition = "all 0.2s ease";
  progressTop.appendChild(badge);
  return badge;
}

function updateQuestionTimerUI() {
  const badge = ensureQuestionTimerBadge();
  if (!badge) {
    return;
  }

  const language = getCurrentLanguage();
  const suffix = language === "bn" ? "সে" : "s";
  badge.textContent = `${t("timerLabel")}: ${questionTimeLeft}${suffix}`;

  if (questionTimeLeft <= 5) {
    badge.style.color = "#b4234d";
    badge.style.borderColor = "#ffc2d4";
    badge.style.background = "#fff1f6";
  } else if (questionTimeLeft <= 10) {
    badge.style.color = "#9a6500";
    badge.style.borderColor = "#ffdca4";
    badge.style.background = "#fff8ea";
  } else {
    badge.style.color = "#3556b2";
    badge.style.borderColor = "#ccd8f4";
    badge.style.background = "#ffffff";
  }
}

function stopQuestionTimer() {
  if (questionTimerInterval) {
    clearInterval(questionTimerInterval);
    questionTimerInterval = null;
  }
}

function startQuestionTimer() {
  stopQuestionTimer();
  questionTimeLeft = QUESTION_TIME_LIMIT;
  updateQuestionTimerUI();

  questionTimerInterval = setInterval(() => {
    const quizScreenActive = document.getElementById("screen-quiz").classList.contains("active");
    if (!quizScreenActive || answered) {
      stopQuestionTimer();
      return;
    }

    questionTimeLeft -= 1;
    updateQuestionTimerUI();

    if (questionTimeLeft <= 0) {
      stopQuestionTimer();
      if (!answered) {
        advance(true);
      }
    }
  }, 1000);
}

function advance(skip = false) {
  stopQuestionTimer();

  if (skip && !answered) {
    userAnswers[currentIndex] = -1;
    wrongCount += 1;
    updateStats();
    updateProgressUI();
  }

  currentIndex += 1;
  if (currentIndex >= quiz.length) {
    showResults();
    return;
  }

  renderQuestion();
}

function showResults() {
  stopQuestionTimer();

  const total = quiz.length;
  const pct = total ? Math.round((correctCount / total) * 100) : 0;

  document.getElementById("progressFill").style.width = "100%";
  document.getElementById("progressPct").textContent = "100%";

  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (pct / 100) * circumference;
  setTimeout(() => {
    document.getElementById("scoreRingFill").style.strokeDashoffset = offset;
  }, 80);

  document.getElementById("scoreNumDisplay").textContent = String(correctCount);
  document.getElementById("scoreDenom").textContent = `/${total}`;
  document.getElementById("rscTotal").textContent = String(total);
  document.getElementById("rscCorrect").textContent = String(correctCount);
  document.getElementById("rscWrong").textContent = String(total - correctCount);
  document.getElementById("rscPct").textContent = `${pct}%`;

  let grade = "Needs Improvement";
  let msg = "Review the explanations and try again to improve your score.";

  if (pct >= 80) {
    grade = "Excellent";
    msg = "Outstanding work. You demonstrated strong understanding across the quiz.";
  } else if (pct >= 50) {
    grade = "Good";
    msg = "Good effort. You are on the right track with room for improvement.";
  }

  document.getElementById("rscPerformance").textContent = grade;

  document.getElementById("resultsGrade").textContent = grade;
  document.getElementById("resultsMessage").textContent = msg;

  document.getElementById("reviewList").innerHTML = quiz.map((q, i) => {
    const ua = userAnswers[i];
    const isRight = ua === q.correct;
    const chosenText = ua === -1 ? t("skipped") : (q.options[ua] || "-");

    return `
      <div class="review-item ${isRight ? "r-correct" : "r-incorrect"}">
        <div class="ri-icon">${isRight ? "OK" : "X"}</div>
        <div class="ri-content">
          <div class="ri-question">${escHtml(q.question)}</div>
          <div class="ri-answer">
            ${isRight
              ? `<span class="correct-ans">${escHtml(t("correctWord"))}: ${escHtml(q.options[q.correct])}</span>`
              : `<span class="wrong-ans">${escHtml(t("yourAnswer"))}: ${escHtml(chosenText)}</span> | <span class="correct-ans">${escHtml(t("correctWord"))}: ${escHtml(q.options[q.correct])}</span>`}
          </div>
        </div>
      </div>
    `;
  }).join("");

  const nameInput = document.getElementById("leaderboardNameInput");
  if (nameInput) {
    nameInput.value = getStoredPlayerName();
  }
  renderLeaderboard();

  showScreen("results");
}

function escHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

document.getElementById("generateBtn").addEventListener("click", generateQuiz);

document.getElementById("topicInput").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    generateQuiz();
  }
});

document.getElementById("topicInput").addEventListener("input", updateChapterOptions);
document.getElementById("boardLevel").addEventListener("change", updateChapterOptions);
document.getElementById("chapterSelect").addEventListener("change", syncChapterChipSelection);
document.getElementById("languageSelect").addEventListener("change", () => {
  applyLanguageToUI();
  updateQuestionTimerUI();
  updateChapterOptions();
  if (document.getElementById("screen-quiz").classList.contains("active") && quiz.length) {
    renderQuestion();
  }
});

document.getElementById("chapterChips").addEventListener("click", (event) => {
  const chip = event.target.closest(".chapter-chip");
  if (!chip) {
    return;
  }
  document.getElementById("chapterSelect").value = chip.dataset.chapter;
  syncChapterChipSelection();
});

document.getElementById("themeToggleBtn").addEventListener("click", () => {
  const isDark = document.body.getAttribute("data-theme") === "dark";
  applyTheme(isDark ? "light" : "dark");
});

document.querySelectorAll(".category-choice").forEach((card) => {
  card.addEventListener("click", () => {
    selectQuizCategory(card.dataset.category);
  });
});

document.getElementById("categoryContinueBtn").addEventListener("click", () => {
  if (!selectedQuizCategoryKey) {
    return;
  }
  showScreen("home");
  const topicInput = document.getElementById("topicInput");
  if (topicInput) {
    topicInput.focus();
  }
});

document.getElementById("topicChips").addEventListener("click", (event) => {
  const chip = event.target.closest(".chip");
  if (!chip || !chip.dataset.topic) {
    return;
  }
  document.getElementById("topicInput").value = chip.dataset.topic;
  updateChapterOptions();
  document.getElementById("topicInput").focus();
});

document.getElementById("nextBtn").addEventListener("click", () => advance(false));
document.getElementById("skipBtn").addEventListener("click", () => advance(true));
document.getElementById("retryBtn").addEventListener("click", () => startQuiz());
document.getElementById("exportBtn").addEventListener("click", exportFilteredSet);
document.getElementById("answerSheetBtn").addEventListener("click", () => exportPdf("full"));
document.getElementById("questionSheetBtn").addEventListener("click", () => exportPdf("questions"));
document.getElementById("answerKeyBtn").addEventListener("click", () => exportPdf("key"));
document.getElementById("saveScoreBtn").addEventListener("click", saveCurrentScoreToLeaderboard);

document.getElementById("newTopicBtn").addEventListener("click", () => {
  stopQuestionTimer();
  document.getElementById("headerStat").style.display = "none";
  document.getElementById("generateBtn").disabled = false;
  showScreen("category");
});

initThemePreference();
applyLanguageToUI();
updateChapterOptions();
