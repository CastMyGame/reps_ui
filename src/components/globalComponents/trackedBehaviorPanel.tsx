import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
};

type TrackedBehaviorStudentTotalsResponse = Record<
  string,
  Record<string, number>
>;

type TrackedBehaviorAdjustmentRequest = {
  studentEmail: string;
  behaviorCode: string;
  adjustmentValue: number;
};

type TrackedBehaviorRequest = {
  teacherEmail: string;
  school: string;
  classPeriod: string;
  adjustments: TrackedBehaviorAdjustmentRequest[];
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
  const school = data?.school?.schoolName ?? "";

  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [trackedBehaviorTypes, setTrackedBehaviorTypes] = useState<
    TrackedBehaviorType[]
  >([]);
  const [selectedClassPeriod, setSelectedClassPeriod] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<ClassRoster | null>(null);
  const [studentTotals, setStudentTotals] =
    useState<TrackedBehaviorStudentTotalsResponse>({});
  const [draftAdjustments, setDraftAdjustments] = useState<
    Record<string, Record<string, number>>
  >({});
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const teacherClasses: ClassRoster[] = useMemo(() => {
    return data?.teacher?.classes ?? [];
  }, [data]);

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${authToken}`,
    }),
    [authToken],
  );

  useEffect(() => {
    fetchAllStudents();
    fetchTrackedBehaviorTypes();
  }, []);

  useEffect(() => {
    if (!selectedClassPeriod) {
      setSelectedClass(null);
      setStudentTotals({});
      setDraftAdjustments({});
      return;
    }

    const foundClass =
      teacherClasses.find((cls) => cls.classPeriod === selectedClassPeriod) ??
      null;

    setSelectedClass(foundClass);
    setDraftAdjustments({});

    if (foundClass?.classRoster?.length) {
      fetchStudentTotals(foundClass.classRoster);
    } else {
      setStudentTotals({});
    }
  }, [selectedClassPeriod, teacherClasses]);

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

      // Placeholder fallback in case backend endpoint is not ready yet
      setTrackedBehaviorTypes([
        { code: "PHONE_OUT", displayName: "Phone Out" },
        {
          code: "TALKING_DURING_INSTRUCTION",
          displayName: "Talking During Instruction",
        },
        {
          code: "INTERRUPTED_CLASSROOM",
          displayName: "Interrupted Classroom",
        },
      ]);
    }
  };

  const fetchStudentTotals = async (studentEmails: string[]) => {
    try {
      const response = await axios.post(
        `${baseUrl}/tracked-behaviors/v1/students/totals`,
        {
          school,
          studentEmails,
        },
        { headers },
      );

      setStudentTotals(response.data || {});
    } catch (error) {
      console.error("Failed to fetch tracked behavior totals", error);
      setToast({
        open: true,
        message: "Failed to load current behavior totals",
        severity: "error",
      });
      setStudentTotals({});
    }
  };

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

  const getSavedTotal = (
    studentEmail: string,
    behaviorCode: string,
  ): number => {
    return studentTotals?.[studentEmail]?.[behaviorCode] ?? 0;
  };

  const getDraftTotal = (
    studentEmail: string,
    behaviorCode: string,
  ): number => {
    return draftAdjustments?.[studentEmail]?.[behaviorCode] ?? 0;
  };

  const getResultingTotal = (
    studentEmail: string,
    behaviorCode: string,
  ): number => {
    return (
      getSavedTotal(studentEmail, behaviorCode) +
      getDraftTotal(studentEmail, behaviorCode)
    );
  };

  const updateDraftValue = (
    studentEmail: string,
    behaviorCode: string,
    changeAmount: number,
  ) => {
    const savedTotal = getSavedTotal(studentEmail, behaviorCode);
    const currentDraft = getDraftTotal(studentEmail, behaviorCode);
    const nextDraft = currentDraft + changeAmount;
    const nextResultingTotal = savedTotal + nextDraft;

    if (nextResultingTotal < 0) {
      setToast({
        open: true,
        message: "This change would make the student's total go below 0.",
        severity: "warning",
      });
      return;
    }

    setDraftAdjustments((prev) => {
      const studentDrafts = prev[studentEmail] ?? {};
      const nextStudentDrafts = {
        ...studentDrafts,
        [behaviorCode]: nextDraft,
      };

      if (nextDraft === 0) {
        delete nextStudentDrafts[behaviorCode];
      }

      const nextState = {
        ...prev,
        [studentEmail]: nextStudentDrafts,
      };

      if (Object.keys(nextStudentDrafts).length === 0) {
        delete nextState[studentEmail];
      }

      return nextState;
    });
  };

  const resetDrafts = () => {
    setDraftAdjustments({});
  };

  const hasAnyDraftChanges = useMemo(() => {
    return Object.keys(draftAdjustments).length > 0;
  }, [draftAdjustments]);

  const buildSavePayload = (): TrackedBehaviorRequest | null => {
    if (!selectedClassPeriod) return null;

    const adjustments: TrackedBehaviorAdjustmentRequest[] = [];

    Object.entries(draftAdjustments).forEach(([studentEmail, behaviorMap]) => {
      Object.entries(behaviorMap).forEach(([behaviorCode, adjustmentValue]) => {
        if (adjustmentValue !== 0) {
          adjustments.push({
            studentEmail,
            behaviorCode,
            adjustmentValue,
          });
        }
      });
    });

    if (adjustments.length === 0) return null;

    return {
      teacherEmail,
      school,
      classPeriod: selectedClassPeriod,
      adjustments,
    };
  };

  const handleSave = async () => {
    const payload = buildSavePayload();

    if (!payload) {
      setToast({
        open: true,
        message: "There are no changes to save.",
        severity: "warning",
      });
      return;
    }

    try {
      setSaving(true);

      await axios.post(`${baseUrl}/tracked-behaviors/v1/save`, payload, {
        headers,
      });

      setToast({
        open: true,
        message: "Tracked behaviors saved successfully.",
        severity: "success",
      });

      if (selectedClass?.classRoster?.length) {
        await fetchStudentTotals(selectedClass.classRoster);
      }

      setDraftAdjustments({});
    } catch (error: any) {
      console.error("Failed to save tracked behaviors", error);

      const message =
        error?.response?.data?.message ||
        "Failed to save tracked behavior changes.";

      setToast({
        open: true,
        message,
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const getStudentDisplayName = (student: Student) =>
    `${student.lastName}, ${student.firstName}`;

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">Tracked Behaviors</Typography>
        <Typography variant="body1">Teacher: {teacherEmail}</Typography>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Select Class Roster
        </Typography>

        <Select
          fullWidth
          displayEmpty
          value={selectedClassPeriod}
          onChange={(e) => setSelectedClassPeriod(e.target.value)}
        >
          <MenuItem value="">
            <em>Select a class period</em>
          </MenuItem>

          {teacherClasses.map((cls) => (
            <MenuItem key={cls.classPeriod} value={cls.classPeriod}>
              {cls.className} - {cls.classPeriod}
            </MenuItem>
          ))}
        </Select>
      </Paper>

      {(loading || saving) && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && selectedClass && (
        <Paper sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Box>
              <Typography variant="h6">{selectedClass.className}</Typography>
              <Typography variant="body2">
                Period: {selectedClass.classPeriod}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                onClick={resetDrafts}
                disabled={!hasAnyDraftChanges || saving}
              >
                Reset Draft
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={!hasAnyDraftChanges || saving}
              >
                Save Changes
              </Button>
            </Box>
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ minWidth: 220, fontWeight: 700 }}>
                    Student
                  </TableCell>

                  {trackedBehaviorTypes.map((type) => (
                    <TableCell
                      key={type.code}
                      align="center"
                      sx={{ minWidth: 220, fontWeight: 700 }}
                    >
                      {type.displayName}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {studentsInSelectedClass.map((student) => (
                  <TableRow key={student.studentEmail} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {getStudentDisplayName(student)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {student.studentEmail}
                        </Typography>
                      </Box>
                    </TableCell>

                    {trackedBehaviorTypes.map((type) => {
                      const savedTotal = getSavedTotal(
                        student.studentEmail,
                        type.code,
                      );
                      const draftTotal = getDraftTotal(
                        student.studentEmail,
                        type.code,
                      );
                      const resultingTotal = getResultingTotal(
                        student.studentEmail,
                        type.code,
                      );

                      return (
                        <TableCell key={type.code} align="center">
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() =>
                                  updateDraftValue(
                                    student.studentEmail,
                                    type.code,
                                    -1,
                                  )
                                }
                              >
                                -
                              </Button>

                              <Button
                                variant="contained"
                                size="small"
                                onClick={() =>
                                  updateDraftValue(
                                    student.studentEmail,
                                    type.code,
                                    1,
                                  )
                                }
                              >
                                +
                              </Button>
                            </Box>

                            <Typography variant="body2">
                              Draft:{" "}
                              {draftTotal >= 0 ? `+${draftTotal}` : draftTotal}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Current total: {resultingTotal}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ opacity: 0.7 }}
                            >
                              Saved: {savedTotal}
                            </Typography>
                          </Box>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}

                {studentsInSelectedClass.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={trackedBehaviorTypes.length + 1}
                      align="center"
                    >
                      No students found for this class roster.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default TrackedBehaviorPanel;
