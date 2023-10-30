import {useEffect, useState} from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

const LockerFormComponent = props => {
    const {
        users,
        rentals,
        lockers,
        handleSave,
        defaultData = undefined,
    } = props;

    const [data, setData] = useState({
        user_id: 1,
        locker_id: 1,
        rental_period: 1,
        department: "",
        deposit: 0,
        id_picture: "REGIST",
        rental_key: 1,
        payment_required: true,
        licenser_id: 1
    });
    const [inputUserFind, setInputUserFind] = useState("1");

    useEffect(() => {
        if (defaultData) {
            setData(defaultData);
            setInputUserFind(`${defaultData.user_id}`)
        }
        else {
            setData({
                user_id: 1,
                locker_id: 1,
                rental_period: 1,
                department: "",
                deposit: 0,
                id_picture: "REGIST",
                rental_key: 1,
                payment_required: true,
                licenser_id: 1
            });
            setInputUserFind(`1`)
        }
    }, [defaultData])
    const selectedUser = users.filter(user => user.user_id === data.user_id).length === 0 ? {} : users.filter(user => user.user_id === data.user_id)[0];

    const isDisable = (locker_id) => rentals.filter(rental => rental.locker_id === locker_id).length !== 0;
    const lockerItemText = (locker) => `[그룹:${locker.location_group} - ${locker.location_y}행 ${locker.location_x}열] ${locker.locker_num}번 사물함 ${isDisable(locker.locker_id) ? "(대여됨)" : ""}`;
    const lockerItems = lockers
        .filter(item => !item.unavailable)
        .map(item => <option value={`${item.locker_id}`} selected={item.locker_id === data.locker_id}
                             disabled={isDisable(item.locker_id)}>{lockerItemText(item)}</option>);

    useEffect(() => {
        const user_id = Number(inputUserFind);
        if (inputUserFind === "") {
            setData({...data, user_id: 1, user: {}})

        } else if (!Number.isInteger(user_id)) {
            const searchedUsers = users.filter(value => value.num === inputUserFind);
            if (searchedUsers.length === 0) return;

            setData({...data, user_id: searchedUsers[0].user_id, user: searchedUsers[0]});
        } else {
            const searchedUsers = users.filter(value => value.user_id === user_id);
            if (searchedUsers.length === 0) return;

            setData({...data, user_id: searchedUsers[0].user_id, user: searchedUsers[0]});
        }
    }, [inputUserFind])

    return (<Form>
        <Form.Group className="mb-3" controlId="formLockerSelect">
            <Form.Label>사물함을 선택하시오.</Form.Label>
            <Form.Select onChange={e => setData({...data, locker_id: Number(e.target.value)})}
                          disabled={defaultData} value={data.locker_id}>
                {lockerItems}
            </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formUserId">
            <Form.Label>사용자 ID를
                입력하시오{selectedUser.username && `(선택: [${selectedUser.user_id}] ${selectedUser.username})`}</Form.Label>
            <Form.Control type="text" placeholder="사용자 ID 또는 전화번호를 입력하시오." onChange={e => setInputUserFind(e.target.value)}
                          disabled={defaultData} value={inputUserFind}
            />
            <Form.Text className="text-muted">
                해당하는 사용자를 찾지 못한다면 가장 마지막에 찾은 사용자가 선택됩니다.
            </Form.Text>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formDepartment">
            <Form.Label>지역을 입력하세요.</Form.Label>
            <Form.Control type="text" placeholder="사용자 지역을 입력하시오."
                          value={data.department}
                          onChange={e => setData({...data, department: e.target.value})}/>
            <Form.Text className="text-muted">일관된 지역 이름을 입력해주세요.</Form.Text>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formRentalPeriod">
            <Form.Label>임대 개월</Form.Label>
            <Form.Select aria-label="Locker Select"
                          disabled={defaultData}
                         onChange={e => setData({...data, rental_period: Number(e.target.value)})}>
                <option value="1" selected={data.rental_period === 1}>1개월</option>
                <option value="2" selected={data.rental_period === 2}>2개월</option>
                <option value="3" selected={data.rental_period === 3}>3개월</option>
                <option value="4" selected={data.rental_period === 4}>4개월</option>
                <option value="5" selected={data.rental_period === 5}>5개월</option>
                <option value="6" selected={data.rental_period === 6}>6개월</option>
            </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formDeposit">
            <Form.Label>보증금</Form.Label>
            <Form.Control type="number" placeholder="보증금 입력"
                          onChange={e => setData({...data, deposit: Number(e.target.value)})}
                          value={`${data.deposit}`}/>
            <Form.Text className="text-muted">없다면 0을 입력하시오</Form.Text>
        </Form.Group>

        <div className="mb-3">
            <Form.Label>열쇠: </Form.Label>
            <Form.Check
                label="보관"
                name="group-key"
                type='radio'
                id={`inline-radio-1`}
                onChange={() => setData({...data, rental_key: 0})}
                defaultChecked={data.rental_key === 0}
            />
            <Form.Check
                label="대여"
                name="group-key"
                type='radio'
                id={`inline-radio-2`}
                onChange={() => setData({...data, rental_key: 1})}
                defaultChecked={data.rental_key === 1}
            />
            <Form.Check
                label="분실"
                name="group-key"
                type='radio'
                id={`inline-radio-3`}
                onChange={() => setData({...data, rental_key: 2})}
                defaultChecked={data.rental_key === 2}
            />
        </div>

        <Form.Group className="mb-3" controlId="formPaymentRequired">
            <Form.Check type="checkbox" label="기한이 끝난후 비용을 내야합니다."
                        onChange={() => setData({...data, payment_required: !data.payment_required})}
                        // defaultChecked={data.payment_required}
                        checked={data.payment_required}
            />
        </Form.Group>

        <Button variant="primary" onClick={() => handleSave(data)}>
            {defaultData ? "수정" : "등록"}
        </Button>
    </Form>)
}

export default LockerFormComponent;