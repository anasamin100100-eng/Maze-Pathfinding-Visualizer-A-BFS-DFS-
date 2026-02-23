from flask import Flask, render_template, request, jsonify
from queue import PriorityQueue, Queue, LifoQueue
import time

app = Flask(__name__)
ROWS = 25

def h(a, b):
    return abs(a[0]-b[0]) + abs(a[1]-b[1])

def get_neighbors(r, c, grid):
    for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:
        nr, nc = r+dr, c+dc
        if 0 <= nr < ROWS and 0 <= nc < ROWS and grid[nr][nc] != 1:
            yield (nr, nc)

def reconstruct(came_from, end):
    path = []
    while end in came_from:
        end = came_from[end]
        path.append(end)
    return path[::-1]

def bfs(grid, start, end):
    q = Queue()
    q.put(start)
    visited = {start}
    came_from = {}
    expanded = 0

    while not q.empty():
        cur = q.get()
        expanded += 1
        if cur == end:
            return reconstruct(came_from, end), expanded

        for nb in get_neighbors(*cur, grid):
            if nb not in visited:
                visited.add(nb)
                came_from[nb] = cur
                q.put(nb)
    return [], expanded

def dfs(grid, start, end):
    st = LifoQueue()
    st.put(start)
    visited = {start}
    came_from = {}
    expanded = 0

    while not st.empty():
        cur = st.get()
        expanded += 1
        if cur == end:
            return reconstruct(came_from, end), expanded

        for nb in get_neighbors(*cur, grid):
            if nb not in visited:
                visited.add(nb)
                came_from[nb] = cur
                st.put(nb)
    return [], expanded

def astar(grid, start, end):
    pq = PriorityQueue()
    pq.put((0, start))
    came_from = {}
    g = {start: 0}
    visited = set()
    expanded = 0

    while not pq.empty():
        _, cur = pq.get()
        if cur in visited:
            continue
        visited.add(cur)
        expanded += 1

        if cur == end:
            return reconstruct(came_from, end), expanded

        for nb in get_neighbors(*cur, grid):
            temp = g[cur] + 1
            if temp < g.get(nb, 1e9):
                g[nb] = temp
                f = temp + h(nb, end)
                came_from[nb] = cur
                pq.put((f, nb))
    return [], expanded

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/solve", methods=["POST"])
def solve():
    data = request.json
    algo = data["algo"]
    grid = data["grid"]
    start = tuple(data["start"])
    end = tuple(data["end"])

    t0 = time.time()

    if algo == "bfs":
        path, nodes = bfs(grid, start, end)
    elif algo == "dfs":
        path, nodes = dfs(grid, start, end)
    else:
        path, nodes = astar(grid, start, end)

    runtime = round((time.time() - t0) * 1000, 2)

    return jsonify({
        "path": path,
        "nodes": nodes,
        "time": runtime,
        "path_len": len(path)
    })

if __name__ == "__main__":
    app.run()
