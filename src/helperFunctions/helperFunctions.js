import axios from "axios";

export const getCurrentWeekOfYear = () => {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const dayOfYear = (today - startOfYear) / 86400000; // 86400000 ms in a day
  return Math.ceil(dayOfYear / 7);
};

export const getWeekNumber = (date) => {
  const oneJan = new Date(date.getFullYear(), 0, 1);
  const millisecondsInDay = 86400000; // 24 * 60 * 60 * 1000
  return Math.ceil(
    ((date - oneJan) / millisecondsInDay + oneJan.getDay() + 1) / 7
  );
};

export const fetchDataFromApi = async (url) => {
  const headers = {
    Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
  };
  try {
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error; // You can also handle the error in a different manner based on your requirement
  }
};

//This returns list of student id that the teacher has had interaction with
// argument
export const getUniqueStudentIdFromList = (data) => {
  const studentIdArray = [];
  const uniqueMap = new Map();

  data.forEach((item) => {
    const studentId = item.student.studentIdNumber;

    // If the studentIdNumber is not in the map, add it to studentIdArray and set its value in the map to true
    if (!uniqueMap.has(studentId)) {
      uniqueMap.set(studentId, true);
      studentIdArray.push(studentId); // Add the studentId to the array
    }
  });

  return studentIdArray; // Return the array containing unique student IDs
};

//The Method filter the list of punihsment by logged in user
export const filterPunishementsByLoggedInUser = (data) => {
  const teachReferrals = data.filter(
    (x) => x.teacherEmail === sessionStorage.getItem("email")
  ).length;
  return teachReferrals;
};

//This Method Returns a subset of punishments from a list by the week of year the punishment was created
export const extractDataByWeek = (week, data) => {
  const thisWeek = data.filter((punish) => {
    const date = new Date(punish.timeCreated);
    const weekNumber = getWeekNumber(date);

    return weekNumber === week; // Return true if date matches the week
  });

  return thisWeek; // Return the filtered array
};

export const extractDataByWeekFirstDay = (week, data, format = "MM/DD") => {
  const firstDayOfWeek = getFirstDayOfWeek(week); // Get the first day of the specified week
  const thisWeek = data.filter((punish) => {
    const date = new Date(punish.timeCreated);
    const weekNumber = getWeekNumber(date);

    return weekNumber === week && isSameDay(date, firstDayOfWeek); // Return true if date matches the week and is the first day of the week
  });

  return thisWeek; // Return the filtered array
};

// Helper function to get the first day of a week
export const getFirstDayOfWeek = (week) => {
  const year = new Date().getFullYear(); // Use the current year, you can adjust this if needed
  const januaryFirst = new Date(year, 0, 1); // January 1st of the year

  const firstDayOfWeek = new Date(januaryFirst);
  firstDayOfWeek.setDate(januaryFirst.getDate() + (week - 1) * 7); // Calculate the first day of the specified week

  return firstDayOfWeek;
};

// Helper function to check if two dates are the same day
const isSameDay = (date1, date2) => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

export const findDataByWeekAndByPunishment = (week, behavioral, data) => {
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

export const getIncidentByBehavior = (bx, fetchedData) => {
  const data = fetchedData.filter((item) => item.infractionName === bx);
  return data.length;
};

export const dateCreateFormat = (inputDate) => {
  const date = new Date(inputDate);
  const options = { year: "numeric", month: "2-digit", day: "2-digit" };
  return date.toLocaleDateString("en-US", options);
};
