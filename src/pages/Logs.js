import Navi from "../components/Navbar";
import Container from "react-bootstrap/Container";
import TableLog from "../components/table/TableLog";

const Logs = () => {
    return (<div>
        <Navi />
        <Container>
            <TableLog />
        </Container>
    </div>)
}

export default Logs;