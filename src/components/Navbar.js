import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import NavDropdown from "react-bootstrap/NavDropdown";
import {Link, NavLink, useLocation, useNavigate} from "react-router-dom";

const Navi = props => {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <Navbar bg="light" expand="lg">
            <Container>
                <Navbar.Brand as={Link} to={"/admin"}>CMS</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={NavLink} to="/qr">QR</Nav.Link>
                        <Nav.Link as={NavLink} to="/users">회원</Nav.Link>
                        <Nav.Link as={NavLink} to="/books">예약</Nav.Link>
                        <Nav.Link as={NavLink} to="/lockers">사물함</Nav.Link>

                        <Nav.Link as={NavLink} to="/configs">설정</Nav.Link>
                        <Nav.Link as={NavLink} to="/exports">추출</Nav.Link>
                        <NavDropdown title="기록" id="basic-nav-dropdown-log">
                            <NavDropdown.Item as={NavLink} to="/logs">전체</NavDropdown.Item>
                            <NavDropdown.Divider />
                        </NavDropdown>
                        {/*<Nav.Link as={NavLink} to="/savedMoney/department">적립금</Nav.Link>*/}
                        <Nav.Link as={NavLink} to="/blocker">날짜 막기</Nav.Link>
                        <Nav.Link as={NavLink} to="/commute">출퇴근 관리</Nav.Link>
                        <Nav.Link as={NavLink} to="/accounts">마감 정산</Nav.Link>

              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
    )
}

export default Navi;