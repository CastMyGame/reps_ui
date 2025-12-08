import React, { useEffect, useMemo, useState } from "react";
import { AssignmentTemplateBinding, AssignmentTemplateSummaryDTO } from "src/types/assignments";
import { getTeacherBindings, searchAssignmentTemplates, setTeacherDefaultBinding } from "src/utils/api/assignmentApi";


// TODO: replace this with your real auth mechanism
const getCurrentTeacherEmail = () => {
  // Adjust this to however you store the teacher's email
  return sessionStorage.getItem("userEmail") || "";
};

export const TeacherAssignmentTemplatesPanel: React.FC = () => {
  const teacherEmail = getCurrentTeacherEmail();

  const [bindings, setBindings] = useState<AssignmentTemplateBinding[]>([]);
  const [loadingBindings, setLoadingBindings] = useState(false);

  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<AssignmentTemplateSummaryDTO[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInfraction, setSelectedInfraction] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // Load current bindings for this teacher
  useEffect(() => {
    if (!teacherEmail) return;
    setLoadingBindings(true);
    getTeacherBindings(teacherEmail)
      .then(setBindings)
      .catch((e: any) => setError(e.message))
      .finally(() => setLoadingBindings(false));
  }, [teacherEmail]);

  // Unique (infraction, level) rows
  const rows = useMemo(() => {
    const keyMap = new Map<string, AssignmentTemplateBinding>();
    bindings.forEach((b) => {
      const key = `${b.infractionName}::${b.level}`;
      if (!keyMap.has(key)) {
        keyMap.set(key, b);
      }
    });
    return Array.from(keyMap.values()).sort((a, b) => {
      if (a.infractionName === b.infractionName) {
        return a.level - b.level;
      }
      return a.infractionName.localeCompare(b.infractionName);
    });
  }, [bindings]);

  const openSearchDialog = (infractionName: string, level: number) => {
    setSelectedInfraction(infractionName);
    setSelectedLevel(level);
    setSearchDialogOpen(true);
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleSearch = async () => {
    if (!selectedInfraction || selectedLevel == null) return;
    setSearchLoading(true);
    try {
      const results = await searchAssignmentTemplates({
        infractionName: selectedInfraction,
        level: selectedLevel,
        q: searchQuery || undefined,
      });
      setSearchResults(results);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectTemplate = async (template: AssignmentTemplateSummaryDTO) => {
    if (!teacherEmail || !selectedInfraction || selectedLevel == null) return;
    try {
      const updatedBinding = await setTeacherDefaultBinding({
        teacherEmail,
        infractionName: selectedInfraction,
        level: selectedLevel,
        assignmentTemplateId: template.id,
      });

      // Replace any existing binding for same teacher/infraction/level
      setBindings((prev) => {
        const filtered = prev.filter(
          (b) =>
            !(
              b.infractionName === updatedBinding.infractionName &&
              b.level === updatedBinding.level &&
              b.teacherEmail === updatedBinding.teacherEmail
            )
        );
        return [...filtered, updatedBinding];
      });

      setSearchDialogOpen(false);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="teacher-assignment-templates-panel" style={{ padding: "20px" }}>
      <h2>Assignment Templates</h2>
      <p>
        Choose which assignment template to use by default for each infraction and level.
      </p>

      {error && (
        <div style={{ marginBottom: "10px", color: "red" }}>
          {error}
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-striped table-bordered">
          <thead>
            <tr>
              <th>Infraction</th>
              <th>Level</th>
              <th>Current Template</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loadingBindings && (
              <tr>
                <td colSpan={4}>Loading...</td>
              </tr>
            )}

            {!loadingBindings && rows.length === 0 && (
              <tr>
                <td colSpan={4}>
                  No defaults set yet. Once you choose templates, they will appear here.
                </td>
              </tr>
            )}

            {rows.map((b) => (
              <tr key={b.id}>
                <td>{b.infractionName}</td>
                <td>{b.level}</td>
                <td>
                  {/* For now, just show the template ID.
                      Later we can fetch the template name/preview and show that. */}
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                      fontSize: "12px",
                    }}
                  >
                    {b.assignmentTemplateId}
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => openSearchDialog(b.infractionName, b.level)}
                    style={{ marginRight: "8px" }}
                  >
                    Change Template
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-default"
                    onClick={() => openSearchDialog(b.infractionName, b.level)}
                  >
                    Search Templates
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Simple "modal" implemented with divs */}
      {searchDialogOpen && (
        <div
          className="assignment-search-modal-backdrop"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1050,
          }}
        >
          <div
            className="assignment-search-modal"
            style={{
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "6px",
              maxWidth: "800px",
              width: "90%",
              maxHeight: "80vh",
              overflowY: "auto",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ marginBottom: "10px" }}>
              <h3 style={{ margin: 0 }}>
                Choose Template for {selectedInfraction} (Level {selectedLevel})
              </h3>
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <input
                type="text"
                className="form-control"
                placeholder="Search text in templates…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSearch}
                disabled={searchLoading}
              >
                {searchLoading ? "Searching..." : "Search"}
              </button>
            </div>

            {searchLoading && <div>Searching...</div>}

            {!searchLoading && searchResults.length === 0 && (
              <div style={{ fontSize: "14px", color: "#555" }}>
                No templates found. Try a different search or create a new template.
              </div>
            )}

            {!searchLoading &&
              searchResults.map((t) => (
                <div
                  key={t.id}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    padding: "10px",
                    marginBottom: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>
                      {t.infractionName} (Level {t.level})
                    </div>
                    <div style={{ fontSize: "13px", color: "#555" }}>
                      {t.firstQuestionPreview || "No preview available"}
                    </div>
                    <div style={{ fontSize: "12px", color: "#888" }}>
                      {t.createdBySystem
                        ? "System template"
                        : `Created by ${t.createdByUserId ?? "Unknown"}`}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-success"
                    onClick={() => handleSelectTemplate(t)}
                  >
                    Use this template
                  </button>
                </div>
              ))}

            <div style={{ textAlign: "right", marginTop: "10px" }}>
              <button
                type="button"
                className="btn btn-default"
                onClick={() => setSearchDialogOpen(false)}
                style={{ marginRight: "8px" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};