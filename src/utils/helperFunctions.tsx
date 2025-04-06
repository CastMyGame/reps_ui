import axios from "axios";
import { OfficeReferral, TeacherReferral } from "src/types/responses";
import { baseUrl } from "./jsonData";

export const handleLogout = async () => {
  const headers = {
    Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
  };
  try {
    const res = await axios.post(`${baseUrl}/v1/logout`, [], { headers });
    clearSessionStorage();
    window.location.href = "/login";
  } catch {
    //for edge case where app is restared while in session, so log out still happens
    clearSessionStorage();
    window.location.href = "/login";
  }
};

const clearSessionStorage = () => {
  ["Authorization", "userName", "schoolName", "email", "role"].forEach(
    (key) => {
      sessionStorage.removeItem(key);
    }
  );
};

export function isTeacherReferral(
  referral: TeacherReferral | OfficeReferral
): referral is TeacherReferral {
  return (referral as TeacherReferral).punishmentId !== undefined;
}

export function isOfficeReferral(
  referral: TeacherReferral | OfficeReferral
): referral is OfficeReferral {
  return (referral as OfficeReferral).officeReferralId !== undefined;
}

export function getInfractionName(
  referral: TeacherReferral | OfficeReferral
): string {
  return isTeacherReferral(referral)
    ? referral.infractionName
    : referral.referralCode.codeName;
}

export function getInfractionDescription(ref: TeacherReferral | OfficeReferral): string {
  return isTeacherReferral(ref)
    ? ref.infractionDescription.join(", ")
    : ref.referralDescription;
}