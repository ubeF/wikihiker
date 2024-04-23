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
  .option("-v, --verbosity <number>", "verbosity level", 1)
  .option(
    "-g, --graph database <path>",
    "database path",
    "neo4j://localhost:7687"
  )
  .option("-u, --username <username>", "username", null)
  .option("-p, --password <password>", "password", null)
  .action(async (startURL, targetURL, options) => {
    const depth = options.depth;
    const graph = options.graph;
    const username = options.username;
    const password = options.password;
    const verbosity = options.verbosity;
    let database;
    let res;

    if ((password && !username) || (username && !password)) {
      console.error("Username and password must be provided together\n ");
      process.exit(0);
    }

    if (options.verbosity > 0) {
      if (graph) {
        console.log("Graph database:", graph);
      }
      console.log("Start URL:", startURL);
      console.log("Target URL:", targetURL);
      console.log("Depth:", options.depth);
    }

    try {
      database = new Database(graph, username, password);
      await database.connect();
    } catch (error) {
      console.error("Failed to connect to database:", error.message);
      process.exit(0);
    }

    try {
      res = await search(startURL, targetURL, depth, database, verbosity);
    } catch (error) {
      console.error("Failed to search:", error.message);
      process.exit(0);
    }

    if (res != undefined) {
      console.log("Path found:");
      res.forEach((x) => console.log(x));
      await database.disconnect();
    } else {
      console.log("No path found");
    }
  })
  .showHelpAfterError("(add --help or -h for additional information)")
  .parse();
