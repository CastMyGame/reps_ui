import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { TeacherReferral } from "src/types/responses";
import { Student } from "src/types/school";
import { baseUrl } from "../../../../utils/jsonData";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 20,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    textDecoration: "underline",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomColor: "#000",
    borderBottomWidth: 1,
    alignItems: "center",
  },
  columnHeader: {
    width: "33.33%",
    padding: 5,
    textAlign: "center",
    fontWeight: "bold",
  },
  evenRow: {
    flexDirection: "row",
    borderBottomColor: "#000",
    borderBottomWidth: 1,
    alignItems: "center",
    paddingTop: 5,
    paddingBottom: 5,
    backgroundColor: "#f2f2f2",
  },
  oddRow: {
    flexDirection: "row",
    borderBottomColor: "#000",
    borderBottomWidth: 1,
    alignItems: "center",
    paddingTop: 5,
    paddingBottom: 5,
    backgroundColor: "#ffffff",
  },
  cell: {
    width: "33.33%",
    padding: 5,
    textAlign: "center",
  },
});

// Define the function outside the component
const calculateDaysSince = (dateCreated: Date) => {
  const currentDate = new Date();
  const createdDate = new Date(dateCreated);

  // Set both dates to UTC
  currentDate.setUTCHours(0, 0, 0, 0);
  createdDate.setUTCHours(0, 0, 0, 0);

  const timeDifference = currentDate.getTime() - createdDate.getTime();
  const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
  return daysDifference;
};

const PDFReport = () => {
  const [data, setData] = useState<TeacherReferral[]>([]); // State for the first table data
  const [data2, setData2] = useState<TeacherReferral[]>([]); // State for the second table data
  const [listOfStudents, setListOfStudents] = useState<Student[]>([]);

  const filterISS = (data: TeacherReferral[]) => {
    return data.filter((punishment) => {
      const days = calculateDaysSince(punishment.timeCreated);
      return days > 3 && punishment.status === "OPEN"; // Filter out records that are NOT older than 3 days
    });
  };

  const filterDetention = (data: TeacherReferral[]) => {
    return data.filter((punishment) => {
      const days = calculateDaysSince(punishment.timeCreated);
      return days > 1 && days < 3 && punishment.status === "OPEN"; // Filter out records that are older than 1 day and less than 3 days
    });
  };
  useEffect(() => {
    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };

    const url = `${baseUrl}/punish/v1/punishments`;

    axios
      .get(url, { headers })
      .then(function (response) {
        const sortedData = response.data.sort(
          (a: TeacherReferral, b: TeacherReferral) => new Date(a.timeCreated).getTime() - new Date(b.timeCreated).getTime()
        );
        setData(filterISS(sortedData)); // Assuming the first table's data is from this endpoint
        setData2(filterDetention(sortedData));
      })
      .catch(function (error) {
        console.error(error);
      });

    // Similarly, if you have another endpoint for the second table, you can make another Axios call here.
    // Ensure you handle and set the data in the respective state variable (like setData2).
  }, []);

  useEffect(() => {
    const url = `${baseUrl}/student/v1/allStudents`; // Replace with your actual API endpoint

    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };
    axios
      .get(url, { headers }) // Pass the headers option with the JWT token
      .then(function (response) {
        setListOfStudents(response.data || []);
      })
      .catch(function (error) {
        console.error(error);
        setListOfStudents([]);
      });
  }, []);

  return (
    <Document>
      <Page style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.header}>ISS Report</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.columnHeader}>Name</Text>
            <Text style={styles.columnHeader}>Infraction</Text>
            <Text style={styles.columnHeader}>Past Due</Text>
          </View>
          {data.map((x, index) => { 
            const student = listOfStudents.find((s) => s.studentEmail === x.studentEmail);
            return (
            
            <View
              style={index % 2 === 0 ? styles.evenRow : styles.oddRow}
              key={index.valueOf()}
            >
              <View style={styles.cell}>
                <Text>{student ? `${student.firstName} ${student.lastName}` : "Unknown Student"}</Text>
              </View>
              <View style={styles.cell}>
                <Text>{x.infractionName}</Text>
              </View>
              <View style={styles.cell}>
                <Text>{calculateDaysSince(x.timeCreated)}</Text>
              </View>
            </View>
          )})}
          <View style={{ height: 30 }}></View>{" "}
          {/* This will create a space of 30 units between the two tables */}
          <View style={{ marginTop: 20 }}>
            {" "}
            {/* Add margin to the top of the second table */}
            <Text style={styles.header}>Detention Report</Text>
            <View style={styles.tableHeader}>
              <Text style={styles.columnHeader}>Name</Text>
              <Text style={styles.columnHeader}>Infraction</Text>
              <Text style={styles.columnHeader}>Past Due</Text>
            </View>
            {data2.map((x, index) => { 
            const student = listOfStudents.find((s) => s.studentEmail === x.studentEmail);
            return (
              <View
                style={index % 2 === 0 ? styles.evenRow : styles.oddRow}
                key={index.valueOf()}
              >
                <View style={styles.cell}>
                  <Text>{student ? `${student.firstName} ${student.lastName}` : "Unknown Student"}</Text>
                </View>
                <View style={styles.cell}>
                  <Text>{x.infractionName}</Text>
                </View>
                <View style={styles.cell}>
                  <Text>{calculateDaysSince(x.timeCreated)}</Text>
                </View>
              </View>
            )})}
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default PDFReport;
