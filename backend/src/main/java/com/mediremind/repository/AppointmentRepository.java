package com.mediremind.repository;

import com.mediremind.enums.AppointmentStatus;
import com.mediremind.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByUserIdOrderByAppointmentDateAsc(Long userId);

    Optional<Appointment> findByIdAndUserId(Long id, Long userId);

    List<Appointment> findByStatusAndAppointmentDateBefore(AppointmentStatus status, LocalDateTime date);

    @Query("""
            SELECT a FROM Appointment a
            JOIN FETCH a.user u
            WHERE a.appointmentDate >= :start
            AND a.appointmentDate <= :end
            AND a.reminderSent = false
            AND a.status = :status
            """)
    List<Appointment> findAppointmentsForReminder(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("status") AppointmentStatus status
    );

    @Query("""
            SELECT a FROM Appointment a
            WHERE a.user.id = :userId
            AND a.appointmentDate >= :now
            AND a.status = :status
            ORDER BY a.appointmentDate ASC
            """)
    List<Appointment> findUpcomingAppointments(
            @Param("userId") Long userId,
            @Param("now") LocalDateTime now,
            @Param("status") AppointmentStatus status
    );
}