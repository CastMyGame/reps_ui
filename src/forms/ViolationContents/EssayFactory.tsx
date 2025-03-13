import React, { useState, useEffect } from "react";
import { AssignmentQuestion } from "src/types/school";

const shuffleArray = (array: string[]) => {
  let currentIndex = array.length,
    randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
};

interface EssayFactoryProps {
  essay: AssignmentQuestion;
  handleRadioChange: React.ChangeEventHandler<HTMLInputElement>;
  sectionName: string;
  saveAnswerAndProgress: (payload: {
    question: string;
    answer: string;
  }) => void;
}

const EssayFactory: React.FC<EssayFactoryProps> = ({
  essay,
  handleRadioChange,
  sectionName,
  saveAnswerAndProgress,
}) => {
  const [shuffledKeys, setShuffledKeys] = useState<string[]>([]);

  // Effect to shuffle keys on component mount
  useEffect(() => {
    setShuffledKeys(shuffleArray(Object.keys(essay.radioAnswers)));
  }, [essay]);

  return (
    <>
      <div className="essay-container">
        <div className="section-header">
          {sectionName}
          <h4 className="question-header">{essay.question}</h4>
        </div>
        <h1>{essay.title}</h1>
        <p style={{ whiteSpace: "pre-line" }}>
          {essay.body
            .replace(/\n{2,}/g, "\n")
            .split("\n")
            .map((paragraph, index) => (
              <React.Fragment key={index.valueOf()}>
                {"\u00A0"}
                {"\u00A0"}
                {"\u00A0"}
                {"\u00A0"}
                {paragraph}
                <br />
                <br />
              </React.Fragment>
            ))}
        </p>{" "}
        <h2 className="references">References</h2>
        {essay?.references.map((ref) => {
          return <p key={ref.valueOf()}>{ref}</p>;
        })}
      </div>
      <div className="required-question" aria-hidden="true" dir="auto">
        * Indicates required question
      </div>
      <hr />
      <div className="question-container">
        <h4 className="question-header">{essay.question}</h4>
        <div>
          {shuffledKeys.map((key) => (
            <label style={{ color: "black" }} key={key}>
              <input
                type="radio"
                id={key}
                name="radioAnswer"
                value={String(essay.radioAnswers[key].value)}
                onChange={handleRadioChange}
              />
              {` ${essay.radioAnswers[key].label}`}
            </label>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={() =>
          saveAnswerAndProgress({ question: essay.question, answer: "" })
        }
      >
        Next
      </button>
    </>
  );
};

export default EssayFactory;
