import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Route as GetVsPostRoute } from "@/routes/get-vs-post";
import { Route as LoanRoute } from "@/routes/loan-application";

type PostHandler = (ctx: { request: Request }) => Promise<Response>;

// The generated handler types are a union (object or createHandlers form);
// our routes use the plain object form, so cast through unknown.
const serverHandler = (route: { options: { server?: { handlers?: unknown } } }): PostHandler =>
  (route.options.server?.handlers as Record<string, PostHandler>)["POST"]!;

const loanInput = (name: string) =>
  LoanRoute.options.component !== undefined
    ? document.querySelector(`form [name="${name}"]`)
    : null;

describe("Question 1 — loan application form", () => {
  it("submits via POST to the same URL with multipart encoding", () => {
    render(LoanRoute.options.component!());
    const form = document.querySelector("form");
    expect(form?.getAttribute("method")).toBe("post");
    expect(form?.getAttribute("action")).toBe("/loan-application");
    expect(form?.getAttribute("enctype")).toBe("multipart/form-data");
  });

  it("marks every captured field required", () => {
    render(LoanRoute.options.component!());
    for (const name of [
      "name",
      "nationalId",
      "phone",
      "email",
      "employmentStatus",
      "loanAmount",
      "documents",
    ]) {
      expect(loanInput(name)?.hasAttribute("required")).toBe(true);
    }
  });

  it("applies the validation attributes the brief asks for", () => {
    render(LoanRoute.options.component!());
    expect(loanInput("nationalId")?.getAttribute("pattern")).toBe("[0-9]{7,10}");
    expect(loanInput("phone")?.getAttribute("pattern")).toBe("(\\+254|0)[17][0-9]{8}");
    expect(loanInput("email")?.getAttribute("type")).toBe("email");
    expect(loanInput("loanAmount")?.getAttribute("min")).toBe("1000");
    expect(loanInput("loanAmount")?.getAttribute("max")).toBe("10000000");
    expect(loanInput("documents")?.getAttribute("accept")).toContain(".pdf");
  });
});

// A browser serialises file inputs as multipart bodies; jsdom's FormData
// stringifies File entries when passed to Request, so we build the raw
// multipart body ourselves — byte-for-byte what the browser would send.
function multipartBody(
  fields: Record<string, string>,
  files: Array<{ name: string; filename: string; type: string }>,
): string {
  const boundary = "----lovable-test-boundary";
  const parts = Object.entries(fields).flatMap(([key, value]) => [
    `--${boundary}`,
    `Content-Disposition: form-data; name="${key}"`,
    "",
    value,
  ]);
  const fileParts = files.flatMap((file) => [
    `--${boundary}`,
    `Content-Disposition: form-data; name="${file.name}"; filename="${file.filename}"`,
    `Content-Type: ${file.type}`,
    "",
    "supporting document contents",
  ]);
  return [...parts, ...fileParts, `--${boundary}--`, ""].join("\r\n");
}

function loanRequest(fields: Record<string, string>): Request {
  return new Request("http://localhost/loan-application", {
    method: "POST",
    headers: { "Content-Type": `multipart/form-data; boundary=----lovable-test-boundary` },
    body: multipartBody(fields, [
      { name: "documents", filename: "payslip.pdf", type: "application/pdf" },
    ]),
  });
}

describe("Question 2 — GET vs POST handlers", () => {
  it("POST handler echoes complete data and returns a clean URL confirmation", async () => {
    const form = new FormData();
    form.set("fullname", "Jane Doe");
    form.set("email", "jane@example.com");
    form.set("amount", "5000");
    const request = new Request("http://localhost/get-vs-post", {
      method: "POST",
      body: form,
    });
    const handler = GetVsPostRoute.options.server?.handlers?.POST;
    const response = await handler!({ request } as never);
    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain("Jane Doe");
    expect(html).toContain("/get-vs-post");
  });

  it("POST handler rejects incomplete data", async () => {
    const form = new FormData();
    form.set("fullname", "Jane Doe");
    const request = new Request("http://localhost/get-vs-post", {
      method: "POST",
      body: form,
    });
    const handler = GetVsPostRoute.options.server?.handlers?.POST;
    const response = await handler!({ request } as never);
    expect(response.status).toBe(400);
  });

  it("loan POST handler rejects an out-of-range loan amount", async () => {
    const request = loanRequest({
      name: "Amina Wanjiru",
      nationalId: "34567890",
      phone: "0712345678",
      email: "amina@example.com",
      employmentStatus: "employed",
      loanAmount: "50",
    });
    const handler = LoanRoute.options.server?.handlers?.POST;
    const response = await handler!({ request } as never);
    const html = await response.text();
    expect(response.status, html.slice(0, 800)).toBe(400);
    expect(html).toContain("KES 1,000");
  });

  it("loan POST handler accepts a valid application and reports the document", async () => {
    const request = loanRequest({
      name: "Amina Wanjiru",
      nationalId: "34567890",
      phone: "0712345678",
      email: "amina@example.com",
      employmentStatus: "employed",
      loanAmount: "50000",
    });
    const handler = LoanRoute.options.server?.handlers?.POST;
    const response = await handler!({ request } as never);
    const html = await response.text();
    expect(response.status, html.slice(0, 800)).toBe(200);
    expect(html).toContain("Amina Wanjiru");
    expect(html).toContain("payslip.pdf");
  });
});
