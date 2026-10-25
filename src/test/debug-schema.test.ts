import { describe, expect, it } from "vitest";
import { z } from "zod";

const loanSchema = z.object({
  name: z.string().trim().min(2).max(100).regex(/^[A-Za-z][A-Za-z' -]*$/),
  nationalId: z.string().trim().regex(/^[0-9]{7,10}$/),
  phone: z.string().trim().regex(/^(\+254|0)[17][0-9]{8}$/),
  email: z.string().trim().email().max(255),
  employmentStatus: z.enum(["employed", "self-employed", "business-owner", "unemployed", "student"]),
  loanAmount: z.coerce.number().min(1000).max(10_000_000),
});

describe("debug", () => {
  it("parses the valid payload", () => {
    const result = loanSchema.safeParse({
      name: "Amina Wanjiru",
      nationalId: "34567890",
      phone: "0712345678",
      email: "amina@example.com",
      employmentStatus: "employed",
      loanAmount: "50000",
    });
    process.stdout.write(JSON.stringify(result.success ? "OK" : result.error.issues, null, 2) + "\n");
    expect(true).toBe(true);
  });
});
