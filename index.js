const { search } = require("./lib/hiker.js");
const { program } = require("commander");
const { Database } = require("./lib/database.js");

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
  .option(
    "-g, --graph database <path>",
    "database path",
    "neo4j://localhost:7687"
  )
  .option("-u, --username <username>", "username", null)
  .option("-p, --password <password>", "password", null)
  .action(async (startURL, targetURL, options) => {
    try {
      const depth = options.depth;
      const graph = options.graph;
      const username = options.username;
      const password = options.password;

      if (options.verbose) {
        console.log("Start URL:", startURL);
        console.log("Target URL:", targetURL);
        console.log("Depth:", options.depth);
      }

      if (graph) {
        console.log("Graph database:", graph);
        console.log("Username:", username);
        console.log("Password:", password);

        try {
          const database = new Database(graph, username, password);
          await database.connect();
        } catch (error) {
          console.error("Failed to connect to database:", error.message);
          process.exit(0);
        }
      }

      const res = await search(
        startURL,
        targetURL,
        depth,
        options.verbose,
        database
      );

      if (res != undefined) {
        res.printTrace();
        await database.disconnect();
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
