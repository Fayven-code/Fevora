import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();
  const [formData, setFormData] = useState({
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
      const response = await fetch(
        "http://localhost:5000/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed.");
        return;
      }

      // Save the authentication token
      localStorage.setItem("token", data.token);

      // Save basic user information
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      if (data.user.role === "admin") {
        navigate("/content");
      } else {
        navigate("/");
      }

      setMessage("Login successful!");
      navigate("/content");

    } catch (error) {
      console.error("Login error:", error);
      setError("Unable to connect to the server.");
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">

        <div className="register-header">
          <h1>Welcome back</h1>
          <p>Log in to your Fevora account.</p>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label htmlFor="email">Email</label>

            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
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
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit">
            Log In
          </button>

        </form>

        <p className="auth-switch">
            Don't have an account?{" "}
            <button
                type="button"
                onClick={() => navigate("/register")}
            >
                Register
            </button>
        </p>

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

export default Login;