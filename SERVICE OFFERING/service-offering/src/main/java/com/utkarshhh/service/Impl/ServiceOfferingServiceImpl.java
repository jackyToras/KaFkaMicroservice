package com.utkarshhh.service.Impl;

import com.utkarshhh.dto.CategoryDTO;
import com.utkarshhh.dto.SalonDTO;
import com.utkarshhh.dto.ServiceDTO;
import com.utkarshhh.model.ServiceOffering;
import com.utkarshhh.service.ServiceOfferingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ServiceOfferingServiceImpl implements ServiceOfferingService {

    private final MongoTemplate mongoTemplate;

    @Override
    public ServiceOffering createService(
            SalonDTO salonDTO,
            ServiceDTO serviceDTO,
            CategoryDTO categoryDTO
    ) {
        log.info(" Creating service: {} for salon: {}", serviceDTO.getName(), salonDTO.getName());

        ServiceOffering service = new ServiceOffering();
        service.setName(serviceDTO.getName());
        service.setDescription(serviceDTO.getDescription());
        service.setPrice(serviceDTO.getPrice());
        service.setDuration(serviceDTO.getDuration());
        service.setImage(serviceDTO.getImage());

        // Store IDs as strings
        service.setSalonId(salonDTO.getId());
        service.setCategoryId(categoryDTO.getId());

        ServiceOffering saved = mongoTemplate.save(service);
        log.info(" Service created with ID: {}", saved.getId());

        return saved;
    }

    @Override
    public ServiceOffering updateService(
            String serviceId,
            ServiceOffering serviceOffering
    ) throws Exception {
        log.info(" Updating service: {}", serviceId);

        ServiceOffering existing = getServiceById(serviceId);

        if (serviceOffering.getName() != null) {
            existing.setName(serviceOffering.getName());
        }
        if (serviceOffering.getDescription() != null) {
            existing.setDescription(serviceOffering.getDescription());
        }
        if (serviceOffering.getPrice() != 0) {
            existing.setPrice(serviceOffering.getPrice());
        }
        if (serviceOffering.getDuration() != 0) {
            existing.setDuration(serviceOffering.getDuration());
        }
        if (serviceOffering.getImage() != null) {
            existing.setImage(serviceOffering.getImage());
        }

        ServiceOffering updated = mongoTemplate.save(existing);
        log.info(" Service updated: {}", updated.getId());

        return updated;
    }

    @Override
    public Set<ServiceOffering> getAllServiceBySalon(
            String salonId,
            String categoryId
    ) {
        log.info(" Fetching services for salon: {}", salonId);

        Query query = new Query();
        query.addCriteria(Criteria.where("salonId").is(salonId));

        if (categoryId != null && !categoryId.equals("null") && !categoryId.isEmpty()) {
            query.addCriteria(Criteria.where("categoryId").is(categoryId));
        }

        List<ServiceOffering> services = mongoTemplate.find(query, ServiceOffering.class);

        log.info(" Found {} services for salon {}", services.size(), salonId);

        return new HashSet<>(services);
    }

    @Override
    public List<ServiceOffering> getServicesByIds(Set<String> ids) {
        log.info(" Fetching services by IDs: {}", ids);

        Query query = new Query();
        query.addCriteria(Criteria.where("_id").in(ids));

        List<ServiceOffering> services = mongoTemplate.find(query, ServiceOffering.class);

        log.info(" Found {} services", services.size());

        return services;
    }

    @Override
    public ServiceOffering getServiceById(String id) throws Exception {
        log.info(" Fetching service by ID: {}", id);

        ServiceOffering service = mongoTemplate.findById(id, ServiceOffering.class);

        if (service == null) {
            log.error(" Service not found: {}", id);
            throw new Exception("Service not found with ID: " + id);
        }

        log.info("Found service: {}", service.getName());

        return service;
    }
}