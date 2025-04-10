import React, { useState } from "react";

interface Question {
  title: string;
  question: string;
}

interface OpenEndedProps {
  question: Question;
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
    const payload = { question: question.question, answer: value };
    saveAnswerAndProgress(payload);
    setValue("");
  };

  return (
    <div>
      <h4 className="section-header">{question.title}</h4>
      <hr />
      <div className="question-container">
        <h5 className="question-text">{question.question}*</h5>
        <div className="image-container">
          {/* Add any additional content here */}
        </div>
        <textarea
          style={{ height: 70 }}
          id="value"
          name="value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
        ></textarea>
      </div>
      <div className="button-container">
        <button type="button" onClick={() => submitAnswer()}>
          Submit Answer
        </button>
      </div>
    </div>
  );
};

export default OpenEndedFormat;
