// pages/index.tsx

import { useState, useRef } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"parser" | "editor">("parser");

  return (
    <div style={{ fontFamily: "monospace", padding: "1rem" }}>
      <h1>🧩 Grid Tool</h1>
      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => setActiveTab("parser")}
          style={{ marginRight: "1rem" }}
        >
          Parser
        </button>
        <button onClick={() => setActiveTab("editor")}>Editor</button>
      </div>
      {activeTab === "parser" ? <ParserTab /> : <EditorTab />}
    </div>
  );
}

function ParserTab() {
  const [rawOutput, setRawOutput] = useState("");
  const [jsonOutput, setJsonOutput] = useState("");
  const [escapedOutput, setEscapedOutput] = useState("");
  const [gridWidth, setGridWidth] = useState(19);
  const [gridHeight, setGridHeight] = useState(19);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const cellW = img.width / gridWidth;
      const cellH = img.height / gridHeight;

      let raw = "";
      const grid: string[][] = [];

      for (let y = 0; y < gridHeight; y++) {
        let row = "";
        const rowArr: string[] = [];
        for (let x = 0; x < gridWidth; x++) {
          const px = Math.floor(x * cellW + cellW / 2);
          const py = Math.floor(y * cellH + cellH / 2);
          const [r, g, b] = ctx.getImageData(px, py, 1, 1).data;

          let char = "#";
          if (r > 240 && g > 240 && b > 240) char = "_";
          else if (r > 230 && g > 230 && b < 100) char = "$";

          row += char;
          rowArr.push(char);
        }
        raw += row + "\n";
        grid.push(rowArr);
      }

      setRawOutput(raw);
      setJsonOutput(JSON.stringify(grid, null, 2));
      setEscapedOutput(JSON.stringify(JSON.stringify(grid)));
    };

    img.src = URL.createObjectURL(file);
  };

  return (
    <div>
      <label>
        Upload image:
        <input type="file" accept="image/*" onChange={handleImage} />
      </label>

      <label>
        Grid width:
        <input
          type="number"
          value={gridWidth}
          onChange={(e) => setGridWidth(Number(e.target.value))}
        />
      </label>

      <label>
        Grid height:
        <input
          type="number"
          value={gridHeight}
          onChange={(e) => setGridHeight(Number(e.target.value))}
        />
      </label>

      <canvas ref={canvasRef} style={{ display: "none" }} />

      <h2>🖨️ Raw Output</h2>
      <button onClick={() => copyToClipboard(rawOutput)}>Copy</button>
      <pre>{rawOutput}</pre>

      <h2>📦 JSON.stringify 2D Array</h2>
      <button onClick={() => copyToClipboard(jsonOutput)}>Copy</button>
      <pre>{jsonOutput}</pre>

      <h2>🧬 Escaped JSON string (for DB)</h2>
      <button onClick={() => copyToClipboard(escapedOutput)}>Copy</button>
      <pre>{escapedOutput}</pre>
    </div>
  );
}

function EditorTab() {
  const [gridWidth, setGridWidth] = useState(19);
  const [gridHeight, setGridHeight] = useState(19);
  const [grid, setGrid] = useState<string[][]>(
    Array.from({ length: 19 }, () => Array.from({ length: 19 }, () => "_"))
  );
  const [tool, setTool] = useState<"_" | "#" | "$">("_");

  const applyTool = (x: number, y: number) => {
    const newGrid = [...grid.map((row) => [...row])];
    newGrid[y][x] = tool;
    setGrid(newGrid);
  };

  const regenerateGrid = () => {
    const newGrid = Array.from({ length: gridHeight }, () =>
      Array.from({ length: gridWidth }, () => "_")
    );
    setGrid(newGrid);
  };

  return (
    <div>
      <label>
        Grid width:
        <input
          type="number"
          value={gridWidth}
          onChange={(e) => setGridWidth(Number(e.target.value))}
        />
      </label>
      <label>
        Grid height:
        <input
          type="number"
          value={gridHeight}
          onChange={(e) => setGridHeight(Number(e.target.value))}
        />
      </label>
      <button onClick={regenerateGrid}>Generate Grid</button>

      <div style={{ margin: "1rem 0" }}>
        Tool:
        <button onClick={() => setTool("_")} style={{ marginLeft: "0.5rem" }}>
          White (_)
        </button>
        <button onClick={() => setTool("#")} style={{ marginLeft: "0.5rem" }}>
          Gray (#)
        </button>
        <button onClick={() => setTool("$")} style={{ marginLeft: "0.5rem" }}>
          Yellow ($)
        </button>
      </div>

      <div style={{ display: "inline-block", border: "1px solid #ccc" }}>
        {grid.map((row, y) => (
          <div key={y} style={{ display: "flex" }}>
            {row.map((cell, x) => (
              <div
                key={x}
                onClick={() => applyTool(x, y)}
                style={{
                  width: "20px",
                  height: "20px",
                  backgroundColor:
                    cell === "#" ? "gray" : cell === "$" ? "gold" : "white",
                  border: "1px solid #999",
                  cursor: "pointer",
                  textAlign: "center",
                  fontSize: "12px",
                  lineHeight: "20px",
                }}
              >
                {cell}
              </div>
            ))}
          </div>
        ))}
      </div>

      <h2>Output</h2>
      <pre>{grid.map((row) => row.join("")).join("\n")}</pre>
      <h3>JSON</h3>
      <pre>{JSON.stringify(grid, null, 2)}</pre>
      <h3>Escaped</h3>
      <pre>{JSON.stringify(JSON.stringify(grid))}</pre>
    </div>
  );
}
