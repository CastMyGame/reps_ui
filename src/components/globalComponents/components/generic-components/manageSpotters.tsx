import axios from "axios";
import { baseUrl } from "src/utils/jsonData";

export function ManageSpotters(data = []) {
    const headers = {
        Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
      };

      const payload = {
        spotters: [sessionStorage.getItem("email")],
        studentEmail: spotEmail,
      };

      const url = `${baseUrl}/student/v1/spotters`;
      axios
        .put(url, payload, { headers })
        .then((response) => {
          window.alert(
            `You have been successfully added as a spotter for: ${spotEmail} `
          );
        })
        .catch((error) => {
          console.error(error);
        });
  return (
    <div className="flex w-full max-w-sm items-center space-x-2">
      <input type="email" placeholder="Enter Student Email" />
      <button type="submit">Subscribe</button>
    </div>
  );
}
