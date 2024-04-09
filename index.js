import { search } from "./lib/hiker.js";

async function main() {
  if (process.argv.length === 4) {
    const startUrl = process.argv[2];
    const targetUrl = process.argv[3];
    console.log(`Start URL: ${startUrl}`);
    console.log(`Target URL: ${targetUrl}`);
    let result = await search(new URL(startUrl), new URL(targetUrl), 3);
    if (result === undefined) {
      console.log("No connection found");
    } else {
      result.printTrace();
    }
  } else {
    console.log("Invalid usuage.\n Right usage: node index.js <start-url> <target-url>");
    process.exit(1);
  }
}

await main();