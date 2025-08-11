import { prisma } from "@/lib/prisma";

export async function POST() {
  const hasProfile = await prisma.businessProfile.findFirst();
  if (!hasProfile) {
    await prisma.businessProfile.create({
      data: {
        id: 1,
        businessName: "Perfect Ceiling",
        address: "Your address here",
        primaryPhone: "9999999999",
        secondaryPhone: "",
        ownerName: "Owner Name",
        managerName: "Manager Name",
        about: "We provide POP, gypsum, PVC and wooden false ceiling solutions.",
        openingTime: "09:00",
        closingTime: "18:00",
        status: "OPEN",
      },
    });
  }
  return Response.json({ ok: true });
}


