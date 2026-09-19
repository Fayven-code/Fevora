import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function CustomerDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [project, setProject] = useState(null);
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

  const fetchProject = async () => {
    try {
        const response = await fetch(
            "http://localhost:5000/api/customer/project",
            {
                headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            }
            );

            const data = await response.json();

            if (!response.ok) {
            return;
            }

            setProject(data);
        } catch (error) {
            console.error("Error fetching project:", error);
        }
    };

  // Load profile when dashboard opens
  useEffect(() => {
    fetchProfile();
    fetchProject();
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

        {/* My Project */}
        <div className="dashboard-card">

            <div className="dashboard-card-heading">
                <p>MY PROJECT</p>

                <h2>Your Fevora Project</h2>
            </div>

            <div className="dashboard-info">

                <div>
                    <span>Project</span>
                    <strong>
                    {project ? project.subject : "No project yet"}
                    </strong>
                </div>

                <div>
                    <span>Status</span>
                    <strong>Pending</strong>
                </div>

                <div>
                    <span>Category</span>
                    <strong>Digital Solution</strong>
                </div>

                <div>
                    <span>Requested</span>
                    <strong>
                    {project
                        ? new Date(project.created_at).toLocaleDateString()
                        : "—"}
                    </strong>
                </div>

            </div>

                <div style={{ marginTop: "15px" }}>
                    <span style={{ color: "#8c9099", fontSize: "13px" }}>
                        Project Description
                    </span>

                    <p style={{ color: "#c7c9cf", lineHeight: "1.4", marginBottom: "0" }}>
                        {project
                        ? project.message
                        : "You have not submitted a project request yet."}
                    </p>
                </div>

            </div>

        </div>

    </div>
  );
}

export default CustomerDashboard;