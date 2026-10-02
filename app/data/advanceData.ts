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

export const branches = ["Indore", "Ujjain", "Bhopal"];

export const advances: Advance[] = [
  // =========================
  // RAHUL SHARMA - INDORE
  // =========================
  {
    id: 1,
    employee: "Rahul Sharma",
    employeeNumber: "EMP001",
    branch: "Indore",
    date: "2026-10-01",
    cash: 2000,
    online: 0,
  },
  {
    id: 2,
    employee: "Rahul Sharma",
    employeeNumber: "EMP001",
    branch: "Indore",
    date: "2026-10-02",
    cash: 0,
    online: 1500,
  },
  {
    id: 3,
    employee: "Rahul Sharma",
    employeeNumber: "EMP001",
    branch: "Indore",
    date: "2026-10-03",
    cash: 1000,
    online: 1000,
  },
  {
    id: 4,
    employee: "Rahul Sharma",
    employeeNumber: "EMP001",
    branch: "Indore",
    date: "2026-10-04",
    cash: 2500,
    online: 0,
  },
  {
    id: 5,
    employee: "Rahul Sharma",
    employeeNumber: "EMP001",
    branch: "Indore",
    date: "2026-10-05",
    cash: 0,
    online: 2000,
  },

  // =========================
  // AMIT VERMA - INDORE
  // =========================
  {
    id: 6,
    employee: "Amit Verma",
    employeeNumber: "EMP002",
    branch: "Indore",
    date: "2026-10-01",
    cash: 1500,
    online: 0,
  },
  {
    id: 7,
    employee: "Amit Verma",
    employeeNumber: "EMP002",
    branch: "Indore",
    date: "2026-10-02",
    cash: 0,
    online: 2000,
  },
  {
    id: 8,
    employee: "Amit Verma",
    employeeNumber: "EMP002",
    branch: "Indore",
    date: "2026-10-03",
    cash: 1200,
    online: 800,
  },
  {
    id: 9,
    employee: "Amit Verma",
    employeeNumber: "EMP002",
    branch: "Indore",
    date: "2026-10-04",
    cash: 1800,
    online: 0,
  },
  {
    id: 10,
    employee: "Amit Verma",
    employeeNumber: "EMP002",
    branch: "Indore",
    date: "2026-10-05",
    cash: 0,
    online: 2500,
  },

  // =========================
  // NEHA SINGH - UJJAIN
  // =========================
  {
    id: 11,
    employee: "Neha Singh",
    employeeNumber: "EMP003",
    branch: "Ujjain",
    date: "2026-10-01",
    cash: 1000,
    online: 1000,
  },
  {
    id: 12,
    employee: "Neha Singh",
    employeeNumber: "EMP003",
    branch: "Ujjain",
    date: "2026-10-02",
    cash: 1500,
    online: 0,
  },
  {
    id: 13,
    employee: "Neha Singh",
    employeeNumber: "EMP003",
    branch: "Ujjain",
    date: "2026-10-03",
    cash: 0,
    online: 2000,
  },
  {
    id: 14,
    employee: "Neha Singh",
    employeeNumber: "EMP003",
    branch: "Ujjain",
    date: "2026-10-04",
    cash: 1200,
    online: 800,
  },
  {
    id: 15,
    employee: "Neha Singh",
    employeeNumber: "EMP003",
    branch: "Ujjain",
    date: "2026-10-05",
    cash: 2000,
    online: 0,
  },

  // =========================
  // POOJA SHARMA - UJJAIN
  // =========================
  {
    id: 16,
    employee: "Pooja Sharma",
    employeeNumber: "EMP004",
    branch: "Ujjain",
    date: "2026-10-01",
    cash: 800,
    online: 1200,
  },
  {
    id: 17,
    employee: "Pooja Sharma",
    employeeNumber: "EMP004",
    branch: "Ujjain",
    date: "2026-10-02",
    cash: 1500,
    online: 500,
  },
  {
    id: 18,
    employee: "Pooja Sharma",
    employeeNumber: "EMP004",
    branch: "Ujjain",
    date: "2026-10-03",
    cash: 1000,
    online: 0,
  },
  {
    id: 19,
    employee: "Pooja Sharma",
    employeeNumber: "EMP004",
    branch: "Ujjain",
    date: "2026-10-04",
    cash: 0,
    online: 1800,
  },
  {
    id: 20,
    employee: "Pooja Sharma",
    employeeNumber: "EMP004",
    branch: "Ujjain",
    date: "2026-10-05",
    cash: 2000,
    online: 500,
  },

  // =========================
  // RIYA PATEL - BHOPAL
  // =========================
  {
    id: 21,
    employee: "Riya Patel",
    employeeNumber: "EMP005",
    branch: "Bhopal",
    date: "2026-10-01",
    cash: 2000,
    online: 0,
  },
  {
    id: 22,
    employee: "Riya Patel",
    employeeNumber: "EMP005",
    branch: "Bhopal",
    date: "2026-10-02",
    cash: 0,
    online: 1500,
  },
  {
    id: 23,
    employee: "Riya Patel",
    employeeNumber: "EMP005",
    branch: "Bhopal",
    date: "2026-10-03",
    cash: 1800,
    online: 700,
  },
  {
    id: 24,
    employee: "Riya Patel",
    employeeNumber: "EMP005",
    branch: "Bhopal",
    date: "2026-10-04",
    cash: 1000,
    online: 1000,
  },
  {
    id: 25,
    employee: "Riya Patel",
    employeeNumber: "EMP005",
    branch: "Bhopal",
    date: "2026-10-05",
    cash: 2500,
    online: 0,
  },

  // =========================
  // VIKAS JAIN - BHOPAL
  // =========================
  {
    id: 26,
    employee: "Vikas Jain",
    employeeNumber: "EMP006",
    branch: "Bhopal",
    date: "2026-10-01",
    cash: 1200,
    online: 800,
  },
  {
    id: 27,
    employee: "Vikas Jain",
    employeeNumber: "EMP006",
    branch: "Bhopal",
    date: "2026-10-02",
    cash: 2000,
    online: 0,
  },
  {
    id: 28,
    employee: "Vikas Jain",
    employeeNumber: "EMP006",
    branch: "Bhopal",
    date: "2026-10-03",
    cash: 0,
    online: 2200,
  },
  {
    id: 29,
    employee: "Vikas Jain",
    employeeNumber: "EMP006",
    branch: "Bhopal",
    date: "2026-10-04",
    cash: 1500,
    online: 500,
  },
  {
    id: 30,
    employee: "Vikas Jain",
    employeeNumber: "EMP006",
    branch: "Bhopal",
    date: "2026-10-05",
    cash: 2000,
    online: 1000,
  },
];