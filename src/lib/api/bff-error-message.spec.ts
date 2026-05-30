import { messageFromErrorBody, messageFromUpstreamText } from "./bff-error-message";

describe("bff-error-message", () => {
  it("reads string message", () => {
    expect(messageFromErrorBody({ message: "name is required" }, "x")).toBe("name is required");
  });

  it("joins validation array messages", () => {
    expect(messageFromErrorBody({ message: ["a", "b"] }, "x")).toBe("a b");
  });

  it("parses upstream JSON errors", () => {
    expect(messageFromUpstreamText(JSON.stringify({ message: "Forbidden" }), 403)).toBe("Forbidden");
  });
});
