import Head from "next/head";
import { type ReactNode } from "react";

const BasePage: React.FC<{ children?: ReactNode }> = ({ children }) => {
  return (
    <>
      <Head>
        <title>ASIM</title>
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          {children}
        </div>
      </main>
    </>
  );
};

export default BasePage;