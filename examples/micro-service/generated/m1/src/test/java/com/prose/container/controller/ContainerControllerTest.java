package com.prose.container.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.prose.container.model.Container;
import com.prose.container.repository.ContainerRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class ContainerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ContainerRepository containerRepository;

    @BeforeEach
    void setUp() {
        containerRepository.deleteAll();
    }

    @Test
    @Order(1)
    void createContainer_shouldReturn201() throws Exception {
        Container container = new Container("Water Tank", 1L, 100, "liters");

        mockMvc.perform(post("/api/containers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(container)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.containerId").isNotEmpty())
                .andExpect(jsonPath("$.containerName").value("Water Tank"))
                .andExpect(jsonPath("$.productId").value(1))
                .andExpect(jsonPath("$.quantity").value(100))
                .andExpect(jsonPath("$.units").value("liters"));
    }

    @Test
    @Order(2)
    void getById_shouldReturnContainer() throws Exception {
        Container saved = containerRepository.save(new Container("Box A", 2L, 50, "kg"));

        mockMvc.perform(get("/api/containers/" + saved.getContainerId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.containerName").value("Box A"));
    }

    @Test
    @Order(3)
    void getById_notFound_shouldReturn404() throws Exception {
        mockMvc.perform(get("/api/containers/9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @Order(4)
    void getByProductId_shouldReturnList() throws Exception {
        containerRepository.save(new Container("Box A", 5L, 10, "pcs"));
        containerRepository.save(new Container("Box B", 5L, 20, "pcs"));

        mockMvc.perform(get("/api/containers/by-product/5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    @Order(5)
    void updateContainer_shouldReturnUpdated() throws Exception {
        Container saved = containerRepository.save(new Container("Old Name", 1L, 10, "kg"));
        Container updated = new Container("New Name", 1L, 20, "liters");

        mockMvc.perform(put("/api/containers/" + saved.getContainerId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.containerName").value("New Name"))
                .andExpect(jsonPath("$.quantity").value(20));
    }

    @Test
    @Order(6)
    void deleteContainer_shouldReturn204() throws Exception {
        Container saved = containerRepository.save(new Container("To Delete", 1L, 1, "pcs"));

        mockMvc.perform(delete("/api/containers/" + saved.getContainerId()))
                .andExpect(status().isNoContent());
    }

    @Test
    @Order(7)
    void listContainers_shouldReturnPaginatedResults() throws Exception {
        for (int i = 0; i < 15; i++) {
            containerRepository.save(new Container("Container " + i, 1L, i + 1, "pcs"));
        }

        mockMvc.perform(get("/api/containers")
                        .param("page", "0")
                        .param("size", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(5)))
                .andExpect(jsonPath("$.totalElements").value(15))
                .andExpect(jsonPath("$.totalPages").value(3));
    }

    @Test
    @Order(8)
    void listContainers_filterByName_shouldReturnFiltered() throws Exception {
        containerRepository.save(new Container("Alpha Tank", 1L, 10, "liters"));
        containerRepository.save(new Container("Beta Box", 2L, 20, "kg"));

        mockMvc.perform(get("/api/containers")
                        .param("containerName", "alpha"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].containerName").value("Alpha Tank"));
    }
}
