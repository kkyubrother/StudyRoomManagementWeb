import Navi from "../components/Navbar";
import axios from "axios";
import "chart.js/auto";
import autocolors from "chartjs-plugin-autocolors";
import { Chart } from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { useEffect, useState } from "react";
import { getBooksByBookDate } from "../api/books";
import moment from "moment";
import {
  convertConfigHourToHour,
  convertRoomToRoomName,
} from "../util/convert";
import _ from "lodash";
import {
  getConfigBookWeekdaysClose,
  getConfigBookWeekdaysOpen,
  getConfigBookWeekendClose,
  getConfigBookWeekendOpen,
} from "../api/config";
import Form from "react-bootstrap/Form";
import {
  classifyRoomBook,
  convertBookItem,
  getDefaultRoom,
} from "../util/book";
import DatePicker from "react-datepicker";
import {
  getSnackBarPaysByDate,
  getSnackBarProducts,
  getSnackBarStock,
} from "../api/snackbar";
Chart.register(autocolors);

const CustomDatePickerInput = ({ value, onClick }) => {
  return (
    <h1 style={{ width: "100%", textAlign: "center" }} onClick={onClick}>
      {value}
    </h1>
  );
};
const getNoShowData = async (date) =>
  await axios
    .get("/api/logs", {
      params: { date, type: "book.del.record", need_all: "all" },
    })
    .then((response) => response.data.logs);
const getUserCancelData = async (date) =>
  await axios
    .get("/api/logs", {
      params: { date, type: "user.book.cancel", need_all: "all" },
    })
    .then((response) => response.data.logs);
const getAdminCancelData = async (date) =>
  await axios
    .get("/api/logs", {
      params: { date, type: "admin.book.delete", need_all: "all" },
    })
    .then((response) => response.data.logs);

const getOpenCloseTime = async (date) => {
  try {
    let open_time, close_time;

    if (moment(date).isoWeekday() >= 6) {
      open_time = convertConfigHourToHour(await getConfigBookWeekendOpen());
      close_time = convertConfigHourToHour(await getConfigBookWeekendClose());
    } else {
      open_time = convertConfigHourToHour(await getConfigBookWeekdaysOpen());
      close_time = convertConfigHourToHour(await getConfigBookWeekdaysClose());
    }

    return {
      open: open_time,
      close: close_time,
    };
  } catch (e) {
    console.log(e);
  }
};

const RoomBookChartComponent = (props) => {
  // 전체, 적절한 비용 지불, 봇 예약, 현장 예약, 노쇼, 취소
  const { selectDateDuration, selectDate } = props;

  const [title, setTitle] = useState("예약 관련 정보");
  const [data, setData] = useState([]);
  const [noShowData, setNoShowData] = useState([]);
  const [userCancelData, setUserCancelData] = useState([]);
  const [adminCancelData, setAdminCancelData] = useState([]);

  const dateArray = [...new Array(selectDateDuration)]
    .map((_, i) => moment(selectDate).subtract(i, "day").format("YYYY-MM-DD"))
    .reverse();
  const updateBookData = async () => {
    setData(
      (
        await Promise.allSettled(
          dateArray.map(async (v) => getBooksByBookDate(v)),
        )
      ).map((v) => v.value),
    );
  };

  useEffect(() => {
    (async () => {
      setTitle("예약 관련 정보(예약 정보 로딩중)");
      await updateBookData();
      setTitle("예약 관련 정보(노쇼 정보 로딩중)");
      await updateNoShowData();
      setTitle("예약 관련 정보(사용자 취소 정보 로딩중)");
      await updateUserCancelData();
      setTitle("예약 관련 정보(관리자 삭제 정보 로딩중)");
      await updateAdminCancelData();
      setTitle("예약 관련 정보");
    })();
  }, [selectDate, selectDateDuration]);

  const updateNoShowData = async () => {
    setNoShowData(
      (
        await Promise.allSettled(dateArray.map(async (v) => getNoShowData(v)))
      ).map((v) => v.value),
    );
  };
  const updateUserCancelData = async () => {
    setUserCancelData(
      (
        await Promise.allSettled(
          dateArray.map(async (v) => getUserCancelData(v)),
        )
      ).map((v) => v.value),
    );
  };
  const updateAdminCancelData = async () => {
    setAdminCancelData(
      (
        await Promise.allSettled(
          dateArray.map(async (v) => getAdminCancelData(v)),
        )
      ).map((v) => v.value),
    );
  };

  const blocked_room_book = data.map(
    (v) => v.filter((v) => v.status === 400).length,
  );
  const success_room_book_success = data.map(
    (v, i) =>
      v.filter((v) => v.pay && v.pay.status === "confirm").length -
      blocked_room_book[i],
  );
  const fail_room_book_success = data.map(
    (v) => v.filter((v) => !v.pay || v.pay.status !== "confirm").length,
  );
  const no_show_room_book = noShowData.map((v) => v.length);
  const user_cancel_room_book = userCancelData.map((v) => v.length);
  const admin_delete_room_book = adminCancelData.map((v) => v.length);

  const chartData = {
    labels: dateArray,
    datasets: [
      {
        id: 1,
        label: "비용을 지불한 예약",
        data: success_room_book_success,
      },
      {
        id: 2,
        label: "비용이 지불되지 않은 예약",
        data: fail_room_book_success,
      },
      {
        id: 3,
        label: "자동생성된 예약",
        data: blocked_room_book,
      },
      {
        id: 4,
        label: "노쇼",
        data: no_show_room_book,
      },
      {
        id: 5,
        label: "사용자 취소",
        data: user_cancel_room_book,
      },
      {
        id: 6,
        label: "관리자 취소",
        data: admin_delete_room_book,
      },
    ],
  };
  const options = {
    plugins: {
      title: {
        display: true,
        text: title,
      },
    },
  };
  return <Line datasetIdKey="id" data={chartData} options={options} />;
};
const RoomBookUseTimeChartComponent = (props) => {
  // 각 방별 사용 현황
  const { selectDateDuration, selectDate } = props;

  const [title, setTitle] = useState("각 방별 사용 현황");
  const [chartDataSet, setChartDataSet] = useState([{}]);

  const dateArray = [...new Array(selectDateDuration)]
    .map((_, i) => moment(selectDate).subtract(i, "day").format("YYYY-MM-DD"))
    .reverse();
  const updateBookData = async () => {
    const loadBookData = (data, date) => {
      const temp_books = getDefaultRoom();

      data.forEach((value) => {
        const v = convertBookItem(value, date, () => {});
        classifyRoomBook(temp_books, value, v);
      });

      return temp_books;
    };
    const newDataList = (
      await Promise.allSettled(
        dateArray.map(async (v) => getBooksByBookDate(v)),
      )
    ).map((v) => v.value);
    const newDataList2 = newDataList.map((value, index) =>
      loadBookData(value, dateArray[index]),
    );

    const result = getDefaultRoom();
    newDataList2.forEach((value, index) => {
      const temp = getDefaultRoom();
      Object.entries(value).forEach((d) => {
        const [k, v] = d;
        v.filter(
          (v) =>
            v.data.status !== 400 &&
            v.data.pay &&
            v.data.pay.status === "confirm",
        ).forEach((vv) => {
          const gap_hour =
            Number(vv.data.end_time.split(":")[0]) -
            Number(vv.data.start_time.split(":")[0]);
          const gap_minute =
            Number(vv.data.end_time.split(":")[1]) -
            Number(vv.data.start_time.split(":")[1]);

          temp[k].push(gap_hour + (gap_minute === 59 ? 60 : gap_minute) / 60);
        });
      });
      Object.entries(temp).map((v) => result[v[0]].push(_.sum(v[1])));
    });

    setChartDataSet(
      Object.entries(result).map((v, i) => {
        return {
          id: i,
          label: convertRoomToRoomName(v[0]),
          hidden: true,
          data: v[1],
        };
      }),
    );
  };

  useEffect(() => {
    (async () => {
      setTitle("각 방별 사용 현황(예약 정보 로딩중)");
      await updateBookData();
      setTitle("각 방별 사용 현황");
    })();
  }, [selectDate, selectDateDuration]);

  const chartData = {
    labels: dateArray,
    datasets: chartDataSet,
  };
  const options = {
    plugins: {
      title: {
        display: true,
        text: title,
      },
    },
  };
  return <Line datasetIdKey="id" data={chartData} options={options} />;
};
const RoomBookUsageChartComponent = (props) => {
  const { selectDateDuration, selectDate } = props;
  const [openToCloseTime, setOpenToCloseTime] = useState({ from: 7, to: 23 });
  const [dataShow, setDataShow] = useState({
    r_01: true,
    r_02: true,
    r_03: true,
    r_04: true,
    r_05: true,
    r_06: true,
    r_07: true,
    r_08: true,
    r_09: true,
    r_10: true,
    seminar: true,
    studio: true,
    hall: true,
  });

  const [title, setTitle] = useState("스터디룸 시간대별 사용");
  const [data, setData] = useState(getDefaultRoom());

  const openToCloseArray = [
    ...new Array((openToCloseTime.to - openToCloseTime.from) * 2 + 1),
  ]
    .map((_, i) => i / 2 + openToCloseTime.from)
    .map(
      (v) =>
        `${Math.floor(v)}:`.padStart(3, "0") +
        `${(v % 1) * 60}`.padStart(2, "0"),
    );

  const updateBookData = async () => {
    const loadBookData = (data) => {
      const temp_books = getDefaultRoom();

      data.forEach((value) => {
        const v = convertBookItem(value, selectDate.valueOf(), () => {});
        classifyRoomBook(temp_books, value, v);
      });

      setData(temp_books);
    };

    const books = await getBooksByBookDate(
      moment(selectDate).format("YYYY-MM-DD"),
    );
    loadBookData(books);
  };

  const updateOpenCloseTime = async () => {
    try {
      const { open, close } = await getOpenCloseTime(selectDate);
      setOpenToCloseTime({ from: open, to: close });
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    (async () => {
      setTitle("스터디룸 시간대별 사용(설정 데이터 로딩중)");
      await updateOpenCloseTime();
      setTitle("스터디룸 시간대별 사용(예약 데이터 로딩중)");
      await updateBookData();
      setTitle("스터디룸 시간대별 사용");
    })();
  }, [selectDate]);

  const filterRoomBookStartEndTime = (dataList) => {
    return openToCloseArray.map((v) => {
      const t = moment(`${moment(selectDate).format("YYYY-MM-DD")} ${v}`);
      return dataList.filter(
        (r) =>
          moment(r.startTime).isSameOrBefore(t) &&
          moment(r.endTime).isSameOrAfter(t),
      ).length
        ? 1
        : 0;
    });
  };
  const chartData = Object.entries(dataShow)
    .filter((v) => v[1])
    .map((v, i) => {
      const key = v[0];
      if (key !== "all") {
        return {
          id: i,
          fill: true,
          label: convertRoomToRoomName(key),
          data: filterRoomBookStartEndTime(data[key]),
        };
      } else {
        const r = [...new Array(10)].map((_, i) =>
          filterRoomBookStartEndTime(data["r_" + `${i + 1}`.padStart(2, "0")]),
        );
        const d = [];
        for (let j = 0; j < r[0].length; j++) {
          d.push(r.map((v) => v[j]).reduce((p, c) => p + c, 0));
        }
        return {
          id: i,
          fill: false,
          type: "line",
          label: "스터디룸 전체",
          data: d,
        };
      }
    });
  const options = {
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
    elements: {
      line: {
        tension: 0, // disables bezier curves
      },
      point: {
        radius: 4,
        borderWidth: 2,
        pointStyle: "circle",
      },
    },
    plugins: {
      title: {
        display: true,
        text: title,
      },
    },
  };
  return (
    <Bar
      datasetIdKey="id"
      options={options}
      data={{
        labels: openToCloseArray,
        datasets: chartData,
      }}
    />
  );
};

const SnackbarPayChartComponent = (props) => {
  const { selectDateDuration, selectDate } = props;
  const [data, setData] = useState([]);

  const dateArray = [...new Array(selectDateDuration)]
    .map((_, i) => moment(selectDate).subtract(i, "day").format("YYYY-MM-DD"))
    .reverse();

  const updateSnackBarPrice = async () => {
    setData(
      (
        await Promise.allSettled(
          dateArray.map(async (v) => getSnackBarPaysByDate(v)),
        )
      ).map((v) => v.value),
    );
  };

  useEffect(() => {
    updateSnackBarPrice();
  }, [selectDate, selectDateDuration]);

  return (
    <Line
      datasetIdKey="id"
      data={{
        labels: dateArray,
        datasets: [
          {
            id: 1,
            fill: true,
            type: "line",
            label: "총 매출",
            data: data.map((v) => v.reduce((p, c) => p + c.total_price, 0)),
          },
          {
            id: 2,
            fill: true,
            type: "line",
            label: "순 수익",
            data: data.map((v) =>
              v.reduce(
                (p, c) =>
                  p +
                  c.total_price -
                  (c.total_original_price + Math.floor(c.total_price / 10)),
                0,
              ),
            ),
          },
        ],
      }}
    />
  );
};
const SnackbarProductStockChartComponent = (props) => {
  const { selectDateDuration, selectDate } = props;
  const dateArray = [...new Array(selectDateDuration)]
    .map((_, i) => moment(selectDate).subtract(i, "day").format("YYYY-MM-DD"))
    .reverse();

  const [snackBarProducts, setSnackBarProducts] = useState([]);
  const [snackBarStocks, setSnackBarStocks] = useState([]);

  useEffect(() => {
    const addCreatedDate = (v) => {
      return {
        ...v,
        createdDate: moment(v.created).add(9, "hour").format("YYYY-MM-DD"),
      };
    };
    (async () => {
      const newSnackBarProducts = await getSnackBarProducts();

      const getAllStocks = newSnackBarProducts.map(
        async (v) => await getSnackBarStock(v.barcode),
      );
      const newSnackBarStocks = (await Promise.allSettled(getAllStocks)).map(
        (v) => v.value,
      );

      const vc = newSnackBarStocks
        // .filter(v => v.product.barcode === "8802280004080")
        .map((v) => {
          const stocks = v.stocks.map(addCreatedDate);
          const sortedData = _.groupBy(stocks, "createdDate");

          let quantity = v.quantity;
          const quantityData = [...dateArray]
            .reverse()
            .map((v, index, array) => {
              if (index === 0) {
                return quantity;
              } else if (sortedData[array[index - 1]]) {
                quantity =
                  quantity -
                  _.sum(sortedData[array[index - 1]].map((d) => d.quantity));
              } else {
              }
              return quantity;
            })
            .reverse();

          return {
            ...v,
            stocks,
            sortedData,
            quantityData,
          };
        });

      setSnackBarProducts(newSnackBarProducts);
      setSnackBarStocks(vc);
    })();
  }, [selectDateDuration, selectDate]);

  const datasets = snackBarStocks.map((v, i) => {
    return {
      id: i,
      label: v.product.name,
      hidden: true,
      data: v.quantityData,
    };
  });

  const options = {
    elements: {
      line: {
        tension: 0, // disables bezier curves
      },
      point: {
        radius: 4,
        borderWidth: 2,
        pointStyle: "circle",
      },
    },
    plugins: {
      title: {
        display: true,
        text: "각 상품별 재고 현황",
      },
    },
  };

  return (
    <Line
      datasetIdKey="id"
      data={{
        labels: dateArray,
        datasets: datasets,
      }}
      options={options}
    />
  );
};
const SnackbarProductPayChartComponent = (props) => {
  const { selectDateDuration, selectDate } = props;
  const dateArray = [...new Array(selectDateDuration)]
    .map((_, i) => moment(selectDate).subtract(i, "day").format("YYYY-MM-DD"))
    .reverse();

  const [snackBarProducts, setSnackBarProducts] = useState([]);
  const [snackBarStocks, setSnackBarStocks] = useState([]);

  useEffect(() => {
    const addCreatedDate = (v) => {
      return {
        ...v,
        createdDate: moment(v.created).add(9, "hour").format("YYYY-MM-DD"),
      };
    };
    (async () => {
      const newSnackBarProducts = await getSnackBarProducts();

      const getAllStocks = newSnackBarProducts.map(
        async (v) => await getSnackBarStock(v.barcode),
      );
      const newSnackBarStocks = (await Promise.allSettled(getAllStocks)).map(
        (v) => v.value,
      );

      const vc = newSnackBarStocks
        // .filter(v => v.product.barcode === "8802280004080")
        .map((v) => {
          const stocks = v.stocks.map(addCreatedDate);
          const sortedData = _.groupBy(stocks, "createdDate");

          // let quantity = v.quantity;
          const quantityData = [...dateArray]
            .reverse()
            .map((v, index, array) => {
              if (!sortedData[v]) return 0;

              let temp_data = sortedData[v];
              temp_data = temp_data.filter((d) => d.reason === "pay");
              return -_.sum(temp_data.map((d) => d.quantity));
            })
            .reverse();

          return {
            ...v,
            stocks,
            sortedData,
            quantityData,
          };
        });

      setSnackBarProducts(newSnackBarProducts);
      setSnackBarStocks(vc);
    })();
  }, [selectDateDuration, selectDate]);

  const datasets = snackBarStocks.map((v, i) => {
    return {
      id: i,
      label: v.product.name,
      hidden: true,
      data: v.quantityData,
    };
  });

  const options = {
    elements: {
      line: {
        tension: 0, // disables bezier curves
      },
      point: {
        radius: 4,
        borderWidth: 2,
        pointStyle: "circle",
      },
    },
    plugins: {
      title: {
        display: true,
        text: "각 상품별 판매 현황",
      },
    },
  };

  return (
    <Line
      datasetIdKey="id"
      data={{
        labels: dateArray,
        datasets: datasets,
      }}
      options={options}
    />
  );
};

const ChartPage = (props) => {
  // 각 요일별 시간대별 사용 현황

  const [selectDate, setSelectDate] = useState(new Date());
  const [selectDateDuration, SetSelectDateDuration] = useState(7);
  const handleChangeDate = (date) => setSelectDate(date);
  const [checkData, setCheckData] = useState({
    room_book: false,
    room_book_usage: false,
    room_book_daily_usage: false,
    snackbar_pay: false,
    snackbar_product_stock: false,
  });

  return (
    <div>
      <Navi />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ maxWidth: "40vw" }}>
          <DatePicker
            dateFormat="yyyy-MM-dd"
            selected={selectDate}
            onChange={handleChangeDate}
            customInput={<CustomDatePickerInput />}
          />
        </div>

        <div>
          <Form.Select
            onChange={(e) => SetSelectDateDuration(Number(e.target.value))}
          >
            <option value="7">일주일</option>
            <option value="14">2주일</option>
            <option value="31">한달전</option>
            <option value="60">두달전</option>
            <option value="90">세달전</option>
          </Form.Select>
        </div>

        <Form>
          <div className="mb-3">
            <Form.Check
              type="checkbox"
              label={"예약 관련 정보"}
              onClick={(e) =>
                setCheckData({ ...checkData, room_book: e.target.checked })
              }
            />
            <Form.Check
              type="checkbox"
              label={"예약 시간대 별 사용 정보"}
              onClick={(e) =>
                setCheckData({
                  ...checkData,
                  room_book_usage: e.target.checked,
                })
              }
            />
          </div>
        </Form>
        <Form>
          <div className="mb-3">
            <Form.Check
              type="checkbox"
              label={"각 방별 사용 현황"}
              onClick={(e) =>
                setCheckData({
                  ...checkData,
                  room_book_daily_usage: e.target.checked,
                })
              }
            />
            {/*<Form.Check type="checkbox" label={"예약 시간대 별 사용 정보"} onClick={e => setCheckData({...checkData, room_book_usage: e.target.checked})} />*/}
          </div>
        </Form>
      </div>
      <div
        style={{ display: "flex", flexDirection: "column", marginRight: 10 }}
      >
        {checkData.room_book ? (
          <RoomBookChartComponent
            selectDate={selectDate}
            selectDateDuration={selectDateDuration}
          />
        ) : null}
        {checkData.room_book_usage ? (
          <RoomBookUsageChartComponent
            selectDate={selectDate}
            selectDateDuration={selectDateDuration}
          />
        ) : null}
        {checkData.room_book_daily_usage ? (
          <RoomBookUseTimeChartComponent
            selectDate={selectDate}
            selectDateDuration={selectDateDuration}
          />
        ) : null}

        {checkData.snackbar_pay ? (
          <SnackbarPayChartComponent
            selectDate={selectDate}
            selectDateDuration={selectDateDuration}
          />
        ) : null}
        {checkData.snackbar_product_stock ? (
          <SnackbarProductStockChartComponent
            selectDate={selectDate}
            selectDateDuration={selectDateDuration}
          />
        ) : null}
        {checkData.snackbar_product_stock ? (
          <SnackbarProductPayChartComponent
            selectDate={selectDate}
            selectDateDuration={selectDateDuration}
          />
        ) : null}
      </div>
    </div>
  );
};

export default ChartPage;
