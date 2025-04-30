import React, { useState } from "react";
import "./landing-01.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "src/utils/jsonData";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const summaryData = [
  {
    title: "Positive Culture",
    b1: "REPS features the latest positive shout-outs at the top of every page, emphasizing what’s going well in the school instead of focusing what’s going wrong",
    b2: "Teachers receive insights into their ratio of positive to negative parent communication, promoting a healthy balance of support and accountability.",
    b3: "We support support PBIS strategies through an integrated token economy system",
  },

  {
    title: "Improved Communication",
    b1: "Streamline parent communication by combining contacting and logging into a single step.",
    b2: "Teachers can easily send mass messages to multiple students parents who need the same communication.",
    b3: "Streamline communication within the school to identify students requiring additional support, those requiring additional accountability, and informing mentors/coaches when students on their team/caseload receive new parent communication.",
  },

  {
    title: "Supports for Exceptional Students",
    b1: "Modified assignments help ensure that students with IEPs and 504 plans are held accountable for their learning in a way that is fair and tailored to their needs.",
    b2: "The suspension tracker in conjunction with restorative assignments reduces time outside of the class and informs administrators when additional services may be needed.",
  },

  {
    title: "Data That Inspires Action",
    b1: "Teachers have access to a dashboard that provides, a snap shot for the week, longitudinal data for their class, an overview of parent communication, students requiring support, and those who have not been recently received parent communication.",
    b2: "The admin dashboard identifies students and teachers requiring assistance, highlights the classroom with the greatest needs per period, and additional longitudinal school data.",
  },

  {
    title: "Automated Support",
    b1: "Provide teachers with clear, user-friendly standard operating procedures (SOPs) and leverage automation to ensure consistent and faithful implementation.",
    b2: "Automatically advance students through the progressive discipline plan, increasing support at each level.",
    b3: "Utilize a dashboard with automated reminders for follow-up appointments and streamline school counselor support",
  },
];

const testimonialData = [
  {
    text: "The immediacy of the system allowed me to restore a relationship that was damaged after I wrote up for being tardy. After completing the referral, the mother informed me that the student was late because their father was undergoing emergency surgery. This allowed me to remove the referral, check in with the student, and restore the relationship.",
  },
  {
    text: "With other discipline management systems, we always see the negatives, but with REPS, we were able to see the positive things other teachers were saying about our students. This made it so much easier to start productive conversations with my students and allowed the students to feel seen when they are doing something positive.",
  },
  {
    text: "The system was so much easier to work with than our previous behavior management system. I no longer had to keep track of which offense the students were on, and the dashboard provided insights that led to a change in how I managed cell phones, which significantly improved class participation..",
  },
];

const LandingPage = () => {
  const [text, setText] = useState(""); // Initialize state for the textarea
  const [booking, setBooking] = useState<boolean>(false);

  const handleScroll = (event: any) => {
    const targetId = event.target.getAttribute("data-target");
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const openLogin = () => {
    if (modalType === "login") {
      setModalType("");
    } else {
      setModalType("login");
    }
  };

  const [bookingMessage, setBookingMessage] = useState(false);

  const HandleDemoBooking = async (event: {
    preventDefault: () => void;
    currentTarget: HTMLFormElement | undefined;
  }) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const payload = {
      email: data.get("email"),
      subject: "Book A Demo",
      message: `Name:  ${data.get("firstName")} ${data.get("lastName")}
                        Contact: Phone ${data.get("phoneNumber")}, Email: ${data.get("email")}
                        Distict/State: ${data.get("district")} / ${data.get("state")}
                        Inquiry Message: ${data.get("multiline-text")}
                    
                            `,
    };

    axios
      .post(`${baseUrl}/contact-us`, payload)
      .then((response) => {
        setText("");
        setBookingMessage(true);
        setTimeout(() => {
          setBookingMessage(false);
        }, 3000);
      })
      .catch((error) => console.error(error));
  };

  const [warningToast, setWarningToast] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const routeChange = (role: string) => {
    if (role === "TEACHER") {
      let path = "/dashboard/teacher";
      navigate(path);
    }
    if (role === "STUDENT") {
      let path = "/dashboard/student";
      navigate(path);
    }
    if (role === "ADMIN") {
      let path = "/dashboard/admin";
      navigate(path);
    }
    if (role === "GUIDANCE") {
      let path = "/dashboard/guidance";
      navigate(path);
    }
  };

  const [modalType, setModalType] = useState("");

  const HandleLogin = async (event: {
    preventDefault: () => void;
    currentTarget: HTMLFormElement | undefined;
  }) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload = {
      username: data.get("username"),
      password: data.get("password"),
    };
    setLoading(true);

    try {
      const res = await axios.post(`${baseUrl}/auth`, payload);
      if (res.data?.userModel) {
        const token = res.data.response;
        const userName = res.data.userModel.firstName;
        const schoolName = res.data.userModel.schoolName;
        const email = res.data.userModel.username;
        const role = res.data.userModel.roles[0]["role"];
        sessionStorage.setItem("Authorization", token);
        sessionStorage.setItem("userName", userName);
        sessionStorage.setItem("schoolName", schoolName);
        sessionStorage.setItem("email", email);
        sessionStorage.setItem("role", role);
        setLoading(false);
        routeChange(role);
        setModalType("");
      } else {
        // Handle the case where the expected data is missing
        console.error(
          "Data or userModel is null or undefined in the response."
        );
        // You can set a warning or error state here if needed
        setLoading(false);
        setWarningToast(true);
        setTimeout(() => {
          setWarningToast(false);
        }, 2000);
      }
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
      setWarningToast(true);
      setTimeout(() => {
        setWarningToast(false);
      }, 2000);
      //
      // Handle the error as needed
    }
  };

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setWarningToast(false);
  };

  return (
    <div>
      <header className="landing-header">
        <div className="logo-container">
          <img src="/repsLogo.png" alt="REPS BMS Logo" className="logo" />
          <span
            className="logo-title"
            style={{ fontSize: 40, fontWeight: "bolder", fontFamily: "Nunito" }}
          >
            Reps Discipline
          </span>
        </div>
        <nav className="nav-menu">
          <div
            data-target="about"
            style={{ fontSize: 18, fontFamily: "Nunito" }}
            onClick={handleScroll}
          >
            About Us
          </div>
          <div
            data-target="features"
            style={{ fontSize: 18, fontFamily: "Nunito" }}
            onClick={handleScroll}
          >
            Features
          </div>
          <div
            data-target="solutions"
            style={{ fontSize: 18, fontFamily: "Nunito" }}
            onClick={handleScroll}
          >
            Solutions
          </div>
          <button
            className="demo-button"
            data-target="demo"
            style={{ fontSize: 18, fontFamily: "Nunito" }}
            onClick={handleScroll}
          >
            Demo Request
          </button>
        </nav>
        <button
          className="landing-header-menu-login"
          style={{ fontSize: 24, fontFamily: "Nunito", fontWeight: "bolder" }}
          onClick={() => openLogin()}
        >
          Login
        </button>
      </header>
      {modalType === "login" && (
        <div
          style={{ height: "auto", background: "red" }}
          className="login-modal"
        >
          <form className="form-container" onSubmit={HandleLogin}>
            <div className="form-row">
              <div className="form-column">
                <label htmlFor="uName">User Name*</label>
                <br />
                <input type="text" id="uName" name="username" />
              </div>
              <div className="form-column">
                <label htmlFor="password">Password*</label>
                <br />
                <input type="password" id="password" name="password" />
              </div>
            </div>
            <a href="/forgot-password">Forgot Password?</a>

            <Snackbar
              open={warningToast}
              autoHideDuration={6000}
              onClose={handleClose}
            >
              <Alert
                onClose={handleClose}
                severity="error"
                sx={{ width: "100%" }}
              >
                Email or Password is incorrect
              </Alert>
            </Snackbar>
            <input type="submit" value={loading ? "Loading..." : "Sign In"} />
          </form>
        </div>
      )}
      <div className="intro-panel"></div>
      <div id="features" className="intro-panel-cards">
        <div className="ip-card">
          <img className="ip-card-img" src="thumbimg.png" alt="thumbs up" />

          <div className="ip-card-content">Supports a Positive Culture</div>
        </div>

        <div className="ip-card">
          <img
            className="ip-card-img"
            src="messageimg.png"
            alt="message bubbles"
          />

          <div className="ip-card-content">Improves Communication</div>
        </div>

        <div className="ip-card">
          <img className="ip-card-img" src="notepadimg.png" alt="imag" />

          <div className="ip-card-content">
            Supports for Exceptional Students
          </div>
        </div>

        <div className="ip-card">
          <img className="ip-card-img" src="graphimg.png" alt="graph" />

          <div className="ip-card-content">Data that inspires Action</div>
        </div>

        <div className="ip-card">
          <img className="ip-card-img" src="gearautomation.png" alt="gears" />

          <div className="ip-card-content">Automated Support</div>
        </div>

        <div className="ip-card">
          <img className="ip-card-img" src="custominzeimg.png" alt="imag" />
          <div className="ip-card-content">Customzied to your school</div>
        </div>
      </div>
      <div className="landing-summary-container">
        {summaryData.map((sum) => {
          return (
            <div className="landing-summary-container-points">
              <div className="point-title">{sum.title}</div>

              <ul className="bullet">
                <li>{sum.b1}</li>
                <li>{sum.b2}</li>
                {sum.b3 && <li>{sum.b3}</li>}
              </ul>
            </div>
          );
        })}
        <div className="landing-summary-container-points">
          <div className="point-title">Customized to Your School</div>
          <p>
            REPS knows that each school comes with its strengths and challenges
            and we welcome the opportunity to provide customization in the form
            of:
          </p>
          <ul className="bullet">
            <li>
              Creating automation to adhere to your schools progressive
              discipline plan.{" "}
            </li>
            <li>
              The ability to add and change restorative assignments and support
              assignment to meet the needs of your students.{" "}
            </li>
            <li>
              The integration of additional tools and reports for teachers,
              admin and students
            </li>
          </ul>
        </div>
      </div>
      <div className="about-us" id="about">
        <div className="about-container">
          <div className="about-us-title">About Us</div>
          <div className="about-us-content">
            REPS Behavior Management was created by two math teachers and
            coaches who wanted to increase data collection, streamline decision
            making processes and leverage coaching principles in the classroom.
            We believe good coaches approach with an asset focus, maintain high
            expectations, use productive means to hold athletes accountable,
            develop a sense of community and continue to grow themselves. REPS
            mirrors this approach by starting with what’s going well, when
            necessary providing support and accountability that is designed to
            benefit the student, involves the parents/guardians, improves
            communication between teachers, administrators and school counselors
            and provides data for continued improvement.
          </div>
        </div>
      </div>

      <div className="testimonials-container" id="testimonials">
        <div className="testimonial-title">Testimonials</div>
        <div className="testimonial-carrousel">
          {testimonialData.map((item) => {
            return (
              <div className="testimonial" key={item.text}>
                {item.text}
              </div>
            );
          })}
        </div>
      </div>

      <div className="book-your-demo-container" id="book-your-demo">
        <div className="demo-text">
          <span className="form-logo-text">
            REPS <span className="form-logo-2">BMS</span>
          </span>{" "}
          <span className="form-text-content">
            {" "}
            is looking to partner with 3 more schools this year to take part in
            a free pilot program. We’re looking for schools that want to:
            <ul className="bullet">
              <li>
                Improve communication between support structures within and
                outisde of school
              </li>
              <li>Empower teachers to manage behavior within the classroom</li>
              <li>Leverage automation to improve student performance.</li>
            </ul>
          </span>
        </div>
        {bookingMessage ? (
          <div id="demo" className="book-your-demo-form">
            <h1>Thank you for your Interest</h1>
            <h2>A REP BMS representative you contact you shortly.</h2>
          </div>
        ) : (
          <div id="demo" className="book-your-demo-form">
            <div className="form-header">
              <h1>Book Your Demo!</h1>
              <span>
                Fill out the form below and we’ll reach out as soon as possible
                to discuss ways that we can help meet your school’s needs.
              </span>
            </div>
            <form className="form-container" onSubmit={HandleDemoBooking}>
              <div className="form-row">
                <div className="form-column">
                  <label htmlFor="fname">First Name*</label>
                  <br />
                  <input type="text" id="fname" name="firstName" />
                </div>
                <div className="form-column">
                  <label htmlFor="lname">Last Name*</label>
                  <br />
                  <input type="text" id="lname" name="lastName" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-column">
                  <label htmlFor="email">Email*</label>
                  <br />
                  <input type="email" id="email" name="email" />
                </div>
                <div className="form-column">
                  <label htmlFor="pnumber">Phone Number*</label>
                  <br />
                  <input type="text" id="pnumber" name="phoneNumber" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-column">
                  <label htmlFor="district">School/District*</label>
                  <br />
                  <input type="text" id="district" name="district" />
                </div>
                <div className="form-column">
                  <label htmlFor="state">State*</label>
                  <br />
                  <input type="text" id="state" name="state" />
                </div>
              </div>
              <label htmlFor="multiline-text">
                What do you hope to learn more about:
              </label>
              <br />

              <div className="form-row full-width">
                <textarea
                  id="multiline-text"
                  name="multiline-text"
                  rows={4}
                  cols={50}
                  value={text} // Bind the value to the state variable 'text'
                  onChange={(e) => setText(e.target.value)} // Update 'text' when user types
                />
              </div>

              <input type="submit" value="Submit" />
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
