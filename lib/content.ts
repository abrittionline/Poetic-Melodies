export type Kind =
  | "poems"
  | "categories"
  | "subcategories"
  | "series"
  | "albums"
  | "poets"
  | "media";
export type Item = {
  id: string;
  title: string;
  en: string;
  description: string;
  descriptionEn?: string;
  text?: string;
  status: "draft" | "published";
  category?: string;
  subcategory?: string;
  poet?: string;
  series?: string;
  album?: string;
  format?: "audio" | "video" | "text";
  src?: string;
  date?: string;
  duration?: string;
};
export type Content = Record<Kind, Item[]>;
export const kinds: Kind[] = [
  "poems",
  "categories",
  "subcategories",
  "series",
  "albums",
  "poets",
  "media",
];
export const seed: Content = {
  categories: [
    {
      id: "nature",
      title: "প্রকৃতি",
      en: "Nature",
      description: "ঋতু, নদী ও ফিরে আসার গল্প।",
      status: "published",
    },
    {
      id: "love",
      title: "প্রেম",
      en: "Love",
      description: "ভালোবাসার অনন্ত কথোপকথন।",
      status: "published",
    },
    {
      id: "life",
      title: "জীবন",
      en: "Life",
      description: "প্রতিদিনের মাঝে অসাধারণ।",
      status: "published",
    },
  ],
  subcategories: [
    {
      id: "rain",
      title: "বৃষ্টি",
      en: "Rain",
      description: "বর্ষার কবিতা",
      category: "nature",
      status: "published",
    },
  ],
  poets: [
    {
      id: "sohel",
      title: "সোহেল আজাদ",
      en: "Sohel Azad",
      description:
        "কবিতা, সুর আর নীরবতার মাঝে নতুন এক সংলাপ। এই সংগ্রহের মৌলিক নমুনা কবিতাগুলি Poetic Melodies-এর জন্য রচিত।",
      text: "A meeting place for words and melody. These original demonstration poems were created for this prototype.",
      status: "published",
    },
  ],
  series: [
    {
      id: "letters",
      title: "নীরবতার চিঠি",
      en: "Letters to Silence",
      description:
        "যা বলা হয়নি, তারই সুর। তিনটি মুহূর্ত, একটি অন্তহীন যাত্রা।",
      text: "A collection of quiet moments, unspoken letters and the music between words.",
      status: "published",
    },
    {
      id: "river",
      title: "নদীর কাছে",
      en: "By the River",
      description: "ফিরে যাওয়া, ভেসে থাকা, আবার শুরু করা।",
      text: "On belonging, drifting and beginning again.",
      status: "published",
    },
  ],
  albums: [
    {
      id: "first-light",
      title: "প্রথম আলো",
      en: "First Light",
      description: "সকালের মতো কোমল কিছু কবিতা ও সুর।",
      text: "An intimate collection of poetry and sound for slow mornings.",
      status: "published",
    },
  ],
  media: [
    {
      id: "tone",
      title: "পিয়ানোর মতো সকাল",
      en: "Morning tones · original instrumental demo",
      description:
        "Locally generated instrumental sample. Not a spoken recording of the poem.",
      format: "audio",
      src: "/media/morning.wav",
      status: "published",
    },
    {
      id: "film",
      title: "প্রকৃতির চলচ্ছবি",
      en: "River light · original ambient film",
      description:
        "Original locally generated ambient film with instrumental audio. Not a spoken recording.",
      format: "video",
      src: "/media/river.mp4",
      status: "published",
    },
  ],
  poems: [
    {
      id: "window",
      title: "জানালার ওপারে",
      en: "Beyond the Window",
      description: "একটি জানালা, কিছু মেঘ, আর ফিরে আসার অপেক্ষা।",
      text: "জানালার ওপারে আকাশ রেখেছি,\nতোমার জন্য এক টুকরো নীল।\nশহর যখন ঘুমিয়ে পড়ে,\nহাওয়ায় ভাসে কথার মিছিল।\n\nকিছু কথা বৃষ্টি হয়ে নামে,\nকিছু কথা রোদের কাছে ঋণ।\nতুমি এলে, চুপটি করে বসো—\nআজকে শুধু শুনব সারাদিন।",
      status: "published",
      category: "nature",
      subcategory: "rain",
      poet: "sohel",
      series: "letters",
      album: "first-light",
      format: "audio",
      src: "/media/morning.wav",
      date: "2026-10-12",
      duration: "0:12",
    },
    {
      id: "blue-letter",
      title: "নীল খামের চিঠি",
      en: "The Blue Letter",
      description: "দূরত্ব পেরিয়ে একটি চিঠি পৌঁছে যায় মনে।",
      text: "নীল খামে ভরে পাঠালাম ভোর,\nখুলে দেখো, আলো আছে।\nযে কথাটি বলিনি কখনো,\nসে কথাটি তোমার কাছে।",
      status: "published",
      category: "love",
      poet: "sohel",
      series: "letters",
      format: "text",
      date: "2026-10-10",
      duration: "2 min",
    },
    {
      id: "river-song",
      title: "নদী জানে",
      en: "The River Knows",
      description: "জলের কাছে জমা রাখা আমাদের সব গল্প।",
      text: "নদী জানে কোথায় আমার ঘর,\nকোথায় থামে বিকেলবেলার রোদ।\nঢেউয়ের কাছে নামটি রেখে যাই,\nফিরে আসার থাকে যদি বোধ।",
      status: "published",
      category: "nature",
      poet: "sohel",
      series: "river",
      album: "first-light",
      format: "video",
      src: "/media/river.mp4",
      date: "2026-10-08",
      duration: "0:10",
    },
    {
      id: "ordinary",
      title: "সাধারণ দিনের গান",
      en: "An Ordinary Day",
      description: "ছোট্ট মুহূর্তে বেঁচে থাকার আনন্দ।",
      text: "চায়ের কাপে সকাল নামে,\nবইয়ের পাতায় একটু রোদ।\nসাধারণ এই দিনটির কাছে\nঅনেকখানি বেঁচে থাকার বোধ।",
      status: "published",
      category: "life",
      poet: "sohel",
      format: "audio",
      src: "/media/morning.wav",
      date: "2026-10-06",
      duration: "0:12",
    },
    {
      id: "return",
      title: "ফিরে আসার পথে",
      en: "On the Way Home",
      description: "পথের শেষে নতুন শুরুর ডাক।",
      text: "ফিরে আসার পথে দেখি,\nগাছটি এখনো দাঁড়িয়ে আছে।\nআমি যত দূরে যাই,\nঘর ততই কাছে ডাকে।",
      status: "published",
      category: "life",
      poet: "sohel",
      series: "river",
      format: "text",
      date: "2026-10-04",
      duration: "1 min",
    },
  ],
};

const englishDescriptions: Record<string, string> = {
  window: "A window, a few clouds, and the quiet anticipation of coming home.",
  "blue-letter":
    "A letter finds its way across the distance, straight to the heart.",
  "river-song": "All our stories, entrusted to the water.",
  ordinary: "The quiet joy of being alive in the smallest moments.",
  return: "At the end of the road, a new beginning calls.",
  nature: "Seasons, rivers, and stories of returning.",
  love: "An endless conversation about love.",
  life: "The extraordinary within the everyday.",
  rain: "Poetry for the monsoon.",
  sohel:
    "A new conversation between poetry, music and silence. The original sample poems in this collection were written for Poetic Melodies.",
  letters:
    "What was never said, set to music. Quiet moments on an endless journey.",
  river: "Belonging, drifting, and beginning again.",
  "first-light": "Soft poems and melodies for slow mornings.",
};
for (const items of Object.values(seed))
  for (const item of items)
    item.descriptionEn = englishDescriptions[item.id] || item.description;
