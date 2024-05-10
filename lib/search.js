async function search(target, depth, getNodes, addConnections, getChildren) {
  for (let level = 0; level < depth + 1; level++) {
    const options = makeLevelOptions(
      target,
      level,
      getNodes,
      addConnections,
      getChildren
    );
    const foundTarget = await searchLevel(options);
    if (foundTarget) {
      return true;
    }
  }

  return false;
}

async function searchLevel(options) {
  while (true) {
    const nodes = await options.getNodesLevel();

    if (!nodes || nodes.length == 0) {
      return false;
    }

    if (await searchChunk(nodes, options)) {
      return true;
    }
  }
}

async function searchChunk(nodes, options) {
  const connections = await Promise.all(
    nodes.map((node) => expandNode(node, options))
  );
  await options.addConnectionsLevel(connections);
  return connections
    .flatMap((connection) => connection.refs)
    .includes(options.target);
}

async function expandNode(node, options) {
  const refs = await options.getChildren(node);
  return { src: node, refs };
}

function makeLevelOptions(
  target,
  level,
  getNodes,
  addConnections,
  getChildren
) {
  return {
    target,
    getNodesLevel: () => getNodes(level),
    addConnectionsLevel: (connections) => addConnections(connections, level + 1),
    getChildren,
  };
}

module.exports = { search, searchLevel, searchChunk, expandNode };
