package com.example.controller;

import com.example.models.Container;
import com.example.service.ContainerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/containers")
public class ContainerController {
    @Autowired
    private ContainerService containerService;

    @GetMapping
    public ResponseEntity<List<Container>> getAllContainers(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "containerId", required = false) Long containerId,
            @RequestParam(value = "containerName", required = false) String containerName
    ) {
        return ResponseEntity.ok(containerService.findAll(page, size, containerId, containerName));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Container> getContainerById(@PathVariable Long id) {
        return ResponseEntity.of(containerService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Container> createContainer(@RequestBody Container container) {
        return ResponseEntity.ok(containerService.save(container));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Container> updateContainer(@PathVariable Long id, @RequestBody Container container) {
        return ResponseEntity.ok(containerService.update(id, container));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContainer(@PathVariable Long id) {
        containerService.deleteById(id);
        return ResponseEntity.ok().build();
    }
}