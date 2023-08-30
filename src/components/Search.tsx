import { useState } from "react";
import { api } from "~/utils/api";

const Search: React.FC<{ token: string | undefined }> = ({ token }) => {
  const [courseSearch, setCourseSearch] = useState("hk 12");
  const searchSubject = api.amis.searchSubject.useQuery({
    course: courseSearch,
    items: 10,
    page: 1,
    status: "All",
    token: token ?? "",
  });

  if (!searchSubject.isLoading) console.log(searchSubject.data);

  function displaysubj(
    subjects: { data: unknown[] | undefined },
    status: string
  ) {
    return subjects.data?.map((value: unknown, index) => {
      // console.log(value);
      try {
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
            <div className="">
              Faculty: {/* @ts-ignore */}
              {value.faculties && value.faculties.length > 0
                ? /* @ts-ignore */
                  `${value.faculties[0].faculty.user.first_name} ${value.faculties[0].faculty.user.last_name}`
                : "TBA"}
            </div>
            {/* @ts-ignore */}
            <div className="">Location: {value.facility_id}</div>
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
    <div>
      <form
        className="mb-2 flex flex-col"
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={async (e) => {
          e.preventDefault();
          await searchSubject.refetch();
        }}
      >
        <input
          className="border-2 border-black"
          type="text"
          onChange={(e) => {
            setCourseSearch(e.target.value);
          }}
        />
      </form>

      <div className="flex flex-row flex-wrap gap-2">
        {!searchSubject.isLoading && displaysubj(searchSubject, "Submitted")}
      </div>
    </div>
  );
};

export default Search;
