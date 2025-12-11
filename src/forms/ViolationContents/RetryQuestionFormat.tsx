import React, { useEffect, useState } from "react";
import { TemplateQuestion } from "src/types/assignments";

interface RetryQuestionProps {
  essay: TemplateQuestion;
  saveAnswerAndProgress: (payload: {
    question: string;
    answer: string;
  }) => void;
  sectionName: string;
  handleRadioChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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

  const compareText = essay.retry?.textToCopy ?? "";

  useEffect(() => {
    if (!compareText) {
      setGeneratedImage(null);
      return;
    }
    const imageElement = generateImage(compareText);
    setGeneratedImage(imageElement);
  }, [compareText]);

  const checkWork = () => {
    const minMatchPercent = essay.retry?.requiredAccuracyPercent ?? 80; // fallback to 80

    const originalText = prepText(compareText);
    const typedText = prepText(copyText);

    const matchingWords = originalText.filter((word: string) =>
      typedText.includes(word)
    );
    const percentage = (matchingWords.length / originalText.length) * 100;

    if (percentage >= minMatchPercent) {
      window.alert("Correct");
      saveAnswerAndProgress({ question: compareText, answer: "true" });
    } else {
      window.alert(
        `Try Again, Text Must Match to at least ${minMatchPercent}%.\nYou are currently at ${percentage.toFixed(
          0
        )}%`
      );
    }
  };

  function prepText(text: string) {
    return text
      .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
      .toLowerCase()
      .split(/\s+/);
  }

  const generateImage = (text: string): HTMLImageElement => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Failed to get canvas context");
    }

    canvas.width = 700;
    canvas.height = 200;

    context.fillStyle = "#ffffff";
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.font = "14px Arial";
    context.fillStyle = "#000000";

    const splitTextIntoLines = (text: string, maxWidth: number) => {
      const words = text.split(" ");
      const lines: string[] = [];
      let currentLine = words[0] ?? "";

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

    const lines = splitTextIntoLines(text, canvas.width - 20);
    const lineHeight = 20;

    lines.forEach((line, index) => {
      context.fillText(line, 10, 20 + index * lineHeight);
    });

    const image = new Image();
    image.src = canvas.toDataURL("image/png");
    return image;
  };

  if (!essay.retry?.enabled || !compareText) {
    return (
      <div>
        <h4 className="section-header">{sectionName}</h4>
        <p>No retry text configured for this question.</p>
      </div>
    );
  }

  return (
    <div>
      <h4 className="section-header">{sectionName}</h4>
      <hr />
      <div className="question-container">
        <h5 className="question-text">
          Copy the following passage down exactly; if it is not written down
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
            <p>{compareText || "No image text available"}</p>
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
        <button type="button" onClick={checkWork}>
          Check Work
        </button>
      </div>
    </div>
  );
};

export default RetryQuestionFormat;
