import { useState } from "react";

function Contact() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusType, setStatusType] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear previous status when the user starts editing again
    if (status) {
      setStatus("");
      setStatusType("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsSubmitting(true);
    setStatus("Sending...");
    setStatusType("sending");

    try {
      const response = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus(data.error || "Something went wrong. Please try again.");
        setStatusType("error");
        return;
      }

      setStatus(
        data.message ||
          "Your message has been received. We'll be in touch soon."
      );
      setStatusType("success");

      setFormData({
        full_name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      setStatus(
        "Unable to connect to the server. Please try again later."
      );
      setStatusType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">

      <p className="contact-eyebrow">
        CONTACT FEVORA
      </p>

      <h1>
        Have a question?
        <br />
        We'd love to hear from you.
      </h1>

      <p className="contact-description">
        Whether you have a question, want to learn more about
        our services, or simply want to get in touch, send us
        a message and we'll get back to you.
      </p>

      <form
        className="contact-form"
        onSubmit={handleSubmit}
      >

        {/* FULL NAME */}
        <div className="form-group">
          <label htmlFor="full_name">
            Full Name
          </label>

          <input
            type="text"
            id="full_name"
            name="full_name"
            placeholder="Your full name"
            value={formData.full_name}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

        {/* EMAIL */}
        <div className="form-group">
          <label htmlFor="email">
            Email
          </label>

          <input
            type="email"
            id="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

        {/* SUBJECT */}
        <div className="form-group">
          <label htmlFor="subject">
            Subject
          </label>

          <input
            type="text"
            id="subject"
            name="subject"
            placeholder="What is your message about?"
            value={formData.subject}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

        {/* MESSAGE */}
        <div className="form-group">
          <label htmlFor="message">
            Message
          </label>

          <textarea
            id="message"
            name="message"
            placeholder="How can we help?"
            rows="6"
            value={formData.message}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          ></textarea>
        </div>

        <button
          type="submit"
          className="contact-page-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending..." : "Send Message →"}
        </button>

      </form>

      {status && (
        <p className={`contact-status ${statusType}`}>
          {status}
        </p>
      )}

      <p className="contact-email">
        hello@fevora.com
      </p>

    </div>
  );
}

export default Contact;