import https from 'https';
import * as cheerio from 'cheerio';

export class Page {
    constructor(url) {
        this.url = url;
    }

    async load() {
        const data = await getUrl(this.url);
        this.parse = cheerio.load(data);
        this.title = this.parse("h1").text();
    }

    getReferences() {
        return this.parse("div#content").find("a")
                    .toArray()
                    .map((x) => x.attribs.href)
                    .filter((x) => x != undefined)
                    .filter((x) => x.startsWith("/wiki/"))
                    .filter((x) => !x.includes("."))
                    .map((x) => `https://${this.url.host}${x}`)
                    .map((x) => new Page(new URL(x)));
    }
}

function getUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let html = "";

      res.on("data", (chunk) => {
        html += chunk;
      });

      res.on("end", () => {
        resolve(html);
      });
    }).on("error", (e) => {
      reject(e);
    })
  });
}