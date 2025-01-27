import type { NextPage } from "next";
import Head from "next/head";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { HomePage } from "@/pages/home";

const Home: NextPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Head>
        <title>Levera - Permissionless Margin Trading</title>
        <meta
          content="Trade, Earn, and Borrow with Levera"
          name="description"
        />
        <link href="/levera-temp-logo.png" rel="icon" />
      </Head>
      <Header />
      <HomePage />
      <Footer />
    </div>
  );
};

export default Home;