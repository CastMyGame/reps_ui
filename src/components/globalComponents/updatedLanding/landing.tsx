import './landing-01.css'

 const  LandingPage =()=>{
    return(
        <div>
            <header id='landing-header'  className='landing-header'>
                <div id='logo-text' className='logo-text'><h1>REPS <span >BMS</span></h1></div>
                <div className='landing-header-menu'>Features</div>
                <div className='landing-header-menu'>About</div>
                <div className='landing-header-menu'>Testimonials</div>
                <div className='landing-header-menu'>Book a Demo</div>
                <div className='landing-header-menu-login'>Login</div>
            </header>
            <div className='intro-panel'>

            </div>
            <div className='intro-panel-cards'>
                <div className='ip-card'>
                        <img className='ip-card-img' src='img/portfolio/02-small.jpg'alt='imag'/>
                  
                    <div className='ip-card-content'>Supports a Positive Culture</div>
                </div>

                <div className='ip-card'>
                        <img className='ip-card-img' src='img/portfolio/02-small.jpg'alt='imag'/>
                  
                    <div className='ip-card-content'>Improves Communication</div>
                </div>

                <div className='ip-card'>
                        <img className='ip-card-img' src='img/portfolio/02-small.jpg'alt='imag'/>
                  
                    <div className='ip-card-content'>Supports for Exceptional Students</div>
                </div>

                <div className='ip-card'>
                        <img className='ip-card-img' src='img/portfolio/02-small.jpg'alt='imag'/>
                  
                    <div className='ip-card-content'>Data that inspires Action</div>
                </div>

                <div className='ip-card'>
                        <img className='ip-card-img' src='img/portfolio/02-small.jpg'alt='imag'/>
                  
                    <div className='ip-card-content'>Automated Support</div>
                </div>

                <div className='ip-card'>
                        <img className='ip-card-img' src='img/portfolio/02-small.jpg'alt='imag'/>
                    <div className='ip-card-content'>Customzied to your school</div>
                </div>
            </div>
            <div className='landing-summary-container'>
                <div className='landing-summary-container-points'>
                    Positive Culture
                </div>
                <div className='landing-summary-container-points'>
                    <div className='point-title'>Positive Culture</div>
                    <div className='point-bullet'>REPS features the latest positive shout-outs at the top of every page, emphasizing what’s going well in the school instead of focusing what’s going wrong</div>
                    <div className='point-bullet'>Teachers receive insights into their ratio of positive to negative parent communication, promoting a healthy balance of support and accountability.</div>
                    <div className='point-bullet'>We support support PBIS strategies through an integrated token economy system</div>

                    </div>

                </div>
          

            




        </div>
    )
}



 export default LandingPage