import { api } from "~/utils/api";

export default function Home() {
  // const hello = api.amis.userInfo.useQuery({ saisID: 123 });
  const subjects = api.amis.getSubjects.useQuery({
    userID: "c986ecdc-3f8f-471c-ac9b-fa1046da9191",
  });

  function displaysubj(status: string) {
    return subjects.data?.map((value, index) => {
      // console.log(value.class);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return status.localeCompare(value.status) === 0 ? (
        <div
          key={index}
          className="flex flex-col rounded-lg border-2 border-green-600 p-2"
        >
          {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
          <div className="flex flex-row">
            <div className="flex-grow pr-2">
              <span className="font-bold">
                {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
                {value.class.course.course_code} {value.class.section}{" "}
              </span>
              {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
              {value.class.course.title}
            </div>
            <div
              className={`h-fit w-fit p-2 ${
                value.class.max_class_size === value.class.active_class_size
                  ? "bg-red-500"
                  : "bg-blue-500"
              }`}
            >
              {value.class.active_class_size}/{value.class.max_class_size}
            </div>
          </div>
          <div className="">
            Faculty:{" "}
            {value.class.faculties && value.class.faculties.length > 0
              ? `${value.class.faculties[0].faculty.user.first_name} ${value.class.faculties[0].faculty.user.last_name}`
              : "TBA"}
          </div>
          <div className="">Location: {value.class.facility_id}</div>
          {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
          {/* <div key={index}>{stringify(value.class)}</div> */}
        </div>
      ) : null;
    });
  }

  return (
    <div className="flex flex-row justify-center gap-2">
      <div className="flex w-[50%] flex-col gap-2">
        <div className="text-center">BOOKMARKED</div>
        {displaysubj("Bookmarked")}
      </div>
      <div className="flex w-[50%] flex-col gap-2">
        <div className="text-center">ENLISTED</div>
        {displaysubj("Submitted")}
      </div>
    </div>
  );
}
