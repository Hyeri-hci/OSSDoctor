package com.ossdoctor.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "cpe")
@Entity
public class CpeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idx;

    @Column(name = "part")
    private String part;

    @Column(name = "vendor")
    private String vendor;

    @Column(name = "product")
    private String product;

    @Column(name = "version")
    private String version;
}
