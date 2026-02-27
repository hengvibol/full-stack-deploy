package com.aditi.backend.service;

import com.aditi.backend.dto.ItemDTO;
import com.aditi.backend.exception.ResourceNotFoundException;
import com.aditi.backend.model.Item;
import com.aditi.backend.repository.ItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ItemService {
    private final ItemRepository itemRepository;

    public ItemService(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    @Transactional(readOnly = true)
    public List<ItemDTO> getAllItems() {
        return itemRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ItemDTO getItemById(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));
        return convertToDTO(item);
    }

    @Transactional
    public ItemDTO createItem(ItemDTO itemDTO) {
        Item item = convertToEntity(itemDTO);
        Item savedItem = itemRepository.save(item);
        return convertToDTO(savedItem);
    }

    @Transactional
    public ItemDTO updateItem(Long id, ItemDTO itemDTO) {
        Item existingItem = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));

        existingItem.setName(itemDTO.getName());
        existingItem.setDescription(itemDTO.getDescription());

        Item updatedItem = itemRepository.save(existingItem);
        return convertToDTO(updatedItem);
    }

    @Transactional
    public void deleteItem(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));
        itemRepository.delete(item);
    }

    @Transactional(readOnly = true)
    public List<ItemDTO> searchItems(String searchTerm) {
        return itemRepository.searchItems(searchTerm)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Conversion methods
    private ItemDTO convertToDTO(Item item) {
        ItemDTO dto = new ItemDTO();
        dto.setId(item.getId());
        dto.setName(item.getName());
        dto.setDescription(item.getDescription());
        dto.setCreatedAt(item.getCreatedAt());
        dto.setUpdatedAt(item.getUpdatedAt());
        dto.setIsActive(item.getIsActive());
        return dto;
    }

    private Item convertToEntity(ItemDTO dto) {
        Item item = new Item();
        item.setName(dto.getName());
        item.setDescription(dto.getDescription());
        return item;
    }
}