import type { McqQuestion } from '../../types';

/** Generated from the single bank during the per-paper split; edit via the data pipeline. */
const QUESTIONS: McqQuestion[] = [
  {
    "id": "q-ict-1",
    "subjectKey": "ict",
    "chapter": {
      "bn": "সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস",
      "en": "Number Systems & Digital Devices"
    },
    "question": {
      "bn": "দশমিক সংখ্যা (29)₁₀ এর বাইনারি রূপ কোনটি?",
      "en": "What is the binary equivalent of the decimal number (29)₁₀?"
    },
    "options": [
      {
        "bn": "(11011)₂",
        "en": "(11011)₂"
      },
      {
        "bn": "(11101)₂",
        "en": "(11101)₂"
      },
      {
        "bn": "(10111)₂",
        "en": "(10111)₂"
      },
      {
        "bn": "(11110)₂",
        "en": "(11110)₂"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "8421 বা 16-8-4-2-1 কোড অনুযায়ী: 16 + 8 + 4 + 0 + 1 = 29 ⇒ (11101)₂।",
      "en": "Using positional weights 16 + 8 + 4 + 0 + 1 = 29 ⇒ (11101)₂."
    },
    "boardTag": {
      "bn": "যশোর ও বরিশাল বোর্ড",
      "en": "Jashore & Barishal Board"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-ict-2",
    "subjectKey": "ict",
    "chapter": {
      "bn": "ডিজিটাল ডিভাইস",
      "en": "Digital Devices"
    },
    "question": {
      "bn": "নিচের কোন গেইটদ্বয়কে সার্বজনীন গেইট (Universal Gate) বলা হয়?",
      "en": "Which pair of logic gates are known as Universal Gates?"
    },
    "options": [
      {
        "bn": "AND ও OR",
        "en": "AND & OR"
      },
      {
        "bn": "XOR ও XNOR",
        "en": "XOR & XNOR"
      },
      {
        "bn": "NAND ও NOR",
        "en": "NAND & NOR"
      },
      {
        "bn": "NOT ও XOR",
        "en": "NOT & XOR"
      }
    ],
    "correctIndex": 2,
    "explanation": {
      "bn": "শুধুমাত্র NAND অথবা শুধুমাত্র NOR গেইট দিয়ে মৌলিক তিনটি গেইটসহ (AND, OR, NOT) যেকোনো লজিক সার্কিট বাস্তবায়ন করা যায় বলে এদের সার্বজনীন গেইট বলে।",
      "en": "NAND and NOR gates can each implement all basic gates (NOT, AND, OR) and any Boolean function."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-ict-3",
    "subjectKey": "ict",
    "chapter": {
      "bn": "ওয়েব ডিজাইন ও HTML",
      "en": "Web Design & HTML"
    },
    "question": {
      "bn": "HTML-এ সবচেয়ে বড় আকারের হেডিং ট্যাগ কোনটি এবং নিচের কোনটি Empty (ফাঁকা) ট্যাগ?",
      "en": "Which is the largest HTML heading tag, and which tag is an Empty (void) tag?"
    },
    "options": [
      {
        "bn": "<h6> এবং <p>",
        "en": "<h6> and <p>"
      },
      {
        "bn": "<h1> এবং <br>",
        "en": "<h1> and <br>"
      },
      {
        "bn": "<h1> এবং <a>",
        "en": "<h1> and <a>"
      },
      {
        "bn": "<head> এবং <img>",
        "en": "<head> and <img>"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "HTML হেডিং <h1> (বৃহত্তম) থেকে <h6> (ক্ষুদ্রতম) পর্যন্ত ৬টি। আর <br>, <img>, <hr> এগুলোর কোনো ক্লোজিং ট্যাগ নেই বলে এগুলো Empty ট্যাগ।",
      "en": "<h1> renders the largest heading, and <br> is a void/empty element requiring no closing tag."
    },
    "boardTag": {
      "bn": "ঢাকা ও যশোর বোর্ড",
      "en": "Dhaka & Jashore Board"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-ict-4",
    "subjectKey": "ict",
    "chapter": {
      "bn": "প্রোগ্রামিং ভাষা (C)",
      "en": "Programming Language (C)"
    },
    "question": {
      "bn": "C প্রোগ্রামে `for(i = 2; i <= 10; i += 3)` লুপটির বডি মোট কতবার নির্বাহ (execute) হবে?",
      "en": "How many times will the body of `for(i = 2; i <= 10; i += 3)` execute in C?"
    },
    "options": [
      {
        "bn": "২ বার",
        "en": "2 times"
      },
      {
        "bn": "৩ বার",
        "en": "3 times"
      },
      {
        "bn": "৪ বার",
        "en": "4 times"
      },
      {
        "bn": "৫ বার",
        "en": "5 times"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "i-এর মান যথাক্রমে 2, 5, 8 এর জন্য শর্ত (i <= 10) সত্য হবে — অর্থাৎ মোট ৩ বার চলবে; এরপর i = 11 হলে লুপ থেমে যাবে।",
      "en": "i takes values 2, 5, and 8 (all ≤ 10), executing 3 times before i becomes 11 and exits."
    },
    "boardTag": {
      "bn": "রাজশাহী ও সিলেট বোর্ড",
      "en": "Rajshahi & Sylhet Board"
    },
    "difficulty": "medium"
  },
  {
    "id": "q-ict-5",
    "subjectKey": "ict",
    "chapter": {
      "bn": "কমিউনিকেশন সিস্টেমস ও নেটওয়ার্কিং",
      "en": "Communication & Networking"
    },
    "question": {
      "bn": "মোবাইল ফোনে কথা বলা ডেটা ট্রান্সমিশন মোডের কোনটির উদাহরণ?",
      "en": "Which data transmission mode is exemplified by a mobile phone conversation?"
    },
    "options": [
      {
        "bn": "সিম্পলেক্স (Simplex)",
        "en": "Simplex"
      },
      {
        "bn": "হাফ-ডুপ্লেক্স (Half-Duplex)",
        "en": "Half-Duplex"
      },
      {
        "bn": "ফুল-ডুপ্লেক্স (Full-Duplex)",
        "en": "Full-Duplex"
      },
      {
        "bn": "মাল্টিকাস্ট (Multicast)",
        "en": "Multicast"
      }
    ],
    "correctIndex": 2,
    "explanation": {
      "bn": "মোবাইল ও টেলিফোনে একই সময়ে উভয় প্রান্ত থেকে ডেটা প্রেরণ ও গ্রহণ করা যায় বলে এটি ফুল-ডুপ্লেক্স (ওয়াকিটকি হলো হাফ-ডুপ্লেক্স, রেডিও/টিভি সিম্পলেক্স)।",
      "en": "Mobile calls allow simultaneous two-way transmission (Full-Duplex); walkie-talkies are Half-Duplex."
    },
    "boardTag": {
      "bn": "যশোর ও ঢাকা বোর্ড",
      "en": "Jashore & Dhaka Board"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-ict-6",
    "subjectKey": "ict",
    "chapter": {
      "bn": "ওয়েব ডিজাইন পরিচিতি এবং HTML",
      "en": "Web Design & HTML"
    },
    "question": {
      "bn": "HTML-এ নিচের কোনটি Empty Tag (যার কোনো ক্লোজিং ট্যাগ নেই)?",
      "en": "Which of the following is an Empty (void) HTML tag requiring no closing tag?"
    },
    "options": [
      {
        "bn": "<p>",
        "en": "<p>"
      },
      {
        "bn": "<a>",
        "en": "<a>"
      },
      {
        "bn": "<br>",
        "en": "<br>"
      },
      {
        "bn": "<table>",
        "en": "<table>"
      }
    ],
    "correctIndex": 2,
    "explanation": {
      "bn": "<br>, <hr>, <img>, <input>, <meta> হলো Empty ট্যাগ — এদের কোনো ক্লোজিং ট্যাগ থাকে না।",
      "en": "<br>, <hr>, <img>, and <input> are void elements without closing tags."
    },
    "boardTag": {
      "bn": "যশোর ও কুমিল্লা বোর্ড",
      "en": "Jashore & Cumilla Board"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-ict-7",
    "subjectKey": "ict",
    "chapter": {
      "bn": "প্রোগ্রামিং ভাষা (C)",
      "en": "Programming Language (C)"
    },
    "question": {
      "bn": "C প্রোগ্রামিং ভাষায় double ডেটা টাইপের জন্য কোন ফরম্যাট স্পেসিফায়ার ব্যবহৃত হয়?",
      "en": "Which format specifier is used for reading a double variable with scanf() in C?"
    },
    "options": [
      {
        "bn": "%d",
        "en": "%d"
      },
      {
        "bn": "%f",
        "en": "%f"
      },
      {
        "bn": "%lf",
        "en": "%lf"
      },
      {
        "bn": "%c",
        "en": "%c"
      }
    ],
    "correctIndex": 2,
    "explanation": {
      "bn": "int-এর জন্য %d, float-এর জন্য %f, double-এর জন্য %lf এবং char-এর জন্য %c ব্যবহৃত হয়।",
      "en": "In C, %d is for int, %f is for float, %lf is for double, and %c is for char."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-ict-c1",
    "subjectKey": "ict",
    "chapter": {
      "bn": "সংখ্যা পদ্ধতি",
      "en": "Number Systems"
    },
    "question": {
      "bn": "বাইনারি ১০১০-এর দশমিক মান কত?",
      "en": "What is the decimal value of binary 1010?"
    },
    "options": [
      {
        "bn": "৮",
        "en": "8"
      },
      {
        "bn": "১০",
        "en": "10"
      },
      {
        "bn": "১২",
        "en": "12"
      },
      {
        "bn": "১৫",
        "en": "15"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "1×2³ + 0×2² + 1×2¹ + 0×2⁰ = ৮ + ২ = ১০।",
      "en": "1×2³ + 0×2² + 1×2¹ + 0×2⁰ = 8 + 2 = 10."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-ict-c2",
    "subjectKey": "ict",
    "chapter": {
      "bn": "সংখ্যা পদ্ধতি",
      "en": "Number Systems"
    },
    "question": {
      "bn": "১ বাইট সমান কত বিট?",
      "en": "One byte equals how many bits?"
    },
    "options": [
      {
        "bn": "৪",
        "en": "4"
      },
      {
        "bn": "৮",
        "en": "8"
      },
      {
        "bn": "১৬",
        "en": "16"
      },
      {
        "bn": "১০২৪",
        "en": "1024"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "১ বাইট = ৮ বিট; ১ কিলোবাইট = ১০২৪ বাইট।",
      "en": "1 byte = 8 bits; 1 kilobyte = 1024 bytes."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-ict-c3",
    "subjectKey": "ict",
    "chapter": {
      "bn": "ওয়েব ডিজাইন ও HTML",
      "en": "Web Design & HTML"
    },
    "question": {
      "bn": "HTML-এ হাইপারলিংক তৈরি করতে কোন ট্যাগ ব্যবহার হয়?",
      "en": "Which HTML tag creates a hyperlink?"
    },
    "options": [
      {
        "bn": "&lt;img&gt;",
        "en": "&lt;img&gt;"
      },
      {
        "bn": "&lt;a&gt;",
        "en": "&lt;a&gt;"
      },
      {
        "bn": "&lt;p&gt;",
        "en": "&lt;p&gt;"
      },
      {
        "bn": "&lt;br&gt;",
        "en": "&lt;br&gt;"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "&lt;a href=\"...\"&gt;টেক্সট&lt;/a&gt; দিয়ে লিংক তৈরি হয়; &lt;img&gt; ছবি, &lt;p&gt; প্যারাগ্রাফ।",
      "en": "&lt;a href=\"...\"&gt;text&lt;/a&gt; makes a link; &lt;img&gt; is an image and &lt;p&gt; a paragraph."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-ict-c4",
    "subjectKey": "ict",
    "chapter": {
      "bn": "ডেটাবেস ম্যানেজমেন্ট",
      "en": "Database Management"
    },
    "question": {
      "bn": "ডেটাবেসে প্রাইমারি কী-এর প্রধান কাজ কী?",
      "en": "What is the main job of a primary key in a database?"
    },
    "options": [
      {
        "bn": "প্রতিটি রেকর্ডকে অনন্য (unique) করা",
        "en": "Make every record unique"
      },
      {
        "bn": "টেবিলের রং নির্ধারণ",
        "en": "Set the table colour"
      },
      {
        "bn": "ডেটা মুছে ফেলা",
        "en": "Delete data automatically"
      },
      {
        "bn": "ফাইল সাইজ কমানো",
        "en": "Reduce file size"
      }
    ],
    "correctIndex": 0,
    "explanation": {
      "bn": "প্রাইমারি কী প্রতিটি রেকর্ডকে অদ্বিতীয়ভাবে চিহ্নিত করে এবং NULL হতে পারে না।",
      "en": "A primary key uniquely identifies each record and cannot be NULL."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-ict-c5",
    "subjectKey": "ict",
    "chapter": {
      "bn": "ডিজিটাল ডিভাইস ও লজিক গেট",
      "en": "Logic Gates"
    },
    "question": {
      "bn": "NAND গেটে দুটি ইনপুটই ১ হলে আউটপুট কত?",
      "en": "For a NAND gate with both inputs 1, what is the output?"
    },
    "options": [
      {
        "bn": "০",
        "en": "0"
      },
      {
        "bn": "১",
        "en": "1"
      },
      {
        "bn": "ইনপুটের ওপর নির্ভরশীল",
        "en": "Depends on the inputs"
      },
      {
        "bn": "অনির্ধারিত",
        "en": "Undefined"
      }
    ],
    "correctIndex": 0,
    "explanation": {
      "bn": "NAND = NOT(AND); AND-এ ১,১ → ১, তাই NAND-এ ১,১ → ০।",
      "en": "NAND is NOT(AND); AND gives 1 for 1,1 so NAND gives 0."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "medium"
  },
  {
    "id": "q-ict-c6",
    "subjectKey": "ict",
    "chapter": {
      "bn": "কমিউনিকেশন সিস্টেম ও নেটওয়ার্কিং",
      "en": "Communication & Networking"
    },
    "question": {
      "bn": "IPv4 অ্যাড্রেস কত বিটের?",
      "en": "How many bits long is an IPv4 address?"
    },
    "options": [
      {
        "bn": "১৬ বিট",
        "en": "16 bits"
      },
      {
        "bn": "৩২ বিট",
        "en": "32 bits"
      },
      {
        "bn": "৬৪ বিট",
        "en": "64 bits"
      },
      {
        "bn": "১২৮ বিট",
        "en": "128 bits"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "IPv4 = ৩২ বিট (৪ অক্টেট), IPv6 = ১২৮ বিট।",
      "en": "IPv4 is 32 bits (four octets); IPv6 is 128 bits."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "medium"
  }
];

export default QUESTIONS;
