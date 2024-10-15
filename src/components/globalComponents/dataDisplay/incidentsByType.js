import ReactEcharts from "echarts-for-react";
import React, { useEffect, useState } from "react";
import "../dataDisplay/CustomPieChart.css";
import { get } from "../../../utils/api/api";

export const IncidentByTypePieChart = ({ data = [] }) => {
  const [writeUps, setWriteUps] = useState([]);

  useEffect(() => {
    const fetchWriteUps = async () => {
      try {
        const response = await get(
          `punish/v1/punishments/${data.studentEmail}`
        );
        setWriteUps(response);
      } catch (error) {
        console.error(error);
      }
    };

    fetchWriteUps();
  }, []);

  const tardyList = writeUps.filter(
    (punishment) => punishment.infraction.infractionName === "Tardy"
  );
  const disruptiveList = writeUps.filter(
    (punishment) =>
      punishment.infraction.infractionName === "Disruptive Behavior"
  );
  const cellList = writeUps.filter(
    (punishment) =>
      punishment.infraction.infractionName === "Unauthorized Device/Cell Phone"
  );
  const horseplayList = writeUps.filter(
    (punishment) => punishment.infraction.infractionName === "Horseplay"
  );
  const dressCodeList = writeUps.filter(
    (punishment) => punishment.infraction.infractionName === "Dress Code"
  );
  const ftcList = writeUps.filter(
    (punishment) =>
      punishment.infraction.infractionName === "Failure To Complete Work"
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

  const listReturn = [
    {
      id: 0,
      value: total > 0 ? ((tardyList.length / total) * 100).toFixed(0) : 0,
      label: "Tardy",
    },
    {
      id: 1,
      value: total > 0 ? ((disruptiveList.length / total) * 100).toFixed(0) : 0,
      label: "Disruptive Behavior",
    },
    {
      id: 2,
      value: total > 0 ? ((cellList.length / total) * 100).toFixed(0) : 0,
      label: "Cell Phone",
    },
    {
      id: 3,
      value: total > 0 ? ((horseplayList.length / total) * 100).toFixed(0) : 0,
      label: "Horseplay",
    },
    {
      id: 4,
      value: total > 0 ? ((dressCodeList.length / total) * 100).toFixed(0) : 0,
      label: "Dress Code",
    },
    {
      id: 5,
      value: total > 0 ? ((ftcList.length / total) * 100).toFixed(0) : 0,
      label: "Failure to Complete Work",
    },
  ];
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
          { value: "", name: "Behavioral Concern" },
          { value: "", name: "Positive Shout Out!" },
          { value: "", name: "Teacher Referrals" },
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
