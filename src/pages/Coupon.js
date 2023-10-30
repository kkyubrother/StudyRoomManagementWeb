import Navi from "../components/Navbar";
import {useEffect, useState} from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Table from "react-bootstrap/Table";
import {getUsers} from "../api/users";
import DataTable from 'react-data-table-component';
import axios from "axios";

Date.prototype.addHours = function(h) {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));
    return this;
}

const columns = [
    {
        name: "ID",
        selector: (row, index) => row.coupon_id,
    }, {
        name: "전화번호",
        selector: (row, index) => row.tel,
        sortable: true,
    }, {
        name: "상태",
        selector: (row, index) => row.status === "usable" ? "적립" : (row.status === "used" ? "사용" : (row.status === "expire" ? "기한 초과" : "알 수 없음")),
        sortable: true,
    }, {
        name: "갯수",
        selector: (row, index) => row.amount,
        sortable: true,
    }, {
        name: "일시",
        selector: (row, index) => new Intl.DateTimeFormat("kr").format(new Date(row.created).addHours(9)),
        hide: "md"
    }
]




const RowStyle = {
    height: "4rem",
    padding: "0.1rem 1rem",
};
const ColStyle = {
    margin: "0.7rem 0.5rem",
    fontSize: "2.3rem",
    border: "solid",
    borderRadius: 50,
    textAlign: "center",
    userSelect: "none",
}

const MILEAGE_PERCENT = 0.05;

const CouponPage = () => {
    const [money, setMoney] = useState(0);
    const [users, setUsers] = useState([]);
    const [user, setUser] = useState({});
    const [tel, setTel] = useState("");
    const [data, setData] = useState([]);
    const [searchResult, setSearchResult] = useState([]);


    useEffect(() => {
        const params = {
            request_type: "all",
            device_id: 2
        };

        (async () => {
            const response = await axios.get("/api/coupons", {params});
            setData(response.data.data);
        })();
    }, []);

    const handleButton = event => {
        const data = event.target.innerText;
        if (money > 0) {
            if (data === "000") {
                setMoney(money * 1000);
            }
            else if (data === "00") {
                setMoney(money * 100);
            }
            else if (data === "0") {
                setMoney(money * 10);
            }
        }
        if (Number.isInteger(Number(data))) {
            setMoney(Number(`${money}${data}`));
        }
        else if (data === "CLEAR") {
            setMoney(0);
        }
        else if (data === "DELETE") {
            setMoney(parseInt(`${money / 10}`));
        }
        else if (data === "ENTER") {
            setMoney(0);
        }
        else {
            console.log("N", data);
        }
    }

    const handleMoney = event => {
        setMoney(Number(event.target.value))
    }
	const loadUsers = () => {
		getUsers(sessionStorage.getItem("Authorization"))
            .then(setUsers)
            .catch(error => {
                if (error.response) {
                    if (parseInt(`${error.response.status / 100}`) === 4) {
                        alert(`응답 오류: [400] ${error.response.data.message}`)
                    }
                    else if (parseInt(`${error.response.status / 100}`) === 5) {
                        alert(`서버 오류: [500] ${error.response.data}`)
                    }
                }
                console.error(error);
            })
	}

	useEffect(()=> {
	    loadUsers();
    }, []);

    useEffect(() => {
        setSearchResult([]);
        const tel_group = getSearchTel();

        (async () => {
            const result = await Promise.allSettled(tel_group.map(value => axios.get("/api/coupons", {params: {request_type: "view", device_id: 2, tel: value}})));
            const combine_with_tel = result.map((value, index) => {
                return {
                    tel: tel_group[index],
                    coupon_count: value.value.data.coupon_count,
                }
            })
            setSearchResult(combine_with_tel);
        })();
    }, [tel])

    const getSearchTel = () => {
        if (tel.length < 4) return [];

        const tel_group = [];
        data.filter(v => v.tel.endsWith(tel)).forEach(v => tel_group.includes(v.tel) ? null : tel_group.push(v.tel));
        return tel_group;
    }

    return (<div>
        <Navi />
        <Container>
            <Container>
                <Row style={{minHeight: "10px"}}></Row>
                <Row>
                    <Col>전화번호를 입력하세요: </Col>
                    <Col><input onChange={e => setTel(e.target.value)} value={tel} /></Col>
                </Row>
                {
                    searchResult.length > 0 && (<Table>
                    <thead><tr><th>번호</th><th>쿠폰 갯수</th></tr></thead>
                    <tbody>{searchResult.map((v, i) => <tr key={i}>
                        <td>{v.tel}</td>
                        <td>{`${v.coupon_count}`}</td>
                    </tr>)}</tbody>
                    </Table>)
                }

            </Container>
            <DataTable
                columns={columns}
                data={tel? data.filter(v => v.tel.endsWith(tel)) : data}
                title={"쿠폰 기록"}
                progressPending={!Boolean(data)}
                pagination
            />
        </Container>
    </div>);
}

export default CouponPage;
