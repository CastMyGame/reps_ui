import { useEffect, useState } from 'react';
import axios from 'axios';
import EssayFactory from './ViolationContents/EssayFormat';
import RetryQuestionFormat from './ViolationContents/RetryQuestionFormat';
import { baseUrl, essayData } from '../utils/jsonData';
import { useParams } from 'react-router-dom';
import OpenEndedFormat from './ViolationContents/OpenEndedFormat';
import MultipleChoiceFormat from './ViolationContents/MultipleChoiceFormat';




 export default function ViolationPage(props) {
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [studentAnswers, setStudentAnswers] = useState([])
  const [mapIndex, setMapIndex] = useState(0)
  
  //Grabs Params to Decide what Json Object to use
  const { param1, param2 } = useParams();

  // Decode URL-encoded parameters
  const decodedParam1 = decodeURIComponent(param1);
  const decodedParam2 = decodeURIComponent(param2);
  
  const essay = Object.values(essayData).filter(
    essay =>
      essay.infractionName === decodedParam1 &&
      essay.level === parseInt(decodedParam2)
  )[0];

  console.log("params",decodedParam1,decodedParam2)
  console.log("essay",essay)



// List of all possible components to compare json too
const listOfPossibleSections = [
"Question 1.question" ,
"Question 1.retryQuestion",
"Question 2.question",
"Question 2.retryQuestion", 
"Question 3.question",
"Question 3.retryQuestion",
"Question 4.question",
"Question 4.retryQuestion",
"exploratory-questions.openEndedExplanation",
"exploratory-questions.emotionalRegulation-radio",
"exploratory-questions.emotionalRegulation-openEnded",
"exploratory-questions.academic-radio",
"exploratory-questions.academic-openEnded",
"exploratory-questions.activities-radio",
"exploratory-questions.emotionalCoping",
  ]


 //Extract all Actual Fields from Json
 // so if question 3 or 4, or exploratory question are not present, they will not be rendered
  function extractFieldNames(obj, prefix = "", result = []) {
    for (const key in obj) {
      const fieldName = prefix + key;
      result.push(fieldName);
  
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        extractFieldNames(obj[key], fieldName + ".", result);
      }
    }
  }
  
  const parsedSections = []
extractFieldNames(essay, "", parsedSections);


const filterSections = (sections, jsonData) => {
  return sections.filter(section => {
    const fieldPath = section.split('.');
    let currentData = jsonData;

    // Check if each part of the path exists in the JSON data
    for (const field of fieldPath) {
      if (currentData && currentData.hasOwnProperty(field)) {
        currentData = currentData[field];
      } else {
        return false; // Stop and return false if any part of the path is not found
      }
    }

    // If the loop completes, it means the entire path exists in the JSON data
    return true;
  });
};

const sectionMap = filterSections(listOfPossibleSections, essay);

//since submit is not part of the json we have to add it, in order to render page
sectionMap.push("Submit")

console.log(sectionMap);


const loggedInUser = sessionStorage.getItem("email")
   

const saveAnswerAndProgress = () =>{
  if(loggedInUser){
    if(selectedAnswer === "correct"){
      window.alert("Congratulations! That is correct!")
      setMapIndex((prev) => prev + 2);
      setSelectedAnswer("")
  
    }else{
      window.alert("Sorry, that is incorrect")
      setMapIndex((prev) => prev + 1);
    }
  

  }else{
    window.alert("Email Not Registered in Reps DMS System")
  }

}



const textCorrectlyCopied = (selectedAnswer) =>{
  if(selectedAnswer === "correct"){
    window.alert("Congratulations! That is correct!")
    setMapIndex((prev) => prev + 1);
}

}




const openEndedQuestionAnswered = (selectedAnswer) =>{
 console.log(selectedAnswer)
    setMapIndex((prev) => prev + 1);
    setStudentAnswers((prev) => [...prev, selectedAnswer]);
 
}

const handleRadioChange = (e) =>{
  setSelectedAnswer(e.target.value);
  
}

const handleSubmit = () => {

  var payload = {
      "studentEmail" :loggedInUser ,
      "infractionName": essay.infractionName,
      "studentAnswer": studentAnswers
      }
  

    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };
    
    const url = `${baseUrl}/punish/v1/punishId/close`;
  

      axios.post(url,payload, { headers })
      .then(function (res){
        console.log(res)
        window.alert(`You Work Has been Recorded for ${payload.studentEmail}`)
    
        window.opener = null;
        window.open("", "_self");
        window.close();


    })
      .catch(function (error){
        console.log(error)

  
  });
}


const conditionalRender = () => {
  const currentSection = sectionMap[mapIndex];
  console.log(currentSection)

  // Check if currentSection is defined
  if (currentSection) {
    console.log(currentSection, mapIndex);

    // If Retry Question Present Render
    if (currentSection.includes(".retryQuestion")) {
      return (
        <RetryQuestionFormat
          essay={essay[currentSection.replace(".retryQuestion", "")]}
          saveAnswerAndProgress={textCorrectlyCopied}
          sectionName={sectionMap[mapIndex]}
        />
      );
    }
    // If Question Present Render
    else if (currentSection.includes(".question")) {
      return (
        <EssayFactory
          essay={essay[sectionMap[mapIndex].replace(".question", "")]}
          saveAnswerAndProgress={saveAnswerAndProgress}
          handleRadioChange={handleRadioChange}
          sectionName={sectionMap[mapIndex]}
        />
      );
    }
    // If Submit section Render
    else if (currentSection.includes("Submit")) {
      return (
        <div>
          <h1>Congratulations! You have Completed the Assignment </h1><br />
          <h3>Hit Submit to Record Your Response for {loggedInUser} </h3>
          <button onClick={() => handleSubmit()} type="button">Submit</button>
        </div>
      );
    }
    // Check for exploratory questions
    else if (
      currentSection.includes(".openEndedExplanation") ||
      currentSection.includes(".emotionalRegulation-openEnded") ||
      currentSection.includes(".academic-openEnded") ||
      currentSection.includes(".emotionalCoping")
    ) {
      return (
        <OpenEndedFormat
          question={essay['exploratory-questions'][currentSection.replace("exploratory-questions.", "")]}
          saveAnswerAndProgress={openEndedQuestionAnswered}
          sectionName={currentSection.replace("exploratory-questions.", "")}
        />
      );
    }
    // Check for radio questions
    else if (
      currentSection.includes(".emotionalRegulation-radio") ||
      currentSection.includes(".academic-radio") ||
      currentSection.includes(".activities-radio")
    ) {
      return (
        <MultipleChoiceFormat
          question={essay['exploratory-questions'][currentSection.replace("exploratory-questions.", "")]}
          saveAnswerAndProgress={openEndedQuestionAnswered}
          sectionName={currentSection.replace("exploratory-questions.", "")}
        />
      );
    } else {
      return null;
    }
  }

  // Return null if currentSection is undefined
  return null;
};

 

  
  return( 
    <div className="">

    <div className="lrKTG">
    <a href="/dashboard/student">
  <button>Go Home</button>
</a>
      <div className="form-container" style={{width:"100%"}}>
        <form onSubmit={handleSubmit}>
        <h1 className="instructions">{essay.infractionName} Violation Level:{essay.level}</h1>
          <hr></hr>
 <div>
 {conditionalRender()}
 </div>


       </form>
      </div>
    </div>
  </div>
);
  }
