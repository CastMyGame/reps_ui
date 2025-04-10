import ReactEcharts from "echarts-for-react";
import { TeacherReferral } from "src/types/responses";

interface StudentPieProps {
  data: TeacherReferral[];
}

const StudentReferralsPieChart: React.FC<StudentPieProps> = ({
  data = [],
}) => {
  const referralData = (data).filter(
    (punishment: TeacherReferral) =>
      punishment.infractionName !== "Positive Shout Out!" ||
      "Behavioral Concern"
  ).length;
  const positiveData = (data).filter(
    (punishment: TeacherReferral) =>
      punishment.infractionName === "Positive Shout Out!"
  ).length;
  const behavioralConcernData = (data).filter(
    (punishment: TeacherReferral) =>
      punishment.infractionName === "Behavioral Concern"
  ).length;

  const option = {
    title: {
      text: "Referral Breakdown",
      left: "center",
    },
    tooltip: {
      trigger: "item",
    },
    legend: {
      orient: "vertical",
      left: "left",
    },
    series: [
      {
        type: "pie",
        radius: "50%",
        data: [
          { value: behavioralConcernData, name: "Behavioral Concern" },
          { value: positiveData, name: "Positive Shout Out!" },
          { value: referralData, name: "Teacher Referrals" },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };

  return (
    <div>
      <ReactEcharts option={option} />
    </div>
  );
};

export default StudentReferralsPieChart;
