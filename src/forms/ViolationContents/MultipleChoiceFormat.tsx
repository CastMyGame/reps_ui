import React from "react";
import { AssignmentQuestion } from "src/types/school";

interface MultipleChoiceProps {
  data: AssignmentQuestion;
  saveAnswerAndProgress: (payload: {
    question: string;
    answer: string;
  }) => void;
}

  const MultipleChoiceFormat: React.FC<MultipleChoiceProps> = ({data, saveAnswerAndProgress}) => {
 
    const handleRadioChange = (value: string) =>{
      const payload = {question:data.question, answer:value}
      saveAnswerAndProgress(payload)
    }
  
    return (
      <>
        <div className="essay-container">
          <div className="section-header" style={{ background: "green", color: "white" }}>
            {data.title}
            <h4 className="question-header" style={{ color: "green", background: "#FDFD96" }}>{data.question}</h4>
          </div>
          {/* <h1 className="section-name">{question.title}</h1> */}
          <p className="question-text">{data.question}</p>
        </div>
        <div className="md0UAd" aria-hidden="true" dir="auto">
          * Indicates required question
        </div>
    
        <div className="radio-container">
         <div className="radio">
          <input
            type="radio"
            id={"1"}
            name="radioAnswer"
            value="agree"
            onChange={() => handleRadioChange("agree")}
          />
          <label style={{marginLeft:"10px",color:"black"}}htmlFor={"1"}>Agree</label>
          </div>
          <div className="radio">
          <input
            type="radio"
            id={"2"}
            name="radioAnswer"
            value="disagree"
            onChange={() => handleRadioChange("disagree")}
          />
          <label style={{marginLeft:"10px",color:"black"}} htmlFor={"2"}>Disagree</label>
    </div>
    <div className="radio">
          <input
            type="radio"
            id={"3"}
            name="radioAnswer"
            value="neutral"
            onChange={() => handleRadioChange("neutral")}
          />
          <label style={{marginLeft:"10px",color:"black"}} htmlFor={"3"}>Neutral</label>
          </div>
        </div>
      </>
    );
    
  }
  
  
  export default MultipleChoiceFormat;