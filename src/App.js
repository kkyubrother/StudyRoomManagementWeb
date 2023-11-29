import "bootstrap/dist/css/bootstrap.min.css";
import "react-datepicker/dist/react-datepicker.css";

import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";

import AdminLogin from "./pages/AdminLogin";
import TableAuthQr from "./components/table/TableAuthQr";
import Users from "./pages/Users";
import Books from "./pages/Books";
import Main from "./pages/Main";
import Config from "./pages/Config";
import Exports from "./pages/Exports";
import Logs from "./pages/Logs";
import GuestBookCheckPage from "./pages/guest/GuestBookCheckPage";
import GuestBookPage from "./pages/guest/GuestBookPage";
import GuestQrCheckPage from "./pages/guest/GuestQrCheckPage";
import GuestQrResultPage from "./pages/guest/GuestQrResultPage";
import AccountsMain from "./pages/AccountsMain";
import LockerPage from "./pages/Locker";
import CouponPage from "./pages/Coupon";
import CommutePage from "./pages/CommutePage";
import BlockerPage from "./pages/BlockerPage";
import DonationPage from "./pages/DonationPage";
import AdminMainPage from "./pages/AdminMainPage";
import ChartPage from "./pages/ChartPage";
import StatusBook from "./pages/StatusBook";
import GuestSignUpPage from "./pages/guest/GuestSignUpPage";

function App() {
  document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });
  return (
    <Routes>
      <Route path="/" exact element={<Main />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/users" element={<Users />} />
      <Route path="/books" element={<Books />} />
      <Route path="/log/qr" element={<TableAuthQr />} />
      <Route path="/configs" element={<Config />} />
      <Route path="/exports" element={<Exports />} />
      <Route path="/logs" exact element={<Logs />} />
      <Route path="/guest/book" element={<GuestBookPage />} />
      <Route path="/guest/signup" element={<GuestSignUpPage />} />
      <Route path="/guest/book_check" element={<GuestBookCheckPage />} />
      <Route path="/guest" element={<GuestQrCheckPage />} />
      <Route path="/qr" element={<GuestQrResultPage />} />
      <Route path="/accounts" element={<AccountsMain />} />
      <Route path="/staff/book" element={<GuestBookPage />} />
      <Route path="/lockers" element={<LockerPage />} />
      <Route path="/commute" element={<CommutePage />} />
      <Route path="/blocker" element={<BlockerPage />} />
      <Route path="/donation" element={<DonationPage />} />
      <Route path="/admin" element={<AdminMainPage />} />
      <Route path="/coupon" element={<CouponPage />} />
      <Route path="/chart" element={<ChartPage />} />
      <Route path="/statusBook" element={<StatusBook />} />
      <Route path="/logout" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
