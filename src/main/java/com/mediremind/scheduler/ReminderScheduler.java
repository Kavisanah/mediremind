package com.mediremind.scheduler;

import com.mediremind.enums.AppointmentStatus;
import com.mediremind.enums.Status;
import com.mediremind.model.Appointment;
import com.mediremind.model.MedicineLog;
import com.mediremind.model.MedicineSchedule;
import com.mediremind.repository.AppointmentRepository;
import com.mediremind.repository.MedicineLogRepository;
import com.mediremind.repository.MedicineScheduleRepository;
import com.mediremind.service.EmailService;
import com.mediremind.service.ObserverService;
import com.mediremind.service.ObserverService.NotifyType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Component
@Slf4j
public class ReminderScheduler {

    private final MedicineScheduleRepository medicineScheduleRepository;
    private final MedicineLogRepository      medicineLogRepository;
    private final AppointmentRepository      appointmentRepository;
    private final EmailService               emailService;
    private final ObserverService            observerService;

    public ReminderScheduler(
            MedicineScheduleRepository medicineScheduleRepository,
            MedicineLogRepository      medicineLogRepository,
            AppointmentRepository      appointmentRepository,
            EmailService               emailService,
            ObserverService            observerService) {
        this.medicineScheduleRepository = medicineScheduleRepository;
        this.medicineLogRepository      = medicineLogRepository;
        this.appointmentRepository      = appointmentRepository;
        this.emailService               = emailService;
        this.observerService            = observerService;
    }

    // ── Medicine reminders (every minute) ────────────────────────────────

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void sendMedicineReminders() {
        LocalTime      now           = LocalTime.now().withSecond(0).withNano(0);
        LocalDateTime  scheduledTime = LocalDateTime.now().withSecond(0).withNano(0);

        List<MedicineSchedule> schedules = medicineScheduleRepository.findSchedulesDueAt(now);

        for (MedicineSchedule schedule : schedules) {
            Long userId     = schedule.getMedicine().getUser().getId();
            Long medicineId = schedule.getMedicine().getId();

            boolean alreadyLogged = medicineLogRepository
                    .existsByMedicineIdAndScheduledTime(medicineId, scheduledTime);

            if (!alreadyLogged) {
                // create MISSED log (patient marks it TAKEN from the app)
                medicineLogRepository.save(MedicineLog.builder()
                        .medicine(schedule.getMedicine())
                        .scheduledTime(scheduledTime)
                        .status(Status.MISSED)
                        .build());

                String patientEmail = schedule.getMedicine().getUser().getEmail();
                String patientName  = schedule.getMedicine().getUser().getName();
                String medName      = schedule.getMedicine().getName();
                String dosage       = schedule.getMedicine().getDosage();
                String notes        = schedule.getMedicine().getNotes();

                // notify patient
                emailService.sendMedicineReminder(
                        patientEmail, patientName, medName, dosage, notes, now.toString());

                // notify observers (medicine reminder preference)
                List<String> observerEmails = observerService
                        .getObserverEmailsForPatient(userId, NotifyType.MEDICINE_REMINDER);
                if (!observerEmails.isEmpty()) {
                    emailService.sendObserverMedicineReminder(
                            observerEmails, patientName, medName, dosage, notes, now.toString());
                }

                log.debug("Medicine reminder sent: {} → {}", medName, patientEmail);
            }
        }
    }

    // ── Missed-dose alert (runs 30 minutes after each hour) ───────────────
    // Finds logs that are still MISSED and are 30+ minutes old.

    @Scheduled(cron = "0 30 * * * *")   // :30 of every hour
    @Transactional
    public void sendMissedDoseAlerts() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(30);

        List<MedicineLog> missedLogs = medicineLogRepository
                .findMissedLogsOlderThan(cutoff);

        for (MedicineLog log : missedLogs) {
            Long   userId      = log.getMedicine().getUser().getId();
            String patientName = log.getMedicine().getUser().getName();

            List<String> observerEmails = observerService
                    .getObserverEmailsForPatient(userId, NotifyType.MISSED_DOSE);

            if (!observerEmails.isEmpty()) {
                emailService.sendObserverMissedDoseAlert(
                        observerEmails,
                        patientName,
                        log.getMedicine().getName(),
                        log.getMedicine().getDosage(),
                        log.getScheduledTime().toString()
                );
            }

            // Always mark as alerted so this log is never processed again
            log.setObserverAlerted(true);
            medicineLogRepository.save(log);
        }
    }

    // ── Appointment reminders (daily at 08:00) ────────────────────────────

    @Scheduled(cron = "0 0 8 * * *")
    @Transactional
    public void sendAppointmentReminders() {
        LocalDateTime start = LocalDateTime.now();
        LocalDateTime end   = LocalDateTime.now().plusDays(1);

        List<Appointment> appointments = appointmentRepository
                .findAppointmentsForReminder(start, end, AppointmentStatus.SCHEDULED);

        for (Appointment apt : appointments) {
            String patientEmail = apt.getUser().getEmail();
            String patientName  = apt.getUser().getName();
            Long   userId       = apt.getUser().getId();

            // notify patient
            emailService.sendAppointmentReminder(
                    patientEmail, patientName,
                    apt.getDoctorName(), apt.getLocation(),
                    apt.getAppointmentDate().toString());

            // notify observers (appointment preference)
            List<String> observerEmails = observerService
                    .getObserverEmailsForPatient(userId, NotifyType.APPOINTMENT);
            if (!observerEmails.isEmpty()) {
                emailService.sendObserverAppointmentReminder(
                        observerEmails, patientName,
                        apt.getDoctorName(), apt.getLocation(),
                        apt.getAppointmentDate().toString());
            }

            apt.setReminderSent(true);
            appointmentRepository.save(apt);
            log.debug("Appointment reminder sent to: {}", patientEmail);
        }
    }

    // ── Weekly reports (every Sunday at 08:00) ────────────────────────────

    @Scheduled(cron = "0 0 8 * * SUN")
    @Transactional
    public void sendWeeklyReports() {
        LocalDateTime weekStart = LocalDateTime.now().minusDays(7);
        LocalDateTime weekEnd   = LocalDateTime.now();

        medicineScheduleRepository.findAll()
                .stream()
                .map(s -> s.getMedicine().getUser())
                .distinct()
                .forEach(user -> {
                    long taken  = medicineLogRepository.countLogsByUserIdAndStatusInRange(
                            user.getId(), Status.TAKEN,  weekStart, weekEnd);
                    long missed = medicineLogRepository.countLogsByUserIdAndStatusInRange(
                            user.getId(), Status.MISSED, weekStart, weekEnd);

                    // patient report
                    emailService.sendWeeklyReport(user.getEmail(), user.getName(), taken, missed);

                    // observer weekly report
                    List<String> observerEmails = observerService
                            .getObserverEmailsForPatient(user.getId(), NotifyType.WEEKLY_REPORT);
                    if (!observerEmails.isEmpty()) {
                        emailService.sendObserverWeeklyReport(
                                observerEmails, user.getName(), taken, missed);
                    }

                    log.debug("Weekly report sent to: {}", user.getEmail());
                });
    }
}
