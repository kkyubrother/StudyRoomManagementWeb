import React, {useCallback, useEffect, useMemo, useState} from "react";

import DataTable from 'react-data-table-component';
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import ListGroup from "react-bootstrap/ListGroup";

import {getUsers, putUser, sendSMSMessage} from "../../api/users";
import FilterComponent from "./FilterComponent";
import UserExpandedComponent from "./UserExpandedComponent";

const convertGradeToGradeName = grade => {
    switch (grade) {
        case 0: return "회원"
        case 10: return "원장"
        case 15: return "플린"
        case 20: return "관리"
        default: return String(grade)
    }
}

const columns = [
    {
        name: "ID",
        selector: row => row.id ? row.id : row.user_id,
        sortable: true,
    }, {
        name: "이름",
        selector: row => row.name ? row.name : row.username,
        sortable: true,
    }, {
        name: "나이",
        selector: row => row.age,
        hide: "sm"
    }, {
        name: "등급",
        selector: row => row.grade ? row.grade : "",
        format: (row, index) => convertGradeToGradeName(row.grade),
        sortable: true,
        hide: "md"
    }, {
        name: "가입일",
        selector: row => row.created ? row.created.replace('T', ' ') : null,
        hide: "md"
    }
]

const conditionalRowStyles = [
    {
        when: row => typeof row.grade !== "number",
        style: {},
    }, {
		when: row => row.grade === 15,
		style: {
			backgroundColor: 'rgba(63, 195, 128, 0.9)',
			color: 'white',
			'&:hover': {
				cursor: 'pointer',
			},
		},
	}, {
		when: row => row.grade === 10,
		style: {
			backgroundColor: 'rgba(148, 174, 163, 0.9)',
			color: 'white',
			'&:hover': {
				cursor: 'pointer',
			},
		},
	}, {
		when: row => row.grade === 20,
		style: {
			backgroundColor: 'rgba(86, 114, 93, 0.9)',
			color: 'white',
			'&:hover': {
				cursor: 'not-allowed',
			},
		},
	},
];

const paginationComponentOptions = {
	rowsPerPageText: '페이지 당 갯수',
	rangeSeparatorText: '중',
	selectAllRowsItem: true,
	selectAllRowsItemText: '전체',
};


const ModalBulkMessage = ({show, onHide, users}) => {
	const [text, setText] = useState("");
	const [result, setResult] = useState({});
	useEffect(() => {
		setResult({});
	}, [show, setResult])

	const handleConsole = result => {
		if (result.status === 'rejected') {
			console.error(result.reason);
		}
		else if (result.status === 'fulfilled') {
			console.log(result.value)
		}
		else {
			console.log(result)
		}
	}
	const handleSendMessage = () => {
		Promise.allSettled(users.map(u => sendSMSMessage(sessionStorage.getItem("Authorization"), u.user_id, text)))
			.then(results => {
				results.forEach(handleConsole);
				const r = {status: "end"};
				results.forEach(v => {
					if (v.status === 'rejected') {
						r[v.reason.user_id] = "rejected";
					}
					else if (v.status === 'fulfilled') {
						if (v.value.status === 'fulfilled') {
							r[v.value.user_id] = "fulfilled";
						}
						else {
							r[v.value.user_id] = "rejected";
						}
					}
				});
				setResult(r);
			})
	}
	const listItems = users.map(u => {
		let variant = "light";
		if (result[u.user_id] === 'rejected') { variant = 'danger'; }
		if (result[u.user_id] === 'fulfilled') { variant = 'success'; }
		return <ListGroup.Item variant={variant} >
			{u.username} {"<" + u.num + ">"}
		</ListGroup.Item>
	})

	return (
		<Modal show={show} size="lg" fullscreen='xl-down' onHide={onHide}>
			<Modal.Header closeButton>
				<Modal.Title>메세지 전송</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Row>
					<Col><ListGroup>
						{listItems}
					</ListGroup></Col>
					<Col><Form>
						<Form.Group className="mb-3" controlId="ModalBulkMessage.Form.ControlText">
							<Form.Label>문자 메시지 내용</Form.Label>
							<Form.Control as="textarea" rows={3} value={text} onChange={e => setText(e.target.value)} />
						</Form.Group>
					</Form>
						{result.status !== 'end' && <Button onClick={handleSendMessage}>전송</Button>}
						{result.status === 'end' && <Button variant={"secondary"} onClick={onHide}>종료</Button>}
					</Col>
				</Row>
			</Modal.Body>
		</Modal>
	)
}


const TableUser = props => {
    const [pending, setPending] = useState(true);
	const [rows, setRows] = useState([]);
	const [filterText, setFilterText] = useState('');
	const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
	const [filteredItems, setFilteredItems] = useState([]);
	const [selectedRows, setSelectedRows] = useState([]);
	const [toggleCleared, setToggleCleared] = useState(false);
	const [show, setShow] = useState(false);

	useEffect(() => {
		if (/^\d+$/.test(filterText)) {
			setFilteredItems(rows.filter(item => item.user_id && String(item.user_id).toLowerCase().includes(filterText.toLowerCase())))
		}
		else if (/^등급:.+/.test(filterText)) {
			switch (filterText) {
				case "등급:회원":
					setFilteredItems(rows.filter(item => item.username && Number(item.grade) === 0))
					break
				case "등급:원장":
					setFilteredItems(rows.filter(item => item.username && Number(item.grade) === 10))
					break
				case "등급:매니저":
					setFilteredItems(rows.filter(item => item.username && Number(item.grade) === 15))
					break
				case "등급:관리자":
					setFilteredItems(rows.filter(item => item.username && Number(item.grade) === 20))
					break
				default:
					setFilteredItems([])
			}
		}
		else {
			setFilteredItems(rows.filter(item => item.username && item.username.toLowerCase().includes(filterText.toLowerCase())))
		}
	}, [filterText, rows])

	const subHeaderComponentMemo = useMemo(() => {
		const handleClear = () => {
			if (filterText) {
				setResetPaginationToggle(!resetPaginationToggle);
				setFilterText('');
			}
		};

		return (
			<FilterComponent
                filterText={filterText}
                onFilter={e => setFilterText(e.target.value)}
                onClear={handleClear} />
		);
	}, [filterText, resetPaginationToggle]);

	const loadUsers = () => {
		getUsers(sessionStorage.getItem("Authorization"))
            .then(users => {
                setRows(users);
                setPending(false);
            })
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
	    loadUsers()
    }, [])
    const handleRowSelected = useCallback(state => {
		setSelectedRows(state.selectedRows);
	}, []);
	const handleHide = () => {
		setToggleCleared(!toggleCleared);
		setShow(false);
	}

	const contextActions = useMemo(() => {
		const handleGrade = (grade) => {
			if (window.confirm(`진짜로 등급을 변경하시겠습니까?:\r ${selectedRows.map(r => r.username)}?`)) {
				setToggleCleared(!toggleCleared);
				Promise.all(selectedRows.map(user => putUser(
					user.user_id,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					grade,
					undefined,
					)
				)).then(result => {
					console.log(result);
					loadUsers();
				})

			}
		};
		return (<>
				<Button key="send-message" onClick={() => setShow(true)} variant="secondary" icon>
					메세지 전송
				</Button>
				<Button key="grade-normal" onClick={() => handleGrade(0)} variant="outline-light text-dark" icon>
					일반 회원 부여
				</Button>
				<Button key="grade-vip" onClick={() => handleGrade(10)} variant="info" icon>
					원장 부여
				</Button>
				<Button key="grade-manager" onClick={() => handleGrade(15)} variant="success" icon>
					매니저 부여
				</Button>
				<Button key="grade-admin" onClick={() => handleGrade(20)} variant="danger" icon>
					관리자 부여
				</Button>
			</>

		);
	}, [selectedRows, toggleCleared]);
    
    return (<>
        <DataTable
			title="사용자 목록"
            columns={columns}
			data={filteredItems}
            expandableRows
            expandableRowsComponent={UserExpandedComponent}
            progressPending={pending}
            defaultSortFieldId={1}
            conditionalRowStyles={conditionalRowStyles}
			persistTableHead
            pagination
			paginationResetDefaultPage={resetPaginationToggle} // optionally, a hook to reset pagination to pages 1
			subHeader
			subHeaderComponent={subHeaderComponentMemo}
            paginationComponentOptions={paginationComponentOptions}

			contextActions={contextActions}
			clearSelectedRows={toggleCleared}
			selectableRows
			onSelectedRowsChange={handleRowSelected}
        />
		<ModalBulkMessage show={show} onHide={handleHide} users={selectedRows} />
		</>
    )
}

export default TableUser;