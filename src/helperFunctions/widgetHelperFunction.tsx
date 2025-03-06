//Set Global Date Variables
const holidayList = [
  "2024-02-03",
  "2024-02-04",
  "2024-02-05",
  "2024-02-06",
  "2024-02-07",
]; // Example holiday on February 5, 2024

//This method uses the global holidaylist above
export function calculateSchoolDays(startDate: Date, endDate: Date): number {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // add 1, to include current day
  let totalDays = Math.floor((Number(end) - Number(start)) / (24 * 60 * 60 * 1000)) + 1;
  let schoolDays = totalDays;

  //going to iterate through date, add 1 for eache instance
  for (
    let current = new Date(start);
    current <= end;
    current.setDate(current.getDate() + 1)
  ) {
    const dayOfWeek = current.getDay();
    const formattedDate = current.toISOString().split("T")[0];

    // Exclude weekends and holidays
    if (dayOfWeek === 0 || dayOfWeek === 6 || holidayList.includes(formattedDate)) {
      schoolDays--;
    }
  }
  return schoolDays;
}
