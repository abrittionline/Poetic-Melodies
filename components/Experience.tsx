"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Content, Item, Kind, kinds, seed } from "@/lib/content";
import { localRepository, validateContent } from "@/lib/repository";

type InstallEvent = Event & { prompt: () => Promise<void> };
const blank: Item = {
  id: "",
  title: "",
  en: "",
  description: "",
  text: "",
  status: "draft",
  format: "text",
};
function Arrow() {
  return (
    <svg
      aria-hidden="true"
      className="arrow-icon"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path d="M4 16 16 4M4 4h12v12" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
export default function Experience() {
  const params = useParams();
  const segments = (params.slug as string[] | undefined) || [];
  const page = segments[0] || "home";
  const id = segments[1];
  const [lang, setLang] = useState<"bn" | "en">("bn");
  const [data, setData] = useState<Content>(seed);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [format, setFormat] = useState("");
  const [install, setInstall] = useState<InstallEvent | null>(null);
  const [online, setOnline] = useState(true);
  const [auth, setAuth] = useState(false);
  const [password, setPassword] = useState("");
  const [kind, setKind] = useState<Kind>("poems");
  const [editing, setEditing] = useState<Item | null>(null);
  const [adminSearch, setAdminSearch] = useState("");
  const t = (bn: string, en: string) => (lang === "bn" ? bn : en);
  const title = (item: Item) => (lang === "bn" ? item.title : item.en);
  const description = (item: Item) =>
    lang === "en" ? item.descriptionEn || item.description : item.description;
  useEffect(() => {
    try {
      setData(localRepository.load());
      setLang(localStorage.getItem("pm-language") === "en" ? "en" : "bn");
      setAuth(sessionStorage.getItem("pm-demo-admin") === "yes");
    } catch (e) {
      setError(String(e));
    }
    setReady(true);
    const onInstall = (e: Event) => {
      e.preventDefault();
      setInstall(e as InstallEvent);
    };
    const onNetwork = () => setOnline(navigator.onLine);
    onNetwork();
    window.addEventListener("beforeinstallprompt", onInstall);
    window.addEventListener("online", onNetwork);
    window.addEventListener("offline", onNetwork);
    if ("serviceWorker" in navigator)
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    return () => {
      window.removeEventListener("beforeinstallprompt", onInstall);
      window.removeEventListener("online", onNetwork);
      window.removeEventListener("offline", onNetwork);
    };
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  useEffect(() => {
    setQuery("");
    setCategory("");
    setFormat("");
    setEditing(null);
    setNotice("");
  }, [page, id]);
  const published = (k: Kind) =>
    data[k].filter((x) => x.status === "published");
  const poems = published("poems").filter(
    (p) =>
      (!p.category ||
        published("categories").some((x) => x.id === p.category)) &&
      (!p.subcategory ||
        published("subcategories").some((x) => x.id === p.subcategory)) &&
      (!p.poet || published("poets").some((x) => x.id === p.poet)) &&
      (!p.series || published("series").some((x) => x.id === p.series)) &&
      (!p.album || published("albums").some((x) => x.id === p.album)),
  );
  const commit = (next: Content) => {
    try {
      localRepository.save(next);
      setData(next);
      setError("");
      return true;
    } catch {
      setError(
        t(
          "সংরক্ষণ হয়নি। ব্রাউজারের স্টোরেজ পূর্ণ অথবা বন্ধ। ব্যাকআপ নিন ও ছোট ফাইল ব্যবহার করুন।",
          "Save failed. Browser storage is full or disabled. Export a backup and use smaller files.",
        ),
      );
      return false;
    }
  };
  const nav = [
    ["home", "প্রচ্ছদ", "Home"],
    ["poetry", "কবিতার সংগ্রহ", "Poetry library"],
    ["audio", "শুনুন", "Listen"],
    ["video", "দেখুন", "Watch"],
    ["series", "সিরিজ", "Series"],
    ["albums", "অ্যালবাম", "Albums"],
  ];
  const labels: Record<Kind, string> = {
    poems: t("কবিতা", "Poems"),
    categories: t("বিভাগ", "Categories"),
    subcategories: t("উপবিভাগ", "Subcategories"),
    series: t("সিরিজ", "Series"),
    albums: t("অ্যালবাম", "Albums"),
    poets: t("কবি", "Poets"),
    media: t("মিডিয়া", "Media"),
  };
  const art = (p: Item, i = 0) => (
    <div className={"art art-" + (i % 4)} aria-hidden="true">
      <div className="orb" />
      <div className="art-line" />
      <span>{p.format === "video" ? "চলচ্ছবি" : "কবিতার গান"}</span>
      <b>{String(i + 1).padStart(2, "0")}</b>
    </div>
  );
  const card = (p: Item, i: number) => (
    <Link className="poem-card group" href={"/poem/" + p.id} key={p.id}>
      {art(p, i)}
      <div className="card-meta">
        <span>
          {p.format === "audio"
            ? t("অডিও কবিতা", "AUDIO POETRY")
            : p.format === "video"
              ? t("ভিডিও কবিতা", "VIDEO POETRY")
              : t("পাঠের কবিতা", "WRITTEN POETRY")}
        </span>
        <span>
          {p.duration || "—"} <Arrow />
        </span>
      </div>
      <h3>{title(p)}</h3>
      <p>{description(p)}</p>
      <div className="byline">
        {t("সোহেল আজাদ", "Sohel Azad")} <span>— {p.date}</span>
      </div>
    </Link>
  );
  const sectionTitle = (
    small: string,
    bn: string,
    en: string,
    href?: string,
  ) => (
    <div className="section-heading">
      <div>
        <span className="eyebrow">{small}</span>
        <h2>{t(bn, en)}</h2>
      </div>
      {href && (
        <Link className="text-link" href={href}>
          {t("সব দেখুন", "View all")} <Arrow />
        </Link>
      )}
    </div>
  );
  const collection = (k: "series" | "albums" | "poets") => (
    <>
      <div className="page-intro">
        <span className="eyebrow">THE COLLECTION / {k.toUpperCase()}</span>
        <h1>{labels[k]}</h1>
        <p>
          {t(
            "কিছু শব্দ, কিছু সুর। এক সুতোয় বাঁধা গল্পের সংগ্রহ।",
            "Words and melodies, gathered into stories that belong together.",
          )}
        </p>
      </div>
      <div className="collection-grid">
        {published(k).map((p, i) => (
          <Link
            className="collection"
            key={p.id}
            href={
              "/" +
              (k === "poets" ? "poet" : k === "albums" ? "album" : "series") +
              "/" +
              p.id
            }
          >
            {art(p, i + 1)}
            <span className="eyebrow">
              {String(i + 1).padStart(2, "0")} / {k.toUpperCase()}
            </span>
            <h2>
              {title(p)} <Arrow />
            </h2>
            <p>{lang === "en" ? p.text || p.description : p.description}</p>
            <small>
              {
                poems.filter(
                  (x) =>
                    x[
                      k === "poets"
                        ? "poet"
                        : k === "albums"
                          ? "album"
                          : "series"
                    ] === p.id,
                ).length
              }{" "}
              {t("কবিতা", "poems")}
            </small>
          </Link>
        ))}
      </div>
    </>
  );
  const exportData = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "poetic-melodies-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  };
  const remove = (item: Item) => {
    const refs = Object.entries(data).flatMap(([k, items]) =>
      items.filter(
        (x) =>
          k !== kind &&
          [x.category, x.subcategory, x.poet, x.series, x.album].includes(
            item.id,
          ),
      ),
    );
    if (refs.length) {
      setError(
        t(
          "এই বিষয়টি অন্য কনটেন্টে ব্যবহৃত। আগে সংশ্লিষ্ট কবিতা বা উপবিভাগ সম্পাদনা করুন।",
          "This item is referenced by other content. Edit those poems or subcategories first.",
        ),
      );
      return;
    }
    if (confirm(t("স্থায়ীভাবে মুছে ফেলবেন?", "Permanently delete this item?")))
      commit({ ...data, [kind]: data[kind].filter((x) => x.id !== item.id) });
  };
  const saveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const item = {
      ...editing,
      id: editing.id || crypto.randomUUID(),
      date: editing.date || new Date().toISOString().slice(0, 10),
    };
    if (!item.title.trim() || !item.en.trim()) {
      setError("Both Bengali and English titles are required.");
      return;
    }
    if (
      item.src &&
      !/^(https:\/\/|\/media\/|data:(audio|video|image)\/)/.test(item.src)
    ) {
      setError("Use an HTTPS URL, local /media/ path, or uploaded media.");
      return;
    }
    const exists = data[kind].some((x) => x.id === item.id);
    if (
      commit({
        ...data,
        [kind]: exists
          ? data[kind].map((x) => (x.id === item.id ? item : x))
          : [item, ...data[kind]],
      })
    ) {
      setEditing(null);
      setNotice(t("কনটেন্ট সংরক্ষিত হয়েছে।", "Content saved."));
    }
  };
  const upload = async (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      setError(
        "Local demo uploads are limited to 2 MB. Use an HTTPS URL for larger media.",
      );
      return;
    }
    if (!/^(audio|video)\//.test(file.type)) {
      setError("Choose an audio or video file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      setEditing((prev) =>
        prev
          ? {
              ...prev,
              src: String(reader.result),
              format: file.type.startsWith("audio/") ? "audio" : "video",
            }
          : null,
      );
    reader.readAsDataURL(file);
  };
  const relation = (
    field: "category" | "subcategory" | "poet" | "series" | "album",
    k: Kind,
  ) => (
    <label key={field}>
      {labels[k]}
      <select
        value={editing?.[field] || ""}
        onChange={(e) => setEditing({ ...editing!, [field]: e.target.value })}
      >
        <option value="">—</option>
        {data[k].map((x) => (
          <option key={x.id} value={x.id}>
            {title(x)} ({x.status})
          </option>
        ))}
      </select>
    </label>
  );
  const player = (p: Item) =>
    p.format === "audio" ? (
      <audio
        controls
        preload="metadata"
        src={p.src}
        className="w-full"
        onError={() =>
          setNotice(
            t(
              "অডিও লোড হয়নি। মিডিয়া লাইব্রেরিতে উৎসটি পরীক্ষা করুন।",
              "Audio could not load. Check the source in Media Library.",
            ),
          )
        }
      />
    ) : p.format === "video" ? (
      <video
        controls
        playsInline
        preload="metadata"
        src={p.src}
        className="w-full"
        onError={() =>
          setNotice(
            t(
              "ভিডিও লোড হয়নি। ইন্টারনেট সংযোগ ও মিডিয়া URL পরীক্ষা করুন।",
              "Video could not load. Check your connection and media URL.",
            ),
          )
        }
      />
    ) : null;
  return (
    <>
      <a href="#main" className="skip">
        Skip to content
      </a>
      <header>
        <div className="topbar shell">
          <Link href="/" className="brand">
            <span className="brand-mark">প</span>
            <span>
              Poetic Melodies<small>কবিতার গান</small>
            </span>
          </Link>
          <div className="header-right">
            <span className="edition">POETRY. VOICE. SOUL.</span>
            <button
              className="language"
              onClick={() => {
                const next = lang === "bn" ? "en" : "bn";
                setLang(next);
                try {
                  localStorage.setItem("pm-language", next);
                } catch {}
              }}
              aria-label="Switch language"
            >
              <span className={lang === "bn" ? "selected" : ""}>বাংলা</span>
              <i>/</i>
              <span className={lang === "en" ? "selected" : ""}>EN</span>
            </button>
            <Link
              className="admin-link"
              href="/admin"
              aria-label="Admin dashboard"
            >
              <Arrow />
            </Link>
          </div>
        </div>
        <nav className="shell" aria-label="Main navigation">
          {nav.map(([path, bn, en]) => (
            <Link
              key={path}
              className={page === path ? "active" : ""}
              href={path === "home" ? "/" : "/" + path}
            >
              {t(bn, en)}
            </Link>
          ))}
          <Link className="nav-about" href="/about">
            {t("আমাদের কথা", "Our story")} <Arrow />
          </Link>
        </nav>
      </header>
      {!online && (
        <div className="network">
          {t(
            "আপনি অফলাইনে আছেন। সংরক্ষিত পৃষ্ঠা ও স্থানীয় অডিও ব্যবহার করতে পারবেন।",
            "You are offline. Cached pages and local audio remain available.",
          )}
        </div>
      )}
      <main id="main" className="shell" aria-busy={!ready}>
        {error && (
          <div role="alert" className="alert">
            {error}
            <button onClick={() => setError("")} aria-label="Dismiss error">
              ×
            </button>
          </div>
        )}
        {notice && (
          <div className="notice" role="status">
            {notice}
          </div>
        )}
        {page === "home" && (
          <>
            <section className="hero">
              <div className="hero-copy">
                <span className="eyebrow">
                  <span className="live-dot" />{" "}
                  {t(
                    "শব্দ থেকে সুরে, হৃদয় থেকে হৃদয়ে",
                    "FROM WORDS TO MELODY, HEART TO HEART",
                  )}
                </span>
                <h1>
                  {t("কবিতা যখন", "When poetry")}
                  <br />
                  <em>{t("গান হয়ে ওঠে।", "finds its melody.")}</em>
                </h1>
                <p>
                  {t(
                    "শব্দের গভীরে, সুরের আলিঙ্গনে। বাংলা কবিতার এক নতুন শ্রবণ-অভিজ্ঞতা।",
                    "Within words, embraced by melody. A new way to experience Bengali poetry.",
                  )}
                </p>
                <div className="hero-actions">
                  <Link className="button dark" href="/audio">
                    <span>
                      <span className="play-triangle" aria-hidden="true" />
                    </span>{" "}
                    {t("শুনতে শুরু করুন", "Start listening")}
                  </Link>
                  <Link className="text-link" href="/poetry">
                    {t("কবিতা পড়ুন", "Explore poetry")} <Arrow />
                  </Link>
                </div>
                <div className="hero-foot">
                  <span>01 — POETIC MELODIES</span>
                  <span>It’s Poetry in Song.</span>
                </div>
              </div>
              <Link
                href={"/poem/" + (poems[0]?.id || "window")}
                className="hero-art"
              >
                <div className="art-caption">FEATURED POEM / 001</div>
                <div className="moon" />
                <div className="horizon" />
                <div className="vertical-type">শব্দেরও একটা নিজস্ব সুর আছে</div>
                <div className="hero-art-bottom">
                  <div>
                    <small>{t("এই সপ্তাহের কবিতা", "THIS WEEK’S POEM")}</small>
                    <h2>
                      {poems[0]
                        ? title(poems[0])
                        : t("নতুন কবিতা আসছে", "New poetry coming soon")}
                    </h2>
                    <span>
                      {t(
                        "কণ্ঠে ও সুরে · সোহেল আজাদ",
                        "Words & melody · Sohel Azad",
                      )}
                    </span>
                  </div>
                  <span className="round-play">
                    <span className="play-triangle" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </section>
            <div className="manifesto">
              <span>কবিতা / POETRY</span>
              <p>
                {t(
                  "কিছু কথা শুধু পড়ার নয়, অনুভব করার।",
                  "Some words are meant to be felt.",
                )}
              </p>
              <span>সুর / MELODY</span>
            </div>
            <section className="section">
              {sectionTitle(
                "01 / LATEST PRODUCTIONS",
                "নতুন প্রকাশনা",
                "Fresh from the studio",
                "/poetry",
              )}
              <div className="poem-grid">{poems.slice(0, 3).map(card)}</div>
            </section>
            <section className="section series-section">
              {sectionTitle(
                "02 / CURATED SERIES",
                "এক সুতোয় বাঁধা",
                "Stories, in chapters",
                "/series",
              )}
              <div className="series-rows">
                {published("series").map((p, i) => (
                  <Link href={"/series/" + p.id} key={p.id}>
                    <span className="row-number">0{i + 1}</span>
                    <div>
                      <h3>{title(p)}</h3>
                      <p>{lang === "en" ? p.text : p.description}</p>
                    </div>
                    <span className="series-count">
                      {poems.filter((x) => x.series === p.id).length}{" "}
                      {t("কবিতা", "POEMS")}
                    </span>
                    <span className="arrow">
                      <Arrow />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
            <section className="quote-section">
              <span className="eyebrow">THE THOUGHT BEHIND THE MELODY</span>
              <blockquote>
                {t("“শব্দ থেমে গেলেও,", "“Even when words fall silent,")}
                <br />
                {t("সুর থেকে যায়।”", "the melody remains.”")}
              </blockquote>
              <Link href="/about" className="text-link">
                {t("আমাদের গল্প", "Our story")} <Arrow />
              </Link>
            </section>
          </>
        )}
        {["poetry", "audio", "video"].includes(page) && (
          <>
            <div className="page-intro">
              <span className="eyebrow">
                THE ARCHIVE / {page.toUpperCase()}
              </span>
              <h1>
                {page === "poetry"
                  ? t("কবিতার সংগ্রহ", "The poetry library")
                  : page === "audio"
                    ? t("কানে কানে কবিতা", "Poetry, in your ears")
                    : t("দৃশ্যে ও কবিতায়", "Poetry in motion")}
              </h1>
              <p>
                {t(
                  "আপনার মনের মতো শব্দটি খুঁজে নিন।",
                  "Find the words that feel like you.",
                )}
              </p>
            </div>
            <div className="filters">
              <label className="search">
                <span>⌕</span>
                <input
                  aria-label={t("কবিতা খুঁজুন", "Search poetry")}
                  placeholder={t(
                    "কবিতা, কবি বা শব্দ খুঁজুন…",
                    "Search poems, poets, or words…",
                  )}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <select
                aria-label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">{t("সব বিভাগ", "All categories")}</option>
                {published("categories").map((c) => (
                  <option value={c.id} key={c.id}>
                    {title(c)}
                  </option>
                ))}
              </select>
              {page === "poetry" && (
                <select
                  aria-label="Format"
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                >
                  <option value="">{t("সব মাধ্যম", "All formats")}</option>
                  <option value="audio">Audio</option>
                  <option value="video">Video</option>
                  <option value="text">Text</option>
                </select>
              )}
            </div>
            <div className="result-line">
              {t("সংগ্রহ থেকে", "FROM THE COLLECTION")}{" "}
              <span>
                {
                  poems.filter(
                    (p) =>
                      (!category || p.category === category) &&
                      (!format || p.format === format) &&
                      (!["audio", "video"].includes(page) ||
                        p.format === page) &&
                      [
                        p.title,
                        p.en,
                        p.description,
                        p.text,
                        ...data.poets
                          .filter((x) => x.id === p.poet)
                          .map((x) => x.title + " " + x.en),
                      ]
                        .join(" ")
                        .toLowerCase()
                        .includes(query.toLowerCase()),
                  ).length
                }{" "}
                {t("কবিতা", "RESULTS")}
              </span>
            </div>
            <div className="poem-grid library">
              {poems
                .filter(
                  (p) =>
                    (!category || p.category === category) &&
                    (!format || p.format === format) &&
                    (!["audio", "video"].includes(page) || p.format === page) &&
                    [
                      p.title,
                      p.en,
                      p.description,
                      p.text,
                      ...data.poets
                        .filter((x) => x.id === p.poet)
                        .map((x) => x.title + " " + x.en),
                    ]
                      .join(" ")
                      .toLowerCase()
                      .includes(query.toLowerCase()),
                )
                .map(card)}
            </div>
            {!poems.some(
              (p) =>
                (!category || p.category === category) &&
                (!format || p.format === format) &&
                (!["audio", "video"].includes(page) || p.format === page) &&
                [
                  p.title,
                  p.en,
                  p.description,
                  p.text,
                  ...data.poets
                    .filter((x) => x.id === p.poet)
                    .map((x) => x.title + " " + x.en),
                ]
                  .join(" ")
                  .toLowerCase()
                  .includes(query.toLowerCase()),
            ) && (
              <div className="empty">
                {t(
                  "কোনো কবিতা পাওয়া যায়নি। অন্য শব্দ বা বিভাগ চেষ্টা করুন।",
                  "No poems found. Try another search or category.",
                )}
              </div>
            )}
          </>
        )}
        {((page === "series" && !id) ||
          page === "albums" ||
          page === "poets") &&
          collection(page as "series" | "albums" | "poets")}
        {((page === "series" && id) || page === "album" || page === "poet") &&
          (() => {
            const k =
              page === "album"
                ? "albums"
                : page === "poet"
                  ? "poets"
                  : "series";
            const item = published(k).find((x) => x.id === id);
            return item ? (
              <>
                <div className="page-intro">
                  <Link className="eyebrow" href={"/" + k}>
                    ← {labels[k]}
                  </Link>
                  <h1>{title(item)}</h1>
                  <p>
                    {lang === "en"
                      ? item.text || item.description
                      : item.description}
                  </p>
                </div>
                <div className="poem-grid library">
                  {poems
                    .filter(
                      (x) =>
                        x[
                          page === "album"
                            ? "album"
                            : page === "poet"
                              ? "poet"
                              : "series"
                        ] === id,
                    )
                    .map(card)}
                </div>
              </>
            ) : (
              <div className="empty">
                {t(
                  "এই সংগ্রহটি পাওয়া যায়নি।",
                  "This collection is unavailable.",
                )}
              </div>
            );
          })()}
        {page === "poem" &&
          (() => {
            const p = poems.find((x) => x.id === id);
            if (!p)
              return (
                <div className="empty">
                  {t(
                    "কবিতাটি পাওয়া যায়নি অথবা প্রকাশিত হয়নি।",
                    "This poem is unavailable or unpublished.",
                  )}{" "}
                  <Link href="/poetry">← Library</Link>
                </div>
              );
            return (
              <article className="poem-detail">
                <Link className="eyebrow" href="/poetry">
                  ← {t("কবিতার সংগ্রহ", "BACK TO LIBRARY")}
                </Link>
                <div className="reading-grid">
                  <div>
                    <span className="eyebrow">
                      {p.format?.toUpperCase()} / {p.date}
                    </span>
                    <h1>{title(p)}</h1>
                    <Link className="poet-credit" href={"/poet/" + p.poet}>
                      {data.poets.find((x) => x.id === p.poet)
                        ? title(data.poets.find((x) => x.id === p.poet)!)
                        : t("অজানা কবি", "Unknown poet")}{" "}
                      <Arrow />
                    </Link>
                    <p className="poem-description">{description(p)}</p>
                    <div className="verse">{p.text}</div>
                    {lang === "en" && (
                      <p className="small-note">
                        The original poem is presented in Bengali. English
                        translations are planned.
                      </p>
                    )}
                    <div className="tags">
                      {p.series && (
                        <Link href={"/series/" + p.series}>
                          {t("সিরিজ", "Series")} <Arrow />
                        </Link>
                      )}
                      {p.album && (
                        <Link href={"/album/" + p.album}>
                          {t("অ্যালবাম", "Album")} <Arrow />
                        </Link>
                      )}
                    </div>
                  </div>
                  <aside>
                    {art(p, 0)}
                    <div className="player-panel">
                      <span className="eyebrow">
                        {t("শব্দের সঙ্গে কিছুক্ষণ", "TAKE A MOMENT")}
                      </span>
                      <h3>{title(p)}</h3>
                      {p.src ? (
                        player(p)
                      ) : (
                        <p>
                          {t(
                            "এই কবিতাটি পড়ার জন্য প্রকাশিত।",
                            "This poem is published for reading.",
                          )}
                        </p>
                      )}
                      {p.src && (
                        <p className="small-note">
                          {t(
                            "ডেমো মিডিয়া: অডিওটি স্থানীয় যন্ত্রসংগীত; ভিডিওটি স্থানীয় পরিবেশচিত্র। এগুলি কবিতার আবৃত্তি নয়।",
                            "Demo media: audio is a local instrumental; video is a local ambient film. These are not recordings of the poem.",
                          )}
                        </p>
                      )}
                    </div>
                    <button
                      className="button outline w-full"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(location.href);
                          setNotice(t("লিংক কপি হয়েছে।", "Link copied."));
                        } catch {
                          setNotice(
                            t(
                              "ঠিকানা বার থেকে লিংক কপি করুন।",
                              "Copy the link from your address bar.",
                            ),
                          );
                        }
                      }}
                    >
                      {t("কবিতাটি শেয়ার করুন", "Copy poem link")} <Arrow />
                    </button>
                  </aside>
                </div>
              </article>
            );
          })()}
        {page === "about" && (
          <section className="about page-intro">
            <span className="eyebrow">OUR STORY / VERSION 1.0</span>
            <h1>
              It’s Poetry
              <br />
              <em>in Song.</em>
            </h1>
            <p>
              {t(
                "কবিতার গান — বাংলা কবিতার শব্দ, সুর ও অনুভূতির জন্য একটি ছোট্ট আশ্রয়। পড়ুন, শুনুন, আর ফিরে আসুন আপনার প্রিয় পঙ্‌ক্তির কাছে।",
                "Poetic Melodies is a home for Bengali words, music and feeling. Read, listen, and return to the lines you love.",
              )}
            </p>
            <div className="about-credit">
              A Creation by <strong>Sohel Azad.</strong>
            </div>
            <Link href="/poet/sohel" className="text-link">
              {t("স্রষ্টার পরিচয়", "Meet the creator")} <Arrow />
            </Link>
            <div className="about-note">
              <h3>{t("ডেমো সম্পর্কে", "About this prototype")}</h3>
              <p>
                {t(
                  "এই সংস্করণের কবিতা মৌলিক নমুনা। কনটেন্ট আপনার এই ব্রাউজারেই সংরক্ষিত হয়। স্থানীয় অডিও যন্ত্রসংগীত এবং স্থানীয় পরিবেশচিত্র নমুনা হিসেবে ব্যবহৃত।",
                  "Poems are original demonstration content. Edits stay in this browser. Local instrumental audio and an original local ambient film demonstrate playback.",
                )}
              </p>
            </div>
          </section>
        )}
        {page === "admin" &&
          (!ready ? (
            <div className="empty">Loading…</div>
          ) : !auth ? (
            <section className="login">
              <span className="eyebrow">THE EDITOR’S DESK</span>
              <h1>{t("স্বাগতম।", "Welcome back.")}</h1>
              <p>
                {t(
                  "স্থানীয় ডেমো অ্যাডমিন। এটি নিরাপদ সার্ভার লগইন নয়।",
                  "Local demo admin. This is a browser session gate, not secure server authentication.",
                )}
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (password === "poetry-demo") {
                    sessionStorage.setItem("pm-demo-admin", "yes");
                    setAuth(true);
                    setPassword("");
                    setError("");
                  } else
                    setError(
                      t("পাসওয়ার্ড সঠিক নয়।", "Incorrect demo password."),
                    );
                }}
              >
                <label>
                  {t("ডেমো পাসওয়ার্ড", "Demo password")}
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </label>
                <p className="small-note">
                  Demo password: <code>poetry-demo</code>. Do not store
                  sensitive data.
                </p>
                <button className="button dark">
                  {t("প্রবেশ করুন", "Enter dashboard")} <Arrow />
                </button>
              </form>
            </section>
          ) : (
            <section className="admin">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">
                    PRIVATE WORKSPACE / LOCAL DEMO
                  </span>
                  <h1>{t("সম্পাদনার ঘর", "The editor’s desk")}</h1>
                </div>
                <button
                  className="text-link"
                  onClick={() => {
                    sessionStorage.removeItem("pm-demo-admin");
                    setAuth(false);
                  }}
                >
                  {t("লগ আউট", "Log out")} <Arrow />
                </button>
              </div>
              <p className="small-note">
                {t(
                  "সব পরিবর্তন এই ব্রাউজারে সংরক্ষিত। প্রকাশ করলে শুধু এই ব্রাউজারের সাইটে দেখা যাবে। নিয়মিত JSON ব্যাকআপ নিন।",
                  "Changes are stored in this browser. Publishing updates this browser’s public view only. Export JSON regularly. This demo gate does not secure browser data.",
                )}
              </p>
              <div className="stats">
                <div>
                  <strong>{data.poems.length}</strong>
                  <span>{t("মোট কবিতা", "Total poems")}</span>
                </div>
                <div>
                  <strong>
                    {data.poems.filter((x) => x.status === "published").length}
                  </strong>
                  <span>{t("প্রকাশিত", "Published")}</span>
                </div>
                <div>
                  <strong>
                    {data.poems.filter((x) => x.status === "draft").length}
                  </strong>
                  <span>{t("খসড়া", "Drafts")}</span>
                </div>
                <div>
                  <strong>{data.media.length}</strong>
                  <span>{t("মিডিয়া ফাইল", "Media files")}</span>
                </div>
              </div>
              <div className="admin-tabs">
                {kinds.map((k) => (
                  <button
                    key={k}
                    className={kind === k ? "active" : ""}
                    onClick={() => {
                      setKind(k);
                      setEditing(null);
                      setAdminSearch("");
                    }}
                  >
                    {labels[k]}
                  </button>
                ))}
              </div>
              <div className="admin-toolbar">
                <input
                  aria-label="Search admin content"
                  placeholder={t("কনটেন্ট খুঁজুন…", "Search content…")}
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                />
                <button
                  className="button dark"
                  onClick={() => setEditing({ ...blank })}
                >
                  + {t("নতুন যোগ করুন", "Add new")}
                </button>
                <button className="button outline" onClick={exportData}>
                  ↓ {t("ব্যাকআপ", "Export")}
                </button>
                <label className="button outline import">
                  ↑ {t("ইমপোর্ট", "Import")}
                  <input
                    type="file"
                    accept="application/json"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        if (file.size > 5 * 1024 * 1024)
                          throw Error("Backup exceeds 5 MB");
                        const imported = JSON.parse(await file.text());
                        if (!validateContent(imported))
                          throw Error("Invalid backup format");
                        if (
                          confirm(
                            "Replace all browser content with this backup?",
                          )
                        ) {
                          if (commit(imported)) setNotice("Backup restored.");
                        }
                      } catch (err) {
                        setError(String(err));
                      }
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
              {editing && (
                <form className="editor" onSubmit={saveItem}>
                  <div className="section-heading">
                    <h2>
                      {editing.id
                        ? t("সম্পাদনা", "Edit item")
                        : t("নতুন কনটেন্ট", "New content")}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setEditing(null)}
                      aria-label="Close editor"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="form-grid">
                    <label>
                      বাংলা শিরোনাম
                      <input
                        required
                        value={editing.title}
                        onChange={(e) =>
                          setEditing({ ...editing, title: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      English title
                      <input
                        required
                        value={editing.en}
                        onChange={(e) =>
                          setEditing({ ...editing, en: e.target.value })
                        }
                      />
                    </label>
                    <label className="wide">
                      {t("সংক্ষিপ্ত পরিচিতি", "Description")}
                      <textarea
                        value={editing.description}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            description: e.target.value,
                          })
                        }
                      />
                    </label>
                    <label className="wide">
                      English description
                      <textarea
                        value={editing.descriptionEn || ""}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            descriptionEn: e.target.value,
                          })
                        }
                      />
                    </label>
                    <label className="wide">
                      {t(
                        "কবিতা / বিস্তারিত লেখা",
                        "Poem / English description",
                      )}
                      <textarea
                        rows={6}
                        value={editing.text || ""}
                        onChange={(e) =>
                          setEditing({ ...editing, text: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      {t("প্রকাশের অবস্থা", "Publication status")}
                      <select
                        value={editing.status}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            status: e.target.value as Item["status"],
                          })
                        }
                      >
                        <option value="draft">Draft / খসড়া</option>
                        <option value="published">Published / প্রকাশিত</option>
                      </select>
                    </label>
                    {kind === "subcategories" &&
                      relation("category", "categories")}
                    {kind === "poems" && (
                      <>
                        {relation("category", "categories")}
                        {relation("subcategory", "subcategories")}
                        {relation("poet", "poets")}
                        {relation("series", "series")}
                        {relation("album", "albums")}
                        <label>
                          Date
                          <input
                            type="date"
                            value={editing.date || ""}
                            onChange={(e) =>
                              setEditing({ ...editing, date: e.target.value })
                            }
                          />
                        </label>
                        <label>
                          Duration
                          <input
                            placeholder="3:24"
                            value={editing.duration || ""}
                            onChange={(e) =>
                              setEditing({
                                ...editing,
                                duration: e.target.value,
                              })
                            }
                          />
                        </label>
                      </>
                    )}
                    {["poems", "media"].includes(kind) && (
                      <>
                        <label>
                          {t("মাধ্যম", "Format")}
                          <select
                            value={editing.format || "text"}
                            onChange={(e) =>
                              setEditing({
                                ...editing,
                                format: e.target.value as Item["format"],
                              })
                            }
                          >
                            <option value="text">Text</option>
                            <option value="audio">Audio</option>
                            <option value="video">Video</option>
                          </select>
                        </label>
                        <label>
                          {t("লাইব্রেরি থেকে মিডিয়া", "Choose library media")}
                          <select
                            value=""
                            onChange={(e) => {
                              const m = data.media.find(
                                (x) => x.id === e.target.value,
                              );
                              if (m)
                                setEditing({
                                  ...editing,
                                  src: m.src,
                                  format: m.format,
                                });
                            }}
                          >
                            <option value="">Select…</option>
                            {data.media.map((m) => (
                              <option value={m.id} key={m.id}>
                                {title(m)}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="wide">
                          Media URL (HTTPS or /media/)
                          <input
                            value={editing.src || ""}
                            onChange={(e) =>
                              setEditing({ ...editing, src: e.target.value })
                            }
                          />
                        </label>
                        <label>
                          Upload audio / video (max 2 MB)
                          <input
                            type="file"
                            accept="audio/*,video/*"
                            onChange={(e) => {
                              if (e.target.files?.[0])
                                upload(e.target.files[0]);
                            }}
                          />
                        </label>
                        {editing.src && (
                          <div className="wide">{player(editing)}</div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="editor-actions">
                    <button className="button dark" type="submit">
                      {t("সংরক্ষণ করুন", "Save content")} <Arrow />
                    </button>
                    <button
                      type="button"
                      className="button outline"
                      onClick={() => setEditing(null)}
                    >
                      {t("বাতিল", "Cancel")}
                    </button>
                  </div>
                </form>
              )}
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>{t("শিরোনাম", "Title")}</th>
                      <th>{t("অবস্থা", "Status")}</th>
                      <th>{t("কাজ", "Actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data[kind]
                      .filter((x) =>
                        (x.title + x.en)
                          .toLowerCase()
                          .includes(adminSearch.toLowerCase()),
                      )
                      .map((x) => (
                        <tr key={x.id}>
                          <td>
                            <strong>{title(x)}</strong>
                            <small>{x.en}</small>
                          </td>
                          <td>
                            <span className={"badge " + x.status}>
                              {x.status}
                            </span>
                          </td>
                          <td>
                            <div className="table-actions">
                              <button onClick={() => setEditing({ ...x })}>
                                {t("সম্পাদনা", "Edit")}
                              </button>
                              <button
                                onClick={() =>
                                  commit({
                                    ...data,
                                    [kind]: data[kind].map((p) =>
                                      p.id === x.id
                                        ? {
                                            ...p,
                                            status:
                                              p.status === "published"
                                                ? "draft"
                                                : "published",
                                          }
                                        : p,
                                    ),
                                  })
                                }
                              >
                                {x.status === "published"
                                  ? t("খসড়া", "Unpublish")
                                  : t("প্রকাশ", "Publish")}
                              </button>
                              <button
                                className="danger"
                                onClick={() => remove(x)}
                              >
                                {t("মুছুন", "Delete")}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {data[kind].length === 0 && (
                  <p className="empty">No items yet. Add your first item.</p>
                )}
              </div>
            </section>
          ))}
        {![
          "home",
          "poetry",
          "audio",
          "video",
          "series",
          "albums",
          "poets",
          "album",
          "poet",
          "poem",
          "about",
          "admin",
        ].includes(page) && (
          <div className="empty">
            <h1>404</h1>
            <p>{t("পাতাটি পাওয়া যায়নি।", "Page not found.")}</p>
            <Link href="/">← Home</Link>
          </div>
        )}
      </main>
      <footer className="shell">
        <div className="footer-top">
          <div>
            <Link href="/" className="footer-brand">
              Poetic Melodies<span>কবিতার গান</span>
            </Link>
            <p>It’s Poetry in Song.</p>
          </div>
          <div className="footer-links">
            <Link href="/poetry">{t("কবিতার সংগ্রহ", "Poetry library")}</Link>
            <Link href="/poets">{t("কবিরা", "Poets")}</Link>
            <Link href="/about">{t("আমাদের কথা", "Our story")}</Link>
            <Link href="/admin">{t("অ্যাডমিন", "Admin")}</Link>
            {install && (
              <button
                onClick={async () => {
                  await install.prompt();
                  setInstall(null);
                }}
              >
                {t("অ্যাপ ইনস্টল করুন", "Install app")} ↓
              </button>
            )}
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Poetic Melodies</span>
          <span>
            A Creation by <strong>Sohel Azad.</strong>
          </span>
          <span>MADE OF WORDS & MELODY · V1.0</span>
        </div>
      </footer>
    </>
  );
}
