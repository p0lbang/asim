import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const AUTHORIZATION = "Bearer 1374667|QTJbkMIKhLfSy9Qn4ujWIPxDxxNqT3iQh9dczsqR";
const HEADERS = {
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.5",
  // "Authorization": AUTHORIZATION,
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-site",
};

const tokenValidate = new RegExp('^Bearer [0-9]{7}\|[0-9a-zA-Z]{40}$');

export const amisRouter = createTRPCRouter({
  validateToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(({ input }) => {
      const isvalid = tokenValidate.test(input.token)
      return isvalid;
    }),
  userInfo: publicProcedure
    .input(z.object({ token: z.string(), saisID: z.number() }))
    .query(async ({ input }) => {
      const userHeaders = {
        ...HEADERS,
        "Authorization": input.token,
      }

      const value = await fetch("https://api.amis.uplb.edu.ph/api/auth/user", {
        "credentials": "include",
        "headers": userHeaders,
        "referrer": "https://amis.uplb.edu.ph/",
        "method": "GET",
        "mode": "cors"
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const output = await value.json();
      // console.log(output);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return output;
    }),
  getSubjects: publicProcedure.input(z.object({ userID: z.string() })).query(async ({ input }) => {
    const response = await fetch(`https://api.amis.uplb.edu.ph/api/students/enlistments?enlistment_user_id=${input.userID}&enlistedClasses=true`, {
      "credentials": "include",
      "headers": HEADERS,
      "referrer": "https://amis.uplb.edu.ph/",
      "method": "GET",
      "mode": "cors"
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const output = await response.json();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const legitoutput = output.enlistments[0].student_enlistment_classes;
    console.log(legitoutput);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return legitoutput as Array<unknown>;
    // return output;
  }),
});
