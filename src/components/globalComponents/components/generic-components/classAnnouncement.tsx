import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseUrl } from "src/utils/jsonData";
import { Employee } from "src/types/school";

interface ClassAnnouncementModalProps {
  setContactUsDisplayModal: (value: string) => void;
  teacher?: Employee;
}

const ClassAnnouncementModal: React.FC<ClassAnnouncementModalProps> = ({
  setContactUsDisplayModal,
  teacher,
}) => {
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [modalSubject, setModalSubject] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [teacherEmailSelected, setTeacherEmailSelected] = useState<
    string | null
  >();

  useEffect(() => {
    const email = sessionStorage.getItem("email");
    setTeacherEmailSelected(email);
  }, []);

  const handleModalSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (selectedClasses.length === 0 || !modalSubject || !modalMessage) {
      alert("Please complete all fields before submitting.");
      return;
    }

    const payload = selectedClasses.map((className) => ({
      teacherEmail: teacherEmailSelected,
      className,
      subject: modalSubject,
      msg: modalMessage,
    }));

    axios
      .post(`${baseUrl}/email/v1/classAnnouncement`, payload, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("Authorization")}`,
        },
      })
      .then(() => {
        alert("Announcement sent successfully!");
        setContactUsDisplayModal(""); // Close modal after submission
      })
      .catch((error) => {
        console.error(error);
        alert("Error sending announcement. Please try again.");
      });
  };

  return (
    <>
      {/* Overlay */}
      <div
        role="button"
        tabIndex={0}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1000,
        }}
        onClick={() => setContactUsDisplayModal("")} // Close modal when clicking outside
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setContactUsDisplayModal(""); // Allow closing modal with Enter or Space key
          }
        }}
      />
      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "20px",
          width: "90%",
          zIndex: 1001,
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
        }}
      >
        <h2>Send Announcement</h2>
        <form onSubmit={handleModalSubmit}>
          {/* Class selection */}
          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="select-classes" style={{ color: "black" }}>
              Select Classes
            </label>
            <div
              id="select-classes"
              style={{
                display: "flex",
                flexDirection: "column",
                marginInline: "12px",
                fontSize: "1rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
                maxHeight: "150px",
                overflowY: "auto",
                padding: "5px",
              }}
            >
              {teacher?.classes && teacher.classes.length > 0 ? (
                teacher?.classes.map((cls) => (
                  <label
                    key={cls.className}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "8px",
                      marginTop: "12px",
                      fontSize: "1.5rem",
                      color: "black",
                    }}
                  >
                    <input
                      type="checkbox"
                      value={cls.className}
                      checked={selectedClasses.includes(cls.className)}
                      onChange={(e) => {
                        const selectedValue = e.target.value;
                        setSelectedClasses((prev) =>
                          e.target.checked
                            ? [...prev, selectedValue]
                            : prev.filter((item) => item !== selectedValue)
                        );
                      }}
                      style={{ marginRight: "8px" }}
                    />
                    {cls.className}
                  </label>
                ))
              ) : (
                <p style={{ color: "red", fontSize: "1rem" }}>
                  No classes available to select.
                </p>
              )}
            </div>
          </div>

          {/* Announcement subject */}
          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="subject" style={{ color: "black" }}>
              Announcement Subject
            </label>
            <input
              id="subject"
              type="text"
              value={modalSubject}
              onChange={(e) => setModalSubject(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 8px",
                fontSize: "1rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
              required
            />
          </div>

          {/* Announcement message */}
          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="message" style={{ color: "black" }}>
              Announcement Message
            </label>
            <textarea
              id="message"
              value={modalMessage}
              onChange={(e) => setModalMessage(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                fontSize: "1rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
              rows={5}
              required
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button
              type="button"
              onClick={() => setContactUsDisplayModal("")}
              style={{
                background: "red",
                color: "white",
                border: "none",
                padding: "8px 15px",
                borderRadius: "4px",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                selectedClasses.length === 0 || !modalSubject || !modalMessage
              }
              style={{
                background: "green",
                color: "white",
                border: "none",
                padding: "8px 15px",
                borderRadius: "4px",
                cursor:
                  selectedClasses.length > 0 && modalSubject && modalMessage
                    ? "pointer"
                    : "not-allowed",
              }}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ClassAnnouncementModal;
