import React, { useEffect, useState } from "react";
import { AssignmentQuestion } from "src/types/school";

interface RetryQuestionProps {
  essay: AssignmentQuestion;
  saveAnswerAndProgress: (payload: {
    question: string;
    answer: string;
  }) => void;
  sectionName: string;
}

const RetryQuestionFormat: React.FC<RetryQuestionProps> = ({
  essay,
  saveAnswerAndProgress,
  sectionName,
}) => {
  const [copyText, setCopyText] = useState("");
  const [generatedImage, setGeneratedImage] = useState<HTMLImageElement | null>(
    null
  );

  const compareText = essay.textToCompare;

  useEffect(() => {
    const imageElement = generateImage(compareText);
    setGeneratedImage(imageElement);
  }, [compareText]); // Run this effect only once when the component mounts

  const checkWork = () => {
    const minMatchPercent = 80;
    const compareText = essay.textToCompare;

    const originalText = prepText(compareText);
    const typedText = prepText(copyText);

    const matchingWords = originalText.filter((word: string) =>
      typedText.includes(word)
    );
    const percentage = (matchingWords.length / originalText.length) * 100;

    // Check if the percentage of matching words is above a certain threshold (e.g., 90%)
    const threshold = minMatchPercent;
    if (percentage >= threshold) {
      window.alert("Correct");
      saveAnswerAndProgress({ question: compareText, answer: copyText });
    } else {
      window.alert(
        `Try Again, Text Must Match to at least ${minMatchPercent} % \n you are currently at ${percentage.toFixed(0)} % `
      );
    }
  };

  // Example prepText function (remove punctuation and convert to lowercase)
  function prepText(text: string) {
    return text
      .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
      .toLowerCase()
      .split(/\s+/);
  }

  //To avoid the need of image hosting will try to generate image from text on load
  const generateImage = (text: string): HTMLImageElement => {
    // Create a canvas element
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    // Check if context is available
    if (!context) {
      throw new Error("Failed to get canvas context");
    }

    // Set canvas dimensions
    canvas.width = 700;
    canvas.height = 200;

    // Set background color (optional)
    context.fillStyle = "#ffffff";
    context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Set text properties
    context.font = "14px Arial";
    context.fillStyle = "#000000"; // Text color

    // Function to split text into lines that fit within the specified width
    const splitTextIntoLines = (text: string, maxWidth: number) => {
      const words = text.split(" ");
      let lines = [];
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const testLine = currentLine + " " + words[i];
        const testWidth = context.measureText(testLine).width;

        if (testWidth <= maxWidth) {
          currentLine = testLine;
        } else {
          lines.push(currentLine);
          currentLine = words[i];
        }
      }

      lines.push(currentLine);
      return lines;
    };

    // Split text into lines that fit within the canvas width
    const lines = splitTextIntoLines(text, canvas.width - 20);

    // Draw each line on the canvas
    const lineHeight = 20; // Adjust as needed
    lines.forEach((line, index) => {
      context.fillText(line, 10, 20 + index * lineHeight);
    });

    // Convert the canvas to an image
    const image = new Image();
    image.src = canvas.toDataURL("image/png");

    // Display the image on the screen
    // document.body.appendChild(image);
    return image;
  };

  return (
    <div>
      <h4 className="section-header">{sectionName}</h4>
      <hr />
      <div className="question-container">
        <h5 className="question-text">
          Copy the following passage down exactly, if it is not written down
          exactly you will need to retry this question: *
        </h5>
        <div className="image-container">
          {generatedImage !== null ? (
            <div id="image">
              {generatedImage && (
                <img src={generatedImage.src} alt="Generated" />
              )}
            </div>
          ) : (
            <p>{essay.textToCompare ?? "No image text available"}</p>
          )}
        </div>
        <textarea
          id="copyText"
          name="copyText"
          style={{ minWidth: "400px", minHeight: "200px" }}
          value={copyText}
          onChange={(e) => setCopyText(e.target.value)}
          required
        />
      </div>
      <div className="button-container">
        <button type="button" onClick={() => checkWork()}>
          Check Work
        </button>
      </div>
    </div>
  );
};

export default RetryQuestionFormat;
