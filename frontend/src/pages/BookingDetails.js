//frontend\src\pages\BookingDetails.js
import axios from "../api/axios";

function DownloadTicketButton({ bookingId }) {
  const handleDownload = async () => {
    try {
      const token = localStorage.getItem("token"); // or your auth logic
      const res = await axios.get(`/bookings/${bookingId}/ticket`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `ticket_${bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading ticket:", err);
      alert("Failed to download ticket");
    }
  };

  return (
    <button onClick={handleDownload}>
      Download Ticket
    </button>
  );
}

export default DownloadTicketButton;
