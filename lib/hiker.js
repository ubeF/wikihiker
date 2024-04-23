const { getReferences } = require("./parse.js");

const CHUNK_SIZE = 256; // Number of nodes to be loaded from Database at the same time

async function search(entry, target, depth, database, verbosity) {
  await database.prepare(entry);

  for (let i = 0; i < depth+1; i++) {
    const result = await searchLevel(i, target, database, verbosity);
    if (result) {
      return await database.getRoute(entry, target);
    }
  }

  return null;
}

async function searchLevel(level, target, database, verbosity) {
  if (verbosity > 0) {
    console.log(`=== Searching Level ${level} ===`);
  }

  while (true) {
    const nodes = await database.getPages(level, CHUNK_SIZE);
    if(nodes.length == 0) {
      return false;
    }

    const promises = nodes.map((url) => {
      return handleURL(url, target, database, level, verbosity);
    })
    let results = await Promise.all(promises);
    if (results.some((x) => x)) {
      return true;
    }
  }
}

async function handleURL(url, target, database, level, verbosity) {
  if (verbosity > 1) {
    console.log(`Searching ${url}`);
  }

  const references = await getReferences(url);
  for (const ref of references) {
    await database.addReference(url, ref, level+1);
    if (ref === target) {
      return true;
    }
  }
  await database.setPageToExpanded(url);

  return false;
}

module.exports = { search };
