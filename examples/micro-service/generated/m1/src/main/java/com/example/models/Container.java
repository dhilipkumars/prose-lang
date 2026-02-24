package com.example.models;

public class Container {
    private Long containerId;
    private String containerName;
    private Long productId;
    private int quantity;
    private String units;

    // Getters and setters
    public Long getContainerId() { return containerId; }
    public void setContainerId(Long containerId) { this.containerId = containerId; }
    public String getContainerName() { return containerName; }
    public void setContainerName(String containerName) { this.containerName = containerName; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public String getUnits() { return units; }
    public void setUnits(String units) { this.units = units; }
}