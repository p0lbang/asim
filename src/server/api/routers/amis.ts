import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const HEADERS = {
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.5",
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-site",
};

const userHeaders = (token: string) => {
  return {
    ...HEADERS,
    "Authorization": token,
  }
}

const tokenValidate = new RegExp('^Bearer [0-9]{7}\|[0-9a-zA-Z]{40}$');

export const amisRouter = createTRPCRouter({
  validateToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      let APIOUTPUT: { isvalid: boolean, id: string, first_name: string, last_name: string } = {
        isvalid: false,
        id: "",
        first_name: "",
        last_name: ""
      }
      let isvalid = tokenValidate.test(input.token);

      if (isvalid) {
        const value = await fetch("https://api.amis.uplb.edu.ph/api/auth/user", {
          "credentials": "include",
          "headers": userHeaders(input.token),
          "referrer": "https://amis.uplb.edu.ph/",
          "method": "GET",
          "mode": "cors"
        });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const output = await value.json();
        console.log(output);
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (output.message === 'Unauthenticated.') {
            isvalid = false;
            return APIOUTPUT;
          }

          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          APIOUTPUT = {
            ...APIOUTPUT,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            ...output.user
          };

        } catch (error) {
          console.log(error);
        }
      }
      return APIOUTPUT;
    }),
  userInfo: publicProcedure
    .input(z.object({ token: z.string(), saisID: z.number() }))
    .query(async ({ input }) => {
      const value = await fetch("https://api.amis.uplb.edu.ph/api/auth/user", {
        "credentials": "include",
        "headers": userHeaders(input.token),
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
  getSubjects: publicProcedure.input(z.object({ token: z.string(), userID: z.string() })).query(async ({ input }) => {
    const response = await fetch(`https://api.amis.uplb.edu.ph/api/students/enlistments?enlistment_user_id=${input.userID}&enlistedClasses=true`, {
      "credentials": "include",
      "headers": userHeaders(input.token),
      "referrer": "https://amis.uplb.edu.ph/",
      "method": "GET",
      "mode": "cors"
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const output = await response.json();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const legitoutput = output.enlistments[0].student_enlistment_classes;
    // console.log(legitoutput);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return legitoutput as Array<unknown>;
    // return output;
  }),
});
