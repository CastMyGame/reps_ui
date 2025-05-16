import React, { useState } from "react";
import "./landing-01.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "src/utils/jsonData";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { Column } from "jspdf-autotable";
import { relative } from "path";
import { red } from "@mui/material/colors";
import { height } from "@mui/system";
import { AccordionItem } from "./AccordianItem";

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
  const [formData, setFormData] = useState({
    firstName: '',
    lastName:'',
    email: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  
  

  const [bookingMessage, setBookingMessage] = useState(false);

  

  const HandleDemoBooking = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  
    const payload = {
      email: formData.email,
      subject: "Book A Demo - Landing Page",
      message: `Name:  ${formData.firstName} ${formData.lastName}
                Contact:Email: ${formData.email}
                Inquiry Message: ${formData.message}`,
    };
  
    try {
      await axios.post(`${baseUrl}/contact-us`, payload);
      setText(""); // assuming this clears some UI text
      setBookingMessage(true);
      setTimeout(() => {
        setBookingMessage(false);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          message: ''
        });
      }, 3000);
    } catch (error) {
      console.error(error);
    }
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
    <div className="full-width-container" >
      
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
                <a href="/forgot-password">Forgot Password?</a>
              </div>
            </div>

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
            <input style={{borderRadius:30,width:"200px",height:'20px'}} type="submit" value={loading ? "Loading..." : "Sign In"} />
          </form>
        </div>
      )}

        {/* TOP HEADER */}
  <div>
  {/* Inline SVG positioned in bottom right */}
 


  <div style={{height:"max-content", display:"flex",flexDirection:'column'
  }}className="section-00">

  <header style={{padding:'15px 15px',height:"100px",zIndex:3,width:'100%',backgroundColor:"#F5F8FF"}} className="landing-header">
        <div className="logo-container">
          {/* <img src="/repsLogo.png" alt="REPS BMS Logo" className="logo" /> */}
          <span
            className="logo-title"
            style={{ fontSize: "30px", fontWeight: "bolder", fontFamily: "'Poppins', sans-serif" }}
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
          style={{ fontSize: 20, fontFamily: "Nunito", fontWeight: "bolder" }}
          onClick={() => openLogin()}
        >
          Login
        </button>
      </header>


    <section  className="section-01">
    <svg
    id="heroShape"
    viewBox="0 0 359 496"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      position: 'absolute',
      bottom: 0,
      right: 0,
      height: '100%', // or use a specific height like '300px'
      zIndex: 0 // Put behind text/image if needed
    }}
  >
    <path
      d="M340.849 18.1648C241.663 30.7341 191.813 84.0742 201.889 143.835C212.387 168.38 223.185 189.191 237.691 209.183C252.197 229.174 266.292 251.296 272.526 278.617C278.76 305.938 275.18 339.663 259.159 357.171C247.222 370.21 231.14 371.988 216.086 372.17C184.968 372.548 153.815 368.311 122.774 371.367C91.7323 374.423 60.0316 385.526 35.6095 412.945C17.5498 433.228 3.28068 463.824 0.566162 495.796L446.323 495.796V65.2735L368.184 0.353271V10.9958L340.849 18.1648Z"
      fill="var(--svg-color, #254c4c)"
    />
  </svg>


      <div  className="section-01-01" style={{ width: '50%', height: '90%', zIndex: 1,padding:"50px" }}>
        <div style={{ color: '#254c4c', fontSize: "40px", fontWeight: "bolder", fontFamily: "'Roboto', sans-serif" }}>
          Transform Student Behavior with REPS Discipline
        </div>
        <p style={{ color: '#254c4c', fontSize: "16px", fontWeight: "normal", fontFamily: "'Roboto', sans-serif", marginTop:"15px"}}>
          REPS Discipline offers a comprehensive solution to tackle behavioral challenges in schools, ensuring that every student has the opportunity to succeed academically. Our platform integrates behavior management, proactive communication, and positive reinforcement, paving the way to a more supportive educational environment.
        </p>

        <button className="pill-btn-style" >Schedule a Demo</button>
      </div>

      <div className="section-01-02"

        style={{ width: '50%', height: '90%', zIndex: 1 }}
      >
        <picture>
          <img
          style={{ position:'relative', height:'400px',zIndex:0 }}
          src="/repsLogo.png"
          alt="REPS BMS Logo"
          className="logo"
        />      </picture>

        
      </div>
    </section>

    <section  className="section-02">  



      <div className="section-02-svg"> 
        <svg
      id="halfCirclesShapeLeft"
      viewBox="0 0 135 463"
      xmlns="http://www.w3.org/2000/svg"
      width="135"
      height="463"
      style={{
         position: 'absolute',
         bottom: '0%',
        left: 0,
       height: '100%',
        zIndex: 0,

      }}
    >
      <mask
        id="mask0_19_27294"
        maskUnits="userSpaceOnUse"
        x="-8"
        y="0"
        width="143"
        height="463"
      >
        <rect
          x="-7.09009"
          y="0.258301"
          width="142.09"
          height="462.689"
          fill="#D9D9D9"
        />
      </mask>
      <g mask="url(#mask0_19_27294)">
        <path
          d="M-127.27 500.616L-122.963 -99.284C-78.3191 -80.6641 -43.1438 -56.2003 -22.3787 -17.5959C-7.0405 10.9606 -1.25163 40.9333 2.23722 70.8214C5.25135 96.4902 16.6895 113.357 36.1095 136.106C72.1115 178.284 121.975 220.267 111.176 270.727C98.5772 329.503 5.34573 372.526 -3.0467 431.644C-6.65406 457.342 -65.4077 476.297 -43.5623 497.304L-127.27 500.616Z"
          fill="var(--svg-color2, #3B5E5E)"
          opacity="1"
        />
        <path
          d="M-103.133 418.469L-99.8875 -33.6469C-57.7959 -21.8134 -18.9885 -6.10061 13.3786 14.1109C77.9035 54.4368 113.084 114.398 89.2174 168.524C63.8548 226.158 -21.3317 269.066 -42.5493 327.301C-53.9085 358.524 -45.2038 389.775 -24.2462 418.961L-103.133 418.469Z"
          fill="var(--svg-color, #FF7A35)"
          opacity="0.9"
        />
      </g>
    </svg>

      </div>

    <div className="section-02-inner" 
>

      
            <div className="sections-title">
             Empowering Schools through Innovative Behavior Management Solutions</div>



  <div className="section-02-card-box">
      <div className="section-02-card">
        <img className='section-02-card-img' src="https://landingsite-app-public.s3.us-east-2.amazonaws.com/client-files/eaa29386-62fc-4a88-ad9a-ee20e0f7c168" alt="undefined" />
        <div className='section-02-card-title' >Transformative Data-Driven Insights</div>
        <div className="section-02-card-body"  >Monitor behavior trends and make informed decisions with our real-time analytics, paving the way for targeted interventions and enhanced student outcomes.</div>
      
      </div>
    <div className="section-02-card">
      <img className='section-02-card-img' src="https://landingsite-app-public.s3.us-east-2.amazonaws.com/client-files/e40928a4-18f2-45aa-921c-ae59d9aa172c" alt="undefined"/>
      <div className="section-02-card-title">Proactive Parent Engagement</div>
      <div className="section-02-card-body"  >REPS Discipline simplifies parent communication by combining logging, texting, and emailing into one step, ensuring timely updates and more informed parents.</div>

      </div>

   <div className="section-02-card">
        <img className='section-02-card-img' src="https://landingsite-app-public.s3.us-east-2.amazonaws.com/client-files/eaa29386-62fc-4a88-ad9a-ee20e0f7c168" alt="undefined"/>
        <div className="section-02-card-title">Streamlined Behavior Management
</div>
        <div className="section-02-card-body"  >Simplify disciplinary actions with our automated tracking system that promotes consistency and fairness while focusing on positive behavioral outcomes.</div>
      
      </div>


</div> 

</div>

 


    </section>


    <section  className="section-03">  



      <div className="section-03-image-box">
        <img className='section-03-img' src="https://landingsite-app-public.s3.us-east-2.amazonaws.com/client-files/feb85756-5ccc-4a48-bb5f-613b63c83fc9" alt="undefined"/>
        </div>

    <div className="section-03-content"> 

      
<div className="sections-title">
Stagnant Scores, Soaring Suspensions: It's Time to Fix What's Really Broken             </div>


    <div className="section-03-text" >
      <p>Despite rising per-student spending, smaller class sizes, and better access to technology, student achievement in math and literacy has remained stagnant. At the same time, suspensions and student anxiety are increasing. The takeaway is clear: without intentional systems of accountability and support, even well-resourced schools struggle to meet their potential.

<br/>
REPS transforms schools by making behavior management seamless, data-driven, and restorative—reducing suspensions and improving student outcomes. New initiatives require time and money, but without strong behavior systems and meaningful support, schools risk repeating decades of underwhelming results.

</p>
    </div> 

    <button style={{fontWeight:"bold",borderRadius:30,backgroundColor:'#254c4c',color:"white", marginTop:15}}>Schedule a Demo</button>





</div>

 


    </section>



 

    <section  className="section-04">

    
            {/* Your two content sections */}
      <div className="sections-title" style={{textAlign:"center"}}>What Schools Are Saying About Reps</div>

      <div className="section-04-card-box">
      <div className="section-04-card">
      <div className="section-04-card-body">The immediacy of the system turned what could've been a negative moment into a positive one. After submitting a tardy referral, the student's mother quickly explained they were late due to their father's emergency surgery. I was able to cancel the referral, check in, and strengthen my connection with the student.</div>
      <div className="section-04-card-footer"  ><span style={{color:"black",fontWeight:"bold"}}>Sophia Lee</span><br/><span>Behavior Management Consultant</span>
      </div>      
      </div>

      <div className="section-04-card">
      <div className="section-04-card-body">With other discipline systems, we mostly saw the negatives. But with REPS, we got to see the positive things teachers were saying about our students. It made starting productive conversations so much easier—and helped students feel seen and valued for the good things they were doing.</div>
      <div className="section-04-card-footer"  >
        
      </div>      
      </div>

      <div className="section-04-card">
      <div className="section-04-card-body">This is the most user-friendly behavior management system I've ever used. The dashboards make it easy to spot where support is needed, and the coaching feedback gives us clear direction for helping both students and teachers. It's completely transformed how we approach support school-wide.</div>
      <div className="section-04-card-footer"  >
        
      </div>      
      </div>

      </div>
 

    </section>




{/* FORM */}
    <section  className="section-05">
        <div className="section-05-left">
          <div>
          <div className="sections-title">
          Ready to Enhance Student Behavior and Engagement?</div>
          <div className="call-to-action">
          Get in Touch with Us
        </div>
          </div>
         
        <div>
        <form onSubmit={HandleDemoBooking}>
  <input
    className="section-input"
    type="text"
    name='firstName'
    value={formData.firstName}
    onChange={handleChange}
    placeholder="First Name"
    required
  />

  <input
      className="section-input"
      type="text"
      name='lastName'
      value={formData.lastName}
      onChange={handleChange}
      placeholder="Last Name"
      required
  />

  <input
    className="section-input"
    type="email"
    name="email"
    value={formData.email}
    onChange={handleChange}
    placeholder="Your Email"
      required
  />

  <textarea
        name="message"
        value={formData.message}
        onChange={handleChange}
        placeholder="Message or Inquiry"
        />


  <button
    type="submit"
    style={{
      fontWeight: "bold",
      borderRadius: 30,
      backgroundColor: "#254c4c",
      color: "white",
      marginTop: 15,
      padding: "10px 20px",
      border: "none",
      cursor: "pointer",
    }}
  >
    Schedule a Demo
  </button>
</form>

{bookingMessage && (
  <p style={{ color: "green", marginTop: 10 }}>
    Demo booked successfully! We’ll be in touch.
  </p>
)}


  
  
  
 


        </div>


        
        </div>
      
        <div className="section-05-right" >
        <div className="qa-accordion">
      <AccordionItem question="How does REPS improve behavioral outcomes?" answer="REPS empowers schools by providing a structured approach to behavior management that emphasizes positive reinforcement, enabling educators to effectively track and respond to student behavior in real-time." />
      <AccordionItem question="What support does REPS provide for teachers?" answer="Our platform offers ongoing professional development and training, equipping teachers with the skills and knowledge to leverage REPS effectively and maximize its benefits in managing classroom behavior." />
      <AccordionItem question="How does REPS facilitate parent involvement?" answer="REPS automates communication with parents, providing timely updates on their child's behavior and actionable next steps, fostering a collaborative environment between home and school." />
      <AccordionItem question="What kind of data does REPS provide?" answer="The platform generates comprehensive reports on student behavior trends, allowing educators and administrators to make data-driven decisions to enhance classroom management and policy adjustments." />
      <AccordionItem question="How can schools get started with REPS?" answer="Schools can easily initiate the process by scheduling a demo through our website, where they will receive personalized guidance on integrating REPS into their existing systems." />


    </div>
        </div>
       




   

    </section>


 <section  className="section-footer">  

  <div className="grid-container">
  <div className="item-1">
  <div className="sections-title">Reps Discipline</div>
    <div className='sub-text'>Everything You Need to Know About REPS Behavior Management. REPS addresses the behavioral issues undermining student success by integrating discipline management, parent communication, and positive reinforcement into a single, user-friendly platform.</div>

  </div>
  <div className="item header">Our Services</div>
  <div className="item header">About US</div>
  <div className="item header">Contact Information</div>
  <div className="item">Key Features</div>
  <div className="item">Our Mission</div>
  <div className="item">Solutions</div>
  <div className="item">Our Vision</div>
  <div className="item">+1 (732) 232-4422</div>
  <div className="item">Analyics</div>
  <div className="item">Get in Touch</div>
  <div className="item">repsdiscipline@gmail.com</div>
</div>



    

    
<div className="section-footer-svg">
  <div style={{ position: "absolute", top: 0,  right: 0, height: '70%' }}>
    <svg
      id="halfCirclesShapeRight"
      viewBox="0 0 135 463"
      xmlns="http://www.w3.org/2000/svg"
      width="135"
      height="463"
      style={{
        height: '100%',
        width: '100%',
        zIndex: 0,
        transform: 'scaleX(-1)',
      }}
    >
      <mask
        id="mask0_19_27294"
        maskUnits="userSpaceOnUse"
        x="-8"
        y="0"
        width="143"
        height="463"
      >
        <rect
          x="-7.09009"
          y="0.258301"
          width="142.09"
          height="462.689"
          fill="#D9D9D9"
        />
      </mask>
      <g mask="url(#mask0_19_27294)">
        <path
          d="M-127.27 500.616L-122.963 -99.284C-78.3191 -80.6641 -43.1438 -56.2003 -22.3787 -17.5959C-7.0405 10.9606 -1.25163 40.9333 2.23722 70.8214C5.25135 96.4902 16.6895 113.357 36.1095 136.106C72.1115 178.284 121.975 220.267 111.176 270.727C98.5772 329.503 5.34573 372.526 -3.0467 431.644C-6.65406 457.342 -65.4077 476.297 -43.5623 497.304L-127.27 500.616Z"
          fill="var(--svg-color2, #3B5E5E)"
          opacity="1"
        />
        <path
          d="M-103.133 418.469L-99.8875 -33.6469C-57.7959 -21.8134 -18.9885 -6.10061 13.3786 14.1109C77.9035 54.4368 113.084 114.398 89.2174 168.524C63.8548 226.158 -21.3317 269.066 -42.5493 327.301C-53.9085 358.524 -45.2038 389.775 -24.2462 418.961L-103.133 418.469Z"
          fill="var(--svg-color, #FF7A35)"
          opacity="0.9"
        />
      </g>
    </svg>
  </div>
</div>

    </section>
  </div>
 
</div>
    </div> 
  );
};

export default LandingPage;
