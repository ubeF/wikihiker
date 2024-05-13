const { Database } = require("./database.js");
const { search } = require("./search.js");
const { getReferences, isValidURL } = require("./parse.js");
const {Progress} = require("./progress.js")

const CHUNK_SIZE = 16;

class Hiker {
  async connect(uri, username, password) {
    this.database = new Database(uri, username, password);
    await this.database.connect();
  }

  async disconnect() {
    await this.database.disconnect();
  }

  async getDistanceTraveled() {
    return await this.database.getNumSearchedPages();
  }

  async forget() {
    return await this.database.clearData();
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

    const progress = new Progress();

    await this.database.prepare(entry);

    const foundTarget = await search(
      target,
      depth,
      (level) => this.database.getPages(level, CHUNK_SIZE),
      (connections, level) => this.database.addReferences(connections, level),
      getReferences,
      (level) => this.database.getNodesonLayer(level).then((count) => progress.createBar(count, level+1)),
      () => progress.increment(CHUNK_SIZE)
    );

    if (foundTarget) {
      return await this.database.getRoute(entry, target);
    } else {
      return null;
    }
  }
}

module.exports = { Hiker };
