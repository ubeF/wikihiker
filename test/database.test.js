const { Database } = require("../lib/database.js");

const DB_URI = "neo4j://localhost:7687";
let db;

beforeAll(async () => {
  db = new Database(DB_URI);
  const info = await db.connect();
});

afterAll(async () => {
  await db.disconnect();
});

beforeEach(async () => {
  await db.clearData();
});

test("Can prepare database", async () => {
  let before = await db.getPages(0, 16);
  expect(before.length).toEqual(0);

  await db.prepare("testURL");

  let after = await db.getPages(0, 16);
  expect(after.length).toEqual(1);
  expect(after[0]).toEqual("testURL");
});

test("Can add references", async () => {
  let before = await db.getPages(1, 16);
  expect(before.length).toEqual(0);

  await db.prepare("srcURL");
  await db.addReferences([{ src: "srcURL", refs: ["trgt1", "trgt2"] }], 1);

  let after = await db.getPages(1, 16);
  expect(after.sort()).toEqual(["trgt1", "trgt2"]);
});

test("Can set to expanded", async () => {
  await db.prepare("srcURL");
  let before = await db.getPages(0, 16);
  expect(before.length).toEqual(1);

  await db.addReferences([{ src: "srcURL", refs: ["trgt1"] }], 1);

  let after = await db.getPages(0, 16);
  expect(after.length).toEqual(0);
});

test("Can find route", async () => {
  await db.prepare("A");
  await db.addReferences({ src: "A", refs: ["B"] }, 1);
  await db.addReferences({ src: "B", refs: ["C"] }, 1);

  let result = await db.getRoute("A", "C");

  expect(result).toEqual(["A", "B", "C"]);
});
