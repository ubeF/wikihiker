const { getReferences } = require("./parse.js");

const CHUNK_SIZE = 256; // Number of nodes to be loaded from Database at the same time

async function search(entry, target, depth, database, verbosity) {
  await database.prepare(entry);

  for (let level = 0; level < depth + 1; level++) {
    const foundTarget = await searchLevel(level, target, database, verbosity);
    if (foundTarget) {
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
    const urls = await database.getPages(level, CHUNK_SIZE);
    if (urls.length == 0) {
      return false;
    }

    const foundTarget = await searchChunk(
      urls,
      target,
      database,
      level,
      verbosity
    );

    if (foundTarget) {
      return true;
    }
  }
}

async function searchChunk(urls, target, database, level, verbosity) {
  const promises = urls.map((url) => {
    return expandURL(url, target, database, level, verbosity);
  });
  let results = await Promise.all(promises);
  return results.some((x) => x);
}

async function expandURL(url, target, database, level, verbosity) {
  if (verbosity > 1) {
    console.log(`Searching ${url}`);
  }

  const references = await getReferences(url);
  for (const ref of references) {
    await database.addReference(url, ref, level + 1);
    if (ref === target) {
      return true;
    }
  }
  await database.setPageToExpanded(url);

  return false;
}

module.exports = { search };
