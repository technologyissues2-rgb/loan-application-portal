import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CAT 1 Practicals — HTML Forms" },
      {
        name: "description",
        content:
          "Question 1: a microfinance loan application form with HTML validation. Question 2: GET vs POST form submissions compared by URL and security.",
      },
      { property: "og:title", content: "CAT 1 Practicals — HTML Forms" },
      {
        property: "og:description",
        content:
          "Question 1: a microfinance loan application form with HTML validation. Question 2: GET vs POST form submissions compared by URL and security.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const practicals = [
  {
    to: "/loan-application",
    question: "Question 1",
    marks: "10 Marks",
    title: "Microfinance Loan Application Form",
    summary:
      "An HTML form that captures applicant name, national ID, phone, email, employment status, loan amount and supporting documents — with HTML validation attributes on every field.",
    tags: ["required", "pattern", "min", "max", "type=email", "type=file"],
  },
  {
    to: "/get-vs-post",
    question: "Question 2",
    marks: "10 Marks",
    title: "GET vs POST — The Same Form, Two Methods",
    summary:
      "One form submitted twice: once with method GET, once with method POST. Watch the generated URLs, then read the analysis of where the data travels and what that means for security.",
    tags: ["method=GET", "method=POST", "query string", "request body"],
  },
];

function Index() {
  return (
    <main className="min-h-screen">
      <header className="border-b bg-card">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Web Design and Development · CAT 1
          </p>
          <h1 className="mt-3 text-4xl leading-tight sm:text-5xl">
            HTML Forms: Collecting Data the Right Way
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Two practical exercises, both answered as working pages you can
            submit data to. Every field validates in the browser, and every
            submission is received by a server handler that shows you exactly
            what arrived.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="grid gap-6 sm:grid-cols-2">
          {practicals.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group flex flex-col rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {item.question}
                </span>
                <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                  {item.marks}
                </span>
              </div>
              <h2 className="mt-4 text-2xl leading-snug group-hover:text-primary">
                {item.title}
              </h2>
              <p className="mt-3 flex-1 text-sm text-muted-foreground">
                {item.summary}
              </p>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <code
                    key={tag}
                    className="rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                  >
                    {tag}
                  </code>
                ))}
              </div>
              <span className="mt-5 text-sm font-semibold text-primary">
                Open practical →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t py-8">
        <p className="mx-auto max-w-4xl px-6 text-xs text-muted-foreground">
          Built with plain HTML forms and native browser validation — no
          JavaScript is used to submit or validate the forms on these pages.
        </p>
      </footer>
    </main>
  );
}
