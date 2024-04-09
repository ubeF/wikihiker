function getUserInput() {
  if (process.argv.length === 4) {
    const startUrl = process.argv[2];
    const targetUrl = process.argv[3];
    console.log(`Start URL: ${startUrl}`);
    console.log(`Target URL: ${targetUrl}`);
  } else {
    console.log(
      "Invalid usuage.\n Right usage: node index.js <start-url> <target-url>"
    );
    process.exit(1);
  }
}

getUserInput();
