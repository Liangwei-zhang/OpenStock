import Link from "next/link";
import Image from "next/image";

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white border-t border-gray-800">
            <div className="container mx-auto px-4 py-10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                    <div>
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <Image
                                src="/assets/images/logo.png"
                                alt="OpenStock"
                                width={150}
                                height={38}
                                className="brightness-0 invert"
                            />
                        </Link>
                        <p className="text-gray-400 max-w-md text-sm leading-6">
                            A lightweight stock tracking workspace focused on search, watchlists, alerts, and clean company detail pages.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-300 mb-3">Navigate</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link></li>
                            <li><Link href="/watchlist" className="text-gray-400 hover:text-white transition-colors">Watchlist</Link></li>
                            <li><Link href="/sign-in" className="text-gray-400 hover:text-white transition-colors">Sign In</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-6 text-sm text-gray-500">
                    © {new Date().getFullYear()} OpenStock
                </div>
            </div>
        </footer>
    );
};

export default Footer;
