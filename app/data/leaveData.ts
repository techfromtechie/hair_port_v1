export type Employee = {
  name: string;
  employeeNumber: string;
  branch: string;
};

export type Leave = {
  id: number;
  employee: string;
  employeeNumber: string;
  branch: string;
  date: string;
  leaveType: "Full" | "Half";
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

export const leaves: Leave[] = [
  {
    id: 1,
    employee: "Rahul Sharma",
    employeeNumber: "EMP001",
    branch: "Indore",
    date: "2026-10-01",
    leaveType: "Full",
  },
  {
    id: 2,
    employee: "Rahul Sharma",
    employeeNumber: "EMP001",
    branch: "Indore",
    date: "2026-10-03",
    leaveType: "Half",
  },
  {
    id: 3,
    employee: "Rahul Sharma",
    employeeNumber: "EMP001",
    branch: "Indore",
    date: "2026-10-05",
    leaveType: "Full",
  },
  {
    id: 4,
    employee: "Amit Verma",
    employeeNumber: "EMP002",
    branch: "Indore",
    date: "2026-10-02",
    leaveType: "Half",
  },
  {
    id: 5,
    employee: "Amit Verma",
    employeeNumber: "EMP002",
    branch: "Indore",
    date: "2026-10-04",
    leaveType: "Full",
  },
  {
    id: 6,
    employee: "Neha Singh",
    employeeNumber: "EMP003",
    branch: "Ujjain",
    date: "2026-10-01",
    leaveType: "Half",
  },
  {
    id: 7,
    employee: "Neha Singh",
    employeeNumber: "EMP003",
    branch: "Ujjain",
    date: "2026-10-04",
    leaveType: "Full",
  },
  {
    id: 8,
    employee: "Pooja Sharma",
    employeeNumber: "EMP004",
    branch: "Ujjain",
    date: "2026-10-02",
    leaveType: "Full",
  },
  {
    id: 9,
    employee: "Pooja Sharma",
    employeeNumber: "EMP004",
    branch: "Ujjain",
    date: "2026-10-05",
    leaveType: "Half",
  },
  {
    id: 10,
    employee: "Riya Patel",
    employeeNumber: "EMP005",
    branch: "Bhopal",
    date: "2026-10-01",
    leaveType: "Full",
  },
  {
    id: 11,
    employee: "Riya Patel",
    employeeNumber: "EMP005",
    branch: "Bhopal",
    date: "2026-10-03",
    leaveType: "Half",
  },
  {
    id: 12,
    employee: "Vikas Jain",
    employeeNumber: "EMP006",
    branch: "Bhopal",
    date: "2026-10-02",
    leaveType: "Full",
  },
  {
    id: 13,
    employee: "Vikas Jain",
    employeeNumber: "EMP006",
    branch: "Bhopal",
    date: "2026-10-05",
    leaveType: "Half",
  },
];