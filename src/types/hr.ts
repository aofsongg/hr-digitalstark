export interface UserInfo {
  IDA: string;
  USER_NAME: string;
  USER_PASS: string;
  NAME: string;
  LNAME: string;
  NICK_NAME: string | null;
  EMAIL: string;
  CREATE_DATE: string;
  UPDATE_DATE: string;
}
export interface Employee {
  IDA: string;
  COMPANY_NM: string;
  EMAIL: string;
  EMP_ID: string;
  EMP_NAME: string;
  EMP_LNAME: string;
  NICK_NAME: string | null;
  IDENTIFY_NUMBER: string | null;
  POSITION_NM: string | null;
  DEPARTMENT_NM: string | null;
  START_WORKING_DATE: string | null;
  BASE_SALARY: number;
  BANK_NAME: string | null;
  BANK_ACC_NUMBER: string | null;
  BANK_ACC_NAME: string | null;
  CREATE_DATE: string;
  UPDATE_BY: string;
}

export interface SalaryDetail {
  IDA: string;
  EMP_ID: string;
  EMPLOYEE:{START_WORKING_DATE:Date | null,
    EMP_NAME: string | null,
    EMP_LNAME: string | null,
    NICK_NAME: string | null,
    COMPANY_NM: string | null,
    POSITION_NM: string | null,
    DEPARTMENT_NM: string | null,
    BASE_SALARY:number,
  BANK_NAME: string | null,
  BANK_ACC_NUMBER: string | null,
  BANK_ACC_NAME: string | null,
  EMAIL: string | null};
  COMPANY_NM: string | null;
  EMP_NAME: string | null;
  EMP_LNAME: string | null;
  NICK_NAME: string | null;
  BASE_SALARY: number;
  OT_TIME: number;
  OT_AMT: number;
  ALLOWANCE_AMT: number;
  BONUS_AMT: number;
  SSO_AMT: number;
  WHT_AMT: number;
  LWP_DAY: number;
  STUDENT_LOAN: number;
  DEDUCTION: number;
  DEDUCTION_REMARK: string | null;
  NET_PAYMENT: number;
  TRANSFER_DATE: string | null;
  BANK_NAME: string | null;
  BANK_ACC_NUMBER: string | null;
  BANK_ACC_NAME: string | null;
  DEPARTMENT_NM: string | null;
  EMAIL: string | null;
  REMARK: string | null;
  CREATE_DATE: string;
  UPDATE_BY: string;
}

export const COMPANIES = ['BALIOS', 'DIAMOND HUNTERS', 'IMAGINE WHALES'] as const;
export type Company = typeof COMPANIES[number];
