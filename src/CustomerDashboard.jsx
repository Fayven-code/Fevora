import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function CustomerDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [requests, setRequests] = useState([]);
  const [requestForm, setRequestForm] = useState({
    title: "",
    description: "",
    category: "",
  });

  const [requestMessage, setRequestMessage] = useState("");
  const [requestError, setRequestError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Get customer information from the backend
  const fetchProfile = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/customer/profile",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to load your profile.");
        return;
      }

      setUser(data);

      localStorage.setItem("user", JSON.stringify(data));

      setFormData({
        full_name: data.full_name,
        email: data.email,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Unable to connect to the server.");
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/customer/projects",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(data.error || "Unable to load projects.");
        return;
      }

      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/customer/requests",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(data.error || "Unable to load requests.");
        return;
      }

      setRequests(data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  // Load profile when dashboard opens
  useEffect(() => {
    fetchProfile();
    fetchProjects();
    fetchRequests();
  }, []);

  // Handle form changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Update customer information
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/customer/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to update your profile.");
        return;
      }

      setMessage(data.message);

      // Load the updated information
      fetchProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Unable to connect to the server.");
    }
  };

  const handleRequestChange = (e) => {
    setRequestForm({
      ...requestForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();

    setRequestMessage("");
    setRequestError("");

    try {
      // Submit the customer request first
      const response = await fetch(
        "http://localhost:5000/api/customer/requests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(requestForm),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setRequestError(data.error || "Unable to submit request.");
        return;
      }

      // Upload the file if the customer selected one
      if (selectedFile) {
        const fileData = new FormData();

        fileData.append("file", selectedFile);
        fileData.append("request_id", data.requestId);

        const fileResponse = await fetch(
          "http://localhost:5000/api/customer/documents",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: fileData,
          }
        );

        const fileResult = await fileResponse.json();

        if (!fileResponse.ok) {
          setRequestError(
            fileResult.error || "Request submitted, but file upload failed."
          );
          return;
        }
      }

      setRequestMessage(
        selectedFile
          ? "Request and file submitted successfully."
          : data.message
      );

      setRequestForm({
        title: "",
        description: "",
        category: "",
      });

      setSelectedFile(null);

      // Reset the file input
      const fileInput = document.getElementById("request-file");

      if (fileInput) {
        fileInput.value = "";
      }

      fetchRequests();
    } catch (error) {
      console.error("Error submitting request:", error);
      setRequestError("Unable to connect to the server.");
    }
  };

  // Log out
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  if (!user) {
    return (
      <div className="dashboard-page">
        <p>Loading your dashboard...</p>

        {error && (
          <p className="error-message">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      <div className="dashboard-container">

        {/* Header */}
        <div className="dashboard-header">

          <div>
            <p className="dashboard-eyebrow">
              CUSTOMER DASHBOARD
            </p>

            <h1>
              Welcome, {user.full_name}
            </h1>

            <p>
              Manage your Fevora account information.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="dashboard-logout-button"
          >
            Log Out
          </button>

        </div>

        {/* Account Information */}
        <div className="dashboard-card">

          <div className="dashboard-card-heading">
            <p>ACCOUNT INFORMATION</p>

            <h2>Your Profile</h2>
          </div>

          <div className="dashboard-info">

            <div>
              <span>Full Name</span>
              <strong>{user.full_name}</strong>
            </div>

            <div>
              <span>Email</span>
              <strong>{user.email}</strong>
            </div>

            <div>
              <span>Account Type</span>
              <strong>Customer</strong>
            </div>

            <div>
              <span>Member Since</span>
              <strong>
                {new Date(
                  user.created_at
                ).toLocaleDateString()}
              </strong>
            </div>

          </div>

        </div>

        {/* Update Account */}
        <div className="dashboard-card">

          <div className="dashboard-card-heading">
            <p>ACCOUNT SETTINGS</p>

            <h2>Update Your Information</h2>
          </div>

          <form
            onSubmit={handleSubmit}
            className="dashboard-form"
          >

            <div className="dashboard-input-group">

              <label htmlFor="full_name">
                Full Name
              </label>

              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
              />

            </div>

            <div className="dashboard-input-group">

              <label htmlFor="email">
                Email
              </label>

              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />

            </div>

            <button
              type="submit"
              className="dashboard-save-button"
            >
              Save Changes
            </button>

          </form>

          {message && (
            <p className="success-message">
              {message}
            </p>
          )}

          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

        </div>

        {/* My Projects */}
        <div className="dashboard-card">

          <div className="dashboard-card-heading">
            <p>MY PROJECTS</p>
            <h2>Your Fevora Projects</h2>
          </div>

          {projects.length === 0 ? (

            <div
              style={{
                padding: "30px 0",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  color: "#8c9099",
                  margin: 0,
                }}
              >
                You do not have any projects assigned yet.
              </p>
            </div>

          ) : (

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >

              {projects.map((project) => (

                <div
                  key={project.id}
                  style={{
                    padding: "20px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background:
                      "linear-gradient(135deg, rgba(49,92,255,0.07), rgba(10,12,16,0.7))",
                  }}
                >

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "20px",
                      marginBottom: "15px",
                    }}
                  >

                    <div>
                      <span
                        style={{
                          color: "#d6c2a3",
                          fontSize: "11px",
                          letterSpacing: "1.5px",
                        }}
                      >
                        PROJECT #{project.id}
                      </span>

                      <h3
                        style={{
                          color: "#ffffff",
                          fontSize: "20px",
                          margin: "6px 0 0",
                        }}
                      >
                        {project.name}
                      </h3>
                    </div>

                    <span
                      style={{
                        padding: "6px 12px",
                        borderRadius: "20px",
                        background: "rgba(49,92,255,0.12)",
                        border: "1px solid rgba(49,92,255,0.25)",
                        color: "#8fa8ff",
                        fontSize: "12px",
                        fontWeight: "600",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {project.status}
                    </span>

                  </div>

                  <p
                    style={{
                      color: "#c7c9cf",
                      fontSize: "14px",
                      lineHeight: "1.6",
                      margin: "0 0 18px",
                    }}
                  >
                    {project.description}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      paddingTop: "12px",
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >

                    <span
                      style={{
                        color: "#777c86",
                        fontSize: "12px",
                      }}
                    >
                      Project #{project.id}
                    </span>

                    <span
                      style={{
                        color: "#777c86",
                        fontSize: "12px",
                      }}
                    >
                      Created{" "}
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

        {/* Submit Request */}
        <div className="dashboard-card">

          <div className="dashboard-card-heading">
            <p>CUSTOMER REQUEST</p>

            <h2>Submit a Request</h2>
          </div>

          <form
            onSubmit={handleRequestSubmit}
            className="dashboard-form"
          >

            <div className="dashboard-input-group">

              <label htmlFor="title">
                Request Title
              </label>

              <input
                type="text"
                id="title"
                name="title"
                value={requestForm.title}
                onChange={handleRequestChange}
                placeholder="What do you need?"
                maxLength="200"
                required
              />

            </div>

            <div className="dashboard-input-group">

              <label htmlFor="category">
                Category
              </label>

              <input
                type="text"
                id="category"
                name="category"
                value={requestForm.category}
                onChange={handleRequestChange}
                placeholder="e.g. Web Development"
                maxLength="100"
                required
              />

            </div>

            <div className="dashboard-input-group">

              <label htmlFor="description">
                Description
              </label>

              <textarea
                id="description"
                name="description"
                value={requestForm.description}
                onChange={handleRequestChange}
                placeholder="Describe what you need..."
                maxLength="2000"
                rows="5"
                required
              />

            </div>

            <div className="dashboard-input-group">

              <label htmlFor="request-file">
                Attachment
              </label>

              <input
                type="file"
                id="request-file"
                onChange={handleFileChange}
              />

              <small
                style={{
                  color: "#777c86",
                  fontSize: "12px",
                  marginTop: "6px",
                }}
              >
                Attach a file related to your request (optional).
              </small>

            </div>

            <button
              type="submit"
              className="dashboard-save-button"
            >
              Submit Request
            </button>

          </form>

          {requestMessage && (
            <p className="success-message">
              {requestMessage}
            </p>
          )}

          {requestError && (
            <p className="error-message">
              {requestError}
            </p>
          )}

        </div>

        {/* My Requests */}
        <div className="dashboard-card">

          <div className="dashboard-card-heading">
            <p>MY REQUESTS</p>

            <h2>Your Requests</h2>
          </div>

          {requests.length === 0 ? (

            <div
              style={{
                padding: "30px 0",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  color: "#8c9099",
                  margin: 0,
                }}
              >
                You have not submitted any requests yet.
              </p>
            </div>

          ) : (

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >

              {requests.map((request) => (

                <div
                  key={request.id}
                  style={{
                    padding: "20px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background:
                      "linear-gradient(135deg, rgba(49,92,255,0.07), rgba(10,12,16,0.7))",
                    boxShadow:
                      "0 8px 25px rgba(0,0,0,0.15)",
                  }}
                >

                  {/* Top row */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "20px",
                      marginBottom: "14px",
                    }}
                  >

                    <div>

                      <h3
                        style={{
                          margin: "0 0 7px",
                          color: "#ffffff",
                          fontSize: "18px",
                        }}
                      >
                        {request.title}
                      </h3>

                      <span
                        style={{
                          display: "inline-block",
                          padding: "5px 10px",
                          borderRadius: "20px",
                          background: "rgba(49,92,255,0.12)",
                          border:
                            "1px solid rgba(49,92,255,0.25)",
                          color: "#8fa8ff",
                          fontSize: "12px",
                        }}
                      >
                        {request.category}
                      </span>

                    </div>

                    {/* Status */}
                    <span
                      style={{
                        padding: "6px 12px",
                        borderRadius: "20px",
                        background:
                          request.status === "Completed"
                            ? "rgba(76,175,80,0.12)"
                            : request.status === "Rejected"
                            ? "rgba(220,70,70,0.12)"
                            : "rgba(214,194,163,0.12)",
                        border:
                          request.status === "Completed"
                            ? "1px solid rgba(76,175,80,0.25)"
                            : request.status === "Rejected"
                            ? "1px solid rgba(220,70,70,0.25)"
                            : "1px solid rgba(214,194,163,0.25)",
                        color:
                          request.status === "Completed"
                            ? "#8fd18f"
                            : request.status === "Rejected"
                            ? "#e58b8b"
                            : "#d6c2a3",
                        fontSize: "12px",
                        fontWeight: "600",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {request.status}
                    </span>

                  </div>

                  {/* Description */}
                  <p
                    style={{
                      color: "#c7c9cf",
                      fontSize: "14px",
                      lineHeight: "1.6",
                      margin: "0 0 15px",
                    }}
                  >
                    {request.description}
                  </p>

                  {/* Attachment */}
                  {request.document_name && (
                    <div
                      style={{
                        marginBottom: "15px",
                        padding: "12px 14px",
                        borderRadius: "10px",
                        background: "rgba(214,194,163,0.06)",
                        border: "1px solid rgba(214,194,163,0.12)",
                      }}
                    >
                      <span
                        style={{
                          color: "#777c86",
                          fontSize: "12px",
                          display: "block",
                          marginBottom: "5px",
                        }}
                      >
                        Attachment
                      </span>

                      <a
                        href={`http://localhost:5000/uploads/${request.file_name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#8fa8ff",
                          fontSize: "14px",
                          textDecoration: "none",
                        }}
                      >
                        📎 {request.document_name}
                      </a>
                    </div>
                  )}

                  {/* Bottom information */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingTop: "12px",
                      borderTop:
                        "1px solid rgba(255,255,255,0.06)",
                    }}
                  >

                    <span
                      style={{
                        color: "#777c86",
                        fontSize: "12px",
                      }}
                    >
                      Request #{request.id}
                    </span>

                    <span
                      style={{
                        color: "#777c86",
                        fontSize: "12px",
                      }}
                    >
                      Submitted{" "}
                      {new Date(
                        request.created_at
                      ).toLocaleDateString()}
                    </span>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default CustomerDashboard;