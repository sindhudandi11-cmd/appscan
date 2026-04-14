import { useEffect, useState } from "react";
import "./App.css";

const API = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api";

function ScoreRing({ score }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const color = score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <svg width="72" height="72" viewBox="0 0 72 72" aria-label={`AI score ${score}`}>
      <circle cx="36" cy="36" r={r} fill="none" stroke="#1e293b" strokeWidth="6" />
      <circle
        cx="36"
        cy="36"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeDasharray={`${filled} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 36 36)"
        style={{ transition: "stroke-dasharray 0.8s ease" }}
      />
      <text x="36" y="41" textAnchor="middle" fontSize="14" fontWeight="700" fill={color}>
        {score}
      </text>
    </svg>
  );
}

function StatusBadge({ status }) {
  const styles = {
    APPROVED: { bg: "#052e16", color: "#4ade80", label: "Approved" },
    REVIEW: { bg: "#431407", color: "#fb923c", label: "Review" },
    PENDING: { bg: "#1e293b", color: "#94a3b8", label: "Pending" },
  };
  const current = styles[status] || styles.PENDING;

  return (
    <span
      style={{
        background: current.bg,
        color: current.color,
        padding: "3px 10px",
        borderRadius: "20px",
        fontSize: "11px",
        fontWeight: "700",
        letterSpacing: "0.5px",
        border: `1px solid ${current.color}33`,
      }}
    >
      {current.label}
    </span>
  );
}

export default function App() {
  const [form, setForm] = useState({
    applicantName: "",
    email: "",
    department: "",
    projectTitle: "",
    fundingRequested: "",
  });
  const [data, setData] = useState([]);
  const [result, setResult] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("submit");

  const loadApplications = async () => {
    const response = await fetch(`${API}/applications`);
    if (!response.ok) {
      throw new Error("Could not load applications");
    }
    const json = await response.json();
    setData(json);
  };

  useEffect(() => {
    loadApplications().catch(() => {});
    fetch(`${API}/meta/applicants`).then((r) => r.json()).then(setApplicants).catch(() => {});
    fetch(`${API}/meta/departments`).then((r) => r.json()).then(setDepartments).catch(() => {});
    fetch(`${API}/meta/projects`).then((r) => r.json()).then(setProjects).catch(() => {});
  }, []);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    setError(null);
  };

  const validate = () => {
    if (!form.applicantName) return "Please select an applicant.";
    if (!form.email || !form.email.includes("@")) return "Please enter a valid email address.";
    if (!form.department) return "Please select a department.";
    if (!form.projectTitle) return "Please select a project.";
    const amount = parseFloat(form.fundingRequested);
    if (Number.isNaN(amount) || amount <= 0) return "Please enter a valid funding amount.";
    return null;
  };

  const submit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API}/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          fundingRequested: parseFloat(form.fundingRequested),
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        setError(json.error || "Submission failed. Please try again.");
        return;
      }

      setResult(json);
      setActiveTab("result");
      await loadApplications();
      setForm({
        applicantName: "",
        email: "",
        department: "",
        projectTitle: "",
        fundingRequested: "",
      });
    } catch (requestError) {
      setError("Could not connect to the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) =>
    value != null
      ? `$${Number(value).toLocaleString("en-US", { minimumFractionDigits: 0 })}`
      : "N/A";

  const avgScore = data.length
    ? Math.round(data.reduce((total, item) => total + (item.aiScore || 0), 0) / data.length)
    : 0;
  const approved = data.filter((item) => item.eligibilityStatus === "APPROVED").length;
  const review = data.filter((item) => item.eligibilityStatus === "REVIEW").length;
  const totalFunding = data.reduce((total, item) => total + (item.fundingRequested || 0), 0);

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          <span className="logo-icon">AS</span>
          <span className="logo-text">
            AppScan<span className="logo-ai">AI</span>
          </span>
        </div>
        <nav className="nav">
          {[
            { id: "submit", icon: "01", label: "New Application" },
            { id: "result", icon: "02", label: "AI Result" },
            { id: "dashboard", icon: "03", label: "Dashboard" },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.id === "result" && result && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-stats">
          <div className="stat-pill">
            <span className="stat-num">{data.length}</span>
            <span className="stat-lbl">Total</span>
          </div>
          <div className="stat-pill approved">
            <span className="stat-num">{approved}</span>
            <span className="stat-lbl">Approved</span>
          </div>
          <div className="stat-pill review">
            <span className="stat-num">{review}</span>
            <span className="stat-lbl">Review</span>
          </div>
        </div>
      </aside>

      <main className="main">
        {activeTab === "submit" && (
          <div className="panel">
            <div className="panel-header">
              <h1>New Application</h1>
              <p>Submit a research funding application for AI-powered review</p>
            </div>

            <div className="form-grid">
              <div className="field">
                <label>Applicant Name</label>
                <select name="applicantName" value={form.applicantName} onChange={handleChange}>
                  <option value="">Select applicant...</option>
                  {applicants.map((applicant) => (
                    <option key={applicant} value={applicant}>
                      {applicant}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Email Address</label>
                <input
                  name="email"
                  type="email"
                  placeholder="researcher@university.edu"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label>Department</label>
                <select name="department" value={form.department} onChange={handleChange}>
                  <option value="">Select department...</option>
                  {departments.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Project Title</label>
                <select name="projectTitle" value={form.projectTitle} onChange={handleChange}>
                  <option value="">Select project...</option>
                  {projects.map((project) => (
                    <option key={project} value={project}>
                      {project}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field full">
                <label>Funding Requested ($)</label>
                <input
                  name="fundingRequested"
                  type="number"
                  min="0"
                  placeholder="e.g. 75000"
                  value={form.fundingRequested}
                  onChange={handleChange}
                />
                <span className="field-hint">
                  Applications over $150,000 will be flagged for manual review.
                </span>
              </div>
            </div>

            {error && <div className="error-banner">Alert: {error}</div>}

            <button className={`submit-btn ${loading ? "loading" : ""}`} onClick={submit} disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" /> Analyzing with AI...
                </>
              ) : (
                <>
                  <span>Go</span> Submit for AI Review
                </>
              )}
            </button>
          </div>
        )}

        {activeTab === "result" && (
          <div className="panel">
            <div className="panel-header">
              <h1>AI Analysis</h1>
              <p>Generated review for the most recent submission</p>
            </div>

            {!result ? (
              <div className="empty-state">
                <div className="empty-icon">02</div>
                <p>No result yet. Submit an application to see the AI analysis here.</p>
                <button className="ghost-btn" onClick={() => setActiveTab("submit")}>
                  Go to Form
                </button>
              </div>
            ) : (
              <div className="result-card">
                <div className="result-top">
                  <div>
                    <div className="result-name">{result.applicantName}</div>
                    <div className="result-project">{result.projectTitle}</div>
                    <div className="result-dept">{result.department}</div>
                  </div>
                  <div className="result-score-block">
                    <ScoreRing score={result.aiScore || 0} />
                    <span className="score-label">AI Score</span>
                  </div>
                </div>

                <div className="result-meta">
                  <div className="meta-chip">
                    <span className="mc-label">Funding</span>
                    <span className="mc-value">{formatCurrency(result.fundingRequested)}</span>
                  </div>
                  <div className="meta-chip">
                    <span className="mc-label">Status</span>
                    <StatusBadge status={result.eligibilityStatus} />
                  </div>
                  <div className="meta-chip">
                    <span className="mc-label">App ID</span>
                    <span className="mc-value mono">#{result.id}</span>
                  </div>
                </div>

                <div className="summary-block">
                  <div className="summary-header">AI Summary</div>
                  <div className="summary-body">{result.aiSummary}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "dashboard" && (
          <div className="panel">
            <div className="panel-header">
              <h1>Applications Dashboard</h1>
              <p>{data.length} total submissions</p>
            </div>

            <div className="kpi-row">
              <div className="kpi">
                <span className="kpi-val">{data.length}</span>
                <span className="kpi-lbl">Submitted</span>
              </div>
              <div className="kpi approved">
                <span className="kpi-val">{approved}</span>
                <span className="kpi-lbl">Approved</span>
              </div>
              <div className="kpi review">
                <span className="kpi-val">{review}</span>
                <span className="kpi-lbl">For Review</span>
              </div>
              <div className="kpi">
                <span className="kpi-val">{avgScore}</span>
                <span className="kpi-lbl">Avg Score</span>
              </div>
              <div className="kpi">
                <span className="kpi-val">{formatCurrency(totalFunding)}</span>
                <span className="kpi-lbl">Total Funding</span>
              </div>
            </div>

            {data.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">03</div>
                <p>No applications yet. Submit one to see it here.</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Applicant</th>
                      <th>Department</th>
                      <th>Project</th>
                      <th>Funding</th>
                      <th>Score</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item) => (
                      <tr key={item.id}>
                        <td className="mono muted">{item.id}</td>
                        <td className="bold">{item.applicantName}</td>
                        <td className="muted">{item.department}</td>
                        <td>{item.projectTitle}</td>
                        <td className="mono">{formatCurrency(item.fundingRequested)}</td>
                        <td>
                          <span
                            className={`score-tag ${
                              item.aiScore >= 75 ? "green" : item.aiScore >= 50 ? "amber" : "red"
                            }`}
                          >
                            {item.aiScore ?? "N/A"}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={item.eligibilityStatus} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
