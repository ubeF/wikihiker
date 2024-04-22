const https = require("https");
const cheerio = require("cheerio");

async function getReferences(url) {
  const data = await getUrl(url);
  const parse = cheerio.load(data);
  return parse("div#content")
      .find("a")
      .toArray()
      .map((x) => x.attribs.href)
      .filter((x) => x != undefined)
      .filter((x) => x.startsWith("/wiki/"))
      .filter((x) => !x.includes("."))
      .map((x) => `https://${this.url.host}${x}`)
      .map((x) => new Page(new URL(x)));
}

function getUrl(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let html = "";

        res.on("data", (chunk) => {
          html += chunk;
        });

        res.on("end", () => {
          resolve(html);
        });
      })
      .on("error", (e) => {
        reject(e);
      });
  });
}

module.exports = { getReferences };
