const neo4j = require("neo4j-driver");

class Database {
  constructor(uri, user, pass) {
    let auth = undefined;
    if (!!user && !!pass) {
      auth = neo4j.auth.basic(user, pass);
    }

    this.driver = new neo4j.driver(uri, auth);
    this.context = { database: "neo4j" };
  }

  async connect() {
    return this.driver.getServerInfo();
  }

  async disconnect() {
    return this.driver.close();
  }

  async prepare(url) {
    await this.migrateData(); // To do: add option to utilize existing page-information

    let { records, summary } = await this.driver.executeQuery(
      `CREATE (:Page {url: $url, depth: 0, expanded: false})`,
      { url },
      this.context
    );
  }

  async migrateData() {
    let { records, summary } = await this.driver.executeQuery(
      `
      MATCH (p:Page) 
      SET p.depth = null
      `,
      {},
      this.context
    );
  }

  async clearData() {
    let { records, summary } = await this.driver.executeQuery(
      `MATCH (n) DETACH DELETE n`,
      {},
      this.context
    );
  }

  async addReference(srcURL, trgtURL, depth) {
    let { records, summary } = await this.driver.executeQuery(
      `
      MATCH (src:Page {url: $srcURL})
      MERGE (trgt:Page {url: $trgtURL})
      ON CREATE SET
        trgt.expanded = false
      SET trgt.depth = $depth
      CREATE (src)-[:references]->(trgt)
      `,
      { srcURL, trgtURL, depth },
      this.context
    );
  }

  async getPages(depth, maxNumItems) {
    let { records, summary } = await this.driver.executeQuery(
      `
      MATCH (p:Page {depth: $depth, expanded: false}) 
      RETURN p.url AS url
      LIMIT $maxNumItems
      `,
      { depth, maxNumItems: neo4j.int(maxNumItems) },
      this.context
    );

    return records;
  }

  async getRoute(srcURL, trgtURL) {
    let { records, summary } = await this.driver.executeQuery(
      `
      MATCH (src:Page {url: $srcURL})
      MATCH (trgt:Page {url: $trgtURL})
      MATCH p = shortestPath((src)-[:references*]-(trgt))
      RETURN [n in nodes(p) | n.url] AS pages
      `,
      { srcURL, trgtURL },
      this.context
    );

    return records[0].get("pages");
  }

  async setPageToExpanded(url) {
    let { records, summary } = await this.driver.executeQuery(
      `
      MATCH (p:Page {url: $url}) 
      SET p.expanded = true
      `,
      { url },
      this.context
    );
  }
}

module.exports = { Database };
