package com.prose.container.controller;

import com.prose.container.model.Container;
import com.prose.container.service.ContainerService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/containers")
@CrossOrigin(origins = "*")
public class ContainerController {

    private final ContainerService containerService;

    public ContainerController(ContainerService containerService) {
        this.containerService = containerService;
    }

    @PostMapping
    public ResponseEntity<Container> create(@Valid @RequestBody Container container) {
        Container created = containerService.create(container);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{containerId}")
    public ResponseEntity<Container> getById(@PathVariable Long containerId) {
        return containerService.getById(containerId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-product/{productId}")
    public ResponseEntity<List<Container>> getByProductId(@PathVariable Long productId) {
        List<Container> containers = containerService.getByProductId(productId);
        return ResponseEntity.ok(containers);
    }

    @PutMapping("/{containerId}")
    public ResponseEntity<Container> update(@PathVariable Long containerId,
                                            @Valid @RequestBody Container container) {
        try {
            Container updated = containerService.update(containerId, container);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{containerId}")
    public ResponseEntity<Void> delete(@PathVariable Long containerId) {
        try {
            containerService.delete(containerId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping
    public ResponseEntity<Page<Container>> list(
            @RequestParam(required = false) Long containerId,
            @RequestParam(required = false) String containerName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "containerId") String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        Page<Container> result = containerService.list(containerId, containerName, pageable);
        return ResponseEntity.ok(result);
    }
}
