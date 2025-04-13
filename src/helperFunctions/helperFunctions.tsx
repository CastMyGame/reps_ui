import axios from "axios";
import { baseUrl } from "../utils/jsonData";
import { CLERICAL, BEHAVIORAL } from "src/types/constants";
import {
  OfficeReferral,
  TeacherDto,
  TeacherReferral,
} from "src/types/responses";
import { DateTimeFormatOptions } from "luxon";
import { Student } from "src/types/school";

export const getCurrentWeekOfYear = (): number => {
  const today = new Date();

  // Set to Thursday of the current week (ensures proper ISO week calculation)
  today.setDate(today.getDate() + 4 - (today.getDay() || 7));

  // First day of the year
  const startOfYear = new Date(today.getFullYear(), 0, 1);

  // Calculate the difference in days, then divide by 7
  const weekNumber = Math.ceil(
    ((today.getTime() - startOfYear.getTime()) / 86400000 + 1) / 7
  );

  return weekNumber;
};

export const currentWeek = getCurrentWeekOfYear();

export const getWeekNumber = (date: Date): number => {
  const tempDate = new Date(date);
  tempDate.setDate(tempDate.getDate() + 4 - (tempDate.getDay() || 7));
  const startOfYear = new Date(tempDate.getFullYear(), 0, 1);
  return Math.ceil(
    ((tempDate.getTime() - startOfYear.getTime()) / 86400000 + 1) / 7
  );
};

//The Method filter the list of punihsment by logged in user
export const filterPunishmentsByLoggedInUser = (
  data: (TeacherDto | TeacherReferral)[]
) => {
  const loggedInEmail = sessionStorage.getItem("email");
  if (!loggedInEmail) {
    console.warn("No logged-in email found in sessionStorage.");
    return 0;
  }

  return data.filter((x) => x.teacherEmail === loggedInEmail).length;
};

//This Method Returns a subset of punishments from a list by the week of year the punishment was created
export const extractDataByWeek = (
  week: number,
  data: (TeacherDto | TeacherReferral | OfficeReferral)[]
): (TeacherDto | TeacherReferral | OfficeReferral)[] => {
  // Ensure data is valid
  if (!Array.isArray(data)) {
    console.error("Invalid data provided to extractDataByWeek:", data);
    return [];
  }

  // Filter data for the specified week
  const thisWeek = data.filter((punish) => {
    if (!punish?.timeCreated) {
      console.warn(
        "Skipping entry with missing or invalid timeCreated:",
        punish
      );
      return false;
    }

    const date = new Date(punish.timeCreated);
    if (isNaN(date.getTime())) {
      console.warn("Skipping entry with invalid date:", punish);
      return false;
    }

    const weekNumber = getWeekNumber(date); // Ensure getWeekNumber is implemented correctly
    return weekNumber === week; // Return true if the week matches
  });

  return thisWeek; // Return the filtered array
};

export const extractDataByWeekFirstDay = (
  week: number,
  data: (TeacherDto | TeacherReferral)[]
): (TeacherDto | TeacherReferral)[] => {
  const firstDayOfWeek = getFirstDayOfWeek(week);

  return data.filter((punish) => {
    const date = new Date(punish.timeCreated);
    return getWeekNumber(date) === week && isSameDay(date, firstDayOfWeek);
  });
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
  data: (TeacherDto | TeacherReferral | OfficeReferral)[]
): number => {
  if (!Array.isArray(data)) {
    console.error(
      "Invalid data provided to findDataByWeekAndByPunishment:",
      data
    );
    return 0;
  }

  const thisWeek = data
    .filter(
      (punish) =>
        "infractionName" in punish && punish.infractionName === behavioral
    )
    .filter((punish) => {
      const date = new Date(punish.timeCreated);
      const weekNumber = getWeekNumber(date);
      return weekNumber === week;
    });

  return thisWeek.length; // ✅ Return the count instead of the array
};

export const getIncidentByBehavior = (
  bx: string,
  fetchedData: (TeacherDto | TeacherReferral)[]
) => {
  const data = fetchedData.filter((item) => item.infractionName === bx);
  return data.length;
};

export const dateCreateFormat = (inputDate: Date | null) => {
  const date = new Date(inputDate ?? new Date());
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
  return <div className="cat-badge">Other</div>; // Ensure there's always a return value
};

export const getStudentList = async (): Promise<
  { studentName: string; studentEmail: string }[]
> => {
  try {
    const headers = {
      Authorization: `Bearer ${sessionStorage.getItem("Authorization")}`,
    };
    const url = `${baseUrl}/student/v1/allStudents`;

    const response = await axios.get<Student[]>(url, { headers });

    return response.data.map((student) => ({
      studentName: `${student.firstName} ${student.lastName} - ${student.studentEmail}`,
      studentEmail: student.studentEmail,
    }));
  } catch (error) {
    console.error("Error fetching student list:", error);
    return [];
  }
};

// Adjust the week number if current week extends prior to this year
export const yearAdj = (cw: number) => {
  return cw > 0 ? cw : 52 + cw;
};

export const GenerateBxByWeek = (
  bx: string,
  numOfWeeks: number,
  data: (TeacherDto | TeacherReferral | OfficeReferral)[]
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
  data: (TeacherDto | TeacherReferral)[]
) => {
  return Array.from({ length: rangeWeeks }, (_, i) => {
    const weekKey = yearAdj(currentWeek - i);
    const weekData = extractDataByWeek(weekKey, data).length;

    const startDate = getFirstDayOfWeek(weekKey);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    const label = `${startDate.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" })} - ${endDate.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" })}`;

    return { [label]: weekData };
  });
};

export function isTeacherReferral(
  referral: TeacherReferral | OfficeReferral
): referral is TeacherReferral {
  return (referral as TeacherReferral).punishmentId !== undefined;
}

export function isOfficeReferral(
  referral: TeacherReferral | OfficeReferral
): referral is OfficeReferral {
  return (referral as OfficeReferral).officeReferralId !== undefined;
}

export function getInfractionName(
  referral: TeacherReferral | OfficeReferral
): string {
  return isTeacherReferral(referral)
    ? referral.infractionName
    : referral.referralCode.codeName;
}

export function getInfractionDescription(ref: TeacherReferral | OfficeReferral): string {
  return isTeacherReferral(ref)
    ? ref.infractionDescription.join(", ")
    : ref.referralDescription;
}
