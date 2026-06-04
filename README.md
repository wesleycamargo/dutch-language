# Dutch Language

Static site served by Nginx in Docker.

Vocabulary data lives in `src/vocab.json`. The imported source list is kept in `src/vocab.md`; onboarded entries preserve their source number and importance weight. See `docs/VOCABULARY_SCHEMA.md` before adding new words or phrases.

## Run locally

Install dependencies once:

```bash
npm install
```

Start the TypeScript dev server:

```bash
npm run dev
```

Then open:

```text
http://localhost:8090
```

Use another port:

```bash
PORT=8091 npm run dev
```

## Run with Docker

From the repository root:

```bash
docker build -t dutch-language .
docker run --rm -p 8080:80 dutch-language
```

Then open:

```text
http://localhost:8080
```
