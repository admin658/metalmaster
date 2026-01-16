# AI Tone Assistant

Small helper library to analyze and rewrite text for a target tone. Initial implementation is rule-based and intended as a scaffold.

Usage:

```ts
import { analyzeTone } from '@metalmaster/ai-tone-assistant';

const res = analyzeTone("Hey team, I'm sending the report. Thanks!", 'formal');
console.log(res.example);
```

This package is a starting point — later iterations can integrate LLMs or Zod validation and expose an HTTP API.
