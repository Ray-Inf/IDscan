-- DropForeignKey
ALTER TABLE `facilityattendancelog` DROP FOREIGN KEY `FacilityAttendanceLog_cardId_fkey`;

-- AlterTable
ALTER TABLE `facilityattendancelog` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'PRESENT';

-- CreateTable
CREATE TABLE `AttendanceLog` (
    `id` VARCHAR(191) NOT NULL,
    `cardId` VARCHAR(191) NOT NULL,
    `loginTime` DATETIME(3) NOT NULL,
    `logoutTime` DATETIME(3) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PRESENT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AttendanceLog` ADD CONSTRAINT `attendance_log_student_fkey` FOREIGN KEY (`cardId`) REFERENCES `Student`(`cardId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AttendanceLog` ADD CONSTRAINT `attendance_log_teacher_fkey` FOREIGN KEY (`cardId`) REFERENCES `Teacher`(`cardId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AttendanceLog` ADD CONSTRAINT `attendance_log_admin_fkey` FOREIGN KEY (`cardId`) REFERENCES `Admin`(`cardId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AttendanceLog` ADD CONSTRAINT `attendance_log_librarian_fkey` FOREIGN KEY (`cardId`) REFERENCES `Librarian`(`cardId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AttendanceLog` ADD CONSTRAINT `attendance_log_gym_master_fkey` FOREIGN KEY (`cardId`) REFERENCES `GymMaster`(`cardId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AttendanceLog` ADD CONSTRAINT `attendance_log_hostel_warden_fkey` FOREIGN KEY (`cardId`) REFERENCES `HostelWarden`(`cardId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FacilityAttendanceLog` ADD CONSTRAINT `facility_attendance_log_student_fkey` FOREIGN KEY (`cardId`) REFERENCES `Student`(`cardId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FacilityAttendanceLog` ADD CONSTRAINT `facility_attendance_log_teacher_fkey` FOREIGN KEY (`cardId`) REFERENCES `Teacher`(`cardId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FacilityAttendanceLog` ADD CONSTRAINT `facility_attendance_log_admin_fkey` FOREIGN KEY (`cardId`) REFERENCES `Admin`(`cardId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FacilityAttendanceLog` ADD CONSTRAINT `facility_attendance_log_librarian_fkey` FOREIGN KEY (`cardId`) REFERENCES `Librarian`(`cardId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FacilityAttendanceLog` ADD CONSTRAINT `facility_attendance_log_gym_master_fkey` FOREIGN KEY (`cardId`) REFERENCES `GymMaster`(`cardId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FacilityAttendanceLog` ADD CONSTRAINT `facility_attendance_log_hostel_warden_fkey` FOREIGN KEY (`cardId`) REFERENCES `HostelWarden`(`cardId`) ON DELETE RESTRICT ON UPDATE CASCADE;
