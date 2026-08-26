import type { ImageMetadata } from "astro";
import { useEffect, useId, useMemo, useRef, useState } from "preact/hooks";

import {
  createFieldDataset,
  sampleSignals,
  type FieldDataset,
  type SamplingScale,
} from "../../lib/field-index-model";

export interface PatternScaleProps {
  seed: number;
  scales: readonly [1, 2, 4, 8];
  fallbackSrc: ImageMetadata | string;
  caption: string;
}

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;

function imageSource(image: ImageMetadata | string): string {
  return typeof image === "string" ? image : image.src;
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

function drawContour(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  offset: number,
  amplitude: number,
) {
  context.beginPath();

  for (let step = 0; step <= 32; step += 1) {
    const x = (step / 32) * width;
    const y =
      height * offset +
      Math.sin(step * 0.54 + offset * 7) * height * amplitude +
      Math.cos(step * 0.17) * height * 0.015;
    if (step === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }

  context.stroke();
}

function drawPatternScale(
  canvas: HTMLCanvasElement,
  dataset: FieldDataset,
  scale: SamplingScale,
  phase: number,
) {
  const { context, width, height } = prepareCanvas(canvas);
  const marginX = width * 0.06;
  const marginY = height * 0.07;
  const sampledSignals = sampleSignals(dataset, scale);

  context.fillStyle = "#17312d";
  context.fillRect(0, 0, width, height);

  context.save();
  context.strokeStyle = "#afc7b8";
  context.globalAlpha = 0.14;
  context.lineWidth = 1;
  for (let index = 0; index < 8; index += 1) {
    drawContour(context, width, height, 0.12 + index * 0.105, 0.035);
  }
  context.restore();

  context.save();
  context.strokeStyle = "#8aa99a";
  context.globalAlpha = 0.16;
  context.lineWidth = 1;
  const divisions = scale * 4;
  context.beginPath();
  for (let column = 0; column <= divisions; column += 1) {
    const x = marginX + ((width - marginX * 2) * column) / divisions;
    context.moveTo(x, marginY);
    context.lineTo(x, height - marginY);
  }
  for (let row = 0; row <= Math.max(3, divisions / 2); row += 1) {
    const y =
      marginY +
      ((height - marginY * 2) * row) / Math.max(3, divisions / 2);
    context.moveTo(marginX, y);
    context.lineTo(width - marginX, y);
  }
  context.stroke();
  context.restore();

  for (const signal of sampledSignals) {
    const x = marginX + signal.x * (width - marginX * 2);
    const y = marginY + signal.y * (height - marginY * 2);
    const pulse = 0.5 + 0.5 * Math.sin(phase * 1.8 + signal.phase);
    const radius = Math.max(
      2,
      width * (0.0022 + signal.strength * 0.0018 + pulse * 0.0008),
    );
    const familyColors = ["#f6ce4a", "#ef7653", "#73b9aa"];

    context.save();
    context.globalAlpha = 0.62 + signal.strength * 0.3;
    context.fillStyle = familyColors[signal.family];
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();

    if (pulse > 0.84) {
      context.globalAlpha = (pulse - 0.84) * 2.3;
      context.strokeStyle = familyColors[signal.family];
      context.lineWidth = Math.max(1, width * 0.001);
      context.beginPath();
      context.arc(x, y, radius * 2.4, 0, Math.PI * 2);
      context.stroke();
    }
    context.restore();
  }

  context.save();
  const labelSize = Math.max(11, width * 0.012);
  context.font = `700 ${labelSize}px "JetBrains Mono", monospace`;
  context.fillStyle = "#e9efe9";
  context.textBaseline = "top";
  context.fillText(`${scale}× density`, marginX, marginY);
  context.globalAlpha = 0.66;
  context.font = `400 ${Math.max(9, width * 0.009)}px "JetBrains Mono", monospace`;
  context.fillText(
    `${sampledSignals.length} readings`,
    marginX,
    marginY + labelSize * 1.55,
  );
  context.restore();
}

export default function PatternScale({
  seed,
  scales,
  fallbackSrc,
  caption,
}: PatternScaleProps) {
  const initialScale = (scales.includes(2) ? 2 : scales[0]) as SamplingScale;
  const [scale, setScale] = useState<SamplingScale>(initialScale);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [canvasReady, setCanvasReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef(0);
  const previousTimeRef = useRef<number | null>(null);
  const canvasId = `pattern-scale-${useId().replace(/:/g, "")}`;
  const dataset = useMemo(() => createFieldDataset(seed), [seed]);

  useEffect(() => {
    const mediaQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mediaQuery) return;

    const updatePreference = () => setReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener?.("change", updatePreference);
    return () => mediaQuery.removeEventListener?.("change", updatePreference);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const IntersectionObserverConstructor = globalThis.IntersectionObserver;
    if (typeof IntersectionObserverConstructor === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserverConstructor(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.01 },
    );
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onVisibilityChange = () =>
      setPageVisible(document.visibilityState !== "hidden");
    onVisibilityChange();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isVisible || !pageVisible) return;

    let animationFrame = 0;
    let cancelled = false;

    const draw = (time?: number) => {
      if (cancelled) return;

      if (time !== undefined && previousTimeRef.current !== null) {
        const elapsed = Math.min(64, time - previousTimeRef.current);
        phaseRef.current += elapsed / 1_000;
      }
      if (time !== undefined) previousTimeRef.current = time;

      try {
        drawPatternScale(
          canvas,
          dataset,
          scale,
          reducedMotion ? 0 : phaseRef.current,
        );
        setCanvasReady(true);
        setHasError(false);
      } catch {
        setCanvasReady(false);
        setHasError(true);
        cancelled = true;
        return;
      }

      if (!paused && !reducedMotion) {
        animationFrame = window.requestAnimationFrame(draw);
      }
    };

    previousTimeRef.current = null;
    draw();

    return () => {
      cancelled = true;
      previousTimeRef.current = null;
      window.cancelAnimationFrame(animationFrame);
    };
  }, [dataset, isVisible, pageVisible, paused, reducedMotion, scale]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ResizeObserverConstructor = globalThis.ResizeObserver;
    if (
      !canvas ||
      !isVisible ||
      !pageVisible ||
      typeof ResizeObserverConstructor === "undefined"
    ) {
      return;
    }

    const resizeObserver = new ResizeObserverConstructor(() => {
      try {
        drawPatternScale(
          canvas,
          dataset,
          scale,
          reducedMotion ? 0 : phaseRef.current,
        );
      } catch {
        setCanvasReady(false);
        setHasError(true);
      }
    });
    resizeObserver.observe(canvas);
    return () => resizeObserver.disconnect();
  }, [dataset, isVisible, pageVisible, reducedMotion, scale]);

  const motionLabel = reducedMotion
    ? "Motion off"
    : paused
      ? "Resume motion"
      : "Pause motion";

  return (
    <figure class="interactive-demo interactive-demo--pattern-scale">
      <div
        class="interactive-demo__viewport"
        style={{ position: "relative", maxWidth: "100%" }}
      >
        <img
          class="interactive-demo__fallback"
          src={imageSource(fallbackSrc)}
          alt="Static preview of environmental readings arranged at several sampling densities."
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
          aria-label={`A Field Index sampling preview at ${scale} times density.`}
          style={{
            display: "block",
            width: "100%",
            height: "auto",
            maxWidth: "100%",
            opacity: canvasReady ? 1 : 0,
          }}
        />
      </div>

      <div class="interactive-demo__controls interactive-demo__controls--scale">
        <div role="group" aria-label="Sampling density" class="interactive-demo__scale-options">
          {scales.map((candidateScale) => {
            const isActive = scale === candidateScale;
            return (
              <button
                key={candidateScale}
                class={`interactive-demo__button${isActive ? " interactive-demo__button--active" : ""}`}
                type="button"
                aria-controls={canvasId}
                aria-pressed={isActive}
                onClick={() => setScale(candidateScale)}
                style={{ minWidth: 44, minHeight: 44 }}
              >
                {candidateScale}×
              </button>
            );
          })}
        </div>

        <button
          class={`interactive-demo__button interactive-demo__motion-button${paused ? " interactive-demo__button--active" : ""}`}
          type="button"
          aria-controls={canvasId}
          aria-pressed={paused}
          disabled={reducedMotion}
          onClick={() => setPaused((current) => !current)}
          style={{ minWidth: 44, minHeight: 44 }}
        >
          {motionLabel}
        </button>
      </div>

      <p class="interactive-demo__status" role="status" aria-live="polite">
        {hasError
          ? "Scale simulator unavailable; the static preview is shown."
          : `${scale}× sampling density. ${
              reducedMotion
                ? "A static state is shown for reduced motion."
                : paused
                  ? "Motion paused."
                  : isVisible && pageVisible
                    ? "Motion playing."
                    : "Motion paused while offscreen."
            }`}
      </p>
      <figcaption class="interactive-demo__caption">{caption}</figcaption>
    </figure>
  );
}
