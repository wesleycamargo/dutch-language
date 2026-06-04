import { readFileSync, writeFileSync } from "node:fs";

const path = "src/vocab.json";
const vocab = JSON.parse(readFileSync(path, "utf8"));

function wordsFor(sentence) {
  return sentence.split(/\s+/).filter(Boolean);
}

function contextFor(item) {
  const nl = item.nl;
  const en = item.en;
  const lower = nl.toLowerCase();

  if (/wie|waar|waarom|wanneer|hoe laat|hoe vaak|hoeveel|wat moet/.test(lower)) {
    return {
      fill: `In de tekst staat de vraag: ___.`,
      sentenceNl: `In de tekst staat de vraag: ${nl}.`,
      sentenceEn: `The text contains the question: ${en}.`,
    };
  }

  if (/kunnen|moeten|mogen|willen|bellen|komen|solliciteren|werken|sporten|praten|schrijven|helpen|gebruiken|kosten|sparen|dweilen|opzoeken|uitnodigen|regelen|ruilen|aanmelden|opgeven|bespreken|durven|maken|houden|krijgen|hebben|bereiken/.test(lower)) {
    return {
      fill: `In de tekst moet iemand ___.`,
      sentenceNl: `In de tekst moet iemand ${nl}.`,
      sentenceEn: `In the text, someone has to ${en}.`,
    };
  }

  if (/zondag|zaterdag|vrijdag|avond|middag|ochtend|nacht|maand|week|vanaf|vóór|uiterlijk|per|eerste|tweede|derde|nu|weekend|werkdagen/.test(lower)) {
    return {
      fill: `De afspraak is gepland voor ___.`,
      sentenceNl: `De afspraak is gepland voor ${nl}.`,
      sentenceEn: `The appointment is planned for ${en}.`,
    };
  }

  if (/huisarts|spreekuur|balie|noodgeval|alarmnummer|telefoonnummer|bloed|advies|uitslagen/.test(lower)) {
    return {
      fill: `Bij de zorg leest u informatie over ___.`,
      sentenceNl: `Bij de zorg leest u informatie over ${nl}.`,
      sentenceEn: `In healthcare information, you read about ${en}.`,
    };
  }

  if (/winkel|klant|kaart|korting|gratis|punt|punten|kosten|schoon|vies|druk/.test(lower)) {
    return {
      fill: `In de winkel krijgt u informatie over ___.`,
      sentenceNl: `In de winkel krijgt u informatie over ${nl}.`,
      sentenceEn: `In the shop, you receive information about ${en}.`,
    };
  }

  if (/buurt|bijeenkomst|bewoners|programma|speeltuin|veiligheid|activiteit|themagroep|uitnodiging/.test(lower)) {
    return {
      fill: `Op de buurtbijeenkomst praten bewoners over ___.`,
      sentenceNl: `Op de buurtbijeenkomst praten bewoners over ${nl}.`,
      sentenceEn: `At the neighborhood meeting, residents talk about ${en}.`,
    };
  }

  return {
    fill: `In de brief staat informatie over ___.`,
    sentenceNl: `In de brief staat informatie over ${nl}.`,
    sentenceEn: `The letter contains information about ${en}.`,
  };
}

let changed = 0;
for (const item of vocab) {
  const isIsolated = item.sentence?.nl === item.nl || item.fill === "Kies het juiste woord: ___.";
  if (!isIsolated) continue;

  const context = contextFor(item);
  item.fill = context.fill;
  item.fill_en = context.sentenceEn;
  item.sentence = {
    nl: context.sentenceNl,
    en: context.sentenceEn,
    words: wordsFor(context.sentenceNl),
  };
  changed++;
}

writeFileSync(path, JSON.stringify(vocab, null, 2) + "\n");
console.log(`Contextualized ${changed} isolated vocabulary items.`);
