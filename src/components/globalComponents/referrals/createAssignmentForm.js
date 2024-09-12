import React, { useState } from 'react';
import TextField from '@mui/material/TextField';

const CreateAssignmentForm = () => {
  const [formData, setFormData] = useState({
    infractionName: 'sample',
    level: 1,
    questions: [
      {
        qTitle: '', // Initialize with an empty string for the question title
        qEssay: 'this is the essay',
        qReferences: [''], // Initialize with an empty string for the first reference
        qQuiz: [],
        retrySection: [],
        exploratoryQuestions: [],
      },
    ]
  });

  const handleInputChange = (e, field) => {
    const { value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleInputChangeQuestions = (e, field) => {
    const { value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      questions: [
        {
          ...prevData.questions[0],
          [field]: value,
        },
      ],
    }));
  };
  const handleReferenceChange = (index, value) => {
    const updatedReferences = [...formData.questions[0].qReferences];
    updatedReferences[index] = value;
    setFormData((prevData) => ({
      ...prevData,
      questions: [{ ...prevData.questions[0], qReferences: updatedReferences }],
    }));
  };

  const handleAddReference = () => {
    setFormData((prevData) => ({
      ...prevData,
      questions: [{ ...prevData.questions[0], qReferences: [...prevData.questions[0].qReferences, ''] }],
    }));
  };

  const handleRemoveReference = (index) => {
    const updatedReferences = [...formData.questions[0].qReferences];
    updatedReferences.splice(index, 1);
    setFormData((prevData) => ({
      ...prevData,
      questions: [{ ...prevData.questions[0], qReferences: updatedReferences }],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <form onSubmit={handleSubmit}>

      {/* Input for Meta Info */}
      <TextField
        margin="normal"
        fullWidth
        label="Infraction Name"
        name="infractionName"
        value={formData.infractionName}
        onChange={(e) => handleInputChange(e, 'infractionName')}
      />

      <TextField
        margin="normal"
        fullWidth
        label="Level"
        name="level"
        type="number" // Assuming level is a numeric value
        value={formData.level}
        onChange={(e) => handleInputChange(e, 'level')}
      />

      {/* Input for question title */}
      <TextField
        margin="normal"
        fullWidth
        label="Question Title"
        name="qTitle"
        value={formData.questions[0].qTitle}
        onChange={(e) => handleInputChangeQuestions(e, 'qTitle')}
      />

      {/* Input for essay content */}
      <TextField
        margin="normal"
        fullWidth
        label="Essay Content"
        name="qEssay"
        value={formData.questions[0].qEssay}
        onChange={(e) => handleInputChangeQuestions(e, 'qEssay')}
      />

      {/* Render reference input boxes */}
      {formData.questions[0].qReferences.map((reference, index) => (
        <div key={index}>
          <TextField
            margin="normal"
            fullWidth
            id={`reference${index + 1}`}
            label={`Reference ${index + 1}`}
            name={`reference${index + 1}`}
            autoComplete={`reference${index + 1}`}
            value={reference}
            onChange={(e) => handleReferenceChange(index, e.target.value)}
          />
          <button type="button" onClick={() => handleRemoveReference(index)}>
            Remove Reference
          </button>
        </div>
      ))}

      {/* Button to add more references */}
      <button type="button" onClick={handleAddReference}>
        Add Reference
      </button>

      <button type="submit">Generate Essay Data</button>
    </form>
  );
};

export default CreateAssignmentForm;
