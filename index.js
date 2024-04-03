import { getTitle } from "./lib/search.js";

getTitle("https://de.wikipedia.org/wiki/Katzen").then((title) => console.log(title));