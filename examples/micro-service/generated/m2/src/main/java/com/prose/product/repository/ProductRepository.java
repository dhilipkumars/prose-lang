package com.prose.product.repository;

import com.prose.product.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT p FROM Product p WHERE " +
           "(:productId IS NULL OR p.productId = :productId) AND " +
           "(:productName IS NULL OR LOWER(p.productName) LIKE LOWER(CONCAT('%', CAST(:productName AS string), '%')))")
    Page<Product> findWithFilters(
            @Param("productId") Long productId,
            @Param("productName") String productName,
            Pageable pageable);
}
