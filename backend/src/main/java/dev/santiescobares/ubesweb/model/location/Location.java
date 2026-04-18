package dev.santiescobares.ubesweb.model.location;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

@Embeddable
@Getter
@Setter
public class Location {

    @Column(name = "location_name", length = 100)
    private String name;
    @Column(name = "location_latitude")
    private double latitude;
    @Column(name = "location_longitude")
    private double longitude;
}
