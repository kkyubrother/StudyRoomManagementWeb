import { useEffect, useState } from "react";

import DataTable from "react-data-table-component";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

import { getBooks, getBooksBy, getBooksByDepartment } from "../../api/books";
import { number, string } from "prop-types";

const columns = [
  {
    name: "ID",
    selector: (row) => row.book_id,
  },
  {
    name: "장소",
    selector: (row) => row.room.name,
  },
  {
    name: "날짜",
    selector: (row) => row.book_date,
  },
  {
    name: "이용시간",
    selector: (row) => `${row.start_time} - ${row.end_time}`,
  },
  {
    name: "이름",
    selector: (row) => row.user.username,
    hide: "md",
  },
  {
    name: "인원",
    selector: (row) => row.people_no,
    hide: "md",
  },
];

const conditionalRowStyles = [
  {
    when: (row) => row.status / 100 !== 2,
    style: {
      backgroundColor: "rgb( 187, 143, 206 )",
    },
  },
  {
    when: (row) => row.status / 100 === 2 && row.status % 100 === 0 && !row.pay,
    style: {
      backgroundColor: "rgba(46, 204, 113 , 0.9)",
      color: "white",
      "&:hover": {
        cursor: "pointer",
      },
    },
  },
  {
    when: (row) => row.status / 100 === 2 && row.status % 100 === 0 && row.pay,
    style: {
      backgroundColor: "rgba(174, 214, 241, 0.9)",
      color: "white",
      "&:hover": {
        cursor: "pointer",
      },
    },
  },
  {
    when: (row) => row.status / 100 === 2 && row.status % 100 === 50,
    style: {
      backgroundColor: "rgba( 249, 231, 159 , 0.9)",
      color: "white",
      "&:hover": {
        cursor: "not-allowed",
      },
    },
  },
];

const ExpandedComponent = ({ data }) => {
  return (
    <Container>
      <Row>
        <Form.Group as={Col} md={4}>
          <Form.Label>날짜</Form.Label>
          <Form.Control
            type="text"
            placeholder="날짜"
            value={data.book_date}
            readOnly
          />
        </Form.Group>
        <Form.Group as={Col} md={4}>
          <Form.Label>입실 시간</Form.Label>
          <Form.Control
            type="text"
            placeholder="입실 시간"
            value={data.start_time}
            readOnly
          />
        </Form.Group>
        <Form.Group as={Col} md={4}>
          <Form.Label>퇴실 시간</Form.Label>
          <Form.Control
            type="text"
            placeholder="퇴실 시간"
            value={data.end_time}
            readOnly
          />
        </Form.Group>
      </Row>
      <Row>
        <Form.Group as={Col} md={4}>
          <Form.Label>회원 이름</Form.Label>
          <Form.Control
            type="text"
            placeholder="회원 이름"
            value={data.user.username}
            readOnly
          />
        </Form.Group>
        <Form.Group as={Col} md={4}>
          <Form.Label>사용인원</Form.Label>
          <Form.Control
            type="text"
            placeholder="사용인원"
            value={data.people_no}
            readOnly
          />
        </Form.Group>
        <Form.Group as={Col} md={4}>
          <Form.Label>장소</Form.Label>
          <Form.Control
            type="text"
            placeholder="장소"
            value={data.room.name}
            readOnly
          />
        </Form.Group>
      </Row>
      <Row>
        <Form.Group as={Col} md={4}>
          <Form.Label>지역</Form.Label>
          <Form.Control
            type="text"
            placeholder="지역"
            value={data.department}
            readOnly
          />
        </Form.Group>
        <Form.Group as={Col} md={4}>
          <Form.Label>목적</Form.Label>
          <Form.Control
            type="text"
            placeholder="목적"
            value={data.purpose}
            readOnly
          />
        </Form.Group>
        <Form.Group as={Col} md={4}>
          <Form.Label>기타</Form.Label>
          <Form.Control
            type="text"
            placeholder="기타"
            value={data.obj}
            readOnly
          />
        </Form.Group>
      </Row>

      {/*<Button>수정</Button>*/}
    </Container>
  );
};

const TableBook = ({ user_id, department }) => {
  const [pending, setPending] = useState(true);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (user_id) {
      getBooksBy(user_id).then((books) => {
        setRows(books);
        setPending(false);
      });
    } else if (department) {
      getBooksByDepartment(department).then((books) => {
        setRows(books);
        setPending(false);
      });
    } else {
      getBooks().then((books) => {
        setRows(books);
        setPending(false);
      });
    }
  }, [user_id]);

  return (
    <DataTable
      columns={columns}
      data={rows}
      title={"예약 현황"}
      expandableRows
      expandableRowsComponent={ExpandedComponent}
      progressPending={pending}
      conditionalRowStyles={conditionalRowStyles}
      pagination
    />
  );
};
TableBook.propTypes = {
  user_id: number,
  department: string,
};

export default TableBook;
