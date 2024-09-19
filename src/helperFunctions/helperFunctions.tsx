import axios from "axios";
import { baseUrl } from "../utils/jsonData";
import { CLERICAL, BEHAVIORAL } from "src/types/constants";
import { TeacherDto, TeacherReferral } from "src/types/responses";
import { DateTimeFormatOptions } from "luxon";
import { Student } from "src/types/school";

export const getCurrentWeekOfYear = (): number => {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);

  // Get the time difference in milliseconds and convert to days
  const dayOfYear =
    Math.floor((today.getTime() - startOfYear.getTime()) / 86400000) + 1;

  // Calculate the week number
  const weekNumber = Math.ceil(dayOfYear / 7);

  return weekNumber;
};

export const currentWeek = getCurrentWeekOfYear();

export const getWeekNumber = (date: Date): number => {
  const oneJan = new Date(date.getFullYear(), 0, 1);
  const millisecondsInDay = 86400000; // 24 * 60 * 60 * 1000
  const dayOfYear =
    Math.floor((date.getTime() - oneJan.getTime()) / millisecondsInDay) + 1;
  const weekNumber = Math.ceil(dayOfYear / 7);

  return weekNumber;
};

//The Method filter the list of punihsment by logged in user
export const filterPunishementsByLoggedInUser = (data: TeacherReferral[]) => {
  const teachReferrals = data.filter(
    (x) => x.teacherEmail === sessionStorage.getItem("email")
  ).length;
  return teachReferrals;
};

//This Method Returns a subset of punishments from a list by the week of year the punishment was created
export const extractDataByWeek = (week: number, data: TeacherDto[]) => {
  const thisWeek = data.filter((punish) => {
    const date = new Date(punish.timeCreated);
    const weekNumber = getWeekNumber(date);

    return weekNumber === week; // Return true if date matches the week
  });

  return thisWeek; // Return the filtered array
};

export const extractDataByWeekFirstDay = (
  week: number,
  data: TeacherDto[],
  format = "MM/DD"
) => {
  const firstDayOfWeek = getFirstDayOfWeek(week); // Get the first day of the specified week
  const thisWeek = data.filter((punish) => {
    const date = new Date(punish.timeCreated);
    const weekNumber = getWeekNumber(date);

    return weekNumber === week && isSameDay(date, firstDayOfWeek); // Return true if date matches the week and is the first day of the week
  });

  return thisWeek; // Return the filtered array
};

// Helper function to get the first day of a week
export const getFirstDayOfWeek = (week: number) => {
  const year = new Date().getFullYear(); // Use the current year, you can adjust this if needed
  const januaryFirst = new Date(year, 0, 1); // January 1st of the year

  const firstDayOfWeek = new Date(januaryFirst);
  firstDayOfWeek.setDate(januaryFirst.getDate() + (week - 1) * 7); // Calculate the first day of the specified week

  return firstDayOfWeek;
};

// Helper function to check if two dates are the same day
const isSameDay = (date1: Date, date2: Date) => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

export const findDataByWeekAndByPunishment = (
  week: number,
  behavioral: string,
  data: TeacherDto[]
) => {
  // Filter data based on the behavioral infraction name
  const thisWeek = data
    .filter((punish) => punish.infractionName === behavioral)
    .filter((punish) => {
      const date = new Date(punish.timeCreated);
      const weekNumber = getWeekNumber(date); // Assuming getWeekNumber is defined elsewhere in your code

      return weekNumber === week; // Return true if date matches the week
    });

  return thisWeek.length; // Return the filtered array
};

export const getIncidentByBehavior = (
  bx: string,
  fetchedData: TeacherDto[]
) => {
  const data = fetchedData.filter((item) => item.infractionName === bx);
  return data.length;
};

export const dateCreateFormat = (inputDate: Date) => {
  const date = new Date(inputDate);
  const options = { year: "numeric", month: "2-digit", day: "2-digit" };
  return date.toLocaleDateString("en-US", options as DateTimeFormatOptions);
};

export const categoryBadgeGenerator = (infractionName: string) => {
  if (CLERICAL.includes(infractionName)) {
    return (
      <div style={{ backgroundColor: "gold" }} className="cat-badge">
        Clerical
      </div>
    );
  }

  if (BEHAVIORAL.includes(infractionName)) {
    return <div className="cat-badge">Behavioral</div>;
  }
};

export const getStudentList = () => {
  const headers = {
    Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
  };

  let studentList: Student[] = [];

  const url = `${baseUrl}/student/v1/allStudents`; // Replace with your actual API endpoint

  axios
    .get(url, { headers }) // Pass the headers option with the JWT token
    .then(function (response) {
      studentList.push(response.data);
    })
    .catch(function (error) {
      console.error(error);
    });

  return studentList.map((student) => ({
    studentName: `${student.firstName} ${student.lastName} - ${student.studentEmail}`, // Display student's full name as the label
    studentEmail: student.studentEmail, // Use a unique value for each option
  }));
};

// Adjust the week number if current week extends prior to this year
export const yearAdj = (cw: number) => {
  return cw > 0 ? cw : 52 + cw;
};

export const GenerateBxByWeek = (
  bx: string,
  numOfWeeks: number,
  data: TeacherDto[]
) => {
  const currentWeek = getCurrentWeekOfYear();
  const bxData = [];
  for (let i = 0; i < numOfWeeks; i++) {
    const weekNum = yearAdj(currentWeek - i);
    const dataForWeek = findDataByWeekAndByPunishment(weekNum, bx, data);
    bxData.push(dataForWeek);
  }
  return bxData;
};

export const GenerateChartData = (
  currentWeek: number,
  rangeWeeks: number,
  data: TeacherDto[]
) => {
  const genData = [];

  for (let i = 0; i < rangeWeeks; i++) {
    const weekKey = yearAdj(currentWeek - i);
    const weekData = extractDataByWeek(weekKey, data).length;

    const startDate = getFirstDayOfWeek(weekKey);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    const label = `${startDate.getMonth() + 1}/${startDate.getDate()} - ${endDate.getMonth() + 1}/${endDate.getDate()}`;

    genData.push({
      [label]: weekData,
    });
  }

  return genData;
};