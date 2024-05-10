const { searchLevel } = require("../lib/search.js");

test("Can search level", async () => {
  let pages = [
    ["A", "B"],
    ["C", "D"],
  ];

  const options = {
    target: "target",
    addConnectionsLevel: jest.fn(() => false),
    getNodesLevel: jest.fn(() => pages.shift() ?? []),
    getChildren: jest.fn((url) => {
      switch (url) {
        case "A":
          return ["A1", "A2"];
        case "B":
          return ["B1", "B2"];
        case "C":
          return ["C1", "C2"];
        case "D":
          return ["D1", "D2"];
      }
    }),
  };

  await searchLevel(options);
  expect(options.getNodesLevel.mock.calls.length).toEqual(3);
  expect(options.getChildren.mock.calls.map((call) => call[0])).toEqual([
    "A",
    "B",
    "C",
    "D",
  ]);
  const calls = options.addConnectionsLevel.mock.calls.map((call) => call[0]);
  expect(calls).toEqual([
    [
      { src: "A", refs: ["A1", "A2"] },
      { src: "B", refs: ["B1", "B2"] },
    ],
    [
      { src: "C", refs: ["C1", "C2"] },
      { src: "D", refs: ["D1", "D2"] },
    ],
  ]);
});
