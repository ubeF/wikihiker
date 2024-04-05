import { Page } from "./lib/parse.js";

const page = new Page(new URL("https://de.wikipedia.org/wiki/Katzen"));
await page.load();
console.log(page.title);
const references = page.getReferences();
await Promise.all(references.map((x) => x.load()))
references.forEach((x) => console.log(x.title));
