import type { ImageMetadata } from "astro";
import { useEffect, useId, useMemo, useRef, useState } from "preact/hooks";

import {
  createFieldDataset,
  FIELD_INDEX_SEED,
  type FieldDataset,
} from "../../lib/field-index-model";

export interface LayerDefinition {
  id: string;
  label: string;
  color: string;
}

export interface LayerMixerProps {
  layers: LayerDefinition[];
  initialActive: string[];
  fallbackSrc: ImageMetadata | string;
  caption: string;
}

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 750;

function imageSource(image: ImageMetadata | string): string {
  return typeof image === "string" ? image : image.src;
}

function colorForLayer(
  layers: LayerDefinition[],
  id: string,
  fallback: string,
): string {
  return layers.find((layer) => layer.id === id)?.color ?? fallback;
}

function prepareCanvas(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D is unavailable");

  const bounds = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(bounds.width || CANVAS_WIDTH));
  const height = width * (CANVAS_HEIGHT / CANVAS_WIDTH);
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const pixelWidth = Math.round(width * pixelRatio);
  const pixelHeight = Math.round(height * pixelRatio);

  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }

  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  context.clearRect(0, 0, width, height);

  return { context, width, height };
}

function drawGrid(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
) {
  const gutter = Math.min(width, height) * 0.055;
  const left = gutter;
  const right = width - gutter;
  const top = gutter;
  const bottom = height - gutter;

  context.save();
  context.strokeStyle = color;
  context.globalAlpha = 0.42;
  context.lineWidth = 1;
  context.beginPath();

  for (let column = 0; column <= 16; column += 1) {
    const x = left + ((right - left) * column) / 16;
    context.moveTo(x, top);
    context.lineTo(x, bottom);
  }

  for (let row = 0; row <= 10; row += 1) {
    const y = top + ((bottom - top) * row) / 10;
    context.moveTo(left, y);
    context.lineTo(right, y);
  }

  context.stroke();
  context.restore();
}

function drawSignals(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  dataset: FieldDataset,
  color: string,
) {
  const marginX = width * 0.07;
  const marginY = height * 0.075;

  context.save();
  context.fillStyle = color;

  for (const signal of dataset.signals) {
    const x = marginX + signal.x * (width - marginX * 2);
    const y = marginY + signal.y * (height - marginY * 2);
    const radius = Math.max(1.6, width * (0.0019 + signal.strength * 0.0015));
    context.globalAlpha = 0.4 + signal.strength * 0.55;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }

  context.restore();
}

function drawRoutes(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  dataset: FieldDataset,
  color: string,
) {
  const marginX = width * 0.065;
  const marginY = height * 0.07;

  context.save();
  context.strokeStyle = color;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = Math.max(2, width * 0.0032);

  for (const route of dataset.routes) {
    context.globalAlpha = 0.76;
    context.beginPath();

    route.forEach((point, index) => {
      const x = marginX + point.x * (width - marginX * 2);
      const y = marginY + point.y * (height - marginY * 2);
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });

    context.stroke();
  }

  context.restore();
}

function drawNotes(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  dataset: FieldDataset,
  color: string,
) {
  const marginX = width * 0.07;
  const marginY = height * 0.075;
  const size = Math.max(15, width * 0.022);

  context.save();
  context.fillStyle = color;
  context.strokeStyle = "#f3f1e9";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = `700 ${Math.max(9, width * 0.009)}px "JetBrains Mono", monospace`;
  context.lineWidth = Math.max(1.5, width * 0.0015);

  for (const note of dataset.notes) {
    const x = marginX + note.x * (width - marginX * 2);
    const y = marginY + note.y * (height - marginY * 2);
    context.beginPath();
    context.arc(x, y, size / 2, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.fillStyle = "#f3f1e9";
    context.fillText(String(note.index), x, y + 0.5);
    context.fillStyle = color;
  }

  context.restore();
}

function drawLayerMixer(
  canvas: HTMLCanvasElement,
  dataset: FieldDataset,
  activeLayers: string[],
  layers: LayerDefinition[],
) {
  const { context, width, height } = prepareCanvas(canvas);
  context.fillStyle = "#d9e1d8";
  context.fillRect(0, 0, width, height);

  context.fillStyle = "rgba(26, 26, 26, 0.04)";
  context.fillRect(width * 0.045, height * 0.055, width * 0.91, height * 0.89);

  if (activeLayers.includes("grid")) {
    drawGrid(context, width, height, colorForLayer(layers, "grid", "#69766b"));
  }
  if (activeLayers.includes("signals")) {
    drawSignals(
      context,
      width,
      height,
      dataset,
      colorForLayer(layers, "signals", "#ef6f46"),
    );
  }
  if (activeLayers.includes("routes")) {
    drawRoutes(
      context,
      width,
      height,
      dataset,
      colorForLayer(layers, "routes", "#3156b7"),
    );
  }
  if (activeLayers.includes("notes")) {
    drawNotes(
      context,
      width,
      height,
      dataset,
      colorForLayer(layers, "notes", "#272727"),
    );
  }
}

export default function LayerMixer({
  layers,
  initialActive,
  fallbackSrc,
  caption,
}: LayerMixerProps) {
  const validLayerIds = useMemo(() => new Set(layers.map((layer) => layer.id)), [layers]);
  const [activeLayers, setActiveLayers] = useState(() =>
    initialActive.filter((id) => validLayerIds.has(id)),
  );
  const [canvasReady, setCanvasReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasId = `layer-mixer-${useId().replace(/:/g, "")}`;
  const dataset = useMemo(() => createFieldDataset(FIELD_INDEX_SEED), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      try {
        drawLayerMixer(canvas, dataset, activeLayers, layers);
        setCanvasReady(true);
        setHasError(false);
      } catch {
        setCanvasReady(false);
        setHasError(true);
      }
    };

    draw();

    const ResizeObserverConstructor = globalThis.ResizeObserver;
    if (typeof ResizeObserverConstructor === "undefined") {
      window.addEventListener("resize", draw);
      return () => window.removeEventListener("resize", draw);
    }

    const resizeObserver = new ResizeObserverConstructor(draw);
    resizeObserver.observe(canvas);
    return () => resizeObserver.disconnect();
  }, [activeLayers, dataset, layers]);

  const toggleLayer = (layerId: string) => {
    setActiveLayers((current) =>
      current.includes(layerId)
        ? current.filter((id) => id !== layerId)
        : [...current, layerId],
    );
  };

  const activeLabels = layers
    .filter((layer) => activeLayers.includes(layer.id))
    .map((layer) => layer.label);

  return (
    <figure class="interactive-demo interactive-demo--layer-mixer">
      <div
        class="interactive-demo__viewport"
        style={{ position: "relative", maxWidth: "100%" }}
      >
        <img
          class="interactive-demo__fallback"
          src={imageSource(fallbackSrc)}
          alt="Static preview of the Field Index map with its grid and signal layers visible."
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          hidden={canvasReady}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <canvas
          id={canvasId}
          ref={canvasRef}
          class="interactive-demo__canvas"
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          role="img"
          aria-label="A Field Index map preview that updates as map layers are toggled."
          style={{
            display: "block",
            width: "100%",
            height: "auto",
            maxWidth: "100%",
            opacity: canvasReady ? 1 : 0,
          }}
        />
      </div>

      <div class="interactive-demo__controls" role="group" aria-label="Map layers">
        {layers.map((layer) => {
          const isActive = activeLayers.includes(layer.id);
          return (
            <button
              key={layer.id}
              class={`interactive-demo__button${isActive ? " interactive-demo__button--active" : ""}`}
              type="button"
              aria-controls={canvasId}
              aria-pressed={isActive}
              onClick={() => toggleLayer(layer.id)}
              style={{ minWidth: 44, minHeight: 44 }}
            >
              <span
                class="interactive-demo__swatch"
                aria-hidden="true"
                style={{ backgroundColor: layer.color }}
              />
              <span>{layer.label}</span>
            </button>
          );
        })}
      </div>

      <p class="interactive-demo__status" role="status" aria-live="polite">
        {hasError
          ? "Interactive map unavailable; the static preview is shown."
          : activeLabels.length > 0
            ? `Visible layers: ${activeLabels.join(", ")}.`
            : "All map layers are hidden."}
      </p>
      <figcaption class="interactive-demo__caption">{caption}</figcaption>
    </figure>
  );
}
