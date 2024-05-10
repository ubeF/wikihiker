const parse = require("./parse.js");

const CHUNK_SIZE = 16; // Number of nodes to be loaded from Database at the same time

async function search(entry, target, depth, database, verbosity, progress) {
  return await startSearch(
    entry,
    target,
    depth,
    database,
    verbosity,
    parse.getReferences,
    progress
  );
}

async function startSearch(
  entry,
  target,
  depth,
  database,
  verbosity,
  getReferences,
  progress
) {
  await database.prepare(entry);

  for (let level = 0; level < depth + 1; level++) {
    const options = {
      level,
      target,
      database,
      verbosity,
      getReferences,
      progress
    };
    const foundTarget = await searchLevel(options);
    if (foundTarget) {
      return await database.getRoute(entry, target);
    }
  }

  return null;
}

async function searchLevel(options) {
  options.progress.createBar(await options.database.getNodesonLayer(options.level), options.level);

  while (true) {
    const urls = await options.database.getPages(options.level, CHUNK_SIZE);
    if (urls.length == 0) {
      return false;
    }

    const foundTarget = await searchChunk(urls, options);

    options.progress.increment(CHUNK_SIZE);

    if (foundTarget) {
      options.progress.stop();
      return true;
    }
  }
}

async function searchChunk(urls, options) {
  const data = await Promise.all(urls.map((url) => expandURL(url, options)));
  await options.database.addReferences(data, options.level + 1);
  if (data.flatMap((x) => x.refs).includes(options.target)) {
    return true;
  }
}

async function expandURL(url, options) {
  if (options.verbosity > 1) {
    console.log(`Searching ${url}`);
  }

  const references = await options.getReferences(url);
  return { src: url, refs: references };
}

module.exports = { search, startSearch, searchLevel, searchChunk, expandURL };
