import { useEffect, useState } from "react";
import {
  FaInstagram,
  FaSnapchatGhost,
  FaYoutube,
  FaLinkedinIn,
  FaGithub,
} from "react-icons/fa";
import fevenImage from "./assets/feven.jpeg";

function App() {
  const [showTopButton, setShowTopButton] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("FORM DATA BEING SENT:", formData);

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
        alert(data.error);
        return;
      }

      alert(data.message);

      // Clear the form after successful submission
      setFormData({
        full_name: "",
        email: "",
        subject: "",
        message: "",
      });

    } catch (error) {
      console.error("Error:", error);

      alert("Unable to send your message. Please try again.");
    }
  };

  useEffect(() => {
    const cards = document.querySelectorAll(".reveal-card");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      {
        threshold: 0.2,
      }
    );

    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowTopButton(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div>

      {/* =========================
          NAVIGATION
      ========================= */}
      <nav>
        <a href="#" className="nav-logo">
          FEVORA
        </a>

        <div className="nav-links">
          <a href="#solutions">Solutions</a>
          <a href="#technology">Technology</a>
          <a href="#about">About</a>
          <a href="#inquiry">Contact</a>
        </div>

        <a href="#contact" className="nav-button">
          Get Started
        </a>
      </nav>


      {/* =========================
          HERO
      ========================= */}
      <section className="hero">
        <div className="hero-content">

          <p className="eyebrow">
            SOFTWARE • TECHNOLOGY • INNOVATION
          </p>

          <h1>
            Technology,
            <br />
            <span>refined.</span>
          </h1>

          <p className="hero-description">
            FEVORA creates intelligent digital solutions designed
            to help businesses move faster, work smarter, and scale further.
          </p>

          <div className="hero-buttons">
            <a href="#solutions" className="hero-main-button">
              Explore Solutions →
            </a>

            <a href="#about" className="hero-secondary-button">
              Discover FEVORA
            </a>
          </div>

        </div>


        <div className="hero-visual">

          <div className="orb orb-one"></div>
          <div className="orb orb-two"></div>
          <div className="orb orb-three"></div>
          <div className="orb orb-four"></div>

          <div className="hero-center">
            <span>🤖</span>
          </div>

          <div className="orbit orbit-one"></div>
          <div className="orbit orbit-two"></div>

        </div>
      </section>


      {/* =========================
          SOLUTIONS
      ========================= */}
      <section id="solutions">

        <p>WHAT WE DO</p>

        <h2>
          Digital solutions
          <br />
          for ambitious businesses.
        </h2>

        <div className="solutions-grid">

          <div className="solution-card">
            <span>01</span>

            <h3>Web Development</h3>

            <p>
              High-performance websites and web applications
              designed to help businesses grow online.
            </p>
          </div>


          <div className="solution-card">
            <span>02</span>

            <h3>Brand & Logo Design</h3>

            <p>
              Distinctive visual identities and logos that make
              businesses recognizable and memorable.
            </p>
          </div>


          <div className="solution-card">
            <span>03</span>

            <h3>AI Solutions</h3>

            <p>
              Intelligent tools and automation that simplify
              workflows and unlock new possibilities.
            </p>
          </div>


          <div className="solution-card">
            <span>04</span>

            <h3>Cloud Solutions</h3>

            <p>
              Secure and scalable cloud systems built to support
              modern businesses as they grow.
            </p>
          </div>


          <div className="solution-card">
            <span>05</span>

            <h3>UI/UX Design</h3>

            <p>
              Thoughtful digital experiences that combine
              beautiful design with effortless usability.
            </p>
          </div>


          <div className="solution-card">
            <span>06</span>

            <h3>Custom Software</h3>

            <p>
              Tailored software solutions built around the
              unique needs of your business.
            </p>
          </div>

        </div>
      </section>


      {/* =========================
          TECHNOLOGY
      ========================= */}
      <section id="technology" className="technology-section">

        <div className="technology-header">

          <p>OUR TECHNOLOGY</p>

          <h2>
            Built with modern technology.
          </h2>

          <p className="technology-description">
            We use modern development tools and technologies
            to create fast, reliable, scalable, and intelligent
            digital experiences.
          </p>

        </div>


        <div className="technology-grid">

          <div className="technology-card">

            <div className="technology-top">
              <span>01</span>

              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg"
                alt="React logo"
              />
            </div>

            <h3>React</h3>

            <p>
              Modern interfaces built for speed, flexibility,
              and scalable digital experiences.
            </p>

          </div>


          <div className="technology-card">

            <div className="technology-top">
              <span>02</span>

              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg"
                alt="JavaScript logo"
              />
            </div>

            <h3>JavaScript</h3>

            <p>
              Powerful functionality and interactive experiences
              across modern web applications.
            </p>

          </div>


          <div className="technology-card">

            <div className="technology-top">
              <span>03</span>

              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg"
                alt="Python logo"
              />
            </div>

            <h3>Python</h3>

            <p>
              Reliable backend systems, automation, data processing,
              and intelligent applications.
            </p>

          </div>


          <div className="technology-card">

            <div className="technology-top">
              <span>04</span>

              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg"
                alt="Node.js logo"
              />
            </div>

            <h3>Node.js</h3>

            <p>
              Fast and scalable backend services for modern
              web applications and APIs.
            </p>

          </div>


          <div className="technology-card">

            <div className="technology-top">
              <span>05</span>

              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg"
                alt="Cloud technology logo"
              />
            </div>

            <h3>Cloud</h3>

            <p>
              Scalable infrastructure designed to support
              growing businesses and applications.
            </p>

          </div>


          <div className="technology-card">

            <div className="technology-top">
              <span>06</span>

              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg"
                alt="Git logo"
              />
            </div>

            <h3>Git</h3>

            <p>
              Reliable version control and collaborative
              development for modern software teams.
            </p>

          </div>

        </div>

      </section>


      {/* =========================
          ABOUT
      ========================= */}
      <section id="about" className="about-section">

        <div className="about-intro">

          <p>ABOUT FEVORA</p>

          <h2>
            We turn ideas into
            <br />
            digital reality.
          </h2>

          <p className="about-description">
            FEVORA is a technology and digital solutions company helping
            businesses build, transform, and grow in an increasingly digital world.
            From powerful websites and distinctive branding to intelligent AI
            and scalable cloud solutions, we bring technology and creativity together.
          </p>

        </div>


        <div className="about-grid">

          <div className="about-card">

            <span>01</span>

            <h3>Think Forward</h3>

            <p>
              We look beyond today's problems to create solutions
              that are ready for tomorrow.
            </p>

          </div>


          <div className="about-card">

            <span>02</span>

            <h3>Design With Purpose</h3>

            <p>
              Every detail has a reason. We combine thoughtful design
              with technology that delivers real value.
            </p>

          </div>


          <div className="about-card">

            <span>03</span>

            <h3>Build Without Limits</h3>

            <p>
              We create flexible digital solutions that grow alongside
              the businesses we work with.
            </p>

          </div>

        </div>


        <div className="about-statement">

          <span>FEVORA</span>

          <div className="founder">

            <img
              src={fevenImage}
              alt="Feven Solomon - Founder & CEO"
            />

            <div className="founder-info">
              <h3>Feven Solomon</h3>
              <p>Founder & CEO</p>
            </div>

          </div>

          <div className="statement-content">

            <p>
              The future belongs to those who build it.
            </p>

            <p>
              At FEVORA, we transform bold ideas into innovative digital solutions designed to help businesses grow,
              adapt, and lead. From concept to creation, we combine technology, creativity, and strategy to turn your
              vision into something real, impactful, and ready for what comes next.
            </p>

          </div>

        </div>

      </section>


      {/* =========================
          START A PROJECT
      ========================= */}
      <section id="contact">

        <p>START A PROJECT</p>

        <h2>
          Ready to build what's next?
        </h2>

        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="contact-button"
        >
          Let's Talk →
        </a>

        <p className="contact-email">
          hello@fevora.com
        </p>

      </section>


      {/* =========================
          CONTACT / INQUIRY
      ========================= */}
      <section id="inquiry" className="inquiry-section">

        <p>CONTACT / INQUIRY</p>

        <h2>
          Have a question? We'd love to hear from you.
        </h2>

        <p className="inquiry-description">
          Tell us a little about what you have in mind and
          we'll get back to you.
        </p>

        <form onSubmit={handleSubmit} className="inquiry-form">

          <input
            type="text"
            name="full_name"
            placeholder="Your Name"
            value={formData.full_name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="subject"
            placeholder="Subject"
            value={formData.subject}
            onChange={handleChange}
            required
          />

          <textarea
            name="message"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleChange}
            rows="6"
            required
          ></textarea>

          <button type="submit">
            Send Message →
          </button>

        </form>

      </section>


      {/* =========================
          PROFESSIONAL FOOTER
      ========================= */}
      <footer>

        <div className="footer-main">

          {/* BRAND */}
          <div className="footer-brand">

            <a href="#" className="footer-logo">
              FEVORA
            </a>

            <p>
              Technology, design, and intelligent digital
              solutions for ambitious businesses.
            </p>

            <p className="footer-tagline">
              Software. Technology. Innovation.
            </p>


            <p className="social-title">
              FOLLOW US
            </p>

            <div className="social-links">

              <a
                href="#"
                className="social-icon"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>

              <a
                href="#"
                className="social-icon"
                aria-label="Snapchat"
              >
                <FaSnapchatGhost />
              </a>

              <a
                href="#"
                className="social-icon"
                aria-label="YouTube"
              >
                <FaYoutube />
              </a>

              <a
                href="#"
                className="social-icon"
                aria-label="LinkedIn"
              >
                <FaLinkedinIn />
              </a>

              <a
                href="#"
                className="social-icon"
                aria-label="GitHub"
              >
                <FaGithub />
              </a>

            </div>

          </div>


          {/* EXPLORE */}
          <div className="footer-column">

            <h4>EXPLORE</h4>

            <a href="#solutions">
              Solutions
            </a>

            <a href="#technology">
              Technology
            </a>

            <a href="#about">
              About
            </a>

            <a href="#contact">
              Contact
            </a>

          </div>


          {/* SOLUTIONS */}
          <div className="footer-column">

            <h4>SOLUTIONS</h4>

            <a href="#solutions">
              Web Development
            </a>

            <a href="#solutions">
              Brand & Logo Design
            </a>

            <a href="#solutions">
              Custom Software
            </a>

            <a href="#solutions">
              AI Solutions
            </a>

            <a href="#solutions">
              Cloud Solutions
            </a>

            <a href="#solutions">
              UI/UX Design
            </a>

          </div>


          {/* COMPANY */}
          <div className="footer-column">

            <h4>COMPANY</h4>

            <a href="#about">
              Our Approach
            </a>

            <a href="#about">
              Why FEVORA
            </a>

            <a href="#contact">
              Work With Us
            </a>

            <a href="#" onClick={(e) => e.preventDefault()}>
              Email Us
            </a>

          </div>


          {/* CONTACT */}
          <div className="footer-column">
            <h4>CONTACT</h4>

            <p>Have a question?</p>

            <a href="#inquiry" className="footer-contact-link">
              Contact / Inquiry →
            </a>

            <p>Digital-first Worldwide</p>
          </div>

        </div>


        {/* FOOTER BOTTOM */}
        <div className="footer-bottom">

          <div className="footer-legal">

            <a href="#" onClick={(e) => e.preventDefault()}>
              Privacy & Cookies
            </a>

            <a href="#" onClick={(e) => e.preventDefault()}>
              Manage cookies
            </a>

            <a href="#" onClick={(e) => e.preventDefault()}>
              Terms of Use
            </a>

            <a href="#" onClick={(e) => e.preventDefault()}>
              Accessibility
            </a>

          </div>

          <p className="copyright">
            © 2026 FEVORA. All rights reserved.
          </p>

        </div>

      </footer>


      {/* =========================
          BACK TO TOP
      ========================= */}
      {showTopButton && (
        <button
          className="back-to-top"
          onClick={scrollToTop}
          aria-label="Back to top"
        >
          ↑
        </button>
      )}

    </div>
  );
}

export default App;