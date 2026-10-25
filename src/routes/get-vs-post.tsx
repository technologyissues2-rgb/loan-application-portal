import { createFileRoute } from "@tanstack/react-router";
import { escapeHtml, htmlDocument } from "@/lib/html-response";

type DemoSearch = {
  fullname?: string;
  email?: string;
  amount?: string | number;
};

export const Route = createFileRoute("/get-vs-post")({
  validateSearch: (search: Record<string, unknown>): DemoSearch => {
    // The router parses search values with JSON semantics, so a numeric
    // field arrives as a number ("amount=5000" -> 5000). Keep it a number
    // so the router re-serialises it cleanly in the URL.
    const pick = (key: string) => {
      const value = search[key];
      if (value === "" || value === undefined) return undefined;
      if (typeof value === "number") return value;
      if (typeof value === "string") return value;
      return undefined;
    };
    return { fullname: pick("fullname"), email: pick("email"), amount: pick("amount") };
  },
  server: {
    handlers: {
      POST: async ({ request }) => {
        const form = await request.formData();
        const fullname = String(form.get("fullname") ?? "").trim();
        const email = String(form.get("email") ?? "").trim();
        const amount = String(form.get("amount") ?? "").trim();

        if (!fullname || !email || !amount) {
          return htmlDocument(
            "Submission rejected",
            `<span class="badge">Rejected</span>
             <h1>All three fields are required</h1>
             <p class="lede">The server received an incomplete POST body.</p>
             <a class="back" href="/get-vs-post">Back to the demo</a>`,
            400,
          );
        }

        return htmlDocument(
          "POST submission received",
          `<span class="badge">Received ✓</span>
           <h1>Data arrived via POST</h1>
           <p class="lede">Look at the address bar: it still reads only <code>/get-vs-post</code>. The values below travelled inside the HTTP request body, invisible in the URL.</p>
           <table>
             <tr><th>Request method</th><td><code>POST</code></td></tr>
             <tr><th>Request URL</th><td><code>/get-vs-post</code> (no query string)</td></tr>
             <tr><th>Data location</th><td>Request body (<code>application/x-www-form-urlencoded</code>)</td></tr>
             <tr><th>Full name</th><td>${escapeHtml(fullname)}</td></tr>
             <tr><th>Email</th><td>${escapeHtml(email)}</td></tr>
             <tr><th>Amount</th><td>${escapeHtml(amount)}</td></tr>
           </table>
           <div class="note">The same values sent by GET would appear in the URL as <code>?fullname=${encodeURIComponent(fullname)}&email=${encodeURIComponent(email)}&amount=${encodeURIComponent(amount)}</code> — visible to anyone looking at the screen, the browser history, or the server logs.</div>
           <a class="back" href="/get-vs-post">Back to the demo</a>`,
        );
      },
    },
  },
  head: () => ({
    meta: [
      { title: "GET vs POST — Question 2" },
      {
        name: "description",
        content:
          "The same HTML form submitted with method GET and method POST, with the generated URLs compared and the security implications explained.",
      },
      { property: "og:title", content: "GET vs POST — Question 2" },
      {
        property: "og:description",
        content:
          "The same HTML form submitted with method GET and method POST, with the generated URLs compared and the security implications explained.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GetVsPostPage,
});

function GetVsPostPage() {
  const search = Route.useSearch();
  const submitted = search.fullname || search.email || search.amount;

  const queryString = new URLSearchParams(
    Object.entries({
      fullname: search.fullname ?? "",
      email: search.email ?? "",
      amount: search.amount === undefined ? "" : String(search.amount),
    }).filter(([, value]) => value !== ""),
  ).toString();

  return (
    <main className="min-h-screen">
      <header className="border-b bg-card">
        <div className="mx-auto max-w-3xl px-6 py-10">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Question 2
            </p>
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
              10 Marks
            </span>
          </div>
          <h1 className="mt-3 text-4xl">GET vs POST: One Form, Two Methods</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            The same three fields are submitted twice — first with{" "}
            <code className="rounded bg-secondary px-1.5 py-0.5 text-secondary-foreground">method="GET"</code>,
            then with{" "}
            <code className="rounded bg-secondary px-1.5 py-0.5 text-secondary-foreground">method="POST"</code>.
            Watch the browser address bar after each submission.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-10">
        {submitted ? (
          <div className="mb-10 rounded-xl border border-primary/30 bg-secondary/60 p-6">
            <h2 className="text-2xl">a) You just submitted with method="GET"</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Look at the address bar — the browser appended the form data to
              the URL as a <strong>query string</strong>:
            </p>
            <code className="mt-3 block overflow-x-auto rounded-md border bg-card px-4 py-3 font-mono text-sm text-primary">
              /get-vs-post{queryString ? `?${queryString}` : ""}
            </code>
            <p className="mt-3 text-sm text-muted-foreground">
              The server read the values straight out of the URL. Anyone who
              bookmarks, shares, or logs this URL captures the submitted data
              with it.
            </p>
          </div>
        ) : null}

        <div className="rounded-xl border bg-card p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl">a) Form submitted with the GET method</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Native HTML form — no JavaScript. After submitting, the page
            reloads with the data in the URL.
          </p>
          <form method="get" action="/get-vs-post" className="mt-6 grid gap-5 sm:grid-cols-3">
            <label className="block">
              <span className="block text-sm font-semibold">Full name</span>
              <input
                type="text"
                name="fullname"
                required
                placeholder="Jane Doe"
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="block text-sm font-semibold">Email</span>
              <input
                type="email"
                name="email"
                required
                placeholder="jane@example.com"
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="block text-sm font-semibold">Amount</span>
              <input
                type="number"
                name="amount"
                required
                min={1}
                placeholder="5000"
                className={inputClass}
              />
            </label>
            <div className="sm:col-span-3">
              <button
                type="submit"
                className="rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Submit with GET
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 rounded-xl border bg-card p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl">b) The same form, modified to use POST</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Only one attribute changes — <code>method="get"</code> becomes{" "}
            <code>method="post"</code>. The data now travels in the request
            body, and the confirmation page proves the URL stayed clean.
          </p>
          <form method="post" action="/get-vs-post" className="mt-6 grid gap-5 sm:grid-cols-3">
            <label className="block">
              <span className="block text-sm font-semibold">Full name</span>
              <input
                type="text"
                name="fullname"
                required
                placeholder="Jane Doe"
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="block text-sm font-semibold">Email</span>
              <input
                type="email"
                name="email"
                required
                placeholder="jane@example.com"
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="block text-sm font-semibold">Amount</span>
              <input
                type="number"
                name="amount"
                required
                min={1}
                placeholder="5000"
                className={inputClass}
              />
            </label>
            <div className="sm:col-span-3">
              <button
                type="submit"
                className="rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Submit with POST
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 rounded-xl border bg-card p-6 sm:p-8">
          <h2 className="text-2xl">Code examples</h2>
          <CodeBlock
            caption="a) GET — data appended to the URL as a query string"
            code={`<form method="get" action="/get-vs-post">
  <input type="text"  name="fullname" required>
  <input type="email" name="email"    required>
  <input type="number" name="amount"  required>
  <button type="submit">Submit with GET</button>
</form>`}
          />
          <CodeBlock
            caption="b) POST — only the method attribute changes; data goes in the request body"
            code={`<form method="post" action="/get-vs-post">
  <input type="text"  name="fullname" required>
  <input type="email" name="email"    required>
  <input type="number" name="amount"  required>
  <button type="submit">Submit with POST</button>
</form>`}
          />
        </div>

        <div className="mt-8 rounded-xl border bg-card p-6 sm:p-8">
          <h2 className="text-2xl">c) GET vs POST — URLs and security</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Both forms send identical data to the same URL, yet the requests
            look completely different on the wire:
          </p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-4 font-semibold">Aspect</th>
                  <th className="py-2 pr-4 font-semibold">GET</th>
                  <th className="py-2 font-semibold">POST</th>
                </tr>
              </thead>
              <tbody className="align-top">
                <ComparisonRow
                  aspect="Generated URL"
                  get="/get-vs-post?fullname=Jane+Doe&email=jane%40example.com&amount=5000 — data is part of the URL"
                  post="/get-vs-post — the URL is unchanged; data is not visible in it"
                />
                <ComparisonRow
                  aspect="Where data travels"
                  get="Appended to the URL as name=value pairs joined by & after a ?"
                  post="Inside the HTTP request body (urlencoded, or multipart for files)"
                />
                <ComparisonRow
                  aspect="Who can see it"
                  get="Anyone: address bar, browser history, bookmarks, server access logs, Referer headers"
                  post="Hidden from the URL, history and logs — visible only to the server (and to the network without HTTPS)"
                />
                <ComparisonRow
                  aspect="Size limits"
                  get="Limited (~2,000 characters in many browsers) because it must fit in a URL"
                  post="Practically unlimited — suitable for large text and file uploads"
                />
                <ComparisonRow
                  aspect="Caching & bookmarking"
                  get="Responses can be cached; the URL can be bookmarked, shared or reloaded"
                  post="Not cached or bookmarkable; reloading re-submits the data"
                />
                <ComparisonRow
                  aspect="Security implications"
                  get="Sensitive data (passwords, ID numbers, loan details) leaks into history, logs and shared links. Never use GET for confidential or state-changing operations."
                  post="Keeps data out of URLs and logs, and is the right choice for forms that create, change or delete data. It is not encryption — only HTTPS protects the data in transit."
                />
                <ComparisonRow
                  aspect="Typical use"
                  get="Searches, filters, retrieval of pages — safe, repeatable requests"
                  post="Loan applications, logins, payments, uploads — anything sensitive or that changes server data"
                />
              </tbody>
            </table>
          </div>
          <p className="mt-5 rounded-lg border border-accent/50 bg-accent/20 p-4 text-sm text-accent-foreground">
            <strong>Conclusion:</strong> GET puts the data on display; POST puts
            it in an envelope. For the microfinance loan form in Question 1,{" "}
            <strong>POST is the correct method</strong> — the applicant's
            national ID, phone number and documents must never end up in a
            bookmarkable URL, and files cannot be sent with GET at all.
          </p>
        </div>
      </section>
    </main>
  );
}

function ComparisonRow({ aspect, get, post }: { aspect: string; get: string; post: string }) {
  return (
    <tr className="border-b">
      <th className="py-3 pr-4 text-left font-semibold">{aspect}</th>
      <td className="py-3 pr-4 text-muted-foreground">{get}</td>
      <td className="py-3 text-muted-foreground">{post}</td>
    </tr>
  );
}

function CodeBlock({ caption, code }: { caption: string; code: string }) {
  return (
    <figure className="mt-4">
      <figcaption className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {caption}
      </figcaption>
      <pre className="mt-2 overflow-x-auto rounded-lg border bg-foreground p-4 text-sm leading-relaxed text-background">
        <code>{code}</code>
      </pre>
    </figure>
  );
}

const inputClass =
  "mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30";
