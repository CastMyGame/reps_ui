import React, { useEffect, useState } from "react";
import {
  StudentContactList,
  TeacherOverviewDto,
} from "src/types/responses";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { dateCreateFormat } from "src/helperFunctions/helperFunctions";
import { Student } from "src/types/school";

const RecentContacts: React.FC<Partial<TeacherOverviewDto>> = ({
  punishmentResponse = [],
  officeReferrals = [],
  students = [],
}) => {
  const [filteredData, setFilteredData] = useState<StudentContactList[]>([]);

  useEffect(() => {
    const safeStudents = Array.isArray(students) ? students : [];
  
    // Create a lookup map for students by email
    const studentMap = new Map<string, Student>();
    safeStudents.forEach((student) => {
      studentMap.set(student.studentEmail, student);
    });
  
    const allContacts = [...punishmentResponse, ...officeReferrals].filter(Boolean);
  
    const uniqueStudentEmails = new Set<string>();
    const recentContacts: StudentContactList[] = [];
  
    // Sort contacts by timeCreated (newest first)
    const sortedData = allContacts
      .slice()
      .sort((a, b) => {
        const dateA = new Date(a.timeCreated || 0);
        const dateB = new Date(b.timeCreated || 0);
        return dateB.getTime() - dateA.getTime();
      });
  
    sortedData.forEach((record) => {
      const studentEmail = record.studentEmail || "Unknown";
  
      // Get the student name from the lookup map
      const studentData = studentMap.get(studentEmail);
      const studentFirstName = "studentFirstName" in record ? record.studentFirstName : studentData?.firstName;
      const studentLastName = "studentLastName" in record ? record.studentLastName : studentData?.lastName;

      // Extract infraction description into a separate variable
  let infractionDescription;
  if ("infractionDescription" in record) {
    infractionDescription = Array.isArray(record.infractionDescription)
      ? record.infractionDescription.join(", ")
      : record.infractionDescription || "";
  } else {
    infractionDescription = record.referralDescription || "";
  }
  
      if (!uniqueStudentEmails.has(studentEmail)) {
        uniqueStudentEmails.add(studentEmail);
        recentContacts.push({
          studentEmail,
          studentName: `${studentFirstName ?? "Unknown"} ${studentLastName ?? ""}`.trim(),
          timeCreated: record.timeCreated ? dateCreateFormat(record.timeCreated) : "N/A",
          infractionName: "infractionName" in record 
        ? record.infractionName 
        : record.referralCode?.codeName || "",
          infractionDescription,
        });
      }
    });
  
    // Ensure all students appear in the list
    const allStudentsData = safeStudents.map((student) => {
      const contact = recentContacts.find((contact) => contact.studentEmail === student.studentEmail);
  
      return (
        contact || {
          studentEmail: student.studentEmail || "Unknown",
          studentName: `${student.firstName || "Unknown"} ${student.lastName || ""}`.trim(),
          timeCreated: "N/A",
          infractionName: "",
          infractionDescription: "",
        }
      );
    });
  
    setFilteredData(allStudentsData);
  }, [punishmentResponse, students, officeReferrals]);

  // Column definitions for AgGrid
  const colDefs: ColDef[] = [
    {
      field: "studentName",
      headerName: "Name",
      flex: 1,
      resizable: true,
    },
    {
      field: "timeCreated",
      headerName: "Last Contacted",
      flex: 1,
      resizable: true,
    },
    {
      field: "infractionName",
      headerName: "Contact Reason",
      flex: 1,
      resizable: true,
    },
  ];

  return (
    <div>
      <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
        Student Last Contacts
      </h3>
      <div
        className="ag-theme-quartz"
        style={{ height: "25vh", width: "100%" }}
      >
        <AgGridReact
          rowData={filteredData}
          columnDefs={colDefs as ColDef<StudentContactList>[]}
          domLayout="autoHeight"
        />
      </div>
    </div>
  );
};


export default RecentContacts;
