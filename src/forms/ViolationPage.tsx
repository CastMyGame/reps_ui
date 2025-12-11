import React, { useEffect, useState } from "react";
import axios from "axios";
import EssayFactory from "./ViolationContents/EssayFactory";
import RetryQuestionFormat from "./ViolationContents/RetryQuestionFormat";
import { baseUrl } from "../utils/jsonData";
import OpenEndedFormat from "./ViolationContents/OpenEndedFormat";
import MultipleChoiceFormat from "./ViolationContents/MultipleChoiceFormat";
import { OfficeReferral, TeacherReferral } from "src/types/responses";
import {
  isTeacherReferral,
  getInfractionName,
  isOfficeReferral,
} from "src/helperComponents/helperComponents";
import {
  AssignmentTemplate,
  StudentAnswerPayload,
} from "src/types/assignments";

interface ViolationProps {
  assignment?: TeacherReferral | OfficeReferral;
}

const ViolationPage: React.FC<ViolationProps> = ({ assignment }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [studentAnswers, setStudentAnswers] = useState<StudentAnswerPayload[]>(
    []
  );
  const [mapIndex, setMapIndex] = useState(0);
  const [template, setTemplate] = useState<AssignmentTemplate | null>(null);
  const [showRetry, setShowRetry] = useState(false);

  useEffect(() => {
    if (assignment?.mapIndex !== undefined) {
      setMapIndex(assignment.mapIndex);
    }
  }, [assignment?.mapIndex]);

  useEffect(() => {
    if (!assignment) return;

    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };

    if (isTeacherReferral(assignment)) {
      const url = `${baseUrl}/assignments/v1/by-punishment/${assignment.punishmentId}`;

      axios
        .get(url, { headers })
        .then((response) => {
          const templateFromServer: AssignmentTemplate = response.data;
          setTemplate(templateFromServer);
        })
        .catch((error) => {
          console.error(
            "Failed to load assignment template for punishment:",
            error
          );
        });
    } else if (isOfficeReferral(assignment)) {
      console.warn("Office referral assignment resolution not wired yet.");
    }
  }, [assignment]);

  // Save "where the student is" in the punishment/officeReferral index
  useEffect(() => {
    if (!assignment) return;

    if (mapIndex !== 0) {
      const headers = {
        Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
      };
      let url = "";
      if (isTeacherReferral(assignment)) {
        url = `${baseUrl}/punish/v1/${assignment.punishmentId}/index/${mapIndex}`;
      } else if (isOfficeReferral(assignment)) {
        url = `${baseUrl}/officeReferral/v1/${assignment.officeReferralId}/index/${mapIndex}`;
      }

      axios
        .put(url, {}, { headers })
        .then(() => {})
        .catch((error) => {
          console.error(error);
        });
    }
  }, [mapIndex, assignment]);

  const loggedInUser = sessionStorage.getItem("email");

  // For READING_MC questions
  const saveAnswerAndProgress = () => {
    if (!loggedInUser) {
      window.alert("Email Not Registered in Reps DMS System");
      return;
    }

    const currentQuestion = template?.questions?.[mapIndex];
    if (!currentQuestion) return;

    if (selectedAnswer === "true") {
      window.alert("Congratulations! That is correct!");
      setSelectedAnswer(null);
      setShowRetry(false);
      // go to next question
      setMapIndex((prev) => prev + 1);
    } else {
      window.alert("Sorry, that is incorrect");

      // if retry is enabled, show retry screen instead of moving to next question
      if (currentQuestion.retry?.enabled) {
        setShowRetry(true);
      } else {
        setMapIndex((prev) => prev + 1);
      }
    }
  };

  // When student passes the retry text-copy check
  const textCorrectlyCopied = (payload: {
    question: string;
    answer: string;
  }) => {
    if (payload.answer === "true") {
      window.alert("Congratulations! That is correct!");
      setShowRetry(false);
      setMapIndex((prev) => prev + 1);
    }
  };

  // Used for both EXPLORATORY_OPEN and EXPLORATORY_RADIO
  const openEndedQuestionAnswered = (payload: {
    question: string;
    answer: string;
  }) => {
    const ans = payload.answer;

    if (ans === "agree") {
      // EXPLORATORY_RADIO - "good" path (keep old behavior)
      setMapIndex((prev) => prev + 1);
      setStudentAnswers((prev) => [
        ...prev,
        { question: payload.question, answer: ans },
      ]);
    } else if (ans === "disagree" || ans === "neutral") {
      // EXPLORATORY_RADIO - "needs more work" path (keep old behavior)
      setMapIndex((prev) => prev + 2);
      setStudentAnswers((prev) => [
        ...prev,
        { question: payload.question, answer: ans },
      ]);
    } else {
      // NEW: EXPLORATORY_OPEN free-text answer
      setMapIndex((prev) => prev + 1);
      setStudentAnswers((prev) => [
        ...prev,
        { question: payload.question, answer: ans },
      ]);
    }
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedAnswer(e.target.value);
  };

  const handleSubmit = () => {
    const formattedInfraction =
      assignment &&
      getInfractionName(assignment) === "Unauthorized Device Cell Phone"
        ? "Unauthorized Device/Cell Phone"
        : assignment && getInfractionName(assignment);

    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };

    const payload = {
      studentEmail: loggedInUser,
      infractionName: formattedInfraction,
      studentAnswer: studentAnswers,
    };

    if (assignment && isOfficeReferral(assignment)) {
      const url = `${baseUrl}/officeReferral/v1/submit/${assignment.officeReferralId}`;

      axios
        .post(url, payload, { headers })
        .then(() => {
          window.alert(
            `You Work Has been Recorded for ${payload.studentEmail}`
          );
          window.location.href = "/dashboard/student";
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      const url = `${baseUrl}/punish/v1/punishId/close`;

      axios
        .post(url, payload, { headers })
        .then(() => {
          window.alert(
            `You Work Has been Recorded for ${payload.studentEmail}`
          );
          window.location.href = "/dashboard/student";
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  return (
    <div>
      <div>
        <div className="form-container-violation" style={{ width: "100%" }}>
          <form>
            <h1 className="instructions">
              {assignment && getInfractionName(assignment)} Violation Level:{" "}
              {assignment?.infractionLevel}
            </h1>
            <hr />
            <div>
              {template?.questions?.map((q, index) => {
                if (mapIndex !== index) return null; // only show the current question

                // READING_MC: show either the normal MC view or the retry view
                if (q.type === "READING_MC") {
                  if (showRetry && q.retry?.enabled) {
                    return (
                      <RetryQuestionFormat
                        key={q.id + "-retry"}
                        essay={q}
                        sectionName="Retry Question"
                        saveAnswerAndProgress={textCorrectlyCopied}
                        handleRadioChange={handleRadioChange}
                      />
                    );
                  }

                  return (
                    <EssayFactory
                      key={q.id}
                      essay={q}
                      sectionName="READING_MC"
                      saveAnswerAndProgress={saveAnswerAndProgress}
                      handleRadioChange={handleRadioChange}
                    />
                  );
                }

                // EXPLORATORY_OPEN
                if (q.type === "EXPLORATORY_OPEN") {
                  return (
                    <OpenEndedFormat
                      key={q.id}
                      question={q}
                      saveAnswerAndProgress={openEndedQuestionAnswered}
                    />
                  );
                }

                // EXPLORATORY_RADIO
                if (q.type === "EXPLORATORY_RADIO") {
                  return (
                    <MultipleChoiceFormat
                      key={q.id}
                      data={q}
                      saveAnswerAndProgress={openEndedQuestionAnswered}
                    />
                  );
                }

                return null;
              })}

              {template?.questions &&
                mapIndex === template.questions.length && (
                  <div>
                    <h1>Congratulations! You have Completed the Assignment </h1>
                    <br />
                    <h3>
                      Hit Submit to Record Your Response for {loggedInUser}
                    </h3>
                    <button
                      type="submit"
                      onClick={() => {
                        handleSubmit();
                      }}
                    >
                      Submit
                    </button>
                  </div>
                )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ViolationPage;
