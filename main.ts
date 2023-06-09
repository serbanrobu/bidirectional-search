const addIfUnset = <K, V>(map: Map<K, V>, key: K, value: V) => {
  if (!map.has(key)) {
    map.set(key, value);
  }
};

function shortestPathBfs(
  adjList: Map<number, Set<number>>,
  queue: { node: number; dist: number }[],
  visitedOwn: Map<number, number>,
  visitedOther: Map<number, number>,
  previous: Map<number, number>,
  isBackwards: boolean,
): { shortestDistance: number; previous: Map<number, number> } | undefined {
  if (queue.length > 0) {
    const { node, dist } = queue.shift()!;

    if (visitedOther.has(node)) {
      return {
        shortestDistance: dist + visitedOther.get(node)!,
        previous,
      };
    }

    for (const neighbour of adjList.get(node)!) {
      if (!visitedOwn.has(neighbour)) {
        if (isBackwards) {
          addIfUnset(previous, node, neighbour);
        } else {
          addIfUnset(previous, neighbour, node);
        }

        queue.push({ node: neighbour, dist: dist + 1 });
        visitedOwn.set(neighbour, dist + 1);
      }
    }
  }
}

function shortestPathBfs2(
  adjList: Map<number, Set<number>>,
  startNode: number,
  stopNode: number,
): { shortestDistance: number; previous: Map<number, number> } {
  const previous = new Map();
  const visited = new Set();
  const queue: { node: number; dist: number }[] = [];
  queue.push({ node: startNode, dist: 0 });
  visited.add(startNode);

  while (queue.length > 0) {
    const { node, dist } = queue.shift()!;

    if (node === stopNode) {
      return { shortestDistance: dist, previous };
    }

    for (const neighbour of adjList.get(node)!) {
      if (!visited.has(neighbour)) {
        previous.set(neighbour, node);
        queue.push({ node: neighbour, dist: dist + 1 });
        visited.add(neighbour);
      }
    }
  }

  return { shortestDistance: -1, previous };
}

function breadcrumbs(
  previous: Map<number, number>,
  startNode: number,
  stopNode: number,
): number[] {
  let currentNode = stopNode;
  const path = [currentNode];

  while (currentNode !== startNode) {
    const node = previous.get(currentNode);

    if (node === undefined) {
      return path;
    }

    currentNode = node;
    path.push(currentNode);
  }

  return path;
}

function bidirectionalSearch(
  adjList: Map<number, Set<number>>,
  startNode: number,
  stopNode: number,
): { shortestDistance: number; previous: Map<number, number> } {
  const previous: Map<number, number> = new Map();
  const visited1: Map<number, number> = new Map();
  const visited2: Map<number, number> = new Map();
  const queue1: { node: number; dist: number }[] = [];
  const queue2: { node: number; dist: number }[] = [];
  queue1.push({ node: startNode, dist: 0 });
  queue2.push({ node: stopNode, dist: 0 });
  visited1.set(startNode, 0);
  visited2.set(stopNode, 0);

  while (queue1.length > 0 || queue2.length > 0) {
    const res1 = shortestPathBfs(
      adjList,
      queue1,
      visited1,
      visited2,
      previous,
      false,
    );

    // if (res1 !== undefined) {
    //   return res1;
    // }

    const res2 = shortestPathBfs(
      adjList,
      queue2,
      visited2,
      visited1,
      previous,
      true,
    );

    if (res2 !== undefined) {
      return res2;
    }
  }

  return { shortestDistance: -1, previous };
}

const adjList = new Map();
adjList.set(0, new Set([5]));
adjList.set(1, new Set([2, 3]));
adjList.set(2, new Set([1, 4, 6, 8]));
adjList.set(3, new Set([1, 5]));
adjList.set(4, new Set([2, 7, 8]));
adjList.set(5, new Set([0, 3, 6]));
adjList.set(6, new Set([2, 5, 7]));
adjList.set(7, new Set([4, 6]));
adjList.set(8, new Set([2, 4]));

const startNode = Number.parseInt(Deno.args[0]);
const stopNode = Number.parseInt(Deno.args[1]);

{
  const { shortestDistance, previous } = shortestPathBfs2(
    adjList,
    startNode,
    stopNode,
  );

  const path = breadcrumbs(previous, startNode, stopNode).reverse();

  console.log(
    `\
Breadth-first search:
  shortest distance: ${shortestDistance}
  path: ${path.map((node) => `(${node})`).join("--")}
`,
  );
}

console.log();

{
  const { shortestDistance, previous } = bidirectionalSearch(
    adjList,
    startNode,
    stopNode,
  );

  const path = breadcrumbs(previous, startNode, stopNode).reverse();

  console.log(
    `\
Bidirectional search:
  shortest distance: ${shortestDistance}
  path: ${path.map((node) => `(${node})`).join("--")}
`,
  );
}
