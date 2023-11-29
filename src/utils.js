export const calcPaid = (room_type, start_time, end_time) => {
  let paid_per_hour = 1000;
  switch (room_type) {
    case 1:
      paid_per_hour = 1000;
      break;
    // case 2: paid_per_hour = 1500; break;
    case 2:
      paid_per_hour = 20 * 1000;
      break;
    // case 3: paid_per_hour = 1500; break;
    case 3:
      paid_per_hour = 20 * 1000;
      break;
    // case 4: paid_per_hour = 1500; break;
    case 4:
      paid_per_hour = 50 * 1000;
      break;
    default:
      paid_per_hour = 1000;
  }
  return (
    (end_time.hours() - start_time.hours()) * paid_per_hour +
    ((end_time.minutes() - start_time.minutes()) / 60) * paid_per_hour
  );
};

export const splitPayType = (pay) => {
  if (!pay) {
    return {
      t: "",
      r: "",
      department: "",
    };
  } else if (/^saved_money\.d.*/.test(pay.pay_type)) {
    return {
      t: "saved_money.d",
      r: pay.pay_type.replace("saved_money.d.", ""),
      department: pay.pay_type.replace("saved_money.d.", ""),
    };
  } else if (/^card\..+/.test(pay.pay_type)) {
    return {
      t: "card",
      r: pay.pay_type.replace("card.", ""),
      department: pay.pay_type.replace("card.", ""),
    };
  } else if (/^donation\.card\..+/.test(pay.pay_type)) {
    return {
      t: "donation.card",
      r: pay.pay_type.replace("donation.card.", ""),
      department: pay.pay_type.replace("donation.card.", ""),
    };
  } else if (/^donation\.etc\..+/.test(pay.pay_type)) {
    return {
      t: "donation.etc",
      r: pay.pay_type.replace("donation.etc.", ""),
      department: pay.pay_type.replace("donation.etc.", ""),
    };
  } else if (/^transfer\..+/.test(pay.pay_type)) {
    return {
      t: "transfer",
      r: pay.pay_type.replace("transfer.", ""),
      department: pay.pay_type.replace("transfer.", ""),
    };
  } else {
    return {
      t: pay.pay_type,
      r: pay.comment ? `(${pay.comment})` : "",
      department: "",
    };
  }
};

export const isDebug = () => process.env.NODE_ENV !== "production";
