"use server";
import { getBusinessInfo } from "@/lib/data";

export async function BusinessCta() {
    const data = await getBusinessInfo();

    const phone = (data?.primaryPhone as string) || (data?.phone as string) || "";
    const digits = phone.replace(/[^0-9]/g, "");
    const waText = encodeURIComponent("Hello! I am interested in your services.");
    const waHref = digits ? `https://wa.me/${digits}?text=${waText}` : "#";
    const telHref = phone ? `tel:${phone}` : "#";
    const name = (data?.name as string) || "Perfect Ceiling";
    const address = (data?.address as string) || undefined;
    const email = (data?.email as string) || undefined;

    return (
        <div className="relative overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-amber-50/80 to-orange-100/60" />
            <div className="absolute inset-0">
                <div
                    className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-primary/30 to-amber-300/20 rounded-full blur-3xl animate-pulse"
                    style={{ animationDelay: "1s" }}
                />
                <div
                    className="absolute bottom-0 right-0 w-52 h-52 bg-gradient-to-tl from-orange-300/25 to-primary/20 rounded-full blur-3xl animate-pulse"
                    style={{ animationDelay: "2s" }}
                />
                <div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-r from-amber-200/30 to-orange-200/30 rounded-full blur-2xl animate-pulse"
                    style={{ animationDelay: "2s" }}
                />
            </div>

            <div className="relative p-8 sm:p-12 lg:p-16">
                <div className="grid gap-12 lg:gap-16 lg:grid-cols-5 items-center">
                    <div className="lg:col-span-3 text-center lg:text-left">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/15 text-primary text-sm font-bold mb-6 shadow-sm backdrop-blur-sm border border-primary/20">
                            <span className="w-2 h-2 bg-primary rounded-full mr-3 animate-pulse"></span>
                            Free Consultation Available
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                            Ready to Transform Your
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-600 to-primary mt-2 animate-pulse">
                                Dream Space?
                            </span>
                        </h2>
                        <p className="text-muted-foreground text-xl mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                            Get a free consultation and personalized quote for your ceiling project. Our expert craftsmen are ready to
                            bring your vision to life with precision and style.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                            <a
                                href={telHref}
                                className="group w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary transition-all duration-300 shadow-xl hover:shadow-2xl font-bold text-lg transform hover:-translate-y-1 hover:scale-105"
                            >
                                <svg
                                    className="w-6 h-6 mr-3 group-hover:animate-pulse"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                    />
                                </svg>
                                Call Now - Free Quote
                            </a>
                            <a
                                href={waHref}
                                target="_blank"
                                rel="noreferrer"
                                className="group w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-2xl border-2 border-green-500 bg-white/80 text-green-600 hover:bg-green-50 hover:border-green-600 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                                <svg
                                    className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                                </svg>
                                WhatsApp Chat
                            </a>
                        </div>
                    </div>
                    <div className="lg:col-span-2">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-orange-300/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                            <div className="relative bg-white/90 backdrop-blur-sm border border-white/50 rounded-3xl p-8 shadow-2xl group-hover:shadow-3xl transition-all duration-300 transform group-hover:-translate-y-2">
                                <div className="flex items-center mb-6">
                                    <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                                        <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="font-bold text-foreground text-2xl">Get In Touch</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="font-bold text-foreground text-xl">{name}</div>
                                    {address && (
                                        <div className="text-muted-foreground flex items-start group/item hover:text-foreground transition-colors">
                                            <svg
                                                className="w-5 h-5 mr-3 mt-1 flex-shrink-0 text-primary"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                            </svg>
                                            <span className="leading-relaxed">{address}</span>
                                        </div>
                                    )}
                                    {phone && (
                                        <div className="text-muted-foreground flex items-center group/item hover:text-foreground transition-colors">
                                            <svg
                                                className="w-5 h-5 mr-3 flex-shrink-0 text-primary"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                                />
                                            </svg>
                                            <a
                                                href={telHref}
                                                className="text-primary hover:text-primary/80 transition-colors font-semibold text-lg group-hover/item:underline"
                                            >
                                                {phone}
                                            </a>
                                        </div>
                                    )}
                                    {email && (
                                        <div className="text-muted-foreground flex items-center group/item hover:text-foreground transition-colors">
                                            <svg
                                                className="w-5 h-5 mr-3 flex-shrink-0 text-primary"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                />
                                            </svg>
                                            <a
                                                href={`mailto:${email}`}
                                                className="text-primary hover:text-primary/80 transition-colors font-semibold group-hover/item:underline"
                                            >
                                                {email}
                                            </a>
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
