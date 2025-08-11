import { prisma } from "./prisma";

export async function getExistingTables(): Promise<Set<string>> {
  try {
    const rows = (await prisma.$queryRawUnsafe<any[]>(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('BusinessProfile','Service','Testimonial','Quotation','QuotationItem','User','Account','Session','VerificationToken')"
    )) as Array<{ table_name: string }>;
    return new Set(rows.map((r) => r.table_name));
  } catch {
    return new Set();
  }
}


