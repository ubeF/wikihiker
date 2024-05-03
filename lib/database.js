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
    await this.clearData();

    let { records, summary } = await this.driver.executeQuery(
      `CREATE (:Page {url: $url, depth: 0, expanded: false})`,
      { url },
      this.context
    );
  }

  async clearData() {
    let { records, summary } = await this.driver.executeQuery(
      `MATCH (n) DETACH DELETE n`,
      {},
      this.context
    );

    return summary.counters.updates()["nodesDeleted"];
  }

  async addReferences(data, depth) {
    await this.driver.executeQuery(
      `
      WITH $data AS batch
      UNWIND batch AS page
      MATCH (src:Page {url: page.src})
      SET src.expanded = true
      WITH page.refs as refs, src
      UNWIND refs as ref
      MERGE (trgt:Page {url: ref})
      ON CREATE SET trgt.expanded = false, trgt.depth = $depth
      MERGE (src)-[:references]->(trgt)
      `,
      { data, depth },
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

    return records.map((x) => x.get("url"));
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

    return records[0]?.get("pages");
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

  async getNumSearchedPages() {
    let { records, summary } = await this.driver.executeQuery(
      `
      MATCH (p:Page WHERE p.depth IS NOT NULL) 
      RETURN count(p) AS numSearchedPages
      `,
      {},
      this.context
    );

    return records[0]?.get("numSearchedPages").low;
  }
}

module.exports = { Database };
