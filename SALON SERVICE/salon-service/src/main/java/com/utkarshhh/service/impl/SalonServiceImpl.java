package com.utkarshhh.service.impl;

import com.utkarshhh.modal.Salon;
import com.utkarshhh.payload.dto.SalonDTO;
import com.utkarshhh.payload.dto.UserDTO;
import com.utkarshhh.repository.SalonRepository;
import com.utkarshhh.service.SalonService;
import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor

public class SalonServiceImpl implements SalonService {

    private final SalonRepository salonRepository;

    @Override
    public Salon createSalon(SalonDTO req, UserDTO user) {
        Salon salon = new Salon();
        salon.setName(req.getName());
        salon.setAddress(req.getAddress());
        salon.setEmail(req.getEmail());
        salon.setCity(req.getCity());
        salon.setImages(req.getImages());
        salon.setOwnerId(req.getOwnerId());
        salon.setOpenTime(req.getOpenTime());
        salon.setCloseTime(req.getCloseTime());
        salon.setPhoneNumber(req.getPhoneNumber());
        return (Salon) salonRepository.save(salon);
    }

    @Override
    public Salon updateSalon(SalonDTO salonDTO, UserDTO user, String salonId) {

        ObjectId objectId = new ObjectId(salonId);

        Salon salon = salonRepository.findById(String.valueOf(objectId))
                .orElseThrow(() -> new RuntimeException("Salon not found"));


        salon.setName(salonDTO.getName());
        salon.setAddress(salonDTO.getAddress());
        salon.setCity(salonDTO.getCity());
        salon.setEmail(salonDTO.getEmail());
        salon.setPhoneNumber(salonDTO.getPhoneNumber());
        salon.setOpenTime(salonDTO.getOpenTime());
        salon.setCloseTime(salonDTO.getCloseTime());
        salon.setImages(salonDTO.getImages());

        return salonRepository.save(salon);
    }



    @Override
    public List<Salon> getAllSalons() {
        return salonRepository.findAll();
    }

    @Override
    public Salon getSalonById(String salonId) throws Exception {
        return salonRepository.findById(salonId)
                .orElseThrow(() -> new Exception("Salon not exist"));
    }

    @Override
    public Salon getSalonByOwnerId(Long ownerId) {
        return salonRepository.findByOwnerId(ownerId);
    }

    @Override
    public List<Salon> searchSalons(String keyword) {
        return salonRepository.searchSalons(keyword);
    }

}
