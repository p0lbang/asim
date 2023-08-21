import Head from "next/head";
import Home from "./home";

export default function Index() {
  return (
    <>
      <Head>
        <title>SIMA</title>
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-6xl font-bold">SIMA</h1>
          <Home />
        </div>
      </main>
    </>
  );
}
