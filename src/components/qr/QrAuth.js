import QrReader from "react-qr-scanner";
import { getUserByQr } from "../../api/users";

const QrAuth = ({ handleUser }) => {
  const handleError = (error) => console.log(error);

  const handleScan = (scan) =>
    scan &&
    getUserByQr(scan.text).then((user) =>
      handleUser({ ...user, qr: scan.text }),
    );

  return (
    <QrReader
      delay={300}
      onError={handleError}
      onScan={handleScan}
      style={{ width: "50%" }}
    />
  );
};

export default QrAuth;
