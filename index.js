#!/usr/bin/env node

const { Hiker } = require("./lib/hiker.js");
const { program } = require("commander");

async function createHiker(graph, username, password) {
  if ((password && !username) || (username && !password)) {
    console.error("Username and password must be provided together\n ");
    process.exit(0);
  }

  try {
    const hiker = new Hiker();
    await hiker.connect(graph, username, password);
    return hiker;
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
  .version("1.0.3");

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

    const hiker = await createHiker(graph, username, password);

    if (!hiker) {
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
      res = await hiker.hike(startURL, targetURL, depth);
      searchedPages = await hiker.getDistanceTraveled();
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
      await hiker.disconnect();
    } else {
      console.log("No path found");
    }

    process.exit(0);
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

    const hiker = await createHiker(graph, username, password);

    if (!hiker) {
      process.exit(0);
    }

    try {
      console.log("Deleted nodes:", await hiker.forget());
    } catch (error) {
      console.error("Failed to clear database:", error.message);
      process.exit(0);
    }

    await hiker.disconnect();
  })
  .showHelpAfterError("(add --help or -h for additional information)");

program.parse(process.argv);

