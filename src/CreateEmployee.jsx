import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CreateEmployee() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/admin/create-employee",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Employee creation failed.");
        return;
      }

      setMessage("Employee account created successfully!");

      setFormData({
        full_name: "",
        email: "",
        password: "",
      });

    } catch (error) {
      console.error("Employee creation error:", error);
      setError("Unable to connect to the server.");
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">

        <div className="register-header">
          <h1>Create Employee</h1>
          <p>Create a new Fevora employee account.</p>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label htmlFor="full_name">Full Name</label>

            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Enter employee name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>

            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter employee email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              required
            />
          </div>

          <button type="submit">
            Create Employee
          </button>

        </form>

        <button
          type="button"
          className="auth-switch"
          onClick={() => navigate("/content")}
        >
          Back to Admin
        </button>

        {message && (
          <p className="success-message">{message}</p>
        )}

        {error && (
          <p className="error-message">{error}</p>
        )}

      </div>
    </div>
  );
}

export default CreateEmployee;