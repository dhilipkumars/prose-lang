package com.example.service;

import com.example.models.Container;
import com.example.repository.ContainerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ContainerService {
    private final ContainerRepository containerRepository;

    public ContainerService(ContainerRepository containerRepository) {
        this.containerRepository = containerRepository;
    }

    @Transactional(readOnly = true)
    public List<Container> findAll(int page, int size, Long containerId, String containerName) {
        if (containerId != null) {
            return containerRepository.findByContainerId(containerId);
        } else if (containerName != null) {
            return containerRepository.findByContainerName(containerName);
        } else {
            return containerRepository.findAll(org.springframework.data.domain.PageRequest.of(page, size)).getContent();
        }
    }

    @Transactional(readOnly = true)
    public Optional<Container> findById(Long id) {
        return containerRepository.findById(id);
    }

    @Transactional
    public Container save(Container container) {
        return containerRepository.save(container);
    }

    @Transactional
    public Container update(Long id, Container container) {
        Container existing = containerRepository.findById(id).orElseThrow(() -> new RuntimeException("Container not found"));
        existing.setContainerName(container.getContainerName());
        existing.setProductId(container.getProductId());
        existing.setQuantity(container.getQuantity());
        existing.setUnits(container.getUnits());
        return containerRepository.save(existing);
    }

    @Transactional
    public void deleteById(Long id) {
        containerRepository.deleteById(id);
    }
}