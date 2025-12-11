import React, { useState } from "react";
import {
  RetryConfig,
  TemplateQuestion,
  QuestionType,
  AnswerOption,
  AssignmentTemplateCreatePayload,
  DEFAULT_INFRACTION_OPTIONS,
  DEFAULT_LEVEL_OPTIONS,
} from "src/types/assignments";
import { createAssignmentTemplate } from "src/utils/api/assignmentApi";

interface TemplateEditorInlineProps {
  teacherEmail: string;
  defaultInfractionName?: string;
  defaultLevel?: number;
  onCreated: (templateId: string) => void;
  onCancel: () => void;

  // optional – can be wired up later
  infractionOptions?: string[];
  levelOptions?: number[];
}

const emptyRetryConfig: RetryConfig = {
  enabled: false,
  mode: "TEXT",
  textToCopy: "",
  requiredAccuracyPercent: 80,
};

const makeEmptyQuestion = (order: number): TemplateQuestion => ({
  id: `q${order}`,
  order,
  type: "READING_MC",
  required: true,
  prompt: "",
  title: "",
  passageBody: "",
  passageReferences: [],
  options: [],
  selectionMode: "SINGLE",
  gradingMode: "ALL_CORRECT",
  retry: { ...emptyRetryConfig },
  minLength: null,
  maxLength: null,
  graded: null,
});

export const TemplateEditorInline: React.FC<TemplateEditorInlineProps> = ({
  teacherEmail,
  defaultInfractionName,
  defaultLevel,
  onCreated,
  onCancel,
  infractionOptions,
  levelOptions,
}) => {
  const availableInfractions =
    infractionOptions && infractionOptions.length > 0
      ? infractionOptions
      : DEFAULT_INFRACTION_OPTIONS;

  const availableLevels =
    levelOptions && levelOptions.length > 0
      ? levelOptions
      : DEFAULT_LEVEL_OPTIONS;

  const [infractionName, setInfractionName] = useState(
    defaultInfractionName || availableInfractions[0] || ""
  );
  const [level, setLevel] = useState<number>(
    defaultLevel ?? availableLevels[0] ?? 1
  );
  const [questions, setQuestions] = useState<TemplateQuestion[]>([
    makeEmptyQuestion(1),
  ]);

  const [templateName, setTemplateName] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // ---------- question handlers ----------

  const handleQuestionChange = (
    index: number,
    changes: Partial<TemplateQuestion>
  ) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...changes };
      return copy;
    });
  };

  const handleQuestionTypeChange = (index: number, type: QuestionType) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const q = { ...copy[index], type };

      if (type === "READING_MC" || type === "EXPLORATORY_RADIO") {
        if (!q.options || q.options.length === 0) {
          q.options = [
            { id: "1", label: "", correct: true },
            { id: "2", label: "", correct: false },
          ];
        }
        if (!q.selectionMode) q.selectionMode = "SINGLE";
        if (!q.gradingMode) q.gradingMode = "ALL_CORRECT";
      } else {
        // open-ended: no options / grading
        q.options = null;
        q.selectionMode = null;
        q.gradingMode = null;
      }

      if (type === "EXPLORATORY_OPEN") {
        if (q.minLength == null) q.minLength = 10;
        if (q.maxLength == null) q.maxLength = 500;
      }

      copy[index] = q;
      return copy;
    });
  };

  const handleOptionChange = (
    qIndex: number,
    optIndex: number,
    changes: Partial<AnswerOption>
  ) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const q = { ...copy[qIndex] };
      const opts = q.options ? [...q.options] : [];
      opts[optIndex] = { ...opts[optIndex], ...changes };
      q.options = opts;
      copy[qIndex] = q;
      return copy;
    });
  };

  const handleAddOption = (qIndex: number) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const q = { ...copy[qIndex] };
      const nextId = (q.options?.length || 0) + 1;
      const opts = q.options ? [...q.options] : [];
      opts.push({ id: String(nextId), label: "", correct: false });
      q.options = opts;
      copy[qIndex] = q;
      return copy;
    });
  };

  const handleRemoveOption = (qIndex: number, optIndex: number) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const q = { ...copy[qIndex] };
      const opts = q.options ? [...q.options] : [];
      opts.splice(optIndex, 1);
      q.options = opts;
      copy[qIndex] = q;
      return copy;
    });
  };

  const handleRetryToggle = (qIndex: number, enabled: boolean) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const q = { ...copy[qIndex] };
      if (!q.retry) q.retry = { ...emptyRetryConfig };
      q.retry.enabled = enabled;
      copy[qIndex] = q;
      return copy;
    });
  };

  const handleRetryChange = (qIndex: number, changes: Partial<RetryConfig>) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const q = { ...copy[qIndex] };
      q.retry = { ...(q.retry || emptyRetryConfig), ...changes };
      copy[qIndex] = q;
      return copy;
    });
  };

  const handleAddQuestion = () => {
    setQuestions((prev) => [...prev, makeEmptyQuestion(prev.length + 1)]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy.map((q, i) => ({ ...q, order: i + 1, id: `q${i + 1}` }));
    });
  };

  // ---------- submit ----------

  const handleSubmit = async () => {
    setError(null);
    setSuccessMessage(null);

    if (!infractionName.trim()) {
      setError("Infraction name is required.");
      return;
    }

    if (!templateName.trim()) {
      setError("Template name is required.");
      return;
    }

    if (!questions.length) {
      setError("You must add at least one question.");
      return;
    }

    const cleanedQuestions: TemplateQuestion[] = questions.map(
      (q, idx): TemplateQuestion => {
        const prompt: string = (q.prompt ?? "").trim();
        const title: string = (q.title ?? "").trim();
        const passageBody: string = (q.passageBody ?? "").trim();

        const passageReferences: string[] =
          q.passageReferences && q.passageReferences.length > 0
            ? q.passageReferences
            : [];

        const options =
          q.options && q.options.length > 0
            ? q.options.map((o, i) => ({
                id: o.id || String(i + 1),
                label: o.label || "",
                correct: !!o.correct,
              }))
            : null;

        const retry: RetryConfig = {
          enabled: q.retry?.enabled ?? false,
          mode: q.retry?.mode ?? "TEXT",
          textToCopy: (q.retry?.textToCopy ?? "").trim(),
          requiredAccuracyPercent: q.retry?.requiredAccuracyPercent ?? null,
        };

        return {
          ...q,
          id: `q${idx + 1}`,
          order: idx + 1,
          prompt,
          title,
          passageBody,
          passageReferences,
          options,
          retry,
        };
      }
    );

    const payload: AssignmentTemplateCreatePayload = {
      // 🔹 human-friendly label
      name: templateName.trim(),

      infractionName: infractionName.trim(),
      level: Number(level) || 1,

      // 🔹 this is a teacher-created template
      createdBySystem: false,
      createdByUserId: teacherEmail,
      schoolId: null, // later: pass real schoolId

      // 🔹 scope & visibility: teacher default + private
      scope: "TEACHER_DEFAULT",
      active: true,
      visibility: "PRIVATE",

      questions: cleanedQuestions,
    };

    setSaving(true);
    try {
      const created = await createAssignmentTemplate(payload);
      setSuccessMessage("Template created successfully.");
      onCreated(created.id || "");
    } catch (e: any) {
      setError(e.message || "Failed to create template.");
    } finally {
      setSaving(false);
    }
  };

  // ---------- render ----------

  return (
    <div
      className="template-editor-inline"
      style={{
        border: "1px solid #ddd",
        borderRadius: "4px",
        padding: "15px",
        marginTop: "15px",
        backgroundColor: "#fafafa",
      }}
    >
      <h3 style={{ marginTop: 0 }}>Create New Assignment Template</h3>

      {error && (
        <div style={{ color: "red", marginBottom: "8px" }}>{error}</div>
      )}
      {successMessage && (
        <div style={{ color: "green", marginBottom: "8px" }}>
          {successMessage}
        </div>
      )}

      {/* Top-level fields */}
      <div className="form-group">
        <label
          htmlFor="template-name"
          style={{
            display: "block",
            fontWeight: 600,
            marginBottom: 4,
            color: "#000",
          }}
        >
          Template Name
        </label>
        <input
          id="template-name"
          type="text"
          className="form-control"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          placeholder="e.g. Tardy L1 – Reading + Reflection"
        />
      </div>

      <div className="form-group">
        <label
          htmlFor="template-infraction-name"
          style={{
            display: "block",
            fontWeight: 600,
            marginBottom: 4,
            color: "#000",
          }}
        >
          Infraction Name
        </label>
        <select
          id="template-infraction-name"
          className="form-control"
          value={infractionName}
          onChange={(e) => setInfractionName(e.target.value)}
        >
          {availableInfractions.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label
          htmlFor="template-level"
          style={{
            display: "block",
            fontWeight: 600,
            marginBottom: 4,
            color: "#000",
          }}
        >
          Level
        </label>
        <select
          id="template-level"
          className="form-control"
          value={level}
          onChange={(e) => setLevel(Number(e.target.value))}
        >
          {availableLevels.map((lvl) => (
            <option key={lvl} value={lvl}>
              {lvl}
            </option>
          ))}
        </select>
      </div>

      <hr />

      {/* Questions */}
      <div>
        <h4>Questions</h4>
        {questions.map((q, index) => (
          <div
            key={q.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "4px",
              padding: "10px",
              marginBottom: "10px",
              backgroundColor: "#fff",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <strong>Question {index + 1}</strong>
              {questions.length > 1 && (
                <button
                  type="button"
                  className="btn btn-xs btn-danger"
                  onClick={() => handleRemoveQuestion(index)}
                >
                  Remove
                </button>
              )}
            </div>

            <div className="form-group">
              <label
                style={{
                  display: "block",
                  fontWeight: 600,
                  marginBottom: 4,
                  color: "#000",
                }}
              >
                Type
              </label>
              <select
                className="form-control"
                value={q.type}
                onChange={(e) =>
                  handleQuestionTypeChange(
                    index,
                    e.target.value as QuestionType
                  )
                }
              >
                <option value="READING_MC">Reading – Multiple Choice</option>
                <option value="EXPLORATORY_OPEN">
                  Exploratory – Open Ended
                </option>
                <option value="EXPLORATORY_RADIO">
                  Exploratory – Agree/Disagree/Neutral
                </option>
              </select>
            </div>

            <div className="form-group">
              <label
                style={{
                  display: "block",
                  fontWeight: 600,
                  marginBottom: 4,
                  color: "#000",
                }}
              >
                Prompt
              </label>
              <textarea
                className="form-control"
                value={q.prompt || ""}
                onChange={(e) =>
                  handleQuestionChange(index, { prompt: e.target.value })
                }
              />
            </div>

            {/* Reading passage */}
            {q.type === "READING_MC" && (
              <div className="form-group">
                <label
                  style={{
                    display: "block",
                    fontWeight: 600,
                    marginBottom: 4,
                    color: "#000",
                  }}
                >
                  Passage (optional)
                </label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={q.passageBody || ""}
                  onChange={(e) =>
                    handleQuestionChange(index, { passageBody: e.target.value })
                  }
                />
              </div>
            )}

            {/* Options */}
            {(q.type === "READING_MC" || q.type === "EXPLORATORY_RADIO") && (
              <div className="form-group">
                <label
                  style={{
                    display: "block",
                    fontWeight: 600,
                    marginBottom: 4,
                    color: "#000",
                  }}
                >
                  Options
                </label>
                {(q.options || []).map((opt, optIndex) => (
                  <div
                    key={opt.id + optIndex}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "4px",
                      gap: "6px",
                    }}
                  >
                    <input
                      type="text"
                      className="form-control"
                      style={{ flex: 1 }}
                      value={opt.label}
                      placeholder={`Option ${optIndex + 1}`}
                      onChange={(e) =>
                        handleOptionChange(index, optIndex, {
                          label: e.target.value,
                        })
                      }
                    />
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        margin: 0,
                        fontSize: "12px",
                        color: "#000",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={!!opt.correct}
                        onChange={(e) =>
                          handleOptionChange(index, optIndex, {
                            correct: e.target.checked,
                          })
                        }
                        style={{ marginRight: "4px" }}
                      />
                      Correct
                    </label>
                    <button
                      type="button"
                      className="btn btn-xs btn-default"
                      onClick={() => handleRemoveOption(index, optIndex)}
                    >
                      X
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-xs btn-default"
                  onClick={() => handleAddOption(index)}
                >
                  + Add Option
                </button>
              </div>
            )}

            {/* Retry for reading MC */}
            {q.type === "READING_MC" && (
              <div
                style={{
                  marginTop: "8px",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px dashed #ccc",
                }}
              >
                <div className="form-group">
                  <label
                    style={{
                      marginRight: "4px",
                      display: "flex",
                      fontWeight: 600,
                      marginBottom: 4,
                      color: "#000",
                      alignItems: "center",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!!q.retry?.enabled}
                      onChange={(e) =>
                        handleRetryToggle(index, e.target.checked)
                      }
                      style={{ marginRight: "6px" }}
                    />
                    Require retry text if answer is incorrect
                  </label>
                </div>

                {q.retry?.enabled && (
                  <>
                    <div className="form-group">
                      <label
                        style={{
                          marginRight: "4px",
                          display: "flex",
                          fontWeight: 600,
                          marginBottom: 4,
                          color: "#000",
                          alignItems: "center",
                        }}
                      >
                        Retry Text (student must copy)
                      </label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={q.retry.textToCopy || ""}
                        onChange={(e) =>
                          handleRetryChange(index, {
                            textToCopy: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label
                        style={{
                          marginRight: "4px",
                          display: "flex",
                          fontWeight: 600,
                          marginBottom: 4,
                          color: "#000",
                          alignItems: "center",
                        }}
                      >
                        Required Accuracy (%)
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        value={q.retry.requiredAccuracyPercent ?? 80}
                        onChange={(e) =>
                          handleRetryChange(index, {
                            requiredAccuracyPercent:
                              Number(e.target.value) || 80,
                          })
                        }
                        min={1}
                        max={100}
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}

        <button
          type="button"
          className="btn btn-default"
          onClick={handleAddQuestion}
        >
          + Add Question
        </button>
      </div>

      <hr />

      <div style={{ textAlign: "right", marginTop: "10px" }}>
        <button
          type="button"
          className="btn btn-default"
          onClick={onCancel}
          style={{ marginRight: "8px" }}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? "Saving..." : "Create Template"}
        </button>
      </div>
    </div>
  );
};
