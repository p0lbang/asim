import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const HEADERS = {
  Accept: "application/json, text/plain, */*",
  "Content-Type": "application/json",
};

const userHeaders = (token: string) => {
  return {
    ...HEADERS,
    Authorization: token,
  };
};

const BASE_DOMAIN = "https://api-amis.uplb.edu.ph";

const tokenValidate = new RegExp("^Bearer [0-9]{7}|[0-9a-zA-Z]{40}$");

export const amisRouter = createTRPCRouter({
  validateToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      let APIOUTPUT: {
        isvalid: boolean;
        id: string;
        first_name: string;
        last_name: string;
        term_id: string;
      } = {
        isvalid: false,
        id: "",
        first_name: "",
        last_name: "",
        term_id: "",
      };
      let isvalid = tokenValidate.test(input.token);

      if (isvalid) {
        const value = await fetch(`${BASE_DOMAIN}/api/auth/user`, {
          credentials: "include",
          headers: userHeaders(input.token),
          referrer: "https://amis.uplb.edu.ph/",
          method: "GET",
          mode: "cors",
        });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const output = await value.json();
        // console.log(output);
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (output.message === "Unauthenticated.") {
            isvalid = false;
            return APIOUTPUT;
          }

          const response_term = await fetch(
            `${BASE_DOMAIN}/api/scheduled-features/enlistment_finalization?role=student`,
            {
              credentials: "include",
              headers: userHeaders(input.token),
              referrer: "https://amis.uplb.edu.ph/",
              method: "GET",
              mode: "cors",
            }
          );

          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const term = await response_term.json();

          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          const term_id = term.activeTerm.term_id as string;

          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          APIOUTPUT = {
            ...APIOUTPUT,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            ...output.user,

            term_id: term_id,
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
      const value = await fetch(`${BASE_DOMAIN}/api/auth/user`, {
        credentials: "include",
        headers: userHeaders(input.token),
        referrer: "https://amis.uplb.edu.ph/",
        method: "GET",
        mode: "cors",
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const output = await value.json();
      // console.log(output);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return output;
    }),
  addBookmark: publicProcedure
    .input(z.object({ token: z.string(), addBookmark: z.string() }))
    .mutation(async ({ input }) => {
      const value = await fetch(`${BASE_DOMAIN}/api/students/enlistments`, {
        credentials: "include",
        headers: userHeaders(input.token),
        body: input.addBookmark,
        referrer: "https://amis.uplb.edu.ph/",
        method: "POST",
        mode: "cors",
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const output = await value.json() as {message?: string};
      console.log(output);
      const saisdown = "Enlistment of Classes is not allowed during this time.";
      if(output.message && saisdown.localeCompare(output.message) === 0){
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: output.message,
        });
      }
      // console.log(output);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return output;
    }),
  removeBookmark: publicProcedure
    .input(
      z.object({
        token: z.string(),
        removeBookmark: z.string(),
        studEnlistID: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const value = await fetch(
        `${BASE_DOMAIN}/api/students/enlistments/${input.studEnlistID}`,
        {
          headers: userHeaders(input.token),
          body: input.removeBookmark,
          referrer: "https://amis.uplb.edu.ph/",
          method: "PUT",
          mode: "cors",
        }
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const output = await value.json();
      // console.log(output);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return output;
    }),
  getSubjects: publicProcedure
    .input(z.object({ token: z.string(), userID: z.string(), term_id: z.string() }))
    .query(async ({ input }) => {
      const response = await fetch(
        `${BASE_DOMAIN}/api/students/enlistments?enlistment_user_id=${input.userID}&term_id=${input.term_id}&enlistedClasses=true`,
        {
          credentials: "include",
          headers: userHeaders(input.token),
          referrer: "https://amis.uplb.edu.ph/",
          method: "GET",
          mode: "cors",
        }
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const output = await response.json();

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const legitoutput = output.enlistments[0].student_enlistment_classes;
      // console.log(legitoutput);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return legitoutput as Array<unknown>;
      // return output;
    }),
  searchSubject: publicProcedure
    .input(
      z.object({
        token: z.string(),
        term_id: z.string(),
        course: z.string(),
        status: z.string(),
        items: z.number(),
        page: z.number(),
      })
    )
    .query(async ({ input }) => {
      const course = input.course.split(" ").join("+");
      const items = Math.max(1, input.items);
      const page = Math.max(1, input.page);
      const term_id = input.term_id;
      // https://api-amis.uplb.edu.ph/api/students/classes?page=1&items=20&status=Active&by_term_type=true&term_id=1251&course_code_like=cmsc&section_like=--&class_status=Open
      const response = await fetch(
        `${BASE_DOMAIN}/api/students/classes?page=${page}&items=${items}&status=Active&by_term_type=true&term_id=${term_id}&course_code_like=${course}&section_like=--&class_status=${input.status}`,
        {
          credentials: "include",
          headers: userHeaders(input.token),
          referrer: "https://amis.uplb.edu.ph/",
          method: "GET",
          mode: "cors",
        }
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const output = await response.json();

      // console.log("backend");
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const legitoutput = output.classes.data;
      // console.log(legitoutput);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return legitoutput as Array<unknown>;
      // return output;
    }),
});
