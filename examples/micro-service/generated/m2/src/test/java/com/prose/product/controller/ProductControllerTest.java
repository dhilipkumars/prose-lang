package com.prose.product.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.prose.product.model.Product;
import com.prose.product.repository.ProductRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProductRepository productRepository;

    @BeforeEach
    void setUp() {
        productRepository.deleteAll();
    }

    @Test
    @Order(1)
    void createProduct_shouldReturn201() throws Exception {
        Product product = new Product("Rice Bag", "Premium Basmati Rice 5kg",
                new BigDecimal("12.99"), 100);

        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(product)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.productId").isNotEmpty())
                .andExpect(jsonPath("$.productName").value("Rice Bag"))
                .andExpect(jsonPath("$.productAmount").value(12.99))
                .andExpect(jsonPath("$.productQuantity").value(100));
    }

    @Test
    @Order(2)
    void getById_shouldReturnProduct() throws Exception {
        Product saved = productRepository.save(
                new Product("Wheat Flour", "Whole Wheat 10kg", new BigDecimal("8.50"), 200));

        mockMvc.perform(get("/api/products/" + saved.getProductId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productName").value("Wheat Flour"));
    }

    @Test
    @Order(3)
    void getById_notFound_shouldReturn404() throws Exception {
        mockMvc.perform(get("/api/products/9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @Order(4)
    void updateProduct_shouldReturnUpdated() throws Exception {
        Product saved = productRepository.save(
                new Product("Old Name", "Old Desc", new BigDecimal("5.00"), 10));
        Product updated = new Product("New Name", "New Desc", new BigDecimal("7.50"), 20);

        mockMvc.perform(put("/api/products/" + saved.getProductId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productName").value("New Name"))
                .andExpect(jsonPath("$.productAmount").value(7.50));
    }

    @Test
    @Order(5)
    void deleteProduct_shouldReturn204() throws Exception {
        Product saved = productRepository.save(
                new Product("To Delete", "desc", new BigDecimal("1.00"), 1));

        mockMvc.perform(delete("/api/products/" + saved.getProductId()))
                .andExpect(status().isNoContent());
    }

    @Test
    @Order(6)
    void listProducts_shouldReturnPaginatedResults() throws Exception {
        for (int i = 0; i < 15; i++) {
            productRepository.save(new Product("Product " + i, "Desc " + i,
                    new BigDecimal(i + 1), i + 10));
        }

        mockMvc.perform(get("/api/products")
                        .param("page", "0")
                        .param("size", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(5)))
                .andExpect(jsonPath("$.totalElements").value(15))
                .andExpect(jsonPath("$.totalPages").value(3));
    }

    @Test
    @Order(7)
    void listProducts_filterByName_shouldReturnFiltered() throws Exception {
        productRepository.save(new Product("Alpha Rice", "desc", new BigDecimal("5.00"), 10));
        productRepository.save(new Product("Beta Wheat", "desc", new BigDecimal("6.00"), 20));

        mockMvc.perform(get("/api/products")
                        .param("productName", "alpha"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].productName").value("Alpha Rice"));
    }
}
