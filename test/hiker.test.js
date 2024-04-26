const { searchLevel, expandURL } = require("../lib/hiker.js");

test("Can expand URL", async () => {
  const mockDB = {
    addReference: jest.fn(() => false),
    setPageToExpanded: jest.fn(),
  };

  const options = {
    level: 1,
    target: "target",
    database: mockDB,
    verbosity: 0,
    getReferences: jest.fn(() => ["A", "B", "C"]),
  };

  const result = await expandURL("test", options);

  expect(result).toEqual(false);
  expect(mockDB.setPageToExpanded.mock.calls[0][0]).toEqual("test");
  expect(options.getReferences.mock.calls[0][0]).toEqual("test");

  expect(mockDB.addReference.mock.calls[0]).toEqual(["test", "A", 2]);
  expect(mockDB.addReference.mock.calls[1]).toEqual(["test", "B", 2]);
  expect(mockDB.addReference.mock.calls[2]).toEqual(["test", "C", 2]);
  expect(mockDB.addReference.mock.calls).toHaveLength(3);
});

test("Can search level", async () => {
  let pages = [["A", "B", "C"]];

  const mockDB = {
    addReference: jest.fn(() => false),
    setPageToExpanded: jest.fn(),
    getPages: jest.fn(() => pages.pop() ?? []),
  };

  const options = {
    level: 1,
    target: "target",
    database: mockDB,
    verbosity: 0,
    getReferences: jest.fn((url) => {
      switch (url) {
        case "A":
          return ["A1", "A2"];
        case "B":
          return ["B1", "B2"];
        case "C":
          return ["C1", "C2"];
      }
    }),
  };

  const result = await searchLevel(options);
  expect(mockDB.getPages.mock.calls).toEqual([
    [1, 256],
    [1, 256],
  ]);
  expect(options.getReferences.mock.calls.map((call) => call[0])).toEqual([
    "A",
    "B",
    "C",
  ]);
  expect(mockDB.addReference.mock.calls.map((call) => call[1]).sort()).toEqual([
    "A1",
    "A2",
    "B1",
    "B2",
    "C1",
    "C2",
  ]);
});
