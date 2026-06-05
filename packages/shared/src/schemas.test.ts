import { describe, it, expect } from "vitest";
import { z } from "zod/v4";
import { ExtractionResultSchema } from "./schemas";

/**
 * Guards the shape that lets the extractor hand this schema to the model as a TOOL.
 *
 * Regression (first live extraction, 2026-06-05): the schema was sent via *strict* structured
 * output, whose grammar caps optional parameters at 24. With every leaf optional by design, the
 * four document sub-objects total 48 optional params and the API rejected every call
 * ("Schemas contains too many optional parameters (48) ... limit: 24"). The fix moved extraction
 * to (non-strict) tool use, which has no such limit. These assertions lock in the invariant that
 * keeps the schema tool-shaped: docType is the only required field and the four document
 * sub-objects stay optional (the model fills only the one matching the classified docType).
 */
describe("ExtractionResultSchema → tool input schema", () => {
  const json = z.toJSONSchema(ExtractionResultSchema) as {
    type: string;
    required?: string[];
    properties: Record<string, unknown>;
  };

  it("is an object whose only required field is docType", () => {
    expect(json.type).toBe("object");
    expect(json.required).toEqual(["docType"]);
  });

  it("keeps all four document sub-objects optional", () => {
    for (const key of ["buletin", "talon", "permis", "policy"]) {
      expect(json.properties).toHaveProperty(key);
      expect(json.required ?? []).not.toContain(key);
    }
  });
});
