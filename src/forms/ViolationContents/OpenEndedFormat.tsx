import React, { useState } from "react";
import { TemplateQuestion } from "src/types/assignments";

interface OpenEndedProps {
  question: TemplateQuestion;
  saveAnswerAndProgress: (payload: {
    question: string;
    answer: string;
  }) => void;
}

const OpenEndedFormat: React.FC<OpenEndedProps> = ({
  question,
  saveAnswerAndProgress,
}) => {
  const [value, setValue] = useState("");

  const submitAnswer = () => {
    const trimmed = value.trim();
    const min = question.minLength ?? 0;
    const max = question.maxLength ?? Infinity;

    if (trimmed.length < min) {
      window.alert(`Please write at least ${min} characters.`);
      return;
    }
    if (trimmed.length > max) {
      window.alert(`Please keep your answer under ${max} characters.`);
      return;
    }

    const payload = { question: question.prompt, answer: value };
    saveAnswerAndProgress(payload);
    setValue("");
  };

  return (
    <div>
      <h4 className="section-header">{question.title}</h4>
      <hr />
      <div className="question-container">
        <h5 className="question-text">
          {question.prompt}
          {question.required && "*"}
        </h5>
        <div className="image-container">{/* optional extras */}</div>
        <textarea
          style={{ height: 70 }}
          id="value"
          name="value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required={question.required}
        ></textarea>
        {(question.minLength || question.maxLength) && (
          <p style={{ fontSize: "0.85rem" }}>
            {question.minLength && `Min: ${question.minLength} chars. `}
            {question.maxLength && `Max: ${question.maxLength} chars.`}
          </p>
        )}
      </div>
      <div className="button-container">
        <button type="button" onClick={submitAnswer}>
          Submit Answer
        </button>
      </div>
    </div>
  );
};

export default OpenEndedFormat;
