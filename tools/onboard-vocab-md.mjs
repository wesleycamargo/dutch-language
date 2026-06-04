import { readFileSync, writeFileSync } from "node:fs";

const sourceName = "Next 200 Dutch Reading Exam Vocabulary Words";
const md = readFileSync("src/vocab.md", "utf8");
const vocab = JSON.parse(readFileSync("src/vocab.json", "utf8"));

const rows = md
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => /^\|\s*\d+\s*\|/.test(line))
  .map((line) => {
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    return {
      number: Number(cells[0]),
      nl: cells[1],
      en: cells[2],
      weight: [...cells[3]].filter((char) => char === "⭐").length,
    };
  });

const byNl = new Map(vocab.map((item) => [item.nl.toLowerCase(), item]));

function topicFor(nl) {
  const text = nl.toLowerCase();
  if (/werk|dienst|rooster|collega|baas|solliciteren/.test(text)) return "💼 Werk";
  if (/zondag|zaterdag|vrijdag|avond|middag|ochtend|nacht|maand|week|wanneer|hoe laat/.test(text)) return "⏰ Tijd";
  if (/klant|kaart|korting|gratis|kosten|punt|sparen|winkel/.test(text)) return "🛒 Winkel";
  if (/huisarts|spreekuur|bloed|balie|noodgeval|alarm/.test(text)) return "🏥 Gezondheid";
  if (/buurt|bewoner|bijeenkomst|uitnodig|programma|speeltuin|veiligheid/.test(text)) return "🏘️ Buurt";
  if (/taal|praten|schrijven|fouten/.test(text)) return "🇳🇱 Taal";
  if (/wie|waar|waarom|hoeveel|kunnen|moeten|mogen|willen/.test(text)) return "❓ Vraagwoorden & modale werkwoorden";
  return "📚 Officiële woordenlijst";
}

function wordsFor(nl) {
  return nl.split(/\s+/).filter(Boolean);
}

function addSource(item, row) {
  item.weight = row.weight;
  item.source = item.source ?? { name: sourceName, numbers: [] };
  if (!Array.isArray(item.source.numbers)) item.source.numbers = [];
  if (!item.source.numbers.includes(row.number)) item.source.numbers.push(row.number);
}

for (const row of rows) {
  const key = row.nl.toLowerCase();
  const existing = byNl.get(key);
  if (existing) {
    addSource(existing, row);
    continue;
  }

  const item = {
    nl: row.nl,
    en: row.en,
    weight: row.weight,
    source: {
      name: sourceName,
      numbers: [row.number],
    },
    topic: topicFor(row.nl),
    tag: row.nl.includes(" ") ? "uitdrukking" : "woord",
    fill: "Kies het juiste woord: ___.",
    answer: row.nl,
    fill_en: `Choose the correct word or phrase: ${row.en}.`,
    dis: [],
    sentence: {
      nl: row.nl,
      en: row.en,
      words: wordsFor(row.nl),
    },
    info: {
      translation: row.en,
      parts: [
        {
          piece: row.nl,
          cls: "part-word",
          role: row.nl.includes(" ") ? "uitdrukking" : "woord",
          meaning: row.en,
        },
      ],
      tip: `📌 Officiële woordenlijst #${row.number}. Gewicht: ${"⭐".repeat(row.weight)}.`,
    },
  };

  vocab.push(item);
  byNl.set(key, item);
}

const allAnswers = vocab.map((item) => item.answer ?? item.nl);
for (let i = 0; i < vocab.length; i++) {
  const item = vocab[i];
  if (Array.isArray(item.dis) && item.dis.length >= 3) continue;
  const dis = [];
  for (let offset = 1; dis.length < 3 && offset < vocab.length; offset++) {
    const candidate = allAnswers[(i + offset) % vocab.length];
    if (candidate !== item.answer && !dis.includes(candidate)) dis.push(candidate);
  }
  item.dis = dis;
}

writeFileSync("src/vocab.json", JSON.stringify(vocab, null, 2) + "\n");
console.log(`Loaded ${rows.length} markdown rows; vocab now has ${vocab.length} unique items.`);
