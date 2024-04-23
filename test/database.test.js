const { Database } = require("../lib/database.js");

const DB_URI = "neo4j://localhost:7687";
let db;

beforeAll(async () => {
    db = new Database(DB_URI);
    const info = await db.connect();
})

afterAll(async () => {
    await db.disconnect();
})

beforeEach(async () => {
    await db.clearData();
})

test("Can prepare database", async () => {
    let before = await db.getPages(0, 16);
    expect(before.length).toEqual(0);

    await db.prepare("testURL");

    let after = await db.getPages(0, 16);
    expect(after.length).toEqual(1);
    expect(after[0]).toEqual("testURL");
})

test("Can add reference", async () => {
    let before = await db.getPages(1, 16);
    expect(before.length).toEqual(0);

    await db.prepare("srcURL");
    await db.addReference("srcURL", "trgtURL", 1);

    let after = await db.getPages(1, 16);
    expect(after.length).toEqual(1);
})

test("Can set to expanded", async () => {
    await db.prepare("testURL");
    let before = await db.getPages(0, 16);
    expect(before.length).toEqual(1);

    await db.setPageToExpanded("testURL");

    let after = await db.getPages(0, 16);
    expect(after.length).toEqual(0);
})

test("Can find route", async () => {
    await db.prepare("A");
    await db.addReference("A", "B", 1);
    await db.addReference("B", "C", 2);

    let result = await db.getRoute("A", "C");

    expect(result).toEqual(["A", "B", "C"]);
})