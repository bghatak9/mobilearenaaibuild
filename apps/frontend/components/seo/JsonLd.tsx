type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
  /** Stable id when multiple JSON-LD blocks appear on one page. */
  id?: string;
};

/**
 * JSON-LD for crawlers. Uses application/ld+json (non-executable) so React 19
 * does not treat it as a blocked client script.
 */
export default function JsonLd({ data, id = "json-ld" }: JsonLdProps) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
