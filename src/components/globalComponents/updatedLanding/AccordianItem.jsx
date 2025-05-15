import React, { useState } from 'react';
import "./landing-01.css";

export const AccordionItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="accordion-item">
      <div
        className="accordion-question"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{question}</span>
        {isOpen ? "-"  : "+"}
      </div>
      {isOpen && <div className="accordion-answer">{answer}</div>}
    </div>
  );
};




