const TotalPositivePoints = ({ data = [], school = [] }) => {
  return (
    <>
      <h3>Total {school.currency}</h3>
      <h1>{data.points}</h1>
    </>
  );
};

export default TotalPositivePoints;
