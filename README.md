# Dutch Language

Static site served by Nginx in Docker.

Vocabulary data lives in `src/vocab.json`. See `docs/VOCABULARY_SCHEMA.md` before adding new words or phrases.

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
