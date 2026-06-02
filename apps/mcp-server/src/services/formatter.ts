export function textResult(value: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: typeof value === "string" ? value : JSON.stringify(value, null, 2)
      }
    ]
  };
}

export function resourceResult(uri: string, value: unknown, mimeType = "application/json") {
  return {
    contents: [
      {
        uri,
        mimeType,
        text: typeof value === "string" ? value : JSON.stringify(value, null, 2)
      }
    ]
  };
}

export function promptText(text: string) {
  return {
    messages: [
      {
        role: "user" as const,
        content: {
          type: "text" as const,
          text
        }
      }
    ]
  };
}
