import type { Metadata } from "next";
import { Figtree, Young_Serif } from "next/font/google";
import "./globals.css";

const heading = Young_Serif({ weight: "400", subsets: ["latin"], variable: "--font-young-serif" });
const body = Figtree({ subsets: ["latin"], variable: "--font-figtree" });

export const metadata: Metadata = {
  title: "Harbour Loaf — sourdough bakery, Whitstable",
  description: "Slow-fermented bread and pastries, baked every morning by the harbour.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // style-dial:start
  // Imported only in development so production builds contain no panel code at all.
  const DevTweakPanel = process.env.NODE_ENV === "development" ? (await import("./dev/DevTweakPanel")).default : null;
  // style-dial:end
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body>
        {children}
        {/* style-dial:start */}
        {DevTweakPanel && <DevTweakPanel />}
        {/* style-dial:end */}
      </body>
    </html>
  );
}
