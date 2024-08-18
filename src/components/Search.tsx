/* eslint-disable @typescript-eslint/ban-ts-comment*/
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { useState } from "react";
import { api } from "~/utils/api";

const Search: React.FC<{
  token: string | undefined;
  refetchSubj: () => void;
}> = ({ token, refetchSubj }) => {
  const [courseSearch, setCourseSearch] = useState("");
  const [items, setItems] = useState(5);

  const searchSubject = api.amis.searchSubject.useQuery(
    {
      course: courseSearch,
      items: items,
      page: 1,
      status: "All",
      token: token ?? "",
    },
    { enabled: false }
  );

  const addbk = api.amis.addBookmark.useMutation({
    onSuccess: () => {
      void refetchSubj();
    },
  });

  function displaysubj(subjects: { data: unknown[] | undefined }) {
    return subjects.data?.map((v, index) => {
      try {
        const value = v as {
          facility_id: null | string;
          date: string;
          id: number;
          parent_class_id: null | number;
          activity: null | string;
          start_time: null | string;
          end_time: null | string;
        };
        // console.log(value);
        let addbookmark: {
          classes: { class_id: number; linked: number | boolean }[];
          action: string;
        } = {
          classes: [{ class_id: value.id, linked: false }],
          action: "Bookmarked",
        };

        if (value.parent_class_id !== null) {
          addbookmark = {
            classes: [
              { class_id: value.id, linked: value.parent_class_id },
              { class_id: value.parent_class_id, linked: value.id },
            ],
            action: "Bookmarked",
          };
        }
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return (
          <div
            key={index}
            className="flex flex-col rounded-lg border-2 border-green-600 p-2"
          >
            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
            <div className="flex flex-row">
              <div className="flex-grow pr-2">
                <span className="font-bold">
                  {/* @ts-ignore */}
                  {value.course.course_code} {value.section}{" "}
                </span>
                {/* @ts-ignore */}
                {value.course.title}
              </div>
              <div
                className={`h-fit w-fit p-2 ${
                  // @ts-ignore
                  value.active_class_size >= value.max_class_size
                    ? "bg-red-500"
                    : "bg-blue-500"
                  }`}
              >
                {/* @ts-ignore */}
                {value.active_class_size}/{value.max_class_size}
              </div>
            </div>
            {value.activity ?
              <div className="">
                HK: {value.activity}
              </div> : ""
            }
            <div className="flex flex-row">
              <div className="pr-2">
                Faculty:
              </div>
              <div>

                {/* @ts-ignore */}
                {value.faculties && value.faculties.length > 0
                  ? /* @ts-ignore */
                  value.faculties.map((v, index) => {
                    /* @ts-ignore */
                    return <p>{v.faculty.user.first_name} {v.faculty.user.last_name}</p>
                  })
                  : "TBA"}
              </div>
            </div>
            {value.date ?
              <div className="">
                Date: {value.date}
              </div> : ""
            }
            {value.start_time ?
              <div className="">
                Time: {value.start_time} - {value.end_time}
              </div> : ""
            }
            {value.facility_id ?
              <div className="">Location: {value.facility_id}</div> : ""
            }
            <div className="text-end">
              <input
                className="cursor-pointer rounded-lg bg-blue-600 p-2"
                type="button"
                value="Add"
                onClick={() => {
                  if (addbk.isLoading) {
                    return;
                  }

                  addbk.mutate({
                    token: token ?? "",
                    addBookmark: JSON.stringify(addbookmark),
                  });

                  if (addbk.isSuccess) {
                    refetchSubj();
                  }
                }}
              />
            </div>
            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
            {/* <div key={index}>{stringify(value)}</div> */}
          </div>
        );
      } catch (err) {
        console.log(err);
      }
      return null;
    });
  }

  return (
    <>
      <h1 className="text-6xl font-bold">Search</h1>
      <form
        className="mb-2 flex flex-col gap-2 sm:flex-row"
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={async (e) => {
          e.preventDefault();
          // console.log("fetch");
          await searchSubject.refetch();
        }}
      >
        <input
          className="rounded-lg border-2 border-black pl-2"
          type="text"
          placeholder="Course"
          onChange={(e) => {
            setCourseSearch(e.target.value);
          }}
        />
        <input
          className="rounded-lg border-2 border-black pl-2"
          type="number"
          placeholder="Items"
          onChange={(e) => {
            setItems(Number(e.target.value));
          }}
        />
        <input
          className="rounded-lg bg-green-600 p-2"
          type="submit"
          value="Search"
        />
      </form>

      <div className="flex flex-row flex-wrap items-stretch justify-center gap-2">
        {searchSubject.isFetching ? (
          <div>Loading</div>
        ) : (
          displaysubj(searchSubject)
        )}
      </div>
    </>
  );
};

export default Search;
