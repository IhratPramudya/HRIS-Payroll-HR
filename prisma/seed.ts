import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const password = await bcrypt.hash("password123", 10);

  // --- Departemen & Jabatan ---
  const engineering = await prisma.department.create({
    data: {
      name: "Engineering",
      positions: {
        create: [{ title: "Software Engineer" }, { title: "Engineering Manager" }],
      },
    },
    include: { positions: true },
  });

  const hrDept = await prisma.department.create({
    data: {
      name: "Human Resources",
      positions: { create: [{ title: "HR Specialist" }, { title: "HR Manager" }] },
    },
    include: { positions: true },
  });

  const sales = await prisma.department.create({
    data: {
      name: "Sales",
      positions: { create: [{ title: "Sales Executive" }] },
    },
    include: { positions: true },
  });

  // --- Users + Employees ---
  const adminUser = await prisma.user.create({
    data: { email: "admin@hris.com", passwordHash: password, role: "ADMIN" },
  });
  const adminEmployee = await prisma.employee.create({
    data: {
      employeeCode: "EMP000001",
      userId: adminUser.id,
      fullName: "Admin Sistem",
      email: "admin@hris.com",
      departmentId: hrDept.id,
      positionId: hrDept.positions.find((p) => p.title === "HR Manager")?.id,
      baseSalary: 15000000,
      status: "ACTIVE",
    },
  });

  const hrUser = await prisma.user.create({
    data: { email: "hr@hris.com", passwordHash: password, role: "HR" },
  });
  const hrEmployee = await prisma.employee.create({
    data: {
      employeeCode: "EMP000002",
      userId: hrUser.id,
      fullName: "Siti Nurhaliza",
      email: "hr@hris.com",
      departmentId: hrDept.id,
      positionId: hrDept.positions.find((p) => p.title === "HR Specialist")?.id,
      managerId: adminEmployee.id,
      baseSalary: 9000000,
      status: "ACTIVE",
    },
  });

  const managerUser = await prisma.user.create({
    data: { email: "manager@hris.com", passwordHash: password, role: "MANAGER" },
  });
  const managerEmployee = await prisma.employee.create({
    data: {
      employeeCode: "EMP000003",
      userId: managerUser.id,
      fullName: "Agus Setiawan",
      email: "manager@hris.com",
      departmentId: engineering.id,
      positionId: engineering.positions.find((p) => p.title === "Engineering Manager")?.id,
      managerId: adminEmployee.id,
      baseSalary: 20000000,
      status: "ACTIVE",
    },
  });

  const employeeUser = await prisma.user.create({
    data: { email: "budi@hris.com", passwordHash: password, role: "EMPLOYEE" },
  });
  const budiEmployee = await prisma.employee.create({
    data: {
      employeeCode: "EMP000004",
      userId: employeeUser.id,
      fullName: "Budi Santoso",
      email: "budi@hris.com",
      departmentId: engineering.id,
      positionId: engineering.positions.find((p) => p.title === "Software Engineer")?.id,
      managerId: managerEmployee.id,
      baseSalary: 12000000,
      status: "ACTIVE",
    },
  });

  await prisma.employee.create({
    data: {
      employeeCode: "EMP000005",
      fullName: "Dewi Lestari",
      email: "dewi@hris.com",
      departmentId: sales.id,
      positionId: sales.positions[0]?.id,
      managerId: adminEmployee.id,
      baseSalary: 8000000,
      status: "PROBATION",
    },
  });

  // --- Attendance ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  await prisma.attendance.create({
    data: {
      employeeId: budiEmployee.id,
      date: today,
      clockIn: new Date(today.getTime() + 8 * 60 * 60 * 1000),
      status: "PRESENT",
    },
  });

  // --- Leave ---
  await prisma.leaveRequest.create({
    data: {
      employeeId: budiEmployee.id,
      type: "ANNUAL",
      startDate: new Date(today.getFullYear(), today.getMonth(), 20),
      endDate: new Date(today.getFullYear(), today.getMonth(), 22),
      days: 3,
      reason: "Liburan keluarga",
      status: "PENDING",
    },
  });

  await prisma.leaveBalance.create({
    data: { employeeId: budiEmployee.id, type: "ANNUAL", year: today.getFullYear(), entitled: 12, used: 0 },
  });

  // --- Recruitment ---
  const job = await prisma.jobPosting.create({
    data: {
      title: "Backend Engineer",
      departmentId: engineering.id,
      description: "Mencari backend engineer berpengalaman dengan Node.js dan PostgreSQL.",
      status: "OPEN",
      openings: 2,
    },
  });

  await prisma.candidate.create({
    data: {
      jobPostingId: job.id,
      fullName: "Rizky Pratama",
      email: "rizky.pratama@example.com",
      stage: "SCREENING",
    },
  });

  // --- Performance ---
  await prisma.goal.create({
    data: {
      employeeId: budiEmployee.id,
      title: "Menyelesaikan modul API pembayaran",
      description: "Implementasi integrasi payment gateway Q4 2026",
      progress: 40,
      status: "IN_PROGRESS",
    },
  });

  // --- Training ---
  await prisma.trainingProgram.create({
    data: {
      title: "Pelatihan Kepemimpinan Dasar",
      description: "Workshop kepemimpinan untuk calon manajer",
      startDate: new Date(today.getFullYear(), today.getMonth() + 1, 5),
      endDate: new Date(today.getFullYear(), today.getMonth() + 1, 6),
      capacity: 15,
    },
  });

  console.log("Seed selesai!");
  console.log("Login demo: admin@hris.com / hr@hris.com / manager@hris.com / budi@hris.com");
  console.log("Password: password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
