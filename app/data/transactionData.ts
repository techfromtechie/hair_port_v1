export type Employee = {
  name: string;
  employeeNumber: string;
  branch: string;
};

export type Advance = {
  id: number;
  employee: string;
  employeeNumber: string;
  branch: string;
  date: string;
  cash: number;
  online: number;
};

export type Transaction = {
  id: number;
  employee: string;
  employeeNumber: string;
  branch: string;
  date: string;
  cash: number;
  online: number;
};

export const employees: Employee[] = [
  {
    name: "Rahul Sharma",
    employeeNumber: "EMP001",
    branch: "Indore",
  },
  {
    name: "Amit Verma",
    employeeNumber: "EMP002",
    branch: "Indore",
  },
  {
    name: "Neha Singh",
    employeeNumber: "EMP003",
    branch: "Ujjain",
  },
  {
    name: "Pooja Sharma",
    employeeNumber: "EMP004",
    branch: "Ujjain",
  },
  {
    name: "Riya Patel",
    employeeNumber: "EMP005",
    branch: "Bhopal",
  },
  {
    name: "Vikas Jain",
    employeeNumber: "EMP006",
    branch: "Bhopal",
  },
];

export const branches = [
  "Indore",
  "Ujjain",
  "Bhopal",
];

export const transactions: Transaction[] = [
  // =========================
  // INDORE - RAHUL SHARMA
  // =========================
  {
    id: 1,
    employee: "Rahul Sharma",
    employeeNumber: "EMP001",
    branch: "Indore",
    date: "2026-10-01",
    cash: 500,
    online: 300,
  },
  {
    id: 2,
    employee: "Rahul Sharma",
    employeeNumber: "EMP001",
    branch: "Indore",
    date: "2026-10-02",
    cash: 700,
    online: 500,
  },
  {
    id: 3,
    employee: "Rahul Sharma",
    employeeNumber: "EMP001",
    branch: "Indore",
    date: "2026-10-03",
    cash: 450,
    online: 650,
  },
  {
    id: 4,
    employee: "Rahul Sharma",
    employeeNumber: "EMP001",
    branch: "Indore",
    date: "2026-10-04",
    cash: 800,
    online: 400,
  },
  {
    id: 5,
    employee: "Rahul Sharma",
    employeeNumber: "EMP001",
    branch: "Indore",
    date: "2026-10-05",
    cash: 600,
    online: 700,
  },

  // =========================
  // INDORE - AMIT VERMA
  // =========================
  {
    id: 6,
    employee: "Amit Verma",
    employeeNumber: "EMP002",
    branch: "Indore",
    date: "2026-10-01",
    cash: 400,
    online: 600,
  },
  {
    id: 7,
    employee: "Amit Verma",
    employeeNumber: "EMP002",
    branch: "Indore",
    date: "2026-10-02",
    cash: 550,
    online: 450,
  },
  {
    id: 8,
    employee: "Amit Verma",
    employeeNumber: "EMP002",
    branch: "Indore",
    date: "2026-10-03",
    cash: 700,
    online: 300,
  },
  {
    id: 9,
    employee: "Amit Verma",
    employeeNumber: "EMP002",
    branch: "Indore",
    date: "2026-10-04",
    cash: 350,
    online: 650,
  },
  {
    id: 10,
    employee: "Amit Verma",
    employeeNumber: "EMP002",
    branch: "Indore",
    date: "2026-10-05",
    cash: 900,
    online: 500,
  },

  // =========================
  // UJJAIN - NEHA SINGH
  // =========================
  {
    id: 11,
    employee: "Neha Singh",
    employeeNumber: "EMP003",
    branch: "Ujjain",
    date: "2026-10-01",
    cash: 600,
    online: 400,
  },
  {
    id: 12,
    employee: "Neha Singh",
    employeeNumber: "EMP003",
    branch: "Ujjain",
    date: "2026-10-02",
    cash: 750,
    online: 350,
  },
  {
    id: 13,
    employee: "Neha Singh",
    employeeNumber: "EMP003",
    branch: "Ujjain",
    date: "2026-10-03",
    cash: 500,
    online: 700,
  },
  {
    id: 14,
    employee: "Neha Singh",
    employeeNumber: "EMP003",
    branch: "Ujjain",
    date: "2026-10-04",
    cash: 450,
    online: 550,
  },
  {
    id: 15,
    employee: "Neha Singh",
    employeeNumber: "EMP003",
    branch: "Ujjain",
    date: "2026-10-05",
    cash: 800,
    online: 600,
  },

  // =========================
  // UJJAIN - POOJA SHARMA
  // =========================
  {
    id: 16,
    employee: "Pooja Sharma",
    employeeNumber: "EMP004",
    branch: "Ujjain",
    date: "2026-10-01",
    cash: 450,
    online: 350,
  },
  {
    id: 17,
    employee: "Pooja Sharma",
    employeeNumber: "EMP004",
    branch: "Ujjain",
    date: "2026-10-02",
    cash: 650,
    online: 450,
  },
  {
    id: 18,
    employee: "Pooja Sharma",
    employeeNumber: "EMP004",
    branch: "Ujjain",
    date: "2026-10-03",
    cash: 500,
    online: 500,
  },
  {
    id: 19,
    employee: "Pooja Sharma",
    employeeNumber: "EMP004",
    branch: "Ujjain",
    date: "2026-10-04",
    cash: 700,
    online: 300,
  },
  {
    id: 20,
    employee: "Pooja Sharma",
    employeeNumber: "EMP004",
    branch: "Ujjain",
    date: "2026-10-05",
    cash: 550,
    online: 650,
  },

  // =========================
  // BHOPAL - RIYA PATEL
  // =========================
  {
    id: 21,
    employee: "Riya Patel",
    employeeNumber: "EMP005",
    branch: "Bhopal",
    date: "2026-10-01",
    cash: 800,
    online: 200,
  },
  {
    id: 22,
    employee: "Riya Patel",
    employeeNumber: "EMP005",
    branch: "Bhopal",
    date: "2026-10-02",
    cash: 600,
    online: 500,
  },
  {
    id: 23,
    employee: "Riya Patel",
    employeeNumber: "EMP005",
    branch: "Bhopal",
    date: "2026-10-03",
    cash: 700,
    online: 600,
  },
  {
    id: 24,
    employee: "Riya Patel",
    employeeNumber: "EMP005",
    branch: "Bhopal",
    date: "2026-10-04",
    cash: 450,
    online: 750,
  },
  {
    id: 25,
    employee: "Riya Patel",
    employeeNumber: "EMP005",
    branch: "Bhopal",
    date: "2026-10-05",
    cash: 900,
    online: 400,
  },

  // =========================
  // BHOPAL - VIKAS JAIN
  // =========================
  {
    id: 26,
    employee: "Vikas Jain",
    employeeNumber: "EMP006",
    branch: "Bhopal",
    date: "2026-10-01",
    cash: 500,
    online: 500,
  },
  {
    id: 27,
    employee: "Vikas Jain",
    employeeNumber: "EMP006",
    branch: "Bhopal",
    date: "2026-10-02",
    cash: 750,
    online: 450,
  },
  {
    id: 28,
    employee: "Vikas Jain",
    employeeNumber: "EMP006",
    branch: "Bhopal",
    date: "2026-10-03",
    cash: 650,
    online: 550,
  },
  {
    id: 29,
    employee: "Vikas Jain",
    employeeNumber: "EMP006",
    branch: "Bhopal",
    date: "2026-10-04",
    cash: 800,
    online: 300,
  },
  {
    id: 30,
    employee: "Vikas Jain",
    employeeNumber: "EMP006",
    branch: "Bhopal",
    date: "2026-10-05",
    cash: 600,
    online: 700,
  },
];