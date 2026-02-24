package com.prose.container.repository;

import com.prose.container.model.Container;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContainerRepository extends JpaRepository<Container, Long> {

    List<Container> findByProductId(Long productId);

    @Query("SELECT c FROM Container c WHERE " +
           "(:containerId IS NULL OR c.containerId = :containerId) AND " +
           "(:containerName IS NULL OR LOWER(c.containerName) LIKE LOWER(CONCAT('%', CAST(:containerName AS string), '%')))")
    Page<Container> findWithFilters(
            @Param("containerId") Long containerId,
            @Param("containerName") String containerName,
            Pageable pageable);
}
