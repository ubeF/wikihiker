const { search } = require("./lib/search.js");
const { program } = require("commander");
const { Database } = require("./lib/database.js");

let database;

async function connectDatabase(graph, username, password) {
  if ((password && !username) || (username && !password)) {
    console.error("Username and password must be provided together\n ");
    process.exit(0);
  }

  try {
    database = new Database(graph, username, password);
    await database.connect();
    return database;
  } catch (error) {
    console.error("Failed to connect to database:", error.message);
    return undefined;
  }
}

program
  .name("wikihiker")
  .description(
    "A web crawler for Wikipedia, finding paths between two articles."
  )
  .version("0.2.0");

program
  .command("search")
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
    let searchedPages;
    let res;

    database = await connectDatabase(graph, username, password);

    if (!database) {
      process.exit(0);
    }

    if (options.verbosity > 0) {
      if (graph) {
        console.log("Graph database:", graph);
      }
      console.log("Start URL:", startURL);
      console.log("Target URL:", targetURL);
      console.log("Depth:", options.depth);
      console.log("\n");
    }

    try {
      res = await search(startURL, targetURL, depth, database, verbosity);
      searchedPages = await database.getNumSearchedPages();
    } catch (error) {
      console.error("Failed to search:", error.message);
      process.exit(0);
    }

    if (res != undefined) {
      console.log("\n");
      console.log("Path found:");
      res.forEach((x) => console.log(x));
      console.log("\n");
      console.log("Searched pages:", searchedPages);
      await database.disconnect();
    } else {
      console.log("No path found");
    }
  })
  .showHelpAfterError("(add --help or -h for additional information)");

program
  .command("clear")
  .option(
    "-g, --graph database <path>",
    "database path",
    "neo4j://localhost:7687"
  )
  .option("-u, --username <username>", "username", null)
  .option("-p, --password <password>", "password", null)
  .action(async (options) => {
    const username = options.username;
    const password = options.password;
    const graph = options.graph;

    database = await connectDatabase(graph, username, password);

    if (!database) {
      process.exit(0);
    }

    try {
      console.log("Deleted nodes:", await database.clearData());
    } catch (error) {
      console.error("Failed to clear database:", error.message);
      process.exit(0);
    }

    await database.disconnect();
  })
  .showHelpAfterError("(add --help or -h for additional information)");

program.parse(process.argv);
