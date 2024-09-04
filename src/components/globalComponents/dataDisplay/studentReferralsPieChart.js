import ReactEcharts from "echarts-for-react";

export default function StudentReferralsPieChart({ data = [] }) {
  const referralData = data.filter(
    (punishment) =>
      punishment.infractionName !== "Positive Shout Out!" ||
      punishment.infractionName !== "Behavioral Concern"
  ).length;
  const positiveData = data.filter(
    (punishment) => punishment.infractionName === "Positive Shout Out!"
  ).length;
  const behavioralConcernData = data.filter(
    (punishment) => punishment.infractionName === "Behavioral Concern"
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
}
