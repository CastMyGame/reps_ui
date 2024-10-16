import ReactEcharts from "echarts-for-react";
import React, { useEffect, useState } from "react";
import "../dataDisplay/CustomPieChart.css";
import { get } from "../../../utils/api/api";

export const IncidentByTypePieChart = ({ data = [] }) => {
  const [writeUps, setWriteUps] = useState([]);
  console.log("DATA ", data);

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
    (punishment) => punishment.infractionName === "Positive Shout Out!"
  );
  const behavioralConcernList = writeUps.filter(
    (punishment) => punishment.infractionName === "Behavioral Concern"
  );

  const refList = [];
  refList.push(tardyList);
  refList.push(disruptiveList);
  refList.push(cellList);
  refList.push(horseplayList);
  refList.push(dressCodeList);
  refList.push(ftcList);

  const total =
    tardyList.length +
    disruptiveList.length +
    cellList.length +
    horseplayList.length +
    dressCodeList.length +
    ftcList.length;

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
