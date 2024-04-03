import https from 'https';
import * as cheerio from 'cheerio';

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

export async function getTitle(url) {
  const data = await getUrl(url);
  const parse = cheerio.load(data);
  return parse("h1").text();
}