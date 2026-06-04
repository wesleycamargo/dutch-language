import { readFileSync, writeFileSync } from "node:fs";

const path = "src/vocab.json";
const vocab = JSON.parse(readFileSync(path, "utf8"));

function cleanToken(token) {
  return token.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
}

function chooseAnswer(item) {
  const phrase = item.answer || item.nl;
  const tokens = phrase.split(/\s+/).map(cleanToken).filter(Boolean);
  return tokens[tokens.length - 1] || phrase;
}

function tokenRegex(token) {
  return new RegExp(`(^|[^\\p{L}\\p{N}])(${escapeRegExp(token)})(?=$|[^\\p{L}\\p{N}])`, "iu");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function blankSentence(sentence, answer) {
  const rx = tokenRegex(answer);
  if (rx.test(sentence)) return sentence.replace(rx, "$1___");
  return `${sentence} Antwoord: ___.`;
}

function singleWordDistractors(itemIndex, answer) {
  const distractors = [];

  for (let offset = 1; distractors.length < 3 && offset < vocab.length; offset++) {
    const candidateItem = vocab[(itemIndex + offset) % vocab.length];
    const candidate = chooseAnswer(candidateItem);
    if (!candidate || candidate.includes(" ")) continue;
    if (candidate.toLowerCase() === answer.toLowerCase()) continue;
    if (distractors.some((d) => d.toLowerCase() === candidate.toLowerCase())) continue;
    distractors.push(candidate);
  }

  return distractors;
}

let changedAnswers = 0;
let changedDistractors = 0;

for (let i = 0; i < vocab.length; i++) {
  const item = vocab[i];
  const oldAnswer = item.answer || item.nl;
  const answer = chooseAnswer(item);

  if (oldAnswer !== answer) {
    item.answer = answer;
    const sentenceNl = item.sentence?.nl || item.fill || item.nl;
    item.fill = blankSentence(sentenceNl, answer);
    changedAnswers++;
  }

  if (!Array.isArray(item.dis) || item.dis.length < 3 || item.dis.some((d) => /\s/.test(d))) {
    item.dis = singleWordDistractors(i, item.answer);
    changedDistractors++;
  }
}

writeFileSync(path, JSON.stringify(vocab, null, 2) + "\n");
console.log(`Changed ${changedAnswers} multi-word answers and ${changedDistractors} distractor sets.`);
