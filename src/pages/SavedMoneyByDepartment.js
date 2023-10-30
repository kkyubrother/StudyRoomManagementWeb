import {useEffect, useState} from "react";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import DataTable from 'react-data-table-component';
import Navi from "../components/Navbar";
// import NumPad from 'react-numpad';
import {getPays, PAY_STATUS_CONFIRM, PAY_STATUS_REJECT, postPay} from "../api/pays";
import moment from "moment";
import {groupBy, splitPayType} from "../utils";
import {getDepartmentName} from "../api/departments";


const TabContainer = ({children, legend, setLegend, department, setDepartment}) => (
    <Tabs id="controlled-tab-legend" activeKey={legend} onSelect={(k) => {
        setLegend(k);
        setDepartment("");
    }} className="mb-3" >
        <Tab title={"전체"} eventKey={"all"}>{children}</Tab>
        <Tab eventKey="youth" title="청년지역">
            <Tabs
                id="controlled-tab-youth"
                activeKey={department}
                onSelect={(k) => setDepartment(k)}
                className="mb-3"
            >
                <Tab eventKey="청1" title="청1">{children}</Tab>
                <Tab eventKey="청2" title="청2">{children}</Tab>
                <Tab eventKey="청3" title="청3">{children}</Tab>
                <Tab eventKey="청4" title="청4">{children}</Tab>
                <Tab eventKey="청5" title="청5">{children}</Tab>
                <Tab eventKey="청6" title="청6">{children}</Tab>
                <Tab eventKey="청7" title="청7">{children}</Tab>
                <Tab eventKey="청8" title="청8">{children}</Tab>
                <Tab eventKey="청9" title="청9">{children}</Tab>
                <Tab eventKey="청10" title="청10">{children}</Tab>
            </Tabs>
        </Tab>
        <Tab eventKey="uni_hope_new" title="대학/소망/새가족 지역">
            <Tabs id="controlled-tab-uni_hope_new" activeKey={department} onSelect={(k) => setDepartment(k)} className="mb-3" >
                <Tab eventKey="대1" title="대1">{children}</Tab>
                <Tab eventKey="대2" title="대2">{children}</Tab>
                <Tab eventKey="대3" title="대3">{children}</Tab>
                <Tab eventKey="대4" title="대4">{children}</Tab>
                <Tab eventKey="소1" title="소망1">{children}</Tab>
                <Tab eventKey="소2" title="소망2">{children}</Tab>
                <Tab eventKey="새부" title="새가족부">{children}</Tab>
            </Tabs>
        </Tab>
        <Tab eventKey="bus" title="부서">
            <Tabs id="controlled-tab-bus" activeKey={department} onSelect={(k) => setDepartment(k)} className="mb-3" >
                <Tab eventKey="청찬" title="청년회 찬양부">{children}</Tab>
                <Tab eventKey="청문" title="청년회 문화부">{children}</Tab>
                <Tab eventKey="정통" title="청년회 정통부">{children}</Tab>
                <Tab eventKey="행정" title="청년회">{children}</Tab>
            </Tabs>
        </Tab>
        <Tab eventKey="etc" title="기타">
            <Tabs id="controlled-tab-etc" activeKey={department} onSelect={(k) => setDepartment(k)} className="mb-3" >
                <Tab eventKey="사랑선교" title="사랑 선교">{children}</Tab>
            </Tabs>
        </Tab>
</Tabs>)

const columns = [
    {
        name: "ID",
        selector: row => row.pay_id,
        sortable: true,
    }, {
        name: "지역",
        selector: row => row.department,
        sortable: true,
    }, {
        name: "사용 결과",
        selector: row => row.status === PAY_STATUS_CONFIRM? "성공" : (row.status === PAY_STATUS_REJECT? "거절" : "대기"),
        hide: "sm"
    }, {
        name: "금액",
        selector: row => row.paid.toLocaleString('ko-KR') + ' 원',
        hide: "sm"
    }, {
        name: "일시",
        selector: row => row.created.format("YYYY-MM-DD HH:hh:ss"),
        hide: "sm"
    }
]

const conditionalRowStyles = [
    {
		when: row => row.status === PAY_STATUS_REJECT,
		style: {
			backgroundColor: 'rgba(240, 128, 128, 0.9)',
			color: 'white',
			'&:hover': {
				cursor: 'pointer',
			},
		},
	},
];

const SavedMoneyEditor = ({department, saved_money, loadPays}) => {
    const department_key = department;
    const [edit_money, setEditMoney] = useState(0);
    const [edit_reason, setEditReason] = useState('');

    const handleOnClick = () => {
        if ((edit_money % 10) !== 0) {
            alert("1원 단위는 수정할 수 없습니다.");
            setEditMoney(0);
        }
        else if (edit_reason === "") {
            alert("수정 사유가 없습니다.");
        }
        else {
            const data = {
                department: department_key,
                edit_money: edit_money,
                edit_reason: edit_reason,
                cashier: 'admin',
            }
            postPay(
                1,
                null,
                "web.admin",
                "saved_money.d." + data.department,
                (-Number(data.edit_money)),
                data.edit_reason,
                "plin.web.admin"
            )
                .then(result => {
                    alert(`${result.comment}`);
                    loadPays()
                })
                .catch(error => alert(`수정 실패: ${error}`))
        }
    }

    return <Form>
        <Form.Group className="mb-3" controlId="SavedMoneyEditorFormKey">
            <Form.Label>지역 고유키</Form.Label>
            <Form.Control type="text" placeholder="지역 고유키" value={department_key} disabled />
            <Form.Text className="text-muted">지역에 따른 고유 값입니다(중복X).</Form.Text>
        </Form.Group>
        <Form.Group className="mb-3" controlId="SavedMoneyEditorFormName">
            <Form.Label>지역 이름</Form.Label>
            <Form.Control type="text" placeholder="지역 이름" value={department} disabled />
            <Form.Text className="text-muted">지역 이름입니다.</Form.Text>
        </Form.Group>
        <Form.Group className="mb-3" controlId="SavedMoneyEditorFormMoney">
            <Form.Label>지역 잔액</Form.Label>
            <Form.Control type="text" placeholder="지역 잔액" value={`${saved_money.toLocaleString('ko-KR')} 원`} disabled />
            <Form.Text className="text-muted">지역 잔액입니다.</Form.Text>
        </Form.Group>
        <Form.Group className="mb-3" controlId="SavedMoneyEditorFormEditMoney">
            <Form.Label>변경할 금액</Form.Label>
            <Form.Control type="number" placeholder="변경할 금액을 입력하세요." value={edit_money} onChange={e => setEditMoney(Number(e.target.value))} />
            {/*<NumPad.Number onChange={setEditMoney} value={edit_money} decimal={0} sync >*/}
            {/*    <Form.Control type="text" placeholder="변경할 금액을 입력하세요." value={`${Number(edit_money).toLocaleString('ko-KR')} 원`} readOnly/>*/}
            {/*</NumPad.Number>*/}
            {/*<Form.Text className="text-muted">클릭시 키패드가 나타납니다. 차감하려면 앞에 - 를 붙이세요.</Form.Text>*/}
        </Form.Group>
        <Form.Group className="mb-3" controlId="SavedMoneyEditorFormEditedMoney">
            <Form.Label>변경후 예상 금액</Form.Label>
            <Form.Control type="text" placeholder="변동 후 예상되는 금액입니다." value={`${(Number(saved_money) + Number(edit_money)).toLocaleString('ko-KR')} 원`} readOnly />
            <Form.Text className="text-muted" >변동 후 예상되는 금액입니다.</Form.Text>
        </Form.Group>
        <Form.Group className="mb-3" controlId="SavedMoneyEditorFormEditReason">
            <Form.Label>변동 사유</Form.Label>
            <Form.Control type="text" placeholder="변동하는 사유를 입력하세요." value={edit_reason} onChange={e => setEditReason(e.target.value)} />
            <Form.Text className="text-muted">금액 변경의 이유를 입력하세요.</Form.Text>
        </Form.Group>
        <Button onClick={handleOnClick}>변경</Button>
    </Form>

}


const SavedMoneyByDepartmentPage = props => {
    const [pending, setPending] = useState(true);
    const [legend, setLegend] = useState('all');
    const [department, setDepartment] = useState('');
    const [pays, setPays] = useState({});
    const [saved_money, setSavedMoney] = useState(null);
    const [show_editor, setShowEditor] = useState(false);
    const [data, setData] = useState([])

    const loadPays = () => {
        setPending(false);
        setPays({});
        getPays()
            .then(pays => pays.filter(value => value.pay_type.startsWith("saved_money.d") || value.pay_type.startsWith("donation")))
            .then(pays => {
                const ungrouped_pays = pays
                        .map(value => {return {...value, created: moment(value.created).add(9, 'hour'), department: splitPayType(value).department}})
                setPays({
                    ...groupBy(ungrouped_pays, "department"),
                    all: ungrouped_pays
                });
                setPending(false);
            })
    }

    useEffect(() => loadPays(), [])

    useEffect(() => {
        setPending(true);
        if (legend === 'all') {
            setDepartment('all');
            setSavedMoney(null);
            setShowEditor(false);
            setPending(false);
        } else if (!department || department === '') {
            setShowEditor(false);
            setPending(false);
        } else {
            getDepartmentName(department)
                .then(result => {
                    setSavedMoney(result.saved_money);
                    setShowEditor(true);
                })
                .catch(error => {
                })
        }
    }, [legend, department])
    
    useEffect(() => {
        setData(pays[department]);
        setPending(false);
    }, [department, pays])

    return (<><Navi /><Container><TabContainer
        legend={legend}
        setLegend={setLegend}
        department={department}
        setDepartment={setDepartment}
    >
        {show_editor && <SavedMoneyEditor department={department} saved_money={saved_money} loadPays={loadPays}/>}
        <DataTable
			title={"지역 적립금" + (typeof saved_money === 'number'? ` (잔액: ${saved_money.toLocaleString('ko-KR')} 원)` : "")}
            columns={columns}
            progressPending={pending}
			data={data}
            pagination
            conditionalRowStyles={conditionalRowStyles}
        />
    </TabContainer></Container></>);
}

export default SavedMoneyByDepartmentPage;