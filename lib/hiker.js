const parse = require("./parse.js");

const CHUNK_SIZE = 256; // Number of nodes to be loaded from Database at the same time

async function search(entry, target, depth, database, verbosity) {
  return await startSearch(
    entry,
    target,
    depth,
    database,
    verbosity,
    parse.getReferences
  );
}

async function startSearch(
  entry,
  target,
  depth,
  database,
  verbosity,
  getReferences
) {
  await database.prepare(entry);

  for (let level = 0; level < depth + 1; level++) {
    const options = {
      level,
      target,
      database,
      verbosity,
      getReferences,
    };
    const foundTarget = await searchLevel(options);
    if (foundTarget) {
      return await database.getRoute(entry, target);
    }
  }

  return null;
}

async function searchLevel(options) {
  if (options.verbosity > 0) {
    console.log(`=== Searching Level ${options.level} ===`);
  }

  while (true) {
    const urls = await options.database.getPages(options.level, CHUNK_SIZE);
    if (urls.length == 0) {
      return false;
    }

    const foundTarget = await searchChunk(urls, options);

    if (foundTarget) {
      return true;
    }
  }
}

async function searchChunk(urls, options) {
  const promises = urls.map((url) => {
    return expandURL(url, options);
  });
  let results = await Promise.all(promises);
  return results.some((x) => x);
}

async function expandURL(url, options) {
  if (options.verbosity > 1) {
    console.log(`Searching ${url}`);
  }

  const references = await options.getReferences(url);
  for (const ref of references) {
    await options.database.addReference(url, ref, options.level + 1);
    if (ref === options.target) {
      return true;
    }
  }
  await options.database.setPageToExpanded(url);

  return false;
}

module.exports = { search, startSearch, searchLevel, searchChunk, expandURL };
