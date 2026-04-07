import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Snackbar,
  Typography,
} from "@mui/material";
import { baseUrl } from "src/utils/jsonData";
import { AdminOverviewDto, TeacherOverviewDto } from "src/types/responses";

type ClassRoster = {
  className: string;
  classPeriod: string;
  classRoster: string[];
  punishmentsThisWeek?: number;
};

type Student = {
  studentEmail: string;
  firstName: string;
  lastName: string;
};

type TrackedBehaviorType = {
  code: string;
  displayName: string;
  consequences: string[];
};

interface TrackedBehaviorPanelProps {
  setPanelName: (panel: string) => void;
  data: TeacherOverviewDto | AdminOverviewDto;
}

const TrackedBehaviorPanel: React.FC<TrackedBehaviorPanelProps> = ({
  setPanelName,
  data,
}) => {
  const teacherEmail = sessionStorage.getItem("email") ?? "";
  const authToken = sessionStorage.getItem("Authorization") ?? "";

  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [trackedBehaviorTypes, setTrackedBehaviorTypes] = useState<
    TrackedBehaviorType[]
  >([]);
  const [selectedClassPeriod, setSelectedClassPeriod] = useState<string>("");
  const [selectedStudentEmails, setSelectedStudentEmails] = useState<string[]>(
    [],
  );
  const [selectedBehaviorCode, setSelectedBehaviorCode] = useState<string>("");
  const [selectedConsequenceCode, setSelectedConsequenceCode] =
    useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning";
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  const [studentsConfirmed, setStudentsConfirmed] = useState<boolean>(false);

  const fontSizes = {
    pageTitle: { fontSize: "2rem", fontWeight: 700 },
    headerText: { fontSize: "1.1rem" },
    stepTitle: { fontSize: "1.4rem", fontWeight: 700 },
    sectionTitle: { fontSize: "1.5rem", fontWeight: 700 },
    primaryText: { fontSize: "1.15rem" },
    secondaryText: { fontSize: "1rem" },
    smallText: { fontSize: "0.95rem" },
    buttonTitle: { fontSize: "1.1rem", fontWeight: 700 },
  };

  const teacherClasses: ClassRoster[] = useMemo(() => {
    return data?.teacher?.classes ?? [];
  }, [data]);

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${authToken}`,
    }),
    [authToken],
  );

  const selectedClass: ClassRoster | null = useMemo(() => {
    return (
      teacherClasses.find((cls) => cls.classPeriod === selectedClassPeriod) ??
      null
    );
  }, [teacherClasses, selectedClassPeriod]);

  const studentsInSelectedClass: Student[] = useMemo(() => {
    if (!selectedClass?.classRoster?.length) return [];

    const rosterEmails = selectedClass.classRoster
      .filter(Boolean)
      .map((email) => email.trim().toLowerCase());

    const rosterSet = new Set(rosterEmails);

    return allStudents
      .filter((student) =>
        rosterSet.has((student.studentEmail ?? "").trim().toLowerCase()),
      )
      .sort((a, b) =>
        `${a.lastName} ${a.firstName}`.localeCompare(
          `${b.lastName} ${b.firstName}`,
        ),
      );
  }, [allStudents, selectedClass]);

  const selectedBehavior: TrackedBehaviorType | null = useMemo(() => {
    return (
      trackedBehaviorTypes.find((type) => type.code === selectedBehaviorCode) ??
      null
    );
  }, [trackedBehaviorTypes, selectedBehaviorCode]);

  const selectedBehaviorConsequences = useMemo(() => {
    return selectedBehavior?.consequences ?? [];
  }, [selectedBehavior]);

  const formatConsequenceLabel = (value: string) =>
    value
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  useEffect(() => {
    fetchAllStudents();
    fetchTrackedBehaviorTypes();
  }, []);

  useEffect(() => {
    setSelectedStudentEmails([]);
    setSelectedBehaviorCode("");
    setSelectedConsequenceCode("");
    setStudentsConfirmed(false);
  }, [selectedClassPeriod]);

  useEffect(() => {
    setSelectedConsequenceCode("");
  }, [selectedBehaviorCode]);

  const fetchAllStudents = async () => {
    try {
      setLoading(true);

      const rosterEmails = Array.from(
        new Set(
          (data?.teacher?.classes ?? []).flatMap(
            (cls) => cls.classRoster ?? [],
          ),
        ),
      );

      if (rosterEmails.length === 0) {
        setAllStudents([]);
        return;
      }

      const response = await axios.post(
        `${baseUrl}/student/v1/getByEmailList`,
        rosterEmails,
        { headers },
      );

      setAllStudents(response.data || []);
    } catch (error) {
      console.error("Failed to fetch students", error);
      setToast({
        open: true,
        message: "Failed to load students",
        severity: "error",
      });
      setAllStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrackedBehaviorTypes = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/tracked-behaviors/v1/types`,
        { headers },
      );

      setTrackedBehaviorTypes(response.data || []);
    } catch (error) {
      console.error("Failed to fetch tracked behavior types", error);

      setTrackedBehaviorTypes([
        {
          code: "PHONE_OUT",
          displayName: "Phone Out",
          consequences: ["WARNING", "PHONE_CONFISCATED", "PARENT_CONTACT"],
        },
        {
          code: "TALKING_DURING_INSTRUCTION",
          displayName: "Talking During Instruction",
          consequences: ["WARNING", "SEAT_CHANGE", "LUNCH_DETENTION"],
        },
        {
          code: "INTERRUPTED_CLASSROOM",
          displayName: "Interrupted Classroom",
          consequences: ["WARNING", "REFLECTION_FORM", "OFFICE_REFERRAL"],
        },
      ]);
    }
  };

  const getStudentDisplayName = (student: Student) =>
    `${student.lastName}, ${student.firstName}`;

  const toggleStudentSelection = (studentEmail: string) => {
    setSelectedStudentEmails((prev) => {
      if (prev.includes(studentEmail)) {
        return prev.filter((email) => email !== studentEmail);
      }

      return [...prev, studentEmail];
    });
  };

  const handleBack = () => {
    if (selectedConsequenceCode) {
      setSelectedConsequenceCode("");
      return;
    }

    if (selectedBehaviorCode) {
      setSelectedBehaviorCode("");
      return;
    }

    if (studentsConfirmed) {
      setStudentsConfirmed(false);
      return;
    }

    if (selectedStudentEmails.length > 0) {
      setSelectedStudentEmails([]);
      return;
    }

    if (selectedClassPeriod) {
      setSelectedClassPeriod("");
    }
  };

  const handleResetAll = () => {
    setSelectedClassPeriod("");
    setSelectedStudentEmails([]);
    setSelectedBehaviorCode("");
    setSelectedConsequenceCode("");
    setStudentsConfirmed(false);
  };

  const handleSubmit = async () => {
    if (!selectedClass) {
      setToast({
        open: true,
        message: "Please select a class.",
        severity: "warning",
      });
      return;
    }

    if (selectedStudentEmails.length === 0) {
      setToast({
        open: true,
        message: "Please select at least one student.",
        severity: "warning",
      });
      return;
    }

    if (!selectedBehavior) {
      setToast({
        open: true,
        message: "Please select a tracked behavior.",
        severity: "warning",
      });
      return;
    }

    if (!selectedConsequenceCode) {
      setToast({
        open: true,
        message: "Please select a consequence.",
        severity: "warning",
      });
      return;
    }

    const payload = selectedStudentEmails.map((studentEmail) => ({
      studentEmail,
      teacherEmail,
      school: data?.school?.schoolName ?? "",
      classPeriod: selectedClass.classPeriod,
      behaviorCode: selectedBehavior.code,
      behaviorName: selectedBehavior.displayName,
      consequenceCode: selectedConsequenceCode,
      consequenceName: formatConsequenceLabel(selectedConsequenceCode),
    }));

    try {
      setSubmitting(true);

      const response = await axios.post(
        `${baseUrl}/tracked-behaviors/v1/save`,
        payload,
        { headers },
      );

      console.log("Tracked behavior save response:", response.data);

      setToast({
        open: true,
        message: "Tracked behavior(s) saved successfully.",
        severity: "success",
      });

      handleResetAll();
    } catch (error) {
      console.error("Failed to submit tracked behavior flow", error);
      setToast({
        open: true,
        message: "Failed to save tracked behavior(s).",
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const currentStep = useMemo(() => {
    if (!selectedClassPeriod) return 1;
    if (!studentsConfirmed) return 2;
    if (!selectedBehaviorCode) return 3;
    if (!selectedConsequenceCode) return 4;
    return 4;
  }, [
    selectedClassPeriod,
    studentsConfirmed,
    selectedBehaviorCode,
    selectedConsequenceCode,
  ]);

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          sx={{ width: "100%", fontSize: "1rem" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography sx={fontSizes.pageTitle}>Tracked Behaviors</Typography>
        <Typography sx={fontSizes.headerText}>
          Teacher: {teacherEmail}
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography sx={{ ...fontSizes.stepTitle, mb: 1.5 }}>
          Step {currentStep} of 4
        </Typography>

        <Typography
          sx={{ ...fontSizes.secondaryText, color: "text.secondary" }}
        >
          1. Select class → 2. Select student(s) → 3. Select behavior → 4.
          Select consequence
        </Typography>

        {(selectedClass ||
          selectedStudentEmails.length > 0 ||
          selectedBehavior) && (
          <Box sx={{ mt: 2.5 }}>
            <Typography sx={{ ...fontSizes.primaryText, mb: 0.5 }}>
              <strong>Class:</strong>{" "}
              {selectedClass
                ? `${selectedClass.className} - ${selectedClass.classPeriod}`
                : "None"}
            </Typography>

            <Typography sx={{ ...fontSizes.primaryText, mb: 0.5 }}>
              <strong>Students selected:</strong> {selectedStudentEmails.length}
            </Typography>

            <Typography sx={{ ...fontSizes.primaryText, mb: 0.5 }}>
              <strong>Behavior:</strong>{" "}
              {selectedBehavior?.displayName ?? "None"}
            </Typography>

            <Typography sx={fontSizes.primaryText}>
              <strong>Consequence:</strong>{" "}
              {selectedConsequenceCode
                ? formatConsequenceLabel(selectedConsequenceCode)
                : "None"}
            </Typography>
          </Box>
        )}
      </Paper>

      {(loading || submitting) && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress size={36} />
        </Box>
      )}

      {!loading && !selectedClassPeriod && (
        <Paper sx={{ p: 3 }}>
          <Typography sx={{ ...fontSizes.sectionTitle, mb: 3 }}>
            Select Your Class
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2.5 }}>
            {teacherClasses.map((cls) => (
              <Button
                key={cls.classPeriod}
                variant="outlined"
                onClick={() => setSelectedClassPeriod(cls.classPeriod)}
                sx={{
                  minWidth: 260,
                  justifyContent: "flex-start",
                  textAlign: "left",
                  p: 2.5,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <Typography sx={fontSizes.buttonTitle}>
                    {cls.className}
                  </Typography>
                  <Typography sx={{ ...fontSizes.secondaryText, mt: 0.5 }}>
                    Period: {cls.classPeriod}
                  </Typography>
                  <Typography
                    sx={{ ...fontSizes.smallText, mt: 0.5 }}
                    color="text.secondary"
                  >
                    {cls.classRoster?.length ?? 0} students
                  </Typography>
                </Box>
              </Button>
            ))}
          </Box>
        </Paper>
      )}

      {!loading && selectedClassPeriod && !studentsConfirmed && (
        <Paper sx={{ p: 3 }}>
          <Typography sx={{ ...fontSizes.sectionTitle, mb: 1.5 }}>
            Select Students
          </Typography>

          <Typography
            sx={{ ...fontSizes.secondaryText, color: "text.secondary", mb: 3 }}
          >
            You can select multiple students.
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2.5 }}>
            {studentsInSelectedClass.map((student) => {
              const isSelected = selectedStudentEmails.includes(
                student.studentEmail,
              );

              return (
                <Button
                  key={student.studentEmail}
                  variant={isSelected ? "contained" : "outlined"}
                  onClick={() => toggleStudentSelection(student.studentEmail)}
                  sx={{
                    minWidth: 260,
                    justifyContent: "flex-start",
                    textAlign: "left",
                    p: 2.5,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                  >
                    <Typography sx={fontSizes.buttonTitle}>
                      {getStudentDisplayName(student)}
                    </Typography>
                    <Typography sx={{ ...fontSizes.smallText, mt: 0.5 }}>
                      {student.studentEmail}
                    </Typography>
                  </Box>
                </Button>
              );
            })}
          </Box>

          {studentsInSelectedClass.length === 0 && (
            <Typography
              sx={{
                ...fontSizes.secondaryText,
                color: "text.secondary",
                mt: 2,
              }}
            >
              No students found for this class roster.
            </Typography>
          )}

          <Box sx={{ display: "flex", gap: 1.5, mt: 4 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              sx={{ fontSize: "1rem", px: 2.5, py: 1.25 }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              disabled={selectedStudentEmails.length === 0}
              onClick={() => setStudentsConfirmed(true)}
              sx={{ fontSize: "1rem", px: 2.5, py: 1.25 }}
            >
              Next
            </Button>
          </Box>
        </Paper>
      )}

      {!loading &&
        selectedClassPeriod &&
        studentsConfirmed &&
        !selectedBehaviorCode && (
          <Paper sx={{ p: 3 }}>
            <Typography sx={{ ...fontSizes.sectionTitle, mb: 1.5 }}>
              Select Tracked Behavior
            </Typography>

            <Typography
              sx={{
                ...fontSizes.secondaryText,
                color: "text.secondary",
                mb: 3,
              }}
            >
              Choose the behavior that applies to the selected student(s).
            </Typography>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2.5 }}>
              {trackedBehaviorTypes.map((type) => (
                <Button
                  key={type.code}
                  variant="outlined"
                  onClick={() => setSelectedBehaviorCode(type.code)}
                  sx={{
                    minWidth: 260,
                    justifyContent: "flex-start",
                    textAlign: "left",
                    p: 2.5,
                  }}
                >
                  <Typography sx={fontSizes.buttonTitle}>
                    {type.displayName}
                  </Typography>
                </Button>
              ))}
            </Box>

            <Box sx={{ display: "flex", gap: 1.5, mt: 4 }}>
              <Button
                variant="outlined"
                onClick={handleBack}
                sx={{ fontSize: "1rem", px: 2.5, py: 1.25 }}
              >
                Back
              </Button>
            </Box>
          </Paper>
        )}

      {!loading &&
        selectedClassPeriod &&
        studentsConfirmed &&
        selectedBehaviorCode && (
          <Paper sx={{ p: 3 }}>
            <Typography sx={{ ...fontSizes.sectionTitle, mb: 1.5 }}>
              Select Consequence
            </Typography>

            <Typography
              sx={{
                ...fontSizes.secondaryText,
                color: "text.secondary",
                mb: 3,
              }}
            >
              Behavior selected:{" "}
              <strong>{selectedBehavior?.displayName}</strong>
            </Typography>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2.5 }}>
              {selectedBehaviorConsequences.map((consequence) => {
                const isSelected = selectedConsequenceCode === consequence;

                return (
                  <Button
                    key={consequence}
                    variant={isSelected ? "contained" : "outlined"}
                    onClick={() => setSelectedConsequenceCode(consequence)}
                    sx={{
                      minWidth: 260,
                      justifyContent: "flex-start",
                      textAlign: "left",
                      p: 2.5,
                    }}
                  >
                    <Typography sx={fontSizes.buttonTitle}>
                      {formatConsequenceLabel(consequence)}
                    </Typography>
                  </Button>
                );
              })}
            </Box>

            {selectedBehaviorConsequences.length === 0 && (
              <Typography
                sx={{
                  ...fontSizes.secondaryText,
                  color: "text.secondary",
                  mt: 2,
                }}
              >
                No consequences were returned for this tracked behavior yet.
              </Typography>
            )}

            <Box sx={{ display: "flex", gap: 1.5, mt: 4 }}>
              <Button
                variant="outlined"
                onClick={handleBack}
                sx={{ fontSize: "1rem", px: 2.5, py: 1.25 }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!selectedConsequenceCode || submitting}
                sx={{ fontSize: "1rem", px: 2.5, py: 1.25 }}
              >
                Submit
              </Button>
            </Box>
          </Paper>
        )}

      {!loading && (
        <Box sx={{ display: "flex", gap: 1.5, mt: 3 }}>
          <Button
            variant="text"
            color="inherit"
            onClick={handleResetAll}
            sx={{ fontSize: "1rem", px: 1.5, py: 1 }}
          >
            Reset All
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default TrackedBehaviorPanel;
