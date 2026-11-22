import { Type } from "typebox";

export const objectOutput = Type.Record(Type.String(), Type.Unknown());
export const MAX_HTML_BYTES = 2 * 1024 * 1024;

export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

export function analysisResult<T extends JsonValue>(details: T, display: unknown = details) {
  const text = JSON.stringify(display, null, 2);
  const maxLength = 24_000;
  return {
    content: [{
      type: "text" as const,
      text: text.length > maxLength
        ? text.slice(0, maxLength) + "\n[Display truncated. Full data is available in structuredContent.]"
        : text,
    }],
    details,
    structuredContent: details,
  };
}
