import React, { useEffect, useState } from "react";
import axios from "axios";
import EssayFactory from "./ViolationContents/EssayFactory";
import RetryQuestionFormat from "./ViolationContents/RetryQuestionFormat";
import { baseUrl } from "../utils/jsonData";
import OpenEndedFormat from "./ViolationContents/OpenEndedFormat";
import MultipleChoiceFormat from "./ViolationContents/MultipleChoiceFormat";
import { OfficeReferral, TeacherReferral } from "src/types/responses";
import { getInfractionName, isOfficeReferral, isTeacherReferral } from "src/utils/helperFunctions";
import { Assignment } from "src/types/school";

interface ViolationProps {
  assignment: TeacherReferral | OfficeReferral;
}

const ViolationPage: React.FC<ViolationProps> = ({assignment}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [studentAnswers, setStudentAnswers] = useState<string[]>([]);
  const [mapIndex, setMapIndex] = useState(0);
  const [essay, setEssay] = useState<Assignment | null>(null);

  useEffect(() => {
    setMapIndex(assignment.mapIndex);
  }, [assignment.mapIndex]);

  useEffect(() => {
    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };

    let theName = getInfractionName(assignment);

    const url = `${baseUrl}/assignments/v1/`;
    axios
      .get(url, { headers })
      .then((response) => {
        const essay = response.data.filter(
          (essay: TeacherReferral | OfficeReferral) =>
            getInfractionName(essay) === theName &&
          !isNaN(Number(essay.infractionLevel)));
        setEssay(essay[0]);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [assignment]);

  useEffect(() => {
    if (mapIndex === 0) {
    } else {
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
        .put(url, {}, { headers }) // Include headers directly in the request config
        .then((response) => {})
        .catch((error) => {
          console.error(error);
        });
    }
  }, [mapIndex, assignment]);

  const loggedInUser = sessionStorage.getItem("email");

  const saveAnswerAndProgress = () => {
    if (loggedInUser) {
      if (selectedAnswer === "true") {
        window.alert("Congratulations! That is correct!");
        setMapIndex((prev) => prev + 2);
        setSelectedAnswer(null);
      } else {
        window.alert("Sorry, that is incorrect");
        setMapIndex((prev) => prev + 1);
      }
    } else {
      window.alert("Email Not Registered in Reps DMS System");
    }
  };

  const textCorrectlyCopied = (payload: { question: string; answer: string }) => {
    if (payload.answer === "true") {
      window.alert("Congratulations! That is correct!");
      setMapIndex((prev) => prev + 1);
    }
  };

  const openEndedQuestionAnswered = (payload: { question: string; answer: string }) => {
    if (payload.answer === "agree") {
      setMapIndex((prev) => prev + 1);
      setStudentAnswers((prev) => [...prev, payload.answer]);
    } else if (
      payload.answer === "disagree" ||
      payload.answer === "neutral"
    ) {
      setMapIndex((prev) => prev + 2);
      setStudentAnswers((prev) => [...prev, payload.answer]);
    } else {
      setMapIndex((prev) => prev + 1);
      setStudentAnswers((prev) => [...prev, payload.answer]);
    }
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedAnswer(e.target.value);
  };

  const handleSubmit = () => {
    const formattedInfraction =
      assignment && getInfractionName(assignment) === "Unauthorized Device Cell Phone"
        ? "Unauthorized Device/Cell Phone"
        : assignment && getInfractionName(assignment);

    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };

    let payload = {
      studentEmail: loggedInUser,
      infractionName: formattedInfraction,
      studentAnswer: studentAnswers,
      timeClosed: Date.now,
    };

    if (assignment && isOfficeReferral(assignment)) {
      let url = `${baseUrl}/officeReferral/v1/submit/${assignment.officeReferralId}`;

      axios
        .post(url, payload, { headers })
        .then(function (res) {
          window.alert(
            `You Work Has been Recorded for ${payload.studentEmail}`
          );
          // window.location.href = "/dashboard/student";
        })
        .catch(function (error) {
          console.error(error);
        });
    } else {
      let url = `${baseUrl}/punish/v1/punishId/close`;

      axios
        .post(url, payload, { headers })
        .then(function (res) {
          window.alert(
            `You Work Has been Recorded for ${payload.studentEmail}`
          );
          // window.location.href = "/dashboard/student";
        })
        .catch(function (error) {
          console.error(error);
        });
    }
  };

  return (
    <div className="">
      <div className="">
        <div className="form-container-violation" style={{ width: "100%" }}>
          <form onSubmit={handleSubmit}>
            <h1 className="instructions">
              {assignment && getInfractionName(assignment)} Violation Level:{" "}
              {assignment?.infractionLevel}
            </h1>{" "}
            <hr></hr>
            <div>
              {essay?.questions?.map((data, index) => {
                return (
                  <>
                    {data.type === "reading" && mapIndex === index && (
                      <EssayFactory
                        essay={data}
                        sectionName={data.type}
                        saveAnswerAndProgress={saveAnswerAndProgress}
                        handleRadioChange={handleRadioChange}
                      />
                    )}

                    {data.type === "retryQuestion" && mapIndex === index && (
                      <RetryQuestionFormat
                        essay={data}
                        sectionName={data.type}
                        saveAnswerAndProgress={textCorrectlyCopied}
                        handleRadioChange={handleRadioChange}
                      />
                    )}

                    {data.type === "exploratory-open-ended" &&
                      mapIndex === index && (
                        <OpenEndedFormat
                          question={data}
                          saveAnswerAndProgress={openEndedQuestionAnswered}
                        />
                      )}

                    {data.type === "exploratory-radio" &&
                      mapIndex === index && (
                          <MultipleChoiceFormat
                            data={data}
                            saveAnswerAndProgress={openEndedQuestionAnswered}
                          />
                      )}
                  </>
                );
              })}

              {essay?.questions &&
                mapIndex === essay.questions.length && (
                  <div>
                    <h1>Congratulations! You have Completed the Assignment </h1>
                    <br />
                    <h3>
                      Hit Submit to Record Your Response for {loggedInUser}{" "}
                    </h3>
                    <button onClick={() => handleSubmit()} type="button">
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
}
export default ViolationPage;