const ROWS = 25;
const SIZE = 20;
const canvas = document.getElementById("grid");
canvas.width = canvas.height = ROWS * SIZE;
const ctx = canvas.getContext("2d");

let grid = Array.from({length: ROWS}, () => Array(ROWS).fill(0));
let start = null, end = null;

function draw() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < ROWS; c++) {
            ctx.fillStyle =
                grid[r][c] === 1 ? "black" :
                grid[r][c] === 2 ? "orange" :
                grid[r][c] === 3 ? "cyan" :
                grid[r][c] === 4 ? "yellow" :
                "white";
            ctx.fillRect(c*SIZE, r*SIZE, SIZE, SIZE);
            ctx.strokeRect(c*SIZE, r*SIZE, SIZE, SIZE);
        }
    }
}

canvas.onclick = e => {
    const r = Math.floor(e.offsetY / SIZE);
    const c = Math.floor(e.offsetX / SIZE);

    // If no start → set start (only on empty cell)
    if (!start && grid[r][c] === 0) {
        start = [r, c];
        grid[r][c] = 2;
    }

    // If no end → set end (only on empty cell)
    else if (!end && grid[r][c] === 0) {
        end = [r, c];
        grid[r][c] = 3;
    }

    // After start & end are set → toggle walls
    else {

        // Do NOT modify start or end
        if (start && r === start[0] && c === start[1]) return;
        if (end && r === end[0] && c === end[1]) return;

        // Toggle wall correctly
        if (grid[r][c] === 1) {
            grid[r][c] = 0;   // remove wall
        } else if (grid[r][c] === 0) {
            grid[r][c] = 1;   // add wall
        }
    }

    draw();
};



function run(algo) {
    fetch("/solve", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({grid, start, end, algo})
    })
    .then(r => r.json())
    .then(data => {
        document.getElementById("stats").innerText =
            `Nodes Expanded: ${data.nodes}`;
        animate(data.path);
    });
}

function animate(path) {
    let i = 0;
    let interval = setInterval(() => {
        if (i >= path.length) return clearInterval(interval);
        let [r, c] = path[i++];
        grid[r][c] = 4;
        draw();
    }, 40);
}

function reset() {
    grid = Array.from({length: ROWS}, () => Array(ROWS).fill(0));
    start = end = null;
    draw();
}

draw();

const COLORS = {
    astar: "cyan",
    bfs: "lime",
    dfs: "yellow"
};

let speed = 80; // default delay in ms

document.getElementById("speed").addEventListener("input", function(e) {
    speed = parseInt(e.target.value);
});


document.addEventListener("keydown", e => {
    if (e.key === "m") generateMaze();
});



function generateMaze() {
    // Step 1: Fill everything with walls
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < ROWS; c++) {
            grid[r][c] = 1;
        }
    }

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

    const stack = [];
    const startR = 1, startC = 1;
    grid[startR][startC] = 0;
    stack.push([startR, startC]);

    const directions = [
        [2, 0],
        [-2, 0],
        [0, 2],
        [0, -2]
    ];

    while (stack.length > 0) {
        const [r, c] = stack[stack.length - 1];
        let neighbors = [];

        for (let [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr > 0 && nr < ROWS - 1 && nc > 0 && nc < ROWS - 1 && grid[nr][nc] === 1) {
                neighbors.push([nr, nc, dr, dc]);
            }
        }

        if (neighbors.length > 0) {
            shuffle(neighbors);
            const [nr, nc, dr, dc] = neighbors[0];

            // Remove wall between cells
            grid[r + dr / 2][c + dc / 2] = 0;
            grid[nr][nc] = 0;
            stack.push([nr, nc]);
        } else {
            stack.pop();
        }
    }

    start = end = null;
    draw();
}


function run(algo) {
    fetch("/solve", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({grid, start, end, algo})
    })
    .then(r => r.json())
    .then(data => {
        document.getElementById("stats").innerText =
            `Nodes: ${data.nodes} | Path: ${data.path_len} | Time: ${data.time} ms`;
        animate(data.path, COLORS[algo]);
    });
}

function animate(path, color) {
    let i = 0;

    let timer = setInterval(() => {
        if (i >= path.length) {
            clearInterval(timer);
            return;
        }

        let [r, c] = path[i++];
        grid[r][c] = 4;

        ctx.fillStyle = color;
        ctx.fillRect(c * SIZE, r * SIZE, SIZE, SIZE);
        ctx.strokeRect(c * SIZE, r * SIZE, SIZE, SIZE);

    }, speed);
}


