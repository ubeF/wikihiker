const { Database } = require("./database.js");
const { search } = require("./search.js");
const { getReferences, isValidURL } = require("./parse.js");

const CHUNK_SIZE = 16;

class Hiker {
  async connect(uri, username, password) {
    this.database = new Database(uri, username, password);
    await this.database.connect();
  }

  async hike(entry, target, depth) {
    if (!this.database) {
      throw new Error(
        "Not connected to database: connect() needs to preceed hike()"
      );
    }

    if (!isValidURL(entry) || !isValidURL(target)) {
      throw new Error("Invalid URL");
    }

    await this.database.prepare(entry);

    const foundTarget = await search(
      target,
      depth,
      (level) => this.database.getPages(level, CHUNK_SIZE),
      ({ node, children }, level) =>
        this.database.addReferences({ src: node, refs: children }, level),
      getReferences
    );

    if (foundTarget) {
      return await database.getRoute(entry, target);
    } else {
      return null;
    }
  }
}

module.exports = { Hiker };
