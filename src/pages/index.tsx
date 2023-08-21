import { useState } from "react";
import Home from "./home";
import BasePage from "~/components/BasePage";
import { api } from "~/utils/api";

export default function Index() {
  const [token, setToken] = useState("");
  const validateToken = api.amis.validateToken.useQuery({ token });

  if (validateToken.data === undefined || validateToken.data == false)
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
              setToken(e.target.value);
            }}
          />
        </form>
      </BasePage>
    );

  return <Home />;
}
