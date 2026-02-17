package com.utkarshhh.service;

import com.utkarshhh.dto.CategoryDTO;
import com.utkarshhh.dto.SalonDTO;
import com.utkarshhh.dto.ServiceDTO;
import com.utkarshhh.model.ServiceOffering;

import java.util.List;
import java.util.Set;

public interface ServiceOfferingService {

    ServiceOffering createService(
            SalonDTO salonDTO,
            ServiceDTO serviceDTO,
            CategoryDTO categoryDTO
    );

    ServiceOffering updateService(
            String serviceId,
            ServiceOffering serviceOffering
    ) throws Exception;

    Set<ServiceOffering> getAllServiceBySalon(
            String salonId,
            String categoryId
    );

    List<ServiceOffering> getServicesByIds(Set<String> ids);

    ServiceOffering getServiceById(String id) throws Exception;
}