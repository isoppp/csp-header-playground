```
npm install
npm run dev
ngrok http http://localhost:3000
```

- put ngrok hosting url which starts with https:// to BASE_URL in src/index.tsx
- try on ngrok environment not on localhost since this requires https not http


To get sha-384 hash of the file, use the following command:

```
openssl dgst -sha384 -binary ./public/sri.js | openssl base64 -A
```
