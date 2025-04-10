export type RadioAnswers = {
    [key: string]: {
      label: string;
      value: boolean;
    };
  };
  
  export interface Question {
    question: string;
    type: "reading" | "retryQuestion" | "exploratory-open-ended" | "exploratory-radio";
    title: string;
    body: string;
    references: string[];
    radioAnswers: RadioAnswers;
    textToCompare: string;
  }
  
  export interface AssignmentPayload {
    infractionName: string;
    level: number;
    questions: Question[];
  }
  