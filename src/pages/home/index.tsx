/* eslint-disable @typescript-eslint/ban-ts-comment*/
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { useState } from "react";
import BasePage from "~/components/BasePage";
import Search from "~/components/Search";
import { api } from "~/utils/api";

const Home: React.FC<{ usertoken?: string; userid?: string }> = ({
  usertoken,
  userid,
}) => {
  const subjects = api.amis.getSubjects.useQuery({
    token: usertoken ?? "",
    userID: userid ?? "",
  });

  const [bookmarkInfo, setbookmarkInfo] = useState("");
  const [studEnlistID, setstudEnlistID] = useState("");

  const removebk = api.amis.removeBookmark.useQuery(
    {
      token: usertoken ?? "",
      removeBookmark: bookmarkInfo,
      studEnlistID: studEnlistID,
    },
    { enabled: false }
  );

  const bkmrk = "Bookmarked";
  function displaysubj(status: string) {
    return subjects.data?.map((value: unknown, index) => {
      // console.log(value.class);
      try {
        if (status === "Bookmarked") {
          // @ts-ignore
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          if (status.localeCompare(value.status) !== 0) {
            return null;
          }
        } else {
          if (bkmrk.localeCompare(value.status) === 0) {
            return null;
          }
        }
        // console.log(value);
        const classParentPresent = value.class.parent != null;
        const removeBookmark = {
          course_id: value.class.course_id,
          linked: value.linked,
          class_details: {
            course_id: value.class.course_id,
            lecture_details: {
              class_id: classParentPresent
                ? value.class.parent.id
                : value.class.id,
              linked: classParentPresent ? value.class.id : value.linked,
            },
            child_details: {
              class_id: classParentPresent ? value.class.id : "None",
              linked: classParentPresent ? value.class.parent_class_id : false,
            },
          },
        };

        const removeaction = {
          classes: [removeBookmark],
          action: "Deleted",
        };

        const removeall = false;
        return (
          <div
            key={index}
            className="flex min-w-[300px] max-w-[500px] flex-col rounded-lg border-2 border-green-600 p-2"
          >
            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
            <div className="flex flex-row">
              <div className="flex-grow pr-2">
                <span className="font-bold">
                  {/* @ts-ignore */}
                  {value.class.course.course_code} {value.class.section}{" "}
                </span>
                {/* @ts-ignore */}
                {value.class.course.title}
              </div>
              <div
                className={`h-fit w-fit p-2 ${
                  // @ts-ignore
                  value.class.active_class_size >= value.class.max_class_size
                    ? "bg-red-500"
                    : "bg-blue-500"
                }`}
              >
                {/* @ts-ignore */}
                {value.class.active_class_size}/{value.class.max_class_size}
              </div>
            </div>
            <div className="">
              Faculty: {/* @ts-ignore */}
              {value.class.faculties && value.class.faculties.length > 0
                ? /* @ts-ignore */
                  `${value.class.faculties[0].faculty.user.first_name} ${value.class.faculties[0].faculty.user.last_name}`
                : "TBA"}
            </div>
            {/* @ts-ignore */}
            <div className="">Location: {value.class.facility_id}</div>

            {(bkmrk.localeCompare(value.status) === 0 || removeall) && (
              <div className="text-end">
                <input
                  className="rounded-lg bg-red-600 p-2"
                  type="button"
                  value="Remove"
                  onClick={() => {
                    setbookmarkInfo(JSON.stringify(removeaction));
                    setstudEnlistID(value.student_enlistment_id ?? "");
                    void removebk.refetch();

                    if (removebk.isSuccess) {
                      void subjects.refetch();
                    }
                  }}
                />
              </div>
            )}
            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
            {/* <div key={index}>{stringify(value.class)}</div> */}
          </div>
        );
      } catch (err) {
        console.log(err);
      }
      return null;
    });
  }

  if (subjects.isLoading)
    return (
      <BasePage>
        <h1 className="text-6xl font-bold">ASIM</h1>
        <h1 className="text-6xl font-bold">Loading...</h1>
      </BasePage>
    );

  return (
    <BasePage>
      <h1 className="text-6xl font-bold">ASIM</h1>
      {localStorage.getItem("last_name") && (
        <p className="text-lg">
          {localStorage.getItem("first_name")}{" "}
          {localStorage.getItem("last_name")}
        </p>
      )}

      <button className="hidden rounded-lg bg-blue-500 p-2 text-2xl">
        ENLIST ALL
      </button>

      <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:items-start">
        <div className="flex flex-col gap-2 sm:w-[50%]">
          <div className="text-center">BOOKMARKED</div>
          {displaysubj("Bookmarked")}
        </div>
        <div className="flex flex-col gap-2 sm:w-[50%]">
          <div className="text-center">ENLISTED</div>
          {displaysubj("Submitted")}
        </div>
      </div>

      <Search token={usertoken} />
    </BasePage>
  );
};

export default Home;
