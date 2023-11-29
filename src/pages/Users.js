import Container from "react-bootstrap/Container";

import Navi from "../components/Navbar";
import TableUser from "../components/table/TableUser";

const Users = (props) => {
  return (
    <div>
      <Navi />
      <Container>
        <TableUser />
      </Container>
    </div>
  );
};

export default Users;
