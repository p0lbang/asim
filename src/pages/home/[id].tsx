/* eslint-disable @typescript-eslint/ban-ts-comment*/
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { useState, useEffect } from "react";
import Home from ".";
import { useRouter } from 'next/router';

const HomeID: React.FC = () => {
  const router = useRouter();
  const [token, setToken] = useState("");

  useEffect(() => {
    setToken(localStorage.getItem("token") ?? "");
  }, [router.query.id]);

  if(token === "" || router.query.id === "" || router.query.id === undefined ) return <div>Loading</div>;

  return <Home userid={router.query.id as string} usertoken={token}  />;
};

export default HomeID;