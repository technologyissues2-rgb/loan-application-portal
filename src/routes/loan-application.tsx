import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { z } from "zod";
import { escapeHtml, htmlDocument } from "@/lib/html-response";

export const Route = createFileRoute("/loan-application")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const form = await request.formData();

        const documents = form
          .getAll("documents")
          .filter(
            (entry): entry is File =>
              !!entry &&
              typeof entry === "object" &&
              "size" in entry &&
              "name" in entry &&
              (entry as File).size > 0,
          );

        const parsed = loanSchema.safeParse({
          name: form.get("name") ?? "",
          nationalId: form.get("nationalId") ?? "",
          phone: form.get("phone") ?? "",
          email: form.get("email") ?? "",
          employmentStatus: form.get("employmentStatus") ?? "",
          loanAmount: form.get("loanAmount") ?? "",
        });

        if (!parsed.success) {
          const items = parsed.error.issues
            .map((issue) => `<li>${escapeHtml(issue.message)}</li>`)
            .join("");
          return htmlDocument(
            "Loan application — invalid data",
            `<span class="badge">Rejected</span>
             <h1>The server rejected this submission</h1>
             <p class="lede">The browser validated the fields, but the server re-checked them anyway — client validation can be bypassed.</p>
             <ul class="errors">${items}</ul>
             <a class="back" href="/loan-application">Back to the form</a>`,
            400,
          );
        }

        const allowedTypes = [".pdf", ".jpg", ".jpeg", ".png", ".docx"];
        const badFiles = documents.filter((file) => {
          const lower = file.name.toLowerCase();
          return !allowedTypes.some((ext) => lower.endsWith(ext)) || file.size > 5 * 1024 * 1024;
        });

        if (documents.length === 0 || badFiles.length > 0) {
          return htmlDocument(
            "Loan application — documents rejected",
            `<span class="badge">Rejected</span>
             <h1>Supporting documents were rejected</h1>
             <p class="lede">The server only accepts PDF, JPG, PNG or DOCX files up to 5&nbsp;MB each.</p>
             <a class="back" href="/loan-application">Back to the form</a>`,
            400,
          );
        }

        const fileList = documents
          .map(
            (file) =>
              `<tr><th>Supporting document</th><td>${escapeHtml(file.name)} <span style="color:#8a9">(${Math.round(file.size / 1024)} KB)</span></td></tr>`,
          )
          .join("");

        return htmlDocument(
          "Loan application received",
          `<span class="badge">Received ✓</span>
           <h1>Loan application submitted</h1>
           <p class="lede">The server received this data inside the <code>POST</code> request body (<code>multipart/form-data</code>). Note that the browser address bar still reads only <code>/loan-application</code>.</p>
           <table>
             <tr><th>Applicant name</th><td>${escapeHtml(parsed.data.name)}</td></tr>
             <tr><th>National ID number</th><td>${escapeHtml(parsed.data.nationalId)}</td></tr>
             <tr><th>Phone number</th><td>${escapeHtml(parsed.data.phone)}</td></tr>
             <tr><th>Email address</th><td>${escapeHtml(parsed.data.email)}</td></tr>
             <tr><th>Employment status</th><td>${escapeHtml(parsed.data.employmentStatus)}</td></tr>
             <tr><th>Loan amount</th><td>KES ${parsed.data.loanAmount.toLocaleString("en-KE")}</td></tr>
             ${fileList}
           </table>
           <div class="note">Because the form used <code>method="POST"</code>, the applicant's details travelled in the request body — they do not appear in the URL, browser history, or server access logs.</div>
           <a class="back" href="/get-vs-post">Continue to Question 2: GET vs POST</a>`,
        );
      },
    },
  },
  head: () => ({
    meta: [
      { title: "Loan Application Form — Question 1" },
      {
        name: "description",
        content:
          "Microfinance loan application form built with plain HTML and validation attributes: required, pattern, min, max, type=email and type=file.",
      },
      { property: "og:title", content: "Loan Application Form — Question 1" },
      {
        property: "og:description",
        content:
          "Microfinance loan application form built with plain HTML and validation attributes: required, pattern, min, max, type=email and type=file.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoanApplicationPage,
});

const loanSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Applicant name must be at least 2 characters.")
    .max(100, "Applicant name is too long.")
    .regex(/^[A-Za-z][A-Za-z' -]*$/, "Name may only contain letters, spaces, apostrophes and hyphens."),
  nationalId: z
    .string()
    .trim()
    .regex(/^[0-9]{7,10}$/, "National ID must be 7 to 10 digits."),
  phone: z
    .string()
    .trim()
    .regex(/^(\+254|0)[17][0-9]{8}$/, "Phone must be a valid Kenyan number, e.g. 0712345678."),
  email: z.string().trim().email("Enter a valid email address.").max(255),
  employmentStatus: z.enum(
    ["employed", "self-employed", "business-owner", "unemployed", "student"],
    { message: "Select an employment status." },
  ),
  loanAmount: z.coerce
    .number()
    .min(1000, "Minimum loan amount is KES 1,000.")
    .max(10_000_000, "Maximum loan amount is KES 10,000,000."),
});

function LoanApplicationPage() {
  return (
    <main className="min-h-screen">
      <header className="border-b bg-card">
        <div className="mx-auto max-w-3xl px-6 py-10">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Question 1
            </p>
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
              10 Marks
            </span>
          </div>
          <h1 className="mt-3 text-4xl">Microfinance Loan Application</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Every field below uses native HTML validation attributes — try
            submitting the form empty or with an invalid ID, phone number or
            amount, and the browser will block it before anything is sent.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-10">
        <form
          method="post"
          action="/loan-application"
          encType="multipart/form-data"
          className="rounded-xl border bg-card p-6 shadow-sm sm:p-8"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <Field
              label="Applicant Name"
              hint="Letters only, 2–100 characters"
            >
              <input
                type="text"
                name="name"
                required
                minLength={2}
                maxLength={100}
                pattern="[A-Za-z][A-Za-z' -]*"
                title="Name may only contain letters, spaces, apostrophes and hyphens"
                placeholder="e.g. Amina Wanjiru"
                className={inputClass}
              />
            </Field>

            <Field label="National ID Number" hint="7–10 digits">
              <input
                type="text"
                name="nationalId"
                required
                inputMode="numeric"
                pattern="[0-9]{7,10}"
                title="National ID must be 7 to 10 digits"
                placeholder="e.g. 34567890"
                className={inputClass}
              />
            </Field>

            <Field label="Phone Number" hint="07xx / 01xx or +2547xx format">
              <input
                type="tel"
                name="phone"
                required
                pattern="(\+254|0)[17][0-9]{8}"
                title="Use a Kenyan number, e.g. 0712345678 or +254712345678"
                placeholder="e.g. 0712345678"
                className={inputClass}
              />
            </Field>

            <Field label="Email Address" hint="Validated by type=email">
              <input
                type="email"
                name="email"
                required
                maxLength={255}
                placeholder="e.g. amina@example.com"
                className={inputClass}
              />
            </Field>

            <Field label="Employment Status" hint="Required selection">
              <select name="employmentStatus" required className={inputClass} defaultValue="">
                <option value="" disabled>
                  Select employment status…
                </option>
                <option value="employed">Employed</option>
                <option value="self-employed">Self-employed</option>
                <option value="business-owner">Business owner</option>
                <option value="unemployed">Unemployed</option>
                <option value="student">Student</option>
              </select>
            </Field>

            <Field label="Loan Amount (KES)" hint="Between 1,000 and 10,000,000">
              <input
                type="number"
                name="loanAmount"
                required
                min={1000}
                max={10_000_000}
                step={100}
                placeholder="e.g. 50000"
                className={inputClass}
              />
            </Field>

            <div className="sm:col-span-2">
              <Field
                label="Upload Supporting Documents"
                hint="PDF, JPG, PNG or DOCX, up to 5 MB each — required"
              >
                <input
                  type="file"
                  name="documents"
                  required
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.docx"
                  title="Attach at least one supporting document"
                  className="block w-full cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-secondary-foreground"
                />
              </Field>
            </div>
          </div>

          <button
            type="submit"
            className="mt-8 w-full rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto sm:px-8"
          >
            Submit loan application
          </button>
        </form>

        <div className="mt-8 rounded-xl border bg-muted/50 p-6">
          <h2 className="text-xl">Validation attributes applied</h2>
          <ul className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <li>
              <code className="rounded bg-secondary px-1.5 py-0.5 text-secondary-foreground">required</code> — on all seven fields; nothing is submitted empty
            </li>
            <li>
              <code className="rounded bg-secondary px-1.5 py-0.5 text-secondary-foreground">pattern</code> — name letters only; ID 7–10 digits; Kenyan phone format
            </li>
            <li>
              <code className="rounded bg-secondary px-1.5 py-0.5 text-secondary-foreground">type="email" / type="tel" / type="number"</code> — semantic inputs with built-in checks
            </li>
            <li>
              <code className="rounded bg-secondary px-1.5 py-0.5 text-secondary-foreground">min / max / step</code> — loan amount bounded to 1,000–10,000,000 in steps of 100
            </li>
            <li>
              <code className="rounded bg-secondary px-1.5 py-0.5 text-secondary-foreground">minLength / maxLength</code> — name and email length limits
            </li>
            <li>
              <code className="rounded bg-secondary px-1.5 py-0.5 text-secondary-foreground">accept</code> — file picker restricted to PDF, JPG, PNG, DOCX
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold">{label}</span>
      <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}
