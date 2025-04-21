import { School, Student } from "src/types/school";

interface PositiveProps {
  data: Student | undefined;
  school: School | undefined;
}

const TotalPositivePoints: React.FC<PositiveProps> = ({ data, school }) => {
  return (
    <>
      <h3
        style={{
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 900,
          margin: 0,
          fontSize: "2.5rem",
          color: "#555",
        }}
      >
        Total {school?.currency}
      </h3>
      <h1
        style={{
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 700,
          margin: 0,
          fontSize: "3rem",
          color: "#1a237e",
        }}
      >
        {data?.currency}
      </h1>
    </>
  );
};

export default TotalPositivePoints;
