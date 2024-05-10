const TotalPositivePoints = ({ data = [], school = [] }) => {
  return (
    <>
      <h3>Total {school.currency}</h3>
      <h1>{data.currency}</h1>
    </>
  );
};

export default TotalPositivePoints;
