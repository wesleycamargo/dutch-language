# Vocabulary Schema

Vocabulary lives in `src/vocab.json` as a JSON array. Add one object per Dutch word or phrase.

## Required shape

```json
{
  "nl": "verplicht",
  "en": "obligatory / required",
  "weight": 5,
  "source": {
    "name": "Next 200 Dutch Reading Exam Vocabulary Words",
    "numbers": [134]
  },
  "topic": "⚠️ Verplichting",
  "tag": "bijvoeglijk naamwoord",
  "fill": "U bent ___ een zorgverzekering te hebben.",
  "answer": "verplicht",
  "fill_en": "You are required to have health insurance.",
  "dis": ["bevoegd", "vrij", "gemachtigd"],
  "sentence": {
    "nl": "U bent verplicht dit formulier in te vullen.",
    "en": "You are required to fill in this form.",
    "words": ["U", "bent", "verplicht", "dit", "formulier", "in", "te", "vullen."]
  },
  "info": {
    "translation": "obligatory, required — you have no choice",
    "parts": [
      {
        "piece": "ver-",
        "cls": "part-prefix",
        "role": "prefix",
        "meaning": "intensifier, makes the meaning stronger"
      }
    ],
    "tip": "🔑 Verplicht means mandatory. The opposite is vrijwillig."
  }
}
```

## Field reference

| Field | Required | Used by | Meaning |
| --- | --- | --- | --- |
| `nl` | Yes | All modes, popup lookup | Dutch word or phrase being taught. Keep it unique. |
| `en` | Yes | Hints, matching, scramble | Short English translation. |
| `weight` | Optional | Ordering/prioritization metadata | Importance from 1 to 5, where 5 is most important. |
| `source.name` | Optional | Source tracking | Original list name, e.g. `Next 200 Dutch Reading Exam Vocabulary Words`. |
| `source.numbers` | Optional | Source tracking | Original item number(s) from the source list. Use an array because duplicate phrases may appear more than once in the source. |
| `topic` | Yes | Topic badge | Category label, often with emoji. |
| `tag` | Yes | Popup | Word type, article, or phrase type. |
| `fill` | Yes | Fill/type/scramble | Contextual Dutch sentence containing `___` where the answer belongs. Do not use isolated prompts. |
| `answer` | Yes | Fill/type/scramble | Exact one-word answer learners must choose/type/build in the blank. Do not use multi-word answers here. |
| `fill_en` | Yes | Fill translation button | English translation of the fill sentence. |
| `dis` | Yes | Fill mode | One-word distractor answers. Provide at least 3. |
| `sentence.nl` | Yes | Reference content | Full Dutch example sentence. |
| `sentence.en` | Yes | Sentence-build prompt | English translation of the example sentence. |
| `sentence.words` | Yes | Sentence-build mode | Correct Dutch sentence split into clickable tokens, in order. |
| `info.translation` | Yes | Popup/type hint | Longer English explanation. |
| `info.parts` | Yes | Popup | Word-part breakdown. Can be an empty array if not useful. |
| `info.tip` | Yes | Popup | Learning tip; may contain simple HTML such as `<strong>`. |

## `info.parts` fields

Each item in `info.parts` has:

| Field | Required | Meaning |
| --- | --- | --- |
| `piece` | Yes | The visible word part. |
| `cls` | Yes | CSS class controlling color. |
| `role` | Yes | Grammatical role or part type. |
| `meaning` | Yes | Meaning or explanation of the part. |

Allowed `cls` values already styled by the app:

- `part-particle`
- `part-prefix`
- `part-base`
- `part-suffix`
- `part-prep`
- `part-word`

## Notes for adding words

- `src/vocab.json` must stay valid JSON: double quotes only, no comments, no trailing commas.
- Use `weight` for importance: `1` = low, `5` = highest. Convert stars directly, e.g. `⭐⭐⭐⭐⭐` → `5`.
- Preserve source-list numbers in `source.numbers` when adding words from an official/original list.
- Keep `nl` unique; popup lookup uses it as the key.
- `answer` may differ in capitalization from `nl` when the answer appears at the start of a sentence, e.g. `nl: "vanaf"`, `answer: "Vanaf"`.
- For multi-word phrases, use the full phrase in `nl`, but keep `answer` to exactly one missing word, e.g. `nl: "tot en met"`, `answer: "met"`, `fill: "De cursus loopt tot en ___ vrijdag."`.
- Always provide context: `fill` and `sentence.nl` should be full sentences, not just the word or phrase by itself.
- `dis` values should also be one word each, so fill-in-the-blank never asks learners to insert several words at once.
- In `sentence.words`, include punctuation attached to tokens if that is how the learner should place it, e.g. `"adres."`.
- After editing, serve the app over HTTP. Browser `fetch()` may not load `vocab.json` correctly from a local `file://` URL.
