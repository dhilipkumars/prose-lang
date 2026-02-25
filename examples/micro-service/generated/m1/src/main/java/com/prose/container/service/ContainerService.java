package com.prose.container.service;

import com.prose.container.model.Container;
import com.prose.container.repository.ContainerRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ContainerService {

    private final ContainerRepository containerRepository;

    public ContainerService(ContainerRepository containerRepository) {
        this.containerRepository = containerRepository;
    }

    public Container create(Container container) {
        return containerRepository.save(container);
    }

    public Optional<Container> getById(Long containerId) {
        return containerRepository.findById(containerId);
    }

    public List<Container> getByProductId(Long productId) {
        return containerRepository.findByProductId(productId);
    }

    public Container update(Long containerId, Container updated) {
        return containerRepository.findById(containerId)
                .map(existing -> {
                    existing.setContainerName(updated.getContainerName());
                    existing.setProductId(updated.getProductId());
                    existing.setQuantity(updated.getQuantity());
                    existing.setUnits(updated.getUnits());
                    return containerRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Container not found with id: " + containerId));
    }

    public void delete(Long containerId) {
        if (!containerRepository.existsById(containerId)) {
            throw new RuntimeException("Container not found with id: " + containerId);
        }
        containerRepository.deleteById(containerId);
    }

    public Page<Container> list(Long containerId, String containerName, Pageable pageable) {
        return containerRepository.findWithFilters(containerId, containerName, pageable);
    }
}
