package com.utkarshhh.model;

import com.mongodb.lang.NonNull;
import jakarta.websocket.OnClose;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "offering")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceOffering {

    @Id
    private String id;

    private String name;

    private String description;

    private int price;

    private int duration;

    private String salonId;

    private String categoryId;

    private String image;
}