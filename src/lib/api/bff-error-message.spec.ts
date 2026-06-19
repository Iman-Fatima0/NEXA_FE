import { messageFromErrorBody, messageFromUpstreamText } from "./bff-error-message";

describe("bff-error-message", () => {
  it("reads string message", () => {
    expect(messageFromErrorBody({ message: "name is required" }, "x")).toBe("name is required");
  });

  it("joins validation array messages", () => {
    expect(messageFromErrorBody({ message: ["a", "b"] }, "x")).toBe("a b");
  });

  it("sanitizes technical upstream errors for end users", () => {
    expect(messageFromUpstreamText(JSON.stringify({ message: "Forbidden" }), 403)).toBe(
      "You do not have access to this.",
    );
  });

  it("maps infra jargon to friendly copy", () => {
    expect(messageFromErrorBody({ message: "Check Redis is running" }, "fallback")).toBe(
      "This feature is temporarily unavailable. Please try again shortly.",
    );
  });
});
