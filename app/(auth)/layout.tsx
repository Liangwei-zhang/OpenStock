import Link from "next/link";
import React from "react";
import Image from "next/image";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/better-auth/auth";

const Layout = async ({ children }: { children: React.ReactNode }) => {
    const session = await auth.api.getSession({ headers: await headers() });

    if (session?.user) redirect('/')

    return (
        <main className="auth-layout">
            <section className="auth-left-section scrollbar-hide-default">
                <Link href="/" className="auth-logo flex items-center gap-2">
                    <Image src="/assets/images/logo.png" alt="OpenStock" width={200} height={50} />
                </Link>

                <div className="pb-6 lg:pb-8 flex-1">
                    {children}
                </div>
            </section>
            <section className="auth-right-section">
                <div className="z-10 relative lg:mt-4 lg:mb-16 space-y-6 max-w-xl">
                    <p className="text-sm uppercase tracking-[0.2em] text-teal-400">OpenStock</p>
                    <h2 className="text-4xl font-semibold text-white leading-tight">
                        Follow the market without the noise.
                    </h2>
                    <p className="text-base text-gray-400 leading-7">
                        Search stocks, open a clean detail page, save what matters to your watchlist, and set price alerts you can act on.
                    </p>
                </div>
                <div className="flex-1 relative">
                    <Image
                        src="/assets/images/dashboard.png"
                        alt="OpenStock dashboard preview"
                        width={1440}
                        height={1150}
                        className="auth-dashboard-preview absolute top-0"
                    />
                </div>
            </section>
        </main>
    )
}

export default Layout
