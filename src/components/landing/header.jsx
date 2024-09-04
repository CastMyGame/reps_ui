export const Header = (props) => {
  return (
    <div>
          <div style={{marginTop:20, padding:"20px 30px",background: "rgba(129, 127, 127, 0.884)"}}>
      <h1>
  {props.data ? props.data.title : "Loading"}
  <span></span>
</h1>
<p>{props.data ? props.data.paragraph : "Loading"}</p>
<a
  href="#features"
  className="btn btn-custom btn-lg page-scroll"
>
  Learn More
</a>{" "}
        </div>
    <header style={{display:"flex",flexDirection:'column'}} id="header">
      <div className="intro">
        <div className="overlay">
          <div className="container">
            <div  className="row">
              <div  style={{height:"500px"}}className="col-md-8 intro-text">
                
              </div>
            </div>
          </div>
        </div>
      </div>
    
    </header>


    </div>
  );
};

