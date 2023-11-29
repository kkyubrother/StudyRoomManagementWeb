import Container from "react-bootstrap/Container";
import Dropdown from "react-bootstrap/Dropdown";

const LockerSelectGroupComponent = (props) => {
  const { locationGroupId, setLocationGroupId } = props;

  return (
    <Container>
      <Dropdown onSelect={(e) => setLocationGroupId(Number(e))}>
        <Dropdown.Toggle>{`선택한 사물함 그룹: ${locationGroupId}번`}</Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item eventKey="1">1번</Dropdown.Item>
          <Dropdown.Item eventKey="2">2번</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </Container>
  );
};

export default LockerSelectGroupComponent;
