import { useEffect, useState } from "react";
import Home from "./home";
import BasePage from "~/components/BasePage";
import { api } from "~/utils/api";

export default function Index() {
  const [token, setToken] = useState("");
  const [id, setID] = useState("");
  const [term_id, setTermID] = useState("");
  const validateToken = api.amis.validateToken.useQuery({ token });

  useEffect(() => {
    setToken(localStorage.getItem("token") ?? "");
    setID(localStorage.getItem("id") ?? "");
    setTermID(String(localStorage.getItem("term_id")) ?? "");
  }, []);

  useEffect(() => {
    if (validateToken.data) {
      localStorage.setItem("id", validateToken.data.id);
      setID(validateToken.data.id);
      setTermID(String(validateToken.data.term_id));
      localStorage.setItem("first_name", validateToken.data.first_name);
      localStorage.setItem("last_name", validateToken.data.last_name);
      localStorage.setItem("term_id", validateToken.data.term_id);
    }
    // console.log("hatdog");
  }, [validateToken.data]);

  if (validateToken.isLoading)
    return (
      <BasePage>
        <h1 className="text-6xl font-bold">ASIM</h1>
        <h1 className="text-6xl font-bold">Loading...</h1>
      </BasePage>
    );

  if (token !== "" && id !== "") {
    return <Home usertoken={token} userid={id} term_id={String(term_id)} />;
  }

  return (
    <BasePage>
      <h1 className="text-6xl font-bold">ASIM</h1>
      <form
        className="flex flex-col"
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={async (e) => {
          e.preventDefault();
          await validateToken.refetch();
        }}
      >
        <input
          className="border-2 border-black"
          type="text"
          value={token}
          onChange={(e) => {
            setToken(decodeURI(e.target.value));
            localStorage.setItem("token", decodeURI(e.target.value));
          }}
        />
      </form>
    </BasePage>
  );
}
