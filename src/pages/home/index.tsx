/* eslint-disable @typescript-eslint/ban-ts-comment*/
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import toast from "react-hot-toast";
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

  const refetchSubjects = () => {
    void subjects.refetch();
  };

  const removebk = api.amis.removeBookmark.useMutation({
    onSuccess: () => {
      void refetchSubjects();
    },
  });

  const addbk = api.amis.addBookmark.useMutation({
    onSuccess: () => {
      toast.success("ENLISTED");
      void refetchSubjects();
    },
    onError: (err) => {
      toast.error(err.message || "Error!");
    }
  });

  const STATUS_BOOKMARKED = "Bookmarked";
  const STATUS_CANCELLED = "Cancelled";
  const STATUS_ENLISTED = "Enlisted";

  type testvalue = {
    status: string;
    linked: number | boolean;
    student_enlistment_id: number;
    class: {
      facility_id: null | string;
      date: string;
      faculties: object[];
      start_time: null | string;
      end_time: null | string;
      activity: null | string;
      parent_class_id: string;
      id: string;
      course_id: string;
      parent: {
        id: string;
      } | null;
    };
  };

  function displaysubj(status: string) {
    return subjects.data?.map((v, index) => {
      const value = v as testvalue;
      // console.log(value.class);
      try {
        if (status === "Bookmarked") {
          // @ts-ignore
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          if (status.localeCompare(value.status) !== 0) {
            return null;
          }
        } else {
          if (STATUS_BOOKMARKED.localeCompare(value.status) === 0) {
            return null;
          }
        }
        // console.log(value);
        const classParentPresent = value.class.parent != null;
        const bookmarkInfo = {
          course_id: value.class.course_id,
          linked: value.linked,
          class_details: {
            course_id: value.class.course_id,
            lecture_details: {
              class_id: classParentPresent
                ? value.class.parent?.id
                : value.class.id,
              linked: classParentPresent ? value.class.id : value.linked,
            },
            child_details: {
              class_id: classParentPresent ? value.class.id : "None",
              linked: classParentPresent ? value.class.parent_class_id : false,
            },
          },
        };

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
            {value.class.activity ?
              <div className="">
                HK: {value.class.activity}
              </div> : ""
            }
            <div className="flex flex-row">
              <div className="pr-2">
                Faculty:
              </div>
              <div>

                {value.class.faculties && value.class.faculties.length > 0
                  ? /* @ts-ignore */
                  value.class.faculties.map((v, _index) => {
                    /* @ts-ignore */
                    return <p key={v}>{v.faculty.user.first_name} {v.faculty.user.last_name}</p>
                  })
                  : "TBA"}
              </div>
            </div>
            {value.class.date ?
              <div className="">
                Date: {value.class.date}
              </div> : ""
            }
            {value.class.start_time ?
              <div className="">
                Time: {value.class.start_time} - {value.class.end_time}
              </div> : ""
            }
            {value.class.facility_id ?
              <div className="">Location: {value.class.facility_id}</div> : ""
            }
            {STATUS_BOOKMARKED.localeCompare(value.status) === 0 && (
              <div className="space-x-2 text-end">
                <input
                  className="cursor-pointer rounded-lg bg-green-600 p-2"
                  type="button"
                  value="Enlist"
                  onClick={() => {
                    if (addbk.isLoading) {
                      return;
                    }

                    const ActionBookmarkEnlist = {
                      classes: [bookmarkInfo],
                      action: "Enlisted",
                    };

                    addbk.mutate({
                      token: usertoken ?? "",
                      addBookmark: JSON.stringify(ActionBookmarkEnlist),
                    });
                  }}
                />

                <input
                  className="cursor-pointer rounded-lg bg-red-600 p-2"
                  type="button"
                  value="Remove"
                  onClick={() => {
                    if (removebk.isLoading) {
                      return;
                    }

                    const ActionBookmarkRemove = {
                      classes: [bookmarkInfo],
                      action: "Deleted",
                    };

                    removebk.mutate({
                      token: usertoken ?? "",
                      removeBookmark: JSON.stringify(ActionBookmarkRemove),
                      studEnlistID:
                        value.student_enlistment_id.toString() ?? "",
                    });
                  }}
                />
              </div>
            )}
            {STATUS_ENLISTED.localeCompare(value.status) === 0 && (
              <div className="text-end">
                <input
                  className="cursor-pointer rounded-lg bg-red-600 p-2"
                  type="button"
                  value="Cancel"
                  onClick={() => {
                    if (removebk.isLoading) {
                      return;
                    }

                    const ActionEnlistCancel = {
                      classes: [bookmarkInfo],
                      action: "Cancelled",
                    };

                    removebk.mutate({
                      token: usertoken ?? "",
                      removeBookmark: JSON.stringify(ActionEnlistCancel),
                      studEnlistID:
                        value.student_enlistment_id.toString() ?? "",
                    });
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

      <Search
        token={usertoken}
        refetchSubj={() => {
          refetchSubjects();
        }}
      />
    </BasePage>
  );
};

export default Home;
