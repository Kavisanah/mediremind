package com.mediremind.repository;

import com.mediremind.enums.Status;
import com.mediremind.model.MedicineLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MedicineLogRepository extends JpaRepository<MedicineLog, Long> {

    // ── Existing queries (unchanged) ──────────────────────────────────────

    @Query("""
            SELECT ml FROM MedicineLog ml
            JOIN FETCH ml.medicine m
            WHERE m.user.id = :userId
            AND ml.scheduledTime >= :start
            AND ml.scheduledTime <= :end
            ORDER BY ml.scheduledTime ASC
            """)
    List<MedicineLog> findLogsInRange(
            @Param("userId") Long userId,
            @Param("start")  LocalDateTime start,
            @Param("end")    LocalDateTime end
    );

    Optional<MedicineLog> findByIdAndMedicineUserId(Long id, Long userId);

    boolean existsByMedicineIdAndScheduledTime(Long medicineId, LocalDateTime scheduledTime);

    @Query("""
            SELECT COUNT(ml) FROM MedicineLog ml
            WHERE ml.medicine.user.id = :userId
            AND ml.status = :status
            AND ml.scheduledTime >= :start
            AND ml.scheduledTime <= :end
            """)
    long countLogsByUserIdAndStatusInRange(
            @Param("userId") Long userId,
            @Param("status") Status status,
            @Param("start")  LocalDateTime start,
            @Param("end")    LocalDateTime end
    );

    // ── New query for missed-dose observer alerts ─────────────────────────

    /**
     * Returns MISSED logs whose scheduled time is at least {@code cutoff} minutes
     * in the past and whose observers have NOT yet been notified.
     *
     * JOIN FETCH pulls the medicine + user in the same query so the scheduler
     * can read patient name / email without extra lazy-load round-trips.
     *
     * Called by ReminderScheduler#sendMissedDoseAlerts() every 30 minutes.
     * After alerting, the scheduler sets observerAlerted = true on each log
     * so this query never returns the same row twice.
     */
    @Query("""
            SELECT ml FROM MedicineLog ml
            JOIN FETCH ml.medicine m
            JOIN FETCH m.user u
            WHERE ml.status = com.mediremind.enums.Status.MISSED
              AND ml.scheduledTime <= :cutoff
              AND ml.observerAlerted = false
            ORDER BY ml.scheduledTime ASC
            """)
    List<MedicineLog> findMissedLogsOlderThan(@Param("cutoff") LocalDateTime cutoff);
}