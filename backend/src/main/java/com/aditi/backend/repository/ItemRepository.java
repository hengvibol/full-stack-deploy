package com.aditi.backend.repository;

import com.aditi.backend.model.Item;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {

    // Find by name (case-insensitive)
    List<Item> findByNameContainingIgnoreCase(String name);

    // Find active items
    List<Item> findByIsActiveTrue();

    // Find active items including legacy rows where isActive is null
    List<Item> findByIsActiveTrueOrIsActiveIsNull();

    // Find by name and active status
    List<Item> findByNameContainingIgnoreCaseAndIsActiveTrue(String name);

    // Custom query using JPQL
    @Query("SELECT i FROM Item i WHERE LOWER(i.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(i.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Item> searchItems(@Param("searchTerm") String searchTerm);

    // Count active items
    @Query("SELECT COUNT(i) FROM Item i WHERE i.isActive = true")
    long countActiveItems();

    // Find recent items
    @Query("SELECT i FROM Item i ORDER BY i.createdAt DESC")
    List<Item> findRecentItems(Pageable pageable);
}