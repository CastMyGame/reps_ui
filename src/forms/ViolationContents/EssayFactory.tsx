import React, { useState, useEffect } from "react";
import { TemplateQuestion } from "src/types/assignments";

const shuffleArray = <T,>(array: T[]): T[] => {
  const copy = [...array];
  let currentIndex = copy.length;
  let randomIndex: number;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [copy[currentIndex], copy[randomIndex]] = [
      copy[randomIndex],
      copy[currentIndex],
    ];
  }

  return copy;
};

interface EssayFactoryProps {
  essay: TemplateQuestion;
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
  const [shuffledOptionIds, setShuffledOptionIds] = useState<string[]>([]);

  useEffect(() => {
    if (!essay.options) {
      setShuffledOptionIds([]);
      return;
    }
    const ids = essay.options.map((opt) => opt.id);
    setShuffledOptionIds(shuffleArray(ids));
  }, [essay]);

  // convenience lookup for options by id
  const optionById = (id: string) =>
    essay.options?.find((opt) => opt.id === id);

  return (
    <>
      <div className="essay-container">
        <div className="section-header">
          {sectionName}
          <h4 className="question-header">{essay.prompt}</h4>
        </div>

        {essay.title && <h1>{essay.title}</h1>}

        {essay.passageBody && (
          <p style={{ whiteSpace: "pre-line" }}>
            {essay.passageBody
              .replace(/\n{2,}/g, "\n")
              .split("\n")
              .map((paragraph, index) => (
                <React.Fragment key={index}>
                  {"\u00A0"}
                  {"\u00A0"}
                  {"\u00A0"}
                  {"\u00A0"}
                  {paragraph}
                  <br />
                  <br />
                </React.Fragment>
              ))}
          </p>
        )}

        {essay.passageReferences && essay.passageReferences.length > 0 && (
          <>
            <h2 className="references">References</h2>
            {essay.passageReferences.map((ref) => (
              <p key={ref}>{ref}</p>
            ))}
          </>
        )}
      </div>

      <div className="required-question" aria-hidden="true" dir="auto">
        * Indicates required question
      </div>
      <hr />

      <div className="question-container">
        <h4 className="question-header">{essay.prompt}</h4>
        <div>
          {shuffledOptionIds.map((id) => {
            const opt = optionById(id);
            if (!opt) return null;

            // value = "true" | "false" so ViolationPage can decide correctness
            const value = String(opt.correct);

            return (
              <label style={{ color: "black" }} key={id}>
                <input
                  type="radio"
                  id={id}
                  name="radioAnswer"
                  value={value}
                  onChange={handleRadioChange}
                />
                {` ${opt.label}`}
              </label>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={() =>
          saveAnswerAndProgress({ question: essay.prompt, answer: "" })
        }
      >
        Next
      </button>
    </>
  );
};

export default EssayFactory;
