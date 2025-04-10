import ReactEcharts from "echarts-for-react";
import React, { useEffect, useState } from "react";
import { TeacherReferral } from "src/types/responses";
import "../dataDisplay/CustomPieChart.css";

interface IncidentByTypeProps {
  data: TeacherReferral[];
}

export const IncidentByTypePieChart: React.FC<IncidentByTypeProps> = ({ data = [] }) => {
  const [writeUps, setWriteUps] = useState<TeacherReferral[]>([]);

  useEffect(() => {
    setWriteUps(data);
  }, [data]);

  const tardyList = writeUps.filter(
    (punishment) => punishment.infractionName === "Tardy"
  );
  const disruptiveList = writeUps.filter(
    (punishment) => punishment.infractionName === "Disruptive Behavior"
  );
  const cellList = writeUps.filter(
    (punishment) =>
      punishment.infractionName === "Unauthorized Device/Cell Phone"
  );
  const horseplayList = writeUps.filter(
    (punishment) => punishment.infractionName === "Horseplay"
  );
  const dressCodeList = writeUps.filter(
    (punishment) => punishment.infractionName === "Dress Code"
  );
  const ftcList = writeUps.filter(
    (punishment) => punishment.infractionName === "Failure To Complete Work"
  );
  const posList = writeUps.filter(
    (punishment) => punishment.infractionName === "Positive Behavior Shout Out!"
  );
  const behavioralConcernList = writeUps.filter(
    (punishment) => punishment.infractionName === "Behavioral Concern"
  );
  const inappropriateLangList = writeUps.filter(
    (punishment) => punishment.infractionName === "Inappropriate Language"
  );

  const total =
    tardyList.length +
    disruptiveList.length +
    cellList.length +
    horseplayList.length +
    dressCodeList.length +
    ftcList.length +
    inappropriateLangList.length;

  const option = {
    tooltip: {
      trigger: "item",
    },
    legend: {
      orient: "vertical",
      top: "top",
    },
    series: [
      {
        type: "pie",
        radius: "50%",
        label: {
          show: false,
        },
        data: [
          { value: behavioralConcernList.length, name: "Behavioral Concern" },
          { value: posList.length, name: "Positive Shout Out!" },
          { value: total, name: "Teacher Referrals" },
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
