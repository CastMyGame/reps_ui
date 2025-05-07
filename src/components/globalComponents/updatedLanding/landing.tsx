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

        {/* TOP HEADER */}
  <div>
  {/* Inline SVG positioned in bottom right */}
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
      zIndex: 1 // Put behind text/image if needed
    }}
  >
    <path
      d="M340.849 18.1648C241.663 30.7341 191.813 84.0742 201.889 143.835C212.387 168.38 223.185 189.191 237.691 209.183C252.197 229.174 266.292 251.296 272.526 278.617C278.76 305.938 275.18 339.663 259.159 357.171C247.222 370.21 231.14 371.988 216.086 372.17C184.968 372.548 153.815 368.311 122.774 371.367C91.7323 374.423 60.0316 385.526 35.6095 412.945C17.5498 433.228 3.28068 463.824 0.566162 495.796L446.323 495.796V65.2735L368.184 0.353271V10.9958L340.849 18.1648Z"
      fill="var(--svg-color, #254c4c)"
    />
  </svg>


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


    <div  className="section-01"
          style={{
            display: "flex",
            position: "relative", // Important!
            height: 'maxHeight',
            marginTop: '15px',
            padding: "4px",
            backgroundColor:"white"
          }}
        >


            {/* Your two content sections */}
      <div     className="section-01-01"
        style={{ width: '50%', height: '90%', zIndex: 1,padding:"50px" }}
      >
        <div style={{ color: '#254c4c', fontSize: "40px", fontWeight: "bolder", fontFamily: "'Roboto', sans-serif" }}>
          Transform Student Behavior with REPS Discipline
        </div>
        <p style={{ color: '#254c4c', fontSize: "16px", fontWeight: "normal", fontFamily: "'Roboto', sans-serif", marginTop:"15px"}}>

          REPS Discipline offers a comprehensive solution to tackle behavioral challenges in schools, ensuring that every student has the opportunity to succeed academically. Our platform integrates behavior management, proactive communication, and positive reinforcement, paving the way to a more supportive educational environment.
        </p>

        <button style={{fontWeight:"bold",borderRadius:30,backgroundColor:'#254c4c',color:"white", marginTop:15}}>Schedule a Demo</button>
      </div>

      <div className="section-01-02"

        style={{ width: '50%', height: '90%', zIndex: 1 }}
      >
        <picture>
          <img
          style={{ height: '400px' }}
          src="/repsLogo.png"
          alt="REPS BMS Logo"
          className="logo"
        />      </picture>

        {/* <img
          style={{ height: '400px' }}
          src="/repsLogo.png"
          alt="REPS BMS Logo"
          className="logo"
        /> */}
      </div>
    </div>

    <div  className="section-02-outer"
          style={{
            display: "flex",
            position: "relative", // Important!
            height: 'max-content',
            flexDirection:'row',
            marginTop: '15px',
            padding: "20px 5px",
            backgroundColor:"white",
            width:"100%",
            zIndex:3


          }}>  



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

      
            <div className="section-02-card-title">
             Empowering Schools through Innovative Behavior Management Solutions</div>



  <div className="section-02-card-box">
      <div className="section-02-card">
        <img className='section-02-card-img' src="https://landingsite-app-public.s3.us-east-2.amazonaws.com/client-files/eaa29386-62fc-4a88-ad9a-ee20e0f7c168" alt="undefined" />
        <div className='section-02-card-title' >Transformative Data-Driven Insights</div>
        <div className="section-02-card-body" style={{ marginTop:"10px",alignItems:'center',color: '#254c4c', fontSize: "16px", fontWeight: "normal", fontFamily: "'Roboto', sans-serif" }} >Monitor behavior trends and make informed decisions with our real-time analytics, paving the way for targeted interventions and enhanced student outcomes.</div>
      
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

 


    </div>


    <div  className="section-03-outer"
          style={{
            display: "flex",
            position: "relative", // Important!
            height: '500px',
            flexDirection:'row',
            marginTop: '15px',
            padding: "20px 5px",
            backgroundColor:"white",
            width:"100%",
            zIndex:3


          }}>  



      <div className="section-02-image-box"
      style={{width:"50%",border:"black 2px solid"}}>
        <h1>IMAGE</h1>
      </div>

    <div className="section-02-inner" 
    style={{position:"relative",border:"2px solid black",width:"50%",height:"100%"}}>

      
    <div className="section-02-title" style={{textAlign:"center", width:"100%"}}>
        <h1 style={{ color: '#254c4c', alignItems:'center' }}> SECTION 2</h1>
    </div> 

    <div className="section-02-content" style={{textAlign:"center", width:"100%"}}>
      <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.

</p>
    </div> 

    <button>Button</button>




</div>

 


    </div>



 

    <div  className="section-04"
          style={{
            display: "flex",
            position: "relative", // Important!
            height: '400px',
            marginTop: '15px',
            padding: "15px 15px",
            backgroundColor:"white",
            zIndex:3


          }}
        >

        
    

            {/* Your two content sections */}
      <div
        style={{ width: '50%', height: '90%', zIndex: 3 }}
        className="section-03-01"
      >
        <h1 style={{ color: '#254c4c' }}>
    SECTION 3    </h1>
    
      </div>

      <div
        style={{ width: '50%', height: '90%', zIndex: 3 }}
        className="section-01-01"
      >


      
      </div>

    </div>





    <div  className="section-04-panel"
          style={{
            display: "flex",
            position: "relative", // Important!
            height: '600px',
            marginTop: '15px',
            padding: "15px 15px",
            backgroundColor:"white",
            zIndex:3


          }}
        >


            {/* Your two content sections */}
      <div
        style={{ width: '50%', height: '90%', zIndex: 3 }}
        className="section-01-01"
      >
        <h1 style={{ color: '#254c4c' }}>
    SECTION 4    </h1>

      </div>

      <div
        style={{ width: '50%', height: '90%', zIndex: 3 }}
        className="section-01-01"
      >


      
      </div>

    </div>

       <div  className="section-footer-outer"
          style={{
            display: "flex",
            position: "relative", // Important!
            height: '700px',
            flexDirection:'row',
            marginTop: '15px',
            padding: "20px 5px",
            backgroundColor:"white",
            width:"100%",
            zIndex:3


          }}>  



    

    <div className="section-footer-inner" 
    style={{position:"relative",border:"2px solid black",width:"90%",height:"100%"}}>

      
    <div className="section-footer-title" style={{textAlign:"center", width:"100%"}}>
        <h1 style={{ color: '#254c4c', alignItems:'center' }}> Footer 2</h1>
    </div> 






</div>
<div className="section-footer-svg"
  style={{ width: "100%", border: "black 2px solid", position: "relative" }} // Add position: relative here
>

  {/* First SVG - Top */}
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

  {/* Second SVG - Bottom */}
  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0}}>
    <svg
      id="bottomRightCornerShape"
      width="515"
      height="344"
      viewBox="0 0 516 344"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        height: '100%',
        width: '100%',
        zIndex: 0,
        transform: 'scaleX(1)',
      }}
    >
      <path
        d="M52.4415 337.119C111.306 320.279 176.711 322.775 239.953 320.489C303.169 318.203 371.105 309.002 414.33 275.589C458.347 241.586 466.074 190.972 498.275 150.645C534.749 104.945 605.745 76.8282 678.165 73.3422L678.165 343.482L33.8223 343.481C39.888 341.081 46.112 338.929 52.4415 337.119Z"
        fill="var(--svg-color2, #FF7A35)"
      />
      <path
        d="M47.7993 329.423C97.1165 319.879 148.992 321.651 199.681 317.555C250.369 313.46 303.379 301.916 336.081 272.561C363.588 247.854 373.979 212.917 407.156 192.591C438.936 173.142 484.376 171.656 518.898 155.064C591.212 120.318 594.483 31.8526 670.911 2.51651C673.285 1.60214 675.711 0.763975 678.138 0.00201234L678.138 343.482L0.75 343.481C15.5452 337.271 31.6063 332.547 47.7993 329.423Z"
        fill="var(--svg-color2, #4F6F70)"
        opacity={0.8}
      />
    </svg>
  </div>

</div>


 


    </div>


      

  </div>
 
</div>

      



   

      {/* <div id="features" className="intro-panel-cards">
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
      </div> */}
    </div> 
  );
};

export default LandingPage;
