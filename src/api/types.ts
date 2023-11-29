export interface Transaction {
  transaction_id: number;
  user_id: number;
  pay_id: number;
  client_name: string;

  type: number;
  money: number;
  tax: number;

  response_original: string;
  transaction_classification: string;
  transaction_type: string;
  response_code: string;
  transaction_amount: string;
  response_message: string;
}

export interface User {
  age: number;
  birthday: string;
  chat_id: number;
  created: string;
  department: string | null;
  gender: number;
  grade: number;
  modified: string | null;
  num: string | null;
  status: number;
  user_id: number;
  valid: boolean;
  username: string;
}

export interface Room {
  name: string;
  no: number;
  type: number;
  available: boolean | null;
  reason: string | null;
}

export interface Pay {
  pay_id: number;
  user_id: number;
  book_id: number;
  cashier: string;
  pay_type: string;
  paid: number;
  comment: string;
  status: string;
  transaction: Transaction | null;
}

export interface Book {
  book_id: number;
  book_date: string;
  created: string;
  department: string;
  start_time: string;
  end_time: string;
  modified: string;
  obj: string;
  people_no: number;
  purpose: string;
  reason: string | null;
  status: number;
  room: Room;
  user: User;
  pay: Pay | null;
}

export interface Department {
  variation: [string];
  name: string;
  key: string;
}

export interface Reason {
  message: string;
  reason: string | null;
}

export interface Commute {
  commute_id: number;
  user: User;
  enter_time: string | null;
  exit_time: string | null;
}

export interface CommuteResult {
  message: string;
  commute_id: string | null;
}

export interface LogResponse {
  total: number;
  data: [];
}

export interface SnackbarPay {
  receipt_id: number;
  total_price: number;
  total_original_price: number;
  datetime: string;
  products: [
    {
      name: string;
      price: number;
      quantity: number;
      original_price: number;
    },
  ];
}
export interface SnackbarProduct {
  product_id: number;
  name: string;
  barcode: string;
  price: number;
  original_price: number;
  image: string | null;
  quantity: number;
}
export interface SnackbarStock {
  product: SnackbarProduct;
  quantity: number;
  stocks: [
    {
      stock_id: number;
      quantity: number;
      reason: string;
      created: string;
    },
  ];
}
