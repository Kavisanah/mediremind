package com.mediremind.scheduler;

import com.mediremind.enums.AppointmentStatus;
import com.mediremind.enums.Frequency;
import com.mediremind.enums.Status;
import com.mediremind.model.*;
import com.mediremind.repository.AppointmentRepository;
import com.mediremind.repository.MedicineLogRepository;
import com.mediremind.repository.MedicineRepository;
import com.mediremind.repository.MedicineScheduleRepository;
import com.mediremind.service.EmailService;
import com.mediremind.service.ObserverService;
import com.mediremind.service.ObserverService.NotifyType;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ReminderSchedulerTest {

    @Mock
    private MedicineScheduleRepository medicineScheduleRepository;

    @Mock
    private MedicineLogRepository medicineLogRepository;

    @Mock
    private MedicineRepository medicineRepository;

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private ObserverService observerService;

    @InjectMocks
    private ReminderScheduler reminderScheduler;

    @Test
    public void testSendMedicineReminders_NotLoggedYet() {
        // Arrange
        User user = User.builder().id(1L).name("John Doe").email("john@example.com").build();
        Medicine medicine = Medicine.builder().id(2L).name("Aspirin").dosage("1 tablet").notes("Take with water").user(user).build();
        MedicineSchedule schedule = MedicineSchedule.builder().id(3L).medicine(medicine).reminderTime(LocalTime.NOON).build();

        when(medicineScheduleRepository.findSchedulesDueAt(any(LocalTime.class)))
                .thenReturn(List.of(schedule));
        when(medicineLogRepository.existsByMedicineIdAndScheduledTime(anyLong(), any(LocalDateTime.class)))
                .thenReturn(false);
        when(observerService.getObserverEmailsForPatient(anyLong(), any(NotifyType.class)))
                .thenReturn(List.of("guardian@example.com"));

        // Act
        reminderScheduler.sendMedicineReminders();

        // Assert
        verify(medicineLogRepository, times(1)).save(any(MedicineLog.class));
        verify(emailService, times(1)).sendMedicineReminder(
                eq("john@example.com"), eq("John Doe"), eq("Aspirin"), eq("1 tablet"), eq("Take with water"), anyString()
        );
        verify(emailService, times(1)).sendObserverMedicineReminder(
                eq(List.of("guardian@example.com")), eq("John Doe"), eq("Aspirin"), eq("1 tablet"), eq("Take with water"), anyString()
        );
    }

    @Test
    public void testSendMedicineReminders_AlreadyLogged() {
        // Arrange
        User user = User.builder().id(1L).name("John Doe").email("john@example.com").build();
        Medicine medicine = Medicine.builder().id(2L).name("Aspirin").dosage("1 tablet").notes("Take with water").user(user).build();
        MedicineSchedule schedule = MedicineSchedule.builder().id(3L).medicine(medicine).reminderTime(LocalTime.NOON).build();

        when(medicineScheduleRepository.findSchedulesDueAt(any(LocalTime.class)))
                .thenReturn(List.of(schedule));
        when(medicineLogRepository.existsByMedicineIdAndScheduledTime(anyLong(), any(LocalDateTime.class)))
                .thenReturn(true);

        // Act
        reminderScheduler.sendMedicineReminders();

        // Assert
        verify(medicineLogRepository, never()).save(any(MedicineLog.class));
        verify(emailService, never()).sendMedicineReminder(anyString(), anyString(), anyString(), anyString(), anyString(), anyString());
    }

    @Test
    public void testSendMissedDoseAlerts_SendsAlert() {
        // Arrange
        User user = User.builder().id(1L).name("John Doe").email("john@example.com").build();
        Medicine medicine = Medicine.builder().id(2L).name("Aspirin").dosage("1 tablet").user(user).build();
        MedicineLog log = MedicineLog.builder()
                .id(4L)
                .medicine(medicine)
                .scheduledTime(LocalDateTime.now().minusMinutes(40))
                .status(Status.MISSED)
                .observerAlerted(false)
                .build();

        when(medicineLogRepository.findMissedLogsOlderThan(any(LocalDateTime.class)))
                .thenReturn(List.of(log));
        when(observerService.getObserverEmailsForPatient(anyLong(), any(NotifyType.class)))
                .thenReturn(List.of("guardian@example.com"));

        // Act
        reminderScheduler.sendMissedDoseAlerts();

        // Assert
        assertTrue(log.getObserverAlerted());
        verify(emailService, times(1)).sendObserverMissedDoseAlert(
                eq(List.of("guardian@example.com")), eq("John Doe"), eq("Aspirin"), eq("1 tablet"), anyString()
        );
        verify(medicineLogRepository, times(1)).save(log);
    }

    @Test
    public void testSendAppointmentReminders() {
        // Arrange
        User user = User.builder().id(1L).name("John Doe").email("john@example.com").build();
        Appointment apt = Appointment.builder()
                .id(5L)
                .user(user)
                .doctorName("Dr. Smith")
                .location("Health Clinic")
                .appointmentDate(LocalDateTime.now().plusHours(12))
                .reminderSent(false)
                .build();

        when(appointmentRepository.findAppointmentsForReminder(any(LocalDateTime.class), any(LocalDateTime.class), eq(AppointmentStatus.SCHEDULED)))
                .thenReturn(List.of(apt));
        when(observerService.getObserverEmailsForPatient(anyLong(), any(NotifyType.class)))
                .thenReturn(List.of("guardian@example.com"));

        // Act
        reminderScheduler.sendAppointmentReminders();

        // Assert
        assertTrue(apt.getReminderSent());
        verify(emailService, times(1)).sendAppointmentReminder(
                eq("john@example.com"), eq("John Doe"), eq("Dr. Smith"), eq("Health Clinic"), anyString()
        );
        verify(emailService, times(1)).sendObserverAppointmentReminder(
                eq(List.of("guardian@example.com")), eq("John Doe"), eq("Dr. Smith"), eq("Health Clinic"), anyString()
        );
        verify(appointmentRepository, times(1)).save(apt);
    }

    @Test
    public void testSendWeeklyReports() {
        // Arrange
        User user = User.builder().id(1L).name("John Doe").email("john@example.com").build();
        Medicine medicine = Medicine.builder().id(2L).name("Aspirin").user(user).build();
        MedicineSchedule schedule = MedicineSchedule.builder().id(3L).medicine(medicine).build();

        when(medicineScheduleRepository.findAll()).thenReturn(List.of(schedule));
        when(medicineLogRepository.countLogsByUserIdAndStatusInRange(eq(1L), eq(Status.TAKEN), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(5L);
        when(medicineLogRepository.countLogsByUserIdAndStatusInRange(eq(1L), eq(Status.MISSED), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(2L);
        when(observerService.getObserverEmailsForPatient(anyLong(), any(NotifyType.class)))
                .thenReturn(List.of("guardian@example.com"));

        // Act
        reminderScheduler.sendWeeklyReports();

        // Assert
        verify(emailService, times(1)).sendWeeklyReport(eq("john@example.com"), eq("John Doe"), eq(5L), eq(2L));
        verify(emailService, times(1)).sendObserverWeeklyReport(eq(List.of("guardian@example.com")), eq("John Doe"), eq(5L), eq(2L));
    }

    @Test
    public void testCleanupExpiredRecords() {
        // Arrange
        Medicine expiredMed = Medicine.builder().id(2L).name("Old Medicine").isActive(true).endDate(LocalDate.now().minusDays(1)).build();
        Appointment pastApt = Appointment.builder().id(5L).doctorName("Dr. Old").status(AppointmentStatus.SCHEDULED).appointmentDate(LocalDateTime.now().minusHours(1)).build();

        when(medicineRepository.findByIsActiveTrueAndEndDateBefore(any(LocalDate.class)))
                .thenReturn(List.of(expiredMed));
        when(appointmentRepository.findByStatusAndAppointmentDateBefore(eq(AppointmentStatus.SCHEDULED), any(LocalDateTime.class)))
                .thenReturn(List.of(pastApt));

        // Act
        reminderScheduler.cleanupExpiredRecords();

        // Assert
        assertFalse(expiredMed.getIsActive());
        verify(medicineRepository, times(1)).saveAll(List.of(expiredMed));

        assertTrue(pastApt.getStatus() == AppointmentStatus.COMPLETED);
        verify(appointmentRepository, times(1)).saveAll(List.of(pastApt));
    }
}
