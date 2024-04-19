const { search } = require("./lib/hiker.js");
const { program } = require("commander");
const { Database } = require("./database.js");

program
  .name("wikihiker")
  .description(
    "A web crawler for wikipedia, finding paths between two articles."
  )
  .version("0.2.0");

program
  .argument("<startURL>", "starting URL")
  .argument("<targetURL>", "target URL")
  .option("-d, --depth <number>", "search depth", 3)
  .option("-v, --verbose", "verbose output")
  .option("-s, --shortest", "find the shortest path")
  .option("-f, --first", "find the first path")
  .action(async (startURL, targetURL, options) => {
    try {
      const start = new URL(startURL);
      const target = new URL(targetURL);

      if (options.shortest && options.first) {
        console.error(
          "Error: The options --shortest and --first are mutually exclusive. Please use only one."
        );
        process.exit(1);
      }

      if (options.verbose) {
        console.log("Start URL:", startURL);
        console.log("Target URL:", targetURL);
        console.log("Depth:", options.depth);
      }

      const res = await search(
        start,
        target,
        options.depth,
        options.verbose,
        options.shortest
      );

      if (res != undefined) {
        res.printTrace();
      } else {
        console.log("No path found");
      }
    } catch (error) {
      console.error("Invalid URL provided:", error.message);
    }
  })
  .showHelpAfterError("(add --help or -h for additional information)")
  .parse();

function conditionalLog(msg, cond) {
  if (cond) {
    console.log(msg);
  }
}
