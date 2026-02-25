package com.prose.product.service;

import com.prose.product.model.Product;
import com.prose.product.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public Product create(Product product) {
        return productRepository.save(product);
    }

    public Optional<Product> getById(Long productId) {
        return productRepository.findById(productId);
    }

    public Product update(Long productId, Product updated) {
        return productRepository.findById(productId)
                .map(existing -> {
                    existing.setProductName(updated.getProductName());
                    existing.setProductDescription(updated.getProductDescription());
                    existing.setProductAmount(updated.getProductAmount());
                    existing.setProductQuantity(updated.getProductQuantity());
                    return productRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));
    }

    public void delete(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new RuntimeException("Product not found with id: " + productId);
        }
        productRepository.deleteById(productId);
    }

    public Page<Product> list(Long productId, String productName, Pageable pageable) {
        return productRepository.findWithFilters(productId, productName, pageable);
    }
}
