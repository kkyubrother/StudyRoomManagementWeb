import DataTable from 'react-data-table-component';
import {useEffect, useState} from "react";

import {getLogsTypeAuth} from "../../api/logs";

const columns = [
    {
        name: "ID",
        selector: row => row.id,
    }, {
        name: "이름",
        selector: row => row.username,
        hide: "md"
    }, {
        name: "나이",
        selector: row => row.age,
        hide: "md",
    }, {
        name: "QR 인증",
        selector: row => row.created.replace("T", " "),
    }
]



const TableAuthQr = ({user_id}) => {
    const [pending, setPending] = useState(true);
	const [rows, setRows] = useState([]);

	useEffect(()=> {
	    if (user_id) {
	        getLogsTypeAuth(user_id)
                .then(logs => {
                    setRows(logs);
                    setPending(false)
                })
        } else {
	        getLogsTypeAuth()
                .then(logs => {
                    setRows(logs);
                    setPending(false)
                })
        }

    }, [user_id])

    return <DataTable columns={columns} data={rows} title={"인증 현황"}
            progressPending={pending}
            pagination />
}

export default TableAuthQr;