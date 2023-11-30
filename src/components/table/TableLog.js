import DataTable from "react-data-table-component";
import { useEffect, useState } from "react";
import { getLogsV2 } from "../../api/logs";

import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { BsFillBookmarkCheckFill } from "react-icons/bs";

const columns = [
  {
    name: "ID",
    selector: (row) => row.id,
  },
  {
    name: "로그 종류",
    selector: (row) => row.log_type,
    sortable: true,
  },
  {
    name: "chat_id",
    selector: (row) => row.chat_id,
  },
  {
    name: "닉네임",
    selector: (row) => row.tg_name,
  },
  {
    name: "이름",
    selector: (row) => row.username,
  },
  {
    name: "기록일시",
    selector: (row) => row.created.replace("T", " "),
    hide: "md",
  },
];

const conditionalRowStyles = [
  {
    when: (row) => row.log_type === "tg",
    style: {
      backgroundColor: "#0088cc",
      color: "white",
      "&:hover": {
        cursor: "pointer",
      },
    },
  },
  {
    when: (row) => row.log_type === "auth",
    style: {
      backgroundColor: "rgba(22, 160, 133, 0.9)",
      color: "white",
      "&:hover": {
        cursor: "pointer",
      },
    },
  },
  {
    when: (row) => row.log_type === "book.cancel",
    style: {
      backgroundColor: "rgba(212, 172, 13, 0.9)",
      color: "white",
      "&:hover": {
        cursor: "not-allowed",
      },
    },
  },
  {
    when: (row) => row.log_type === "error",
    style: {
      backgroundColor: "rgba(146, 43, 33, 0.9)",
      color: "white",
      "&:hover": {
        cursor: "not-allowed",
      },
    },
  },
  {
    when: (row) => row.log_type === "restart",
    style: {
      backgroundColor: "rgba(86, 114, 93, 0.9)",
      color: "white",
      "&:hover": {
        cursor: "not-allowed",
      },
    },
  },
];

const CustomRowDataComponent = ({ name, value, extra }) => (
  <Row>
    <Col>
      <span>{name}: </span>
      <span>{value}</span>
      {extra}
    </Col>
  </Row>
);
const ExtraDataTypeTg = ({ request, result, is_success }) => (
  <Row
    style={{
      backgroundColor: is_success ? "#2980b9" : "#c0392b",
      color: "whitesmoke",
    }}
  >
    <Col>
      <span>요청: </span>
      <span>{request}</span>
    </Col>
    <Col>
      <span>응답: </span>
      <span>{result}</span>
    </Col>
  </Row>
);

const ExpandedComponent = ({ data }) => {
  const [row, setRow] = useState(data);
  const [extra, setExtra] = useState({});

  useEffect(() => {
    setRow(data);
    setExtra(JSON.parse(data.extra_data_str));
  }, [data]);
  return (
    <Container>
      <CustomRowDataComponent name={"chat ID"} value={data.chat_id} />
      <CustomRowDataComponent name={"닉네임"} value={data.tg_name} />
      <CustomRowDataComponent
        name={"이름"}
        value={data.username}
        extra={
          data.sms === 1 ? (
            <BsFillBookmarkCheckFill style={{ color: "#23ab34" }} />
          ) : null
        }
      />

      <CustomRowDataComponent name={"생일"} value={data.birthday} />
      <CustomRowDataComponent name={"나이"} value={data.age} />
      <CustomRowDataComponent name={"성별"} value={data.gender} />
      <CustomRowDataComponent name={"등급"} value={data.grade} />
      <CustomRowDataComponent
        name={"기록일시"}
        value={data.created.replace("T", " ")}
      />

      {row.log_type === "tg" && (
        <ExtraDataTypeTg
          request={extra.update_text}
          result={extra.result_text}
          is_success={extra.success}
        />
      )}
      {row.log_type === "error" && (
        <Row>
          <Col>
            <Form.Control
              as="textarea"
              style={{ height: 150 }}
              value={JSON.stringify(extra, null, 2)}
              readOnly
            />
          </Col>
        </Row>
      )}
    </Container>
  );
};

const TableLog = () => {
  const [data, setData] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [pending, setPending] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const fetchLogs = async (page) => {
    setPending(true);

    const data = await getLogsV2(page, perPage);

    setData(data.data);
    setTotalRows(data.total);
    setPending(false);
  };

  useEffect(() => {
    fetchLogs(1);
  }, []);

  return (
    <DataTable
      columns={columns}
      // data={rows}
      title={"로그 현황"}
      expandableRows
      expandableRowsComponent={ExpandedComponent}
      progressPending={pending}
      conditionalRowStyles={conditionalRowStyles}
      pagination
      data={data}
      paginationServer
      paginationTotalRows={totalRows}
    />
  );
};

export default TableLog;
