import { Geist, Geist_Mono } from "next/font/google";
import "./styles/globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { cookies } from "next/headers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "GPA Tracker",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  const userToken = cookies().get("user")?.value;
  return (
    <html lang="en">
      <head>
        <title>My Next.js Project</title>
      </head>

      <body class="">
        <Header userToken={userToken} /> {/* Include Header Component */}
        <main className="min-h-screen">{children}</main>
        <Footer /> {/* Include Footer Component */}
      </body>
    </html>
  );
}
