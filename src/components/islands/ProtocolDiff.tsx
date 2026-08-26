import type { ImageMetadata } from "astro";
import { useEffect, useState } from "preact/hooks";

import {
  PROTOCOL_BASE,
  PROTOCOL_VARIANTS,
  getProtocolVariant,
  protocolChangeCount,
  type ProtocolVariantId,
} from "../../lib/lineage-model";

export interface ProtocolDiffProps {
  initialVariant: ProtocolVariantId;
  fallbackSrc: ImageMetadata | string;
  caption: string;
}

function imageSource(image: ImageMetadata | string): string {
  return typeof image === "string" ? image : image.src;
}

export default function ProtocolDiff({
  initialVariant,
  fallbackSrc,
  caption,
}: ProtocolDiffProps) {
  const [variantId, setVariantId] = useState<ProtocolVariantId>(initialVariant);
  const [ready, setReady] = useState(false);
  const variant = getProtocolVariant(variantId);
  const fallbackWidth = typeof fallbackSrc === "string" ? 1280 : fallbackSrc.width;
  const fallbackHeight = typeof fallbackSrc === "string" ? 900 : fallbackSrc.height;

  useEffect(() => setReady(true), []);

  return (
    <figure class="interactive-demo interactive-demo--protocol" data-demo="protocol-diff">
      <img
        class="interactive-demo__fallback"
        src={imageSource(fallbackSrc)}
        alt="Static Lineage protocol diff showing changes between main and the European Union branch."
        width={fallbackWidth}
        height={fallbackHeight}
        hidden={ready}
      />

      <div class="protocol-demo__application" hidden={!ready}>
        <header class="protocol-demo__header">
          <div>
            <span class="protocol-demo__eyebrow">fixed base</span>
            <strong>{PROTOCOL_BASE.label}</strong>
            <code>{PROTOCOL_BASE.commit}</code>
          </div>
          <span aria-hidden="true">→</span>
          <div>
            <span class="protocol-demo__eyebrow">comparison branch</span>
            <strong>{variantId}</strong>
            <code>{variant.commit}</code>
          </div>
        </header>

        <div class="interactive-demo__controls" role="group" aria-label="Protocol region">
          {PROTOCOL_VARIANTS.map((id) => {
            const candidate = getProtocolVariant(id);
            return (
              <button
                type="button"
                class={`interactive-demo__button${id === variantId ? " interactive-demo__button--active" : ""}`}
                aria-pressed={id === variantId}
                onClick={() => setVariantId(id)}
              >
                {id.toUpperCase()} · {candidate.label}
              </button>
            );
          })}
        </div>

        <dl class="protocol-demo__summary" aria-label={`${variant.label} diff summary`}>
          <div><dt>Added</dt><dd>{variant.added}</dd></div>
          <div><dt>Modified</dt><dd>{variant.modified}</dd></div>
          <div><dt>Removed</dt><dd>{variant.removed}</dd></div>
          <div><dt>Total changes</dt><dd>{protocolChangeCount(variant)}</dd></div>
        </dl>

        <ol class="protocol-demo__changes">
          {variant.changes.map((change) => (
            <li>
              <p><strong>{change.field}</strong><span>{change.section}</span></p>
              <div class="protocol-demo__field protocol-demo__field--before">
                <span>main</span>
                <del>{change.before}</del>
              </div>
              <div class="protocol-demo__field protocol-demo__field--after">
                <span>{variantId}</span>
                <ins>{change.after}</ins>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <p class="interactive-demo__status" role="status" aria-live="polite">
        Comparing main with {variant.label}: {variant.added} added, {variant.modified} modified, {variant.removed} removed.
      </p>
      <figcaption class="interactive-demo__caption">{caption}</figcaption>
    </figure>
  );
}
