package com.mediremind.repository;

import com.mediremind.model.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {

    List<Medicine> findByUserIdAndIsActiveTrue(Long userId);

    Optional<Medicine> findByIdAndUserId(Long id, Long userId);

    long countByUserIdAndIsActiveTrue(Long userId);
}