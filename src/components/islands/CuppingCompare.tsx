import type { ImageMetadata } from "astro";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";

import {
  CUPPING_LOTS,
  CUPPING_METRICS,
  formatCuppingValue,
  getCuppingLot,
  metricDelta,
  type CuppingLotId,
  type CuppingMode,
} from "../../lib/coffee-cupping-model";

export interface CuppingCompareProps {
  initialMode: CuppingMode;
  initialLot: CuppingLotId;
  fallbackSrc: ImageMetadata | string;
  caption: string;
}

const LOT_COLORS = ["#f4cd00", "#3dc1a2", "#f1892a", "#3e58e2", "#f391c7"] as const;

function imageSource(image: ImageMetadata | string): string {
  return typeof image === "string" ? image : image.src;
}

function drawPriceQuality(canvas: HTMLCanvasElement, selectedLot: CuppingLotId) {
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D is unavailable");

  const bounds = canvas.getBoundingClientRect();
  const width = Math.max(280, Math.round(bounds.width || 720));
  const height = Math.max(220, Math.round(width * 0.46));
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, width, height);

  const left = 46;
  const right = width - 24;
  const top = 22;
  const bottom = height - 38;
  const x = (price: number) => left + ((price - 3.5) / 4.5) * (right - left);
  const y = (score: number) => bottom - ((score - 74) / 18) * (bottom - top);

  context.fillStyle = "#f4f0e6";
  context.fillRect(0, 0, width, height);
  context.strokeStyle = "rgba(26, 26, 26, 0.28)";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(left, top);
  context.lineTo(left, bottom);
  context.lineTo(right, bottom);
  context.stroke();

  context.fillStyle = "#1a1a1a";
  context.font = '10px "JetBrains Mono", monospace';
  context.textAlign = "center";
  context.fillText("price / lb →", (left + right) / 2, height - 10);
  context.save();
  context.translate(12, (top + bottom) / 2);
  context.rotate(-Math.PI / 2);
  context.fillText("SCA total →", 0, 0);
  context.restore();

  CUPPING_LOTS.forEach((lot, index) => {
    const selected = lot.id === selectedLot;
    context.beginPath();
    context.fillStyle = LOT_COLORS[index];
    context.strokeStyle = "#1a1a1a";
    context.lineWidth = selected ? 4 : 1.5;
    context.arc(x(lot.pricePerPound), y(lot.totalSca), selected ? 8 : 6, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    if (selected) {
      context.fillStyle = "#1a1a1a";
      context.textAlign = "left";
      context.fillText(lot.shortLabel, x(lot.pricePerPound) + 13, y(lot.totalSca) + 3);
    }
  });
}

export default function CuppingCompare({
  initialMode,
  initialLot,
  fallbackSrc,
  caption,
}: CuppingCompareProps) {
  const [mode, setMode] = useState<CuppingMode>(initialMode);
  const [selectedLot, setSelectedLot] = useState<CuppingLotId>(initialLot);
  const [ready, setReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const selected = useMemo(() => getCuppingLot(selectedLot), [selectedLot]);
  const fallbackWidth = typeof fallbackSrc === "string" ? 1280 : fallbackSrc.width;
  const fallbackHeight = typeof fallbackSrc === "string" ? 900 : fallbackSrc.height;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      try {
        drawPriceQuality(canvas, selectedLot);
        setReady(true);
        setHasError(false);
      } catch {
        setReady(false);
        setHasError(true);
      }
    };

    draw();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", draw);
      return () => window.removeEventListener("resize", draw);
    }

    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [selectedLot]);

  return (
    <figure class="interactive-demo interactive-demo--cupping" data-demo="cupping-compare">
      <img
        class="interactive-demo__fallback"
        src={imageSource(fallbackSrc)}
        alt="Static Coffee Cupping comparison showing five source lots and their absolute sensory scores."
        width={fallbackWidth}
        height={fallbackHeight}
        hidden={ready}
      />

      <div class="cupping-demo__application" hidden={!ready}>
        <div class="cupping-demo__toolbar">
          <div class="interactive-demo__controls cupping-demo__mode" role="group" aria-label="Score display mode">
            <button
              type="button"
              class={`interactive-demo__button${mode === "absolute" ? " interactive-demo__button--active" : ""}`}
              aria-pressed={mode === "absolute"}
              onClick={() => setMode("absolute")}
            >
              Absolute
            </button>
            <button
              type="button"
              class={`interactive-demo__button${mode === "delta" ? " interactive-demo__button--active" : ""}`}
              aria-pressed={mode === "delta"}
              onClick={() => setMode("delta")}
            >
              Delta
            </button>
          </div>

          <p class="cupping-demo__selection">
            <strong>{selected.label}</strong><br />
            {selected.origin} · {selected.process}
          </p>
        </div>

        <div class="cupping-demo__matrix-scroll" tabIndex={0} aria-label="Scrollable comparison matrix">
          <table class="cupping-demo__matrix">
            <caption class="visually-hidden">Six cupping metrics compared across five source lots</caption>
            <thead>
              <tr>
                <th scope="col">Metric</th>
                {CUPPING_LOTS.map((lot) => (
                  <th scope="col" class={lot.id === selectedLot ? "is-selected" : undefined}>
                    <button
                      type="button"
                      aria-pressed={lot.id === selectedLot}
                      onClick={() => setSelectedLot(lot.id)}
                    >
                      {lot.shortLabel}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CUPPING_METRICS.map((metric) => (
                <tr>
                  <th scope="row">{metric.label}</th>
                  {CUPPING_LOTS.map((lot) => {
                    const delta = metricDelta(lot, metric.id);
                    return (
                      <td class={`${lot.id === selectedLot ? "is-selected " : ""}${mode === "delta" ? (delta >= 0 ? "is-positive" : "is-negative") : ""}`}>
                        {formatCuppingValue(lot, metric.id, mode)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <canvas
          ref={canvasRef}
          class="cupping-demo__plot"
          role="img"
          aria-label={`Price versus quality plot. ${selected.label} is selected at $${selected.pricePerPound.toFixed(2)} per pound and ${selected.totalSca.toFixed(1)} SCA points.`}
          width="720"
          height="332"
        />
      </div>

      <p class="interactive-demo__status" role="status" aria-live="polite">
        {hasError
          ? "Interactive comparison unavailable; the static preview is shown."
          : `${mode === "absolute" ? "Absolute scores" : "Deltas from the room average"}; ${selected.label} selected.`}
      </p>
      <figcaption class="interactive-demo__caption">{caption}</figcaption>
    </figure>
  );
}
