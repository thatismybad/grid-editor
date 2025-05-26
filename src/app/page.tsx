"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import ImageNext from "next/image";

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("parser");
  return (
    <div className="p-6 font-mono">
      <h1 className="text-2xl font-bold mb-4">🧩 Grid Tool</h1>
      <Tabs
        defaultValue={activeTab}
        onValueChange={(value) => setActiveTab(value)}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="parser">Parser</TabsTrigger>
          <TabsTrigger value="editor">Editor</TabsTrigger>
        </TabsList>
        <TabsContent value="parser">
          <ParserTab />
        </TabsContent>
        <TabsContent value="editor">
          <EditorTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ParserTab() {
  const [rawOutput, setRawOutput] = useState("");
  const [jsonOutput, setJsonOutput] = useState("");
  const [escapedOutput, setEscapedOutput] = useState("");
  const [gridWidth, setGridWidth] = useState(19);
  const [gridHeight, setGridHeight] = useState(19);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

  const handleImage = (file: File) => {
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
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex flex-row gap-2">
          <label className="flex flex-row gap-2 items-center">
            Width:
            <Input
              type="number"
              value={gridWidth}
              onChange={(e) => setGridWidth(Number(e.target.value))}
              placeholder="Grid width"
              className="w-20"
            />
          </label>
          <label className="flex flex-row gap-2 items-center">
            Height:
            <Input
              type="number"
              value={gridHeight}
              onChange={(e) => setGridHeight(Number(e.target.value))}
              placeholder="Grid height"
              className="w-20"
            />
          </label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              const objectUrl = URL.createObjectURL(file);
              setUploadedFile(file);
              setImagePreviewUrl(objectUrl);

              const img = new window.Image();
              img.onload = () => {
                setImageDimensions({ width: img.width, height: img.height });
              };
              img.src = objectUrl;
            }}
          />
          <Button
            onClick={() => {
              if (uploadedFile) handleImage(uploadedFile);
              else alert("Please upload an image first.");
            }}
          >
            Generate
          </Button>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="flex flex-row gap-2">
        <div className="">
          {imagePreviewUrl && imageDimensions && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-1">Image Preview:</p>
              <ImageNext
                width={imageDimensions?.width * 0.5}
                height={imageDimensions?.height * 0.5}
                src={imagePreviewUrl}
                alt="Uploaded preview"
                className="max-w-full h-auto border border-gray-300 rounded"
              />
              {/* <Image
                src={imagePreviewUrl}
                alt="Uploaded preview"
                className=" h-auto border border-gray-300 rounded"
              /> */}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-lg font-semibold">🖨️ Raw Output</h2>
            <Button size="sm" onClick={() => copyToClipboard(rawOutput)}>
              Copy
            </Button>
          </div>
          <Textarea
            className="whitespace-pre h-80"
            value={rawOutput}
            onChange={(e) => {
              const newRaw = e.target.value;
              setRawOutput(newRaw);

              const grid = newRaw
                .trim()
                .split("\n")
                .map((line) => line.split(""));

              setJsonOutput(JSON.stringify(grid, null, 2));
              setEscapedOutput(JSON.stringify(JSON.stringify(grid)));
            }}
          />
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-lg font-semibold">📦 JSON Output</h2>
            <Button size="sm" onClick={() => copyToClipboard(jsonOutput)}>
              Copy
            </Button>
          </div>
          <Textarea
            className="whitespace-pre h-80"
            readOnly
            value={jsonOutput}
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-lg font-semibold">🧬 Escaped JSON (DB safe)</h2>
          <Button size="sm" onClick={() => copyToClipboard(escapedOutput)}>
            Copy
          </Button>
        </div>
        <Textarea
          className="whitespace-pre h-40"
          readOnly
          value={escapedOutput}
        />
      </div>
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
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          type="number"
          value={gridWidth}
          onChange={(e) => setGridWidth(Number(e.target.value))}
          placeholder="Grid width"
        />
        <Input
          type="number"
          value={gridHeight}
          onChange={(e) => setGridHeight(Number(e.target.value))}
          placeholder="Grid height"
        />
        <Button onClick={regenerateGrid}>Generate Grid</Button>
      </div>

      <div className="flex items-center gap-2">
        Tool:
        <Button
          variant={tool === "_" ? "default" : "outline"}
          onClick={() => setTool("_")}
        >
          White (_)
        </Button>
        <Button
          variant={tool === "#" ? "default" : "outline"}
          onClick={() => setTool("#")}
        >
          Gray (#)
        </Button>
        <Button
          variant={tool === "$" ? "default" : "outline"}
          onClick={() => setTool("$")}
        >
          Yellow ($)
        </Button>
      </div>

      <div className="flex flex-row gap-2">
        <div className="flex-1">
          <div className="inline-block border rounded overflow-hidden">
            {grid.map((row, y) => (
              <div key={y} className="flex">
                {row.map((cell, x) => (
                  <div
                    key={x}
                    onClick={() => applyTool(x, y)}
                    className={`w-6 h-6 border border-gray-400 text-xs flex items-center justify-center cursor-pointer select-none
                  ${
                    cell === "#"
                      ? "bg-gray-400"
                      : cell === "$"
                      ? "bg-yellow-300"
                      : "bg-white"
                  }`}
                  >
                    {cell}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold">🖨️ Raw Output</h2>
          <Textarea
            className="whitespace-pre h-80"
            readOnly
            value={grid.map((row) => row.join("")).join("\n")}
          />
        </div>
      </div>
      <div>
        <h2 className="text-lg font-semibold">📦 JSON Output</h2>
        <Textarea
          className="whitespace-pre h-40"
          readOnly
          value={JSON.stringify(grid, null, 2)}
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold">🧬 Escaped JSON (DB safe)</h2>
        <Textarea
          className="whitespace-pre h-40"
          readOnly
          value={JSON.stringify(JSON.stringify(grid))}
        />
      </div>
    </div>
  );
}
