package com.aditi.backend.controller;

import com.aditi.backend.dto.ApiResponseDTO;
import com.aditi.backend.dto.ItemDTO;
import com.aditi.backend.service.ItemService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    @GetMapping
    public ResponseEntity<ApiResponseDTO<List<ItemDTO>>> getAllItems() {
        List<ItemDTO> items = itemService.getAllItems();
        return ResponseEntity.ok(ApiResponseDTO.success(items));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<ItemDTO>> getItemById(@PathVariable Long id) {
        ItemDTO item = itemService.getItemById(id);
        return ResponseEntity.ok(ApiResponseDTO.success(item));
    }

    @PostMapping
    public ResponseEntity<ApiResponseDTO<ItemDTO>> createItem(@Valid @RequestBody ItemDTO itemDTO) {
        ItemDTO createdItem = itemService.createItem(itemDTO);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponseDTO.success("Item created successfully", createdItem));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<ItemDTO>> updateItem(
            @PathVariable Long id,
            @Valid @RequestBody ItemDTO itemDTO) {
        ItemDTO updatedItem = itemService.updateItem(id, itemDTO);
        return ResponseEntity.ok(ApiResponseDTO.success("Item updated successfully", updatedItem));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<Void>> deleteItem(@PathVariable Long id) {
        itemService.deleteItem(id);
        return ResponseEntity.ok(ApiResponseDTO.success("Item deleted successfully", null));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponseDTO<List<ItemDTO>>> searchItems(
            @RequestParam(required = true) String q) {
        List<ItemDTO> items = itemService.searchItems(q);
        return ResponseEntity.ok(ApiResponseDTO.success(items));
    }
}