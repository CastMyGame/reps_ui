import { School, Student } from "src/types/school";

interface PositiveProps {
  data: Student | undefined;
  school: School | undefined;
}

const TotalPositivePoints: React.FC<PositiveProps> = ({ data, school }) => {
  return (
    <>
      <h3>Total {school?.currency}</h3>
      <h1>{data?.currency}</h1>
    </>
  );
};

export default TotalPositivePoints;
