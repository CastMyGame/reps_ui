import React from "react";
import { TemplateQuestion } from "src/types/assignments";

interface MultipleChoiceProps {
  data: TemplateQuestion;
  saveAnswerAndProgress: (payload: {
    question: string;
    answer: string;
  }) => void;
}

const MultipleChoiceFormat: React.FC<MultipleChoiceProps> = ({
  data,
  saveAnswerAndProgress,
}) => {
  const handleRadioChange = (value: string) => {
    const payload = { question: data.prompt, answer: value };
    saveAnswerAndProgress(payload);
  };

  const options = data.options ?? [];

  return (
    <>
      <div className="essay-container">
        <div
          className="section-header"
          style={{ background: "green", color: "white" }}
        >
          {data.title}
          <h4
            className="question-header"
            style={{ color: "green", background: "#FDFD96" }}
          >
            {data.prompt}
          </h4>
        </div>
        <p className="question-text">{data.prompt}</p>
      </div>

      <div className="md0UAd" aria-hidden="true" dir="auto">
        * Indicates required question
      </div>

      <div className="radio-container">
        {options.map((opt) => {
          const value = opt.label.toLowerCase(); // "agree", "disagree", etc.
          return (
            <div className="radio" key={opt.id}>
              <input
                type="radio"
                id={opt.id}
                name="radioAnswer"
                value={value}
                onChange={() => handleRadioChange(value)}
              />
              <label
                style={{ marginLeft: "10px", color: "black" }}
                htmlFor={opt.id}
              >
                {opt.label}
              </label>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default MultipleChoiceFormat;
