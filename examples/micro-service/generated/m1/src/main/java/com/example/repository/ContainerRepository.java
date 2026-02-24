package com.example.repository;

import com.example.models.Container;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContainerRepository extends JpaRepository<Container, Long> {
    List<Container> findByContainerId(Long containerId);
    List<Container> findByContainerName(String containerName);
    List<Container> findByProductId(Long productId);
}