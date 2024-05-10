const https = require("https");
const cheerio = require("cheerio");

async function getReferences(url) {
  const data = await getURL(url);
  const parse = cheerio.load(data);
  return parse("div#bodyContent")
    .find("a")
    .toArray()
    .map((x) => x.attribs.href)
    .filter((x) => x != undefined)
    .filter((x) => x.startsWith("/wiki/"))
    .filter((x) => !x.includes("."))
    .map((x) => `https://${getHost(url)}${x}`);
}

function getHost(url) {
  const x = new URL(url);
  return x.host;
}

function getURL(url) {
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

function isValidURL(x) {
  try {
    const url = new URL(x);
    return url.hostname.endsWith("wikipedia.org");
  } catch (error) {
    return false;
  }
}

module.exports = { getReferences, isValidURL };
