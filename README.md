# Dutch Language

Static site served by Nginx in Docker.

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
