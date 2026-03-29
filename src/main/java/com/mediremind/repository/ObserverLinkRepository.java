package com.mediremind.repository;

import com.mediremind.enums.ObserverStatus;
import com.mediremind.model.ObserverLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ObserverLinkRepository extends JpaRepository<ObserverLink, Long> {

    @Query("""
        SELECT ol FROM ObserverLink ol
        WHERE ol.patient.id = :patientId
          AND ol.status = :status
    """)
    List<ObserverLink> findByPatientIdAndStatus(
            @Param("patientId") Long patientId,
            @Param("status") ObserverStatus status);

    // FIX: new method — fetches ACTIVE + PENDING together for the guardians list page
    @Query("""
        SELECT ol FROM ObserverLink ol
        WHERE ol.patient.id = :patientId
          AND ol.status IN :statuses
    """)
    List<ObserverLink> findByPatientIdAndStatusIn(
            @Param("patientId") Long patientId,
            @Param("statuses") List<ObserverStatus> statuses);

    @Query("""
        SELECT ol FROM ObserverLink ol
        WHERE ol.observer.id = :observerId
          AND ol.status = :status
    """)
    List<ObserverLink> findByObserverIdAndStatus(
            @Param("observerId") Long observerId,
            @Param("status") ObserverStatus status);

    Optional<ObserverLink> findByInviteToken(String inviteToken);

    boolean existsByPatientIdAndObserverEmailAndStatusNot(
            Long patientId, String observerEmail, ObserverStatus status);
}
