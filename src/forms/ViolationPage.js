import { useEffect, useState } from "react";
import axios from "axios";
import EssayFactory from "./ViolationContents/EssayFormat";
import RetryQuestionFormat from "./ViolationContents/RetryQuestionFormat";
import { baseUrl } from "../utils/jsonData";
import OpenEndedFormat from "./ViolationContents/OpenEndedFormat";
import MultipleChoiceFormat from "./ViolationContents/MultipleChoiceFormat";

export default function ViolationPage(props) {
  const [selectedAnswer, setSelectedAnswer] = useState();
  const [studentAnswers, setStudentAnswers] = useState([""]);
  const [mapIndex, setMapIndex] = useState(0);
  const [essay, setEssay] = useState();

  useEffect(() => {
    setMapIndex(props.data.mapIndex);
    console.log(mapIndex);
  }, []);

  useEffect(() => {
    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };

    console.log("ENJPY", props.data);

    const url = `${baseUrl}/assignments/v1/`;
    axios
      .get(url, { headers })
      .then((response) => {
        const essay = response.data.filter(
          (essay) =>
            essay.infractionName === props.data.infractionName &&
            essay.level == parseInt(props.data.infractionLevel)
        );
        setEssay(essay[0]);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  useEffect(() => {
    if (mapIndex == 0) {
    } else {
      const headers = {
        Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
      };

      const url = `${baseUrl}/punish/v1/${props.data.punishmentId}/index/${mapIndex}`;

      axios
        .put(url, {}, { headers }) // Include headers directly in the request config
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [mapIndex]);

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

  const textCorrectlyCopied = (selectedAnswer) => {
    if (selectedAnswer === "true") {
      window.alert("Congratulations! That is correct!");
      setMapIndex((prev) => prev + 1);
    }
  };

  const openEndedQuestionAnswered = (selectedAnswer) => {
    if (selectedAnswer.answer === "agree") {
      setMapIndex((prev) => prev + 1);
      setStudentAnswers((prev) => [...prev, selectedAnswer]);
    } else if (
      selectedAnswer.answer === "disagree" ||
      selectedAnswer.answer === "neutral"
    ) {
      setMapIndex((prev) => prev + 2);
      setStudentAnswers((prev) => [...prev, selectedAnswer]);
    } else {
      setMapIndex((prev) => prev + 1);
      setStudentAnswers((prev) => [...prev, selectedAnswer]);
    }
  };

  const handleRadioChange = (e) => {
    setSelectedAnswer(e.target.value);
  };

  const handleSubmit = () => {
    const formattedInfraction =
      essay.infractionName === "Unauthorized Device Cell Phone"
        ? "Unauthorized Device/Cell Phone"
        : essay.infractionName;

    var payload = {
      studentEmail: loggedInUser,
      infractionName: formattedInfraction,
      studentAnswer: studentAnswers,
      timeClosed: Date.now,
    };

    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };

    const url = `${baseUrl}/punish/v1/punishId/close`;

    axios
      .post(url, payload, { headers })
      .then(function (res) {
        window.alert(`You Work Has been Recorded for ${payload.studentEmail}`);
        window.location.href = "/dashboard/student";
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  return (
    essay && (
      <>
        <div className="">
          <div className="">
            <div className="form-container-violation" style={{ width: "100%" }}>
              <form onSubmit={handleSubmit}>
                <h1 className="instructions">
                  {essay && essay.infractionName} Violation Level:{" "}
                  {essay && essay.level}
                </h1>{" "}
                <hr></hr>
                <div>
                  {essay &&
                    essay.questions &&
                    essay.questions.map((data, index) => {
                      return (
                        <>
                          {data.type === "reading" && mapIndex === index && (
                            <EssayFactory
                              essay={data}
                              saveAnswerAndProgress={saveAnswerAndProgress}
                              handleRadioChange={handleRadioChange}
                            />
                          )}

                          {data.type === "retryQuestion" &&
                            mapIndex === index && (
                              <RetryQuestionFormat
                                essay={data}
                                saveAnswerAndProgress={textCorrectlyCopied}
                                handleRadioChange={handleRadioChange}
                              />
                            )}

                          {data.type === "exploratory-open-ended" &&
                            mapIndex === index && (
                              <OpenEndedFormat
                                question={data}
                                saveAnswerAndProgress={
                                  openEndedQuestionAnswered
                                }
                              />
                            )}

                          {data.type === "exploratory-radio" &&
                            mapIndex === index && (
                              <>
                                <MultipleChoiceFormat
                                  data={data}
                                  saveAnswerAndProgress={
                                    openEndedQuestionAnswered
                                  }
                                  sectionName={"tbd"}
                                />
                              </>
                            )}
                        </>
                      );
                    })}

                  {essay &&
                    essay.questions &&
                    mapIndex === essay.questions.length && (
                      <div>
                        <h1>
                          Congratulations! You have Completed the Assignment{" "}
                        </h1>
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
      </>
    )
  );
}