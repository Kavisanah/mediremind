package com.mediremind.repository;

import com.mediremind.model.MedicineSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface MedicineScheduleRepository extends JpaRepository<MedicineSchedule, Long> {

    List<MedicineSchedule> findByMedicineId(Long medicineId);

    @Transactional
    void deleteByMedicineId(Long medicineId);

    @Query("""
            SELECT ms FROM MedicineSchedule ms
            JOIN FETCH ms.medicine m
            JOIN FETCH m.user u
            WHERE ms.reminderTime = :time
            AND m.isActive = true
            """)
    List<MedicineSchedule> findSchedulesDueAt(@Param("time") LocalTime time);
}