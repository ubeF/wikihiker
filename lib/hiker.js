const { Page } = require("./parse.js");

class Node {
  constructor(page, parent) {
    this.page = page;
    this.parent = parent;
  }

  async getChildren() {
    await this.page.load();
    const references = this.page.getReferences();
    return references.map((page) => new Node(page, this));
  }

  getURL() {
    return this.page.url;
  }

  getTrace() {
    let trace = [];

    for (let node = this; node != null; node = node.parent) {
      trace.unshift(node);
    }

    return trace;
  }

  printTrace() {
    let trace = this.getTrace();

    for (let i in trace) {
      console.log(`${i} ${trace[i].page.url.toString()}`);
    }
  }
}

async function search(entry, target, depth, database, log) {
  await database.prepareData(depth);
  await database.createRootPage(entry);
  for (let i = 0; i < depth; i++) {}
}

module.exports = { search };

// async function travel(node, target, height, verbose, shortest) {
//   if (node.getURL().pathname === target.pathname) {
//     return node;
//   } else if (height === 0) {
//     return undefined;
//   } else {
//     conditionalLog(
//       `==== HEIGHT ${height}: Searching ${node.getURL().pathname} ====`,
//       verbose
//     );
//     const children = await node.getChildren();
//     conditionalLog(`Found ${children.length} references`, verbose);
//     if (!shortest) {
//       return await findFirst(
//         children,
//         async (x) => await travel(x, target, height - 1, verbose, shortest)
//       );
//     } else {
//       return await findBest(
//         children,
//         async (x) => await travel(x, target, height - 1, verbose, shortest),
//         (a, b) => a.getTrace().length - b.getTrace().length
//       );
//     }
//   }
// }

// async function findFirst(items, func) {
//   for (const item of items) {
//     const result = await func(item);
//     if (result != undefined) {
//       return result;
//     }
//   }

//   return undefined;
// }

// async function findBest(items, func, compare) {
//   let best = undefined;

//   for (const item of items) {
//     const result = await func(item);
//     if (result != undefined) {
//       if (best != undefined && compare(best, result) > 0) {
//         best = result;
//       }
//     }
//   }

//   return best;
// }
