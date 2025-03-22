import React from "react";
import { PieChart, pieArcLabelClasses } from "@mui/x-charts/PieChart";
import { Student } from "src/types/school";
import { TeacherReferral } from "src/types/responses";
import { StudentIncident } from "src/types/menus";

interface TeacherProfilePieProps {
  writeUps: TeacherReferral[];
  listOfStudents: Student[];
}

export const TeacherProfileIncidentByStudentPieChart: React.FC<
  TeacherProfilePieProps
> = ({ writeUps, listOfStudents }) => {
  // const filterData = data.filter()
  const uniqueStudents: Record<string, number> = {};
  const totalIncidents = writeUps.length;

  // Get Unique Students Info
  writeUps.forEach((item) => {
    const studentEmail = item.studentEmail;
    uniqueStudents[studentEmail] = (uniqueStudents[studentEmail] || 0) + 1;
  });

  const studentsWithIncidentsList = Object.entries(uniqueStudents).map(
    ([studentEmail, incidents]) => {
      const studentMap = new Map(
        listOfStudents.map((student) => [student.studentEmail, student])
      );
      const studentRecord = studentMap.get(studentEmail);

      return {
        studentEmail,
        firstName: studentRecord?.firstName ?? "Unknown",
        lastName: studentRecord?.lastName ?? "Unknown",
        incidents,
        percent: ((incidents / totalIncidents) * 100).toFixed(2),
      };
    }
  );

  const meetsTres = studentsWithIncidentsList
    .filter((ind) => parseFloat(ind.percent) > 5.0)
    .sort((a, b) => b.incidents - a.incidents);
  const otherNotMeetingTreshold = studentsWithIncidentsList
    .filter((ind) => parseFloat(ind.percent) <= 5.0)
    .sort((a, b) => b.incidents - a.incidents);

  const modifiedList: StudentIncident[] = [
    ...meetsTres,
    {
      studentEmail: "other_students", // Provide a string identifier
      firstName: "Other",
      lastName: "Students",
      incidents: Number(
        otherNotMeetingTreshold.reduce(
          (acc, student) => acc + student.incidents,
          0
        )
      ), // Ensure incidents is a number
      percent: otherNotMeetingTreshold
        .reduce((acc, student) => acc + parseFloat(student.percent), 0)
        .toFixed(2),
    },
  ];

  // Custom styles for the scrollable container
  const scrollableContainerStyle = {
    maxHeight: "200px",
    overflowY: "auto",
    paddingRight: "10px", // Adjust as needed to make room for the scrollbar
  };

  const generateLegendColor = (index: number): string => {
    const colors = [
      "#02B2AF",
      "#2E96FF",
      "#B800D8",
      "#60009B",
      "#2731C8",
      "#03008D",
    ];
    return colors[index % colors.length];
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center", // Center horizontally
        alignItems: "center", // Center vertically
        height: "100%", // Ensure the container takes up the full height
        width: "100%", // Ensure the container takes up the full width
      }}
    >
      <PieChart
        series={[
          {
            data: modifiedList.map((student, index) => ({
              id: index,
              value: parseFloat(student.percent),
              label: ` ${student.studentEmail}`,
            })),
            arcLabel: (item) => `(${item.value}%)`,
            arcLabelMinAngle: 45,
          },
        ]}
        width={300}
        height={300}
        sx={{
          [`& .${pieArcLabelClasses.root}`]: {
            fill: "white",
            fontWeight: "bold",
          },
          marginLeft: "15vh",
        }}
        slotProps={{ legend: { hidden: true } }}
      />
      {/* <div className="legend">
          {modifiedList.map((student, index) => (
            <div key={index} className="legend-item">
              <div
                className={`legend-color legend-color-${index + 1}`}
                style={{ backgroundColor: generateLegendColor(index) }}
              ></div>
              <span>{`${student.studentEmail} `}</span>
            </div>
          ))}
        </div> */}
    </div>
  );
};
